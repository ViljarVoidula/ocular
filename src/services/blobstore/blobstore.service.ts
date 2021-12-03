// Initializes the `buckets` service on path `/buckets`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { BlobStore } from "./blobstore.class";
import hooks from "./blobstore.hooks";
import Busboy from "busboy";
const multer = require("multer");

interface BlobData {
  _id?: string;
  checksum: string;
  path?: string;
  value: {}[];
  bucket: string;
  origins: {}[];
  acl: {}[];
}
// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    blobs: BlobData & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const paginate = app.get("paginate");
  let mongoClient = app.get("mongoClient");
  const options = {
    paginate,
    whitelist: ["$text", "$search", "$regex"],
    multi: ["remove"],
  };

  // Initialize our service with any options it requires
  app.use(
    "/blobstore",
    multer().single("image"),
    (req: any, res: any, next) => {
      if (req.method === "POST") {
        req.feathers.file = req?.file;
        next();
      } else {
        next();
      }
    },
    new BlobStore(options, app),
    (_req: any, res: any, next) => {
      if (
        _req.method === "GET" &&
        !Array.isArray(res.data) &&
        !res.data.total &&
        !res.data.limit
      ) {
        res.setHeader("content-type", res.data.mimetype);
        res.type(res.data.mimetype);
        res.data._stream.pipe(res);
      } else {
        next();
      }

      // _next();
    }
  );
  // Get our initialized service so that we can register hooks
  const service: any = app.service("blobstore");
  mongoClient
    .then((db: { collection: (arg0: string, arg1: {}) => any }) => {
      return db.collection("blobs", {});
    })
    .then((serviceModel: any) => {
      service.Model = serviceModel;
    });

  service.hooks(hooks);
}
