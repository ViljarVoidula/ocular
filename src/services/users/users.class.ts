import { Params } from '@feathersjs/feathers';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';
import crypto from 'crypto';
// A type interface for our user (it does not validate any data)
interface UserData {
  _id?: string;
  email: string;
  password: string;
  name?: string;
  apiKey?: string;
}

export class Users extends Service<UserData> {
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);
  }

  create (data: UserData, params?: Params) {
    // This is the information we want from the user signup data
    const { email, password, name } = data;
    // Use the existing avatar image or return the Gravatar for the email
    // The complete user
    const userData = {
      email,
      name,
      password,
      apiKey: crypto.randomBytes(32).toString('hex')
    };

    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }
}