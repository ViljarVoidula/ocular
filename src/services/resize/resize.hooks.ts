
import { HookContext } from '@feathersjs/feathers'
import * as feathersAuthentication from '@feathersjs/authentication';

import  normalize from 'normalize-type'
import rapidApiKey from '../../helpers/rapidApiKey';

const {authenticate} = feathersAuthentication.hooks

const inputSchema = {
  title: 'Resize service schema',
  description: 'Description of API data object',
  type: 'object', 
  required: ['url'],
  properties: {
    url: { type: 'string', minLength: 8, maxLength: 2048},
    width: {type: 'number', minimum: 1, maximum: 1920},
    height: {type: 'number', minimum: 1, maximum: 1920},
    quality: {type: 'number', minimum: 1, maximum: 100},
    fit: { type: 'string', enum: ['cover', 'fill', 'contain', 'inside', 'outside'], default: 'cover'},
    extension: { type: 'string', enum: ['jpeg', 'jpg', 'png'], default: 'png' } 
  }
}


export default {
    before: {
      all: [],
      find: [],
      get: [],
      create: [
        (ctx: HookContext)=>{
            ctx.params.query = normalize(ctx.params.query)
        }
      ],
      update: [],
      patch: [],
      remove: []
    },
  
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
  
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  };