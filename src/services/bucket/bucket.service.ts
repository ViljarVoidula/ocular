// Initializes the `bucket` service on path `/bucket`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Bucket } from "./bucket.class";
import hooks from "./bucket.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    bucket: Bucket & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const paginate = app.get("paginate");
  let mongoClient = app.get("mongoClient");
  const options = {
    paginate,
  };

  // Initialize our service with any options it requires
  app.use("/bucket", new Bucket(options, app));
  // Get our initialized service so that we can register hooks
  const service: any = app.service("bucket");
  mongoClient
    .then((db) => {
      return db.collection("bucket", {});
    })
    .then((serviceModel) => {
      service.Model = serviceModel;
    });

  service.hooks(hooks);
}
