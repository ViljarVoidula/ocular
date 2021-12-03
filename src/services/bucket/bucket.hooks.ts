import * as feathersAuthentication from "@feathersjs/authentication";
import rapidApiKey from "./../../helpers/rapidApiKey";
import apiKey from "./../../helpers/allowApiKey";
import { isProvider, iff, stashBefore, combine } from "feathers-hooks-common";
import { setField } from "feathers-authentication-hooks";
import { normalize as normalizePath } from "path";
const { authenticate } = feathersAuthentication.hooks;

export default {
  before: {
    all: [
      iff(
        isProvider("external"),
        rapidApiKey(),
        apiKey(),
        authenticate("jwt", "rapidApi", "apiKey")
      ),
    ],
    find: [],
    get: [],
    create: [
      (ctx) => {
        if (!ctx.data.acl) {
          ctx.data.acl = [];
        }
        if (!ctx.data?.paths?.length) {
          ctx.data.paths = ["/"];
        }
      },
      setField({ from: "params.user._id", as: "data.owner" }),
      (ctx) => {
        if (ctx.data.owner) {
          ctx.data.owner = ctx.data.owner.toString();
        }
      },
    ],
    update: [],
    patch: [
      combine(async (ctx) => {
        if (ctx.data.paths && ctx.id) {
          ctx.data.paths.forEach((path) => {
            path = normalizePath(path);
          });
          let { paths } = await ctx.app.services.bucket._get(ctx.id);
          const removed = paths.filter((path) => {
            return !ctx.data.paths.includes(path);
          });

          if (removed.length) {
            for (const item of removed) {
              const files = await ctx.app.services.blobstore.find({
                query: {
                  bucket: ctx.id,
                  path: {
                    $search: item,
                  },
                  $limit: -1,
                },
              });
              await files.forEach(async (file: { _id: string }) => {
                await ctx.app.services.blobstore.remove(file._id.toString);
              });
            }
          }
        }
      }),
    ],
    remove: [
      async (ctx) => {
        const files = await ctx.app.services.blobstore.find({
          query: {
            bucket: ctx.id,
            $limit: -1,
          },
        });
        await files.forEach(async (file: { _id: string }) => {
          await ctx.app.services.blobstore.remove(file._id.toString);
        });
      },
    ],
  },

  after: {
    all: [],
    find: [],
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
