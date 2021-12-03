import * as feathersAuthentication from "@feathersjs/authentication";
import generateChecksum from "./../../helpers/checksum";
import rapidApiKey from "./../../helpers/rapidApiKey";
import apiKey from "./../../helpers/allowApiKey";
import { Base64ToStream, SharpTransformer } from "./../../helpers/transformers";
import normalize from "normalize-type";

import {
  disablePagination,
  iff,
  isProvider,
  mongoKeys,
} from "feathers-hooks-common";

import bucketValidator from "./hooks/validateBucket.hook";
import assert from "assert";
import { normalize as normalizePath } from "path";
import { ObjectID } from "mongodb";
import { getBase64DataURI } from "dauria";
import buildTree from "../../helpers/pathsToTree";
import search from "feathers-mongodb-fuzzy-search";
const { authenticate } = feathersAuthentication.hooks;

const inputSchema = {
  type: "object",
  properties: {
    uri: { type: "string" },
    bucket: { type: "string" },
    mimetype: { type: "string" },
    path: { type: "string" },
    checksum: { type: "string" },
  },
};

const querySchema = {
  type: "object",
  properties: {
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
  },
};

export default {
  before: {
    all: [],
    find: [
      mongoKeys(ObjectID, ["_id"]),
      disablePagination(),
      // bucket as required query param
      (ctx) => {
        assert.ok(
          ctx.params.query.bucket,
          "Please specify bucket for query /blobstore?bucket={bucket_id}"
        );
        if (!ctx.params.query.$limit) {
          ctx.params.query.$limit = 200;
        }
        if (ctx.params.query.tree) {
          ctx.params.tree = true;
          delete ctx.params.query.tree;
        }
      },
      search({
        // regex search on given fields
        fields: ["path"],
      }),
      iff(
        isProvider("external"),
        rapidApiKey(),
        apiKey(),
        authenticate("jwt", "rapidApi", "apiKey"),
        bucketValidator()
      ),
    ],
    get: [
      (ctx) => {
        ctx.params._options = normalize(ctx.params.query);
        ctx.params.query = {};
      },
    ],
    create: [
      rapidApiKey(),
      apiKey(),
      authenticate("jwt", "rapidApi", "apiKey"),
      (ctx) => {
        assert.ok(
          ctx.params.query.bucket,
          "Please add bucket to query string /blobstore?bucket=bucket_id"
        );
        ctx.data.uri = getBase64DataURI(ctx.params.file.buffer);
        ctx.data.bucket = ctx.params.query.bucket;
        ctx.data.mimetype = ctx.params.file.mimetype;

        if (!ctx.params?.query?.path) {
          ctx.data.path = normalizePath(`/${ctx.params.file.originalname}`);
        } else {
          ctx.data.path = normalizePath(
            `${ctx.params.query.path}/${ctx.params.file.originalname}`
          );
        }
        const pathDepth = ctx.data.path.split("/").length;
        assert.ok(
          pathDepth <= 10,
          "File tree max depth is 10 , please reduce depth of your requested file path "
        );
      },

      iff(isProvider("external"), bucketValidator()),

      generateChecksum({ field: "uri", as: "checksum" }),
      async (ctx) => {
        const { data = [] } = await ctx.app.services.blobstore.find({
          query: {
            checksum: ctx.data.checksum,
            bucket: ctx.data.bucket,
            path: ctx.data?.path ?? `/${ctx.params.file.originalname}`,
          },
        });

        if (data.length) {
          ctx.result = data[0];
        }
      },
    ],
    update: [
      iff(
        isProvider("external"),
        rapidApiKey(),
        apiKey(),
        authenticate("jwt", "rapidApi", "apiKey")
      ),
    ],
    patch: [
      iff(
        isProvider("external"),
        rapidApiKey(),
        apiKey(),
        authenticate("jwt", "rapidApi", "apiKey")
      ),
    ],
    remove: [
      mongoKeys(ObjectID, ["_id"]),
      iff(
        isProvider("external"),
        rapidApiKey(),
        apiKey(),
        authenticate("jwt", "rapidApi", "apiKey")
      ),
    ],
  },

  after: {
    all: [],
    find: [
      // return paths instead of regular data
      (ctx) => {
        if (ctx.result.data) {
          ctx.result?.data.forEach((item) => {
            delete item.uri;
          });
        } else {
          ctx.result.forEach((item) => {
            if (item.uri) delete item.uri;
          });
        }

        if (ctx?.params?.tree) {
          ctx.result.data = buildTree(ctx.result?.data ?? ctx.result);
        }
      },
    ],
    get: [
      (ctx) => {
        const extension = ctx.result.mimetype.split("/")[1];
        if (
          Object.keys(ctx.params._options).length &&
          ["jpg", "jpeg", "png", "svg"].filter((el) => el === extension).length
        ) {
          const { quality = 100 } = ctx.params._options;

          let transformer = SharpTransformer({
            ...ctx.params._options,
            quality,
            extension,
          });

          ctx.result._stream = Base64ToStream(ctx.result.uri);
          ctx.result._stream = ctx.result._stream.pipe(transformer);
        } else {
          ctx.result._stream = Base64ToStream(ctx.result.uri);
        }
      },
    ],
    create: [
      (ctx) => {
        delete ctx.result.uri;
      },
    ],
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
