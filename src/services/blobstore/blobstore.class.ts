import { Params } from "@feathersjs/feathers";
import { Service, MongoDBServiceOptions } from "feathers-mongodb";
import { Application } from "../../declarations";
// A type interface for our user (it does not validate any data)
interface BlobData {
  _id?: string;
  checksum: string;
  path?: string;
  mimetype?: string;
  uri: {}[];
  bucket: string;
}

export class BlobStore extends Service<BlobData> {
  app: Application | undefined;
  Model: any;

  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);
  }
  async setup(app: Application) {
    this.app = app;
  }

  create(data: BlobData, params?: Params) {
    if (!data.path) data.path = "/";
    return super.create(data, params);
  }
  get(id: string, params?: Params) {
    return super.get(id, params);
  }
}
