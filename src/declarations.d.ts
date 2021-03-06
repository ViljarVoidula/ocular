import { Application as ExpressFeathers } from "@feathersjs/express";
import { Service, HookContext } from "@feathersjs/feathers";
import "@feathersjs/transport-commons";

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {
  blobstore: any;
}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

declare module "mongoStore";
