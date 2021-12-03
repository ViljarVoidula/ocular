import { Application } from "./declarations";
import { MongoClient } from "mongodb";
import { parseConnectionString } from "mongodb-core";

export default function (app: Application) {
  let config = app.get("appdb");
  const promise = MongoClient.connect(config, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    poolSize: 10,
    // writeConcern: {
    //   j: true,
    // },
  })
    .then((client) => {
      // For mongodb <= 2.2
      if (client.collection) {
        return client;
      }

      const dbName = parseConnectionString(config, () => {});
      console.info("App mongo connected");
      return client.db(dbName);
    })
    .catch((error) => {
      console.error(error);
    });

  app.set("mongoClient", promise);
}
