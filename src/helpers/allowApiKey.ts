import { Hook, HookContext } from "@feathersjs/feathers";
import assert from "assert";

export default (): Hook => {
  return async (context: HookContext) => {
    const { params, app } = context;

    const headerField = app.get("authentication").apiKey.header;
    const token = params?.headers![headerField];

    if (token && params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: "apiKey",
          token,
        },
      };
    }
    return context;
  };
};
