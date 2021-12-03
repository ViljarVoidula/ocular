import { HookContext } from "@feathersjs/feathers";

import normalize from "normalize-type";
import pEvent from "p-event";
import validate from "./../../helpers/validateSchema";
const inputSchema = {
  title: "Resize service schema",
  description: "Description of API data object",
  type: "object",
  required: ["url"],
  properties: {
    url: { type: "string", minLength: 8, maxLength: 2048 },
    width: { type: "number", minimum: 1, maximum: 1920 },
    height: { type: "number", minimum: 1, maximum: 1920 },
    quality: { type: "number", minimum: 1, maximum: 100 },
    fit: {
      type: "string",
      enum: ["cover", "fill", "contain", "inside", "outside"],
      default: "cover",
    },
    bw: { type: "number", enum: [1, 0], default: 0 },
    extension: {
      type: "string",
      enum: ["jpeg", "jpg", "png", "webp"],
      default: "png",
    },
    format: { type: "string", enum: ["stream", "base64"], default: "stream" },
  },
};

export default {
  before: {
    all: [],
    find: [
      (ctx: HookContext) => {
        ctx.params.query = normalize(ctx.params.query);
        validate(inputSchema, ctx?.params?.query ?? {});
      },
    ],
    get: [],
    create: [
      (ctx: HookContext) => {
        ctx.params.query = normalize(ctx.params.query);
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [
      // if result is requested as base64 image
      async (ctx) => {
        if (ctx?.params?.query?.format === "base64" && ctx?.result?.stream) {
          let chunks: Uint8Array[] = [];
          let base64 = "";
          ctx.result.stream
            .on("error", (e: Error) => {
              throw e;
            })
            .on("data", (_data: Uint8Array) => {
              chunks.push(_data);
            })
            .on("end", () => {
              base64 = `data:image/${
                ctx?.params?.query?.extension ?? "png"
              };base64,${Buffer.concat(chunks).toString("base64")}`;
            });
          await pEvent(ctx.result.stream, "end", { timeout: 10 * 1000 });
          ctx.result = { base64 };
        }
      },
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
