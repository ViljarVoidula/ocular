import axios from 'axios';
import { Writable, Readable } from 'stream';
import { fromBuffer, fromStream } from 'file-type'
import  { BadRequest } from '@feathersjs/errors';
import magic from 'stream-mmmagic';
async function downloadImageToArrayBuffer (url:string) {  
    let chunks: Buffer[] = []
    let writer = new Writable()
    writer._write = (chunk, encoding, next) => {
        chunks.push(chunk)
        next()
    }
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    const readtableStream = Readable.from(response.data);
    const [ mime ] = await magic.promise(readtableStream);
    const isValidType =  mime ? /png|jpeg|gif|jpg|svg/gi.test((mime as { type: string }).type ) : undefined
    if(!isValidType) {
        throw new BadRequest('File format not supported')
    }

    return response
  }

  export {
      downloadImageToArrayBuffer
    }