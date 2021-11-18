import * as nsfwjs from 'nsfwjs'
import * as tf from '@tensorflow/tfjs-node'
import { Application } from '../../declarations';
import { downloadImageToArrayBuffer } from '../../helpers/axiosClient';

export default class Classify {
    app: Application | undefined
    model?: any

    async setup(app: Application) {
        this.app = app;
        this.model = await nsfwjs.load()
    }
    
    // url: string, width: number, height: number, quality: string, fit?: sharp.FitEnum = 'cover'

    async find(params: { query: any }){
        let result = {}
        const { url } = params?.query ;
        let picture =  await this?.app?.get('_cache').wrap(`classify_${url}`, async()=>{
            let { data } = await downloadImageToArrayBuffer(url)
            return data
        }, { ttl: 60 })
        // hack to convert types when loading from cache
     
        if(picture._bsontype){
            picture = picture.buffer
        }
  
        const image = await tf.node.decodeImage(picture, 3)
        const predictions = await this?.model?.classify(image)
        predictions.forEach((el) => {
            result[el.className.toLowerCase()] = el.probability
        })
        image.dispose()


        return result;
    }
}