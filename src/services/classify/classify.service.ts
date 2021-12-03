import Classify from "./classify.class";
import { Application } from "../../declarations";
import hooks from "./classify.hooks";

export default function (app: Application) {
  // Initialize our service with any options it requires
  app.use("/classify", new Classify());

  // Get our initialized service so that we can register hooks
  const service = app.service("classify");
  console.info("classify service started");

  service.hooks(hooks);
}
