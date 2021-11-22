import * as cacheManager from "cache-manager";
import { Application } from "./declarations";
import * as mongoStore from "cache-manager-mongodb";

export default function (app: Application) {
  var mongoCache = cacheManager.caching({
    store: mongoStore,
    uri: app.get("mongodb"),
    ttl: 60 * 30,
    options: {
      collection: "ocularecache",
      compression: false,
      poolSize: 5,
      autoReconnect: true,
    },
  });
  app.set("_cache", mongoCache);
}
