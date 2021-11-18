import  Resize from './resize.class';
import { Application } from '../../declarations';
import hooks from './resize.hooks';

export default function (app: Application) { 
    // Initialize our service with any options it requires
    app.use('/resize', new Resize(), (req, res)=>{
      // middleware to set response 
      if(res.data.stream){
        const {extension} = res.data?.query ?? 'png'
        res.setHeader("content-type", `image/${extension}`);
        res.type(`image/${extension}`)
        res.data.stream.pipe(res).on('error', (e)=>{debugger});
      }
    });
  
    // Get our initialized service so that we can register hooks
    const service = app.service('resize');
    console.info('resize service started')
    
  
    service.hooks(hooks);
  }