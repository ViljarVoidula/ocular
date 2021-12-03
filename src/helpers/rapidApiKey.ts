import { Hook, HookContext } from "@feathersjs/feathers";

export default (): Hook => {
  return async (context: HookContext) => {
    const { params, app } = context;
    const headerField = app.get("authentication").rapidApi?.header;
    const token = params?.headers![headerField] || undefined;

    if (token && params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: "rapidApi",
          token,
        },
      };
    }

    return context;
  };
};
