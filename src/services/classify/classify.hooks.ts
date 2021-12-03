import { HookContext } from "@feathersjs/feathers";
import normalize from "normalize-type";

const inputSchema = {
  title: "Classify image  service schema",
  description: "Description of API query object",
  type: "object",
  required: ["url"],
  properties: {
    url: { type: "string", minLength: 8, maxLength: 2048 },
  },
};

import validate from "../../helpers/validateSchema";

export default {
  before: {
    all: [
      (ctx: HookContext) => {
        ctx.params.query = normalize(ctx.params.query);
      },
      (ctx) => {
        validate(inputSchema, ctx.params.query);
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
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
