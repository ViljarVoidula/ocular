import axios from 'axios';
import { Writable } from 'stream';
import { fromBuffer, fromStream } from 'file-type'
import  { BadRequest } from '@feathersjs/errors';
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
    const fileType = await fromBuffer(response.data)
    debugger
    const isValidType = fileType ? /png|jpeg|gif|jpg/gi.test(fileType.ext) : undefined
          
    if(!isValidType) {
        throw new BadRequest('File format not supported')
    }
    debugger

    return response
  }

  export {
      downloadImageToArrayBuffer
    }