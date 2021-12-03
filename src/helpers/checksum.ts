import crypto from "crypto";
import { Hook, HookContext } from "@feathersjs/feathers";

enum Algorithms {
  md5 = "md5",
  sha = "sha",
}
type BinaryToTextEncoding = "base64" | "hex";
export default (options: {
  algorithm?: Algorithms;
  encoding?: BinaryToTextEncoding;
  field: string;
  as: string;
}): Hook => {
  return async (context: HookContext) => {
    const { data } = context;
    const { field, as, algorithm = "md5", encoding = "hex" } = options;
    data[as] = crypto
      .createHash(algorithm)
      .update(data[field], "utf8")
      .digest(encoding);
    return context;
  };
};
