import normalize from "normalize-type";
import axios from 'axios';
import sharp, { FitEnum } from 'sharp';
import { Application } from '../../declarations';
import  pEvent from 'p-event';

import { Writable, Readable} from 'stream'
import { StringCodec } from 'nats'

import magic from 'stream-mmmagic';
import  { BadRequest } from '@feathersjs/errors';




export default class Resize {
    app: Application | undefined
    cache: any;
    subscription: any
    instanceId: string | undefined
    

    setup(app: Application) {
        this.app = app;
        this.instanceId = new Date().valueOf().toString();
        this.cache = app?.get('_cache')
    }

    // helper for downlading image from url 
    async downloadImage (url:string) {  
        let chunks: Buffer[] = []
        let writer = new Writable()
        writer._write = (chunk, encoding, next) => {
            chunks.push(chunk)
            next()
        }
      
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream'
        })
        
        response.data.pipe(writer)
        await pEvent(writer, 'finish', { timeout: 10 * 1000 });

        return chunks
      }
    
    async handleImageCache(query){
        let data = await this.cache?.wrap(query.url, async()=>{
            let res = await this.downloadImage(query.url)
            this?.app?.get('natsClient')?.publish("resize_image", StringCodec().encode(JSON.stringify({res, query , instance: this.instanceId})));
            return res
        }, { ttl: 600 })
        // hack to convert types when loading from cache
        if(data[0]._bsontype){
            data = data.map(el=>el.buffer)
        }

        return data;
    }
    async find(params: { query: any }){
            const { width = 320, height = 240, quality = 70, fit = 'cover', extension = 'png', bw = false, bg = '' } = normalize(params?.query);
            // const result: string = await this.resize({url, width, height, quality, fit, extension, bw, bg })
            const data = await this.handleImageCache(params?.query)
            const readtableStream = Readable.from(data);
            const [ mime ] = await magic.promise(readtableStream);
            const isValidType =  mime ? /png|jpeg|gif|jpg|svg/gi.test((mime as { type: string }).type ) : undefined
            if(!isValidType) {
                throw new BadRequest('File format not supported')
            }
    
            const transfomerMap = {
                jpeg: sharp().jpeg({ quality }),
                jpg: sharp().jpeg({ quality }),
                png: sharp().png({ quality })
            }
    
            const transformer = transfomerMap[extension].resize(width, height, {
                fit: fit as keyof FitEnum,
            })
    
            if(bg?.length){
                transformer.ensureAlpha()
                transformer.flatten({ background: `#${bg.match(/[0-9a-f]+/i)}` })
            }
    
            if(bw){
                transformer.toColourspace('b-w')
            }
            const stream = Readable.from(data).pipe(transformer)
       
            // create readable stream from data and push to forward
        
            // const file = 
            //     .on('error', (e: Error) => {
            //     throw e;
            // })
            // .on('data', (_data:Uint8Array) => {
            //     chunks.push(_data);
            // }).on('end', () =>{
            //     output = `data:image/${extension};base64,${Buffer.concat(chunks).toString('base64')}`;
            // })
          
           
            return {
                stream,
                query: params?.query
            }

    }

}

  