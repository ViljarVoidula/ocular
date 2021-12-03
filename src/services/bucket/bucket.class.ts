import { Params } from "@feathersjs/feathers";
import { Service, MongoDBServiceOptions } from "feathers-mongodb";
import { Application } from "../../declarations";
// A type interface for our user (it does not validate any data)
interface BucketData {
  _id?: string;
  owner: string;
  acl: string[];
  paths: string[];
}

export class Bucket extends Service<BucketData> {
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);
  }

  create(data: BucketData, params?: Params) {
    // This is the information we want from the user signup data
    const { owner, acl = [], paths = ["/"] } = data;
    // Use the existing avatar image or return the Gravatar for the email
    // The complete user
    const BucketData = {
      owner,
      acl,
      paths,
    };
    // Call the original `create` method with existing `params` and new data
    return super.create(BucketData, params);
  }
}
