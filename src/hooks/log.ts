import logger from "../logger";
import util from "util";

// To see more detailed messages, uncomment the following line:
// logger.level = 'debug';

// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";

export default (): Hook => {
  return async (context: HookContext) => {
    // Get `app`, `method`, `params` and `result` from the hook context
    if (context.error) {
      let _messages: string[] = [];
      // record.stack = context.error.stack;
      if (context?.error?.errors?.length) {
        context.error.errors.forEach((key: string) => {
          _messages.push(key);
        });
      }
      logger.error(
        util.inspect(
          {
            stack: `${context?.error?.stack.toString()}`,
            _messages,
          },
          { depth: null, colors: false }
        )
      );
    }

    return context;
  };
};
