import { connect, StringCodec } from "nats";
import { Application } from "./declarations";

function optionsToString(options: { [key: string]: any }) {
  let result = "";
  Object.keys(options).forEach((key, index) => {
    if (options[key]) {
      result += key + "=" + options[key];
    }
  });
  return result?.replace(/\/|\./gi, "-");
}

export default function (app: Application) {
  const { servers = [], user, pass } = app.get("nats");

  if (servers.length) {
    (async () => {
      const connection = await connect({ servers, user, pass });
      console.log(
        `max payload for the server is ${connection?.info?.max_payload} bytes`
      );

      // connection.closed();
      const sub = connection.subscribe("resize_image");
      (async () => {
        for await (const m of sub) {
          app.emit("resize_image_in", StringCodec().decode(m.data));
        }
      })();
      console.info("Connected to NATS");

      app.set("natsClient", connection);
    })();
  }

  app.on("resize_image_in", (data: string) => {
    const _data = JSON.parse(data);
    const _instance = app.services.resize.instanceId;
    const cache = app.get("_cache");
    if (_instance !== _data.instance) {
      cache.set(
        _data.url,
        _data.map((el) => Buffer.from(el.data)),
        { ttl: 600 }
      );
    }
  });
}
