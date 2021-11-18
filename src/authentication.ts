import { ServiceAddons, Params } from '@feathersjs/feathers';
import { AuthenticationService, AuthenticationResult, AuthenticationBaseStrategy, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy,  } from '@feathersjs/authentication-local';
import { NotAuthenticated } from '@feathersjs/errors';
import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
    'resize': any,
    'classify': ServiceAddons<any>
  }
}
class ApiKeyStrategy extends AuthenticationBaseStrategy {
    async authenticate(authentication: AuthenticationResult) {
      const { token } = authentication;
      const config = this?.authentication?.configuration[this?.name!];
  
      const match = config.allowedKeys.includes(token);
      if (!match) throw new NotAuthenticated('Incorrect API Key');
    
      return {
        apiKey: true
      }
    }
  }

  class RapidApiStrategy extends AuthenticationBaseStrategy {
    async authenticate(authentication: AuthenticationResult) {
      const { token } = authentication;
      const config = this?.authentication?.configuration[this?.name!];
      const match = config.allowedKeys.includes(token);
      if (!match) throw new NotAuthenticated('Incorrect API Key');
    
      return {
        rapidApi: true
      }
    }
  }
  
  export default function(app: Application) {
    const authentication = new AuthenticationService(app);
    // ... authentication service setup
    authentication.register('rapidApi', new RapidApiStrategy());
    authentication.register('apiKey', new ApiKeyStrategy());
    authentication.register('jwt', new JWTStrategy());
    authentication.register('local', new LocalStrategy());
  

    app.use('/authentication', authentication);
    
  }