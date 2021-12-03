import { MongoMemoryServer } from "mongodb-memory-server";

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;

// TestContext will be used by all the test
export type TestContext = Mocha.Context;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let mongoServer;
export const mochaHooks = {
  async beforeAll(this: Mocha.Context) {
    mongoServer = new MongoMemoryServer({
      instance: {
        dbName: "testdb",
        port: 27019,
      },
      binary: "4.2.14",
    });
    console.info("setup of in memory server finished");
    // await mongoServer.cleanup(true);
    await mongoServer.ensureInstance();
    await sleep(2000);

    // debugger;
  },
  async beforeEach(this: TestContext) {
    // the contents of the Before Each hook
  },
  async afterAll(this: TestContext) {
    // the contents of the After All hook
    mongoServer.stop();
  },
  async afterEach(this: TestContext) {
    // the contents of the After Each hook
  },
};
