import { Hook, HookContext } from "@feathersjs/feathers";
import { BadRequest } from "@feathersjs/errors";
import assert from "assert";
export default (): Hook => {
  return async (context: HookContext) => {
    let bucket;
    const { data, app } = context;

    try {
      if (
        context.type === "before" &&
        context.method !== "create" &&
        !context.params?.query?.bucket
      ) {
        let record = await app.services[context.path]._get(context?.id);
        bucket = record.bucket;
      } else if (context.params?.query?.bucket) {
        let record = await app.services.bucket._get(
          context.params?.query?.bucket
        );
        bucket = record._id.toString();
      } else {
        let record = await app.services.bucket._get(data.bucket);
        bucket = record._id.toString();
      }

      assert.ok(
        bucket && bucket.length,
        "Please specifiy valid bucket for you data"
      );
      const target = await app.services.bucket.get(bucket);

      if (target?.acl?.length) {
        target.acl.forEach((entry) => {
          console.debug("validating acl entry", entry);
        });
      }

      /*
      Validate path
      */
      if (context.data?.path) {
        const _path = context.data.path.match(/^(.*[\\\/])/)[0];
        let testPaths = target.paths.filter((path) => {
          return new RegExp(`^${path}$`).test(_path);
        });
        assert.ok(testPaths.length, "Path is not added to bucket");
      }

      assert.ok(
        target.owner === context?.params?.user?._id.toString(),
        "Bucket access is not allowed for this user"
      );
    } catch (error: any) {
      if (error?.name === "NotFound") {
        throw new BadRequest("Bucket not valid");
      }
      throw error;
    }

    return context;
  };
};
