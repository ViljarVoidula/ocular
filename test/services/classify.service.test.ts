import assert from "assert";
import { Server } from "http";
import axios from "axios";
import app from "../../src/app";

const port = app.get("port") || 8998;
const host = app.get("host");
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
describe("Classify service tests", async function () {
  let server: Server;
  before(async function () {
    server = await app.listen(port);
  });

  after(async function () {
    await server.close();
  });

  describe("Classify service works as expected", async function () {
    it("Classify external URL works", async function () {
      await sleep(2500);
      const { data } = await axios.get(
        `http://${host}:${port}/classify?url=http://${host}:${port}/logo.png`
      );

      assert.ok(Object.keys(data).length >= 4, "Keys not present in response");
      assert.ok(data.neutral > data.porn, "Picture is not neutral");
    }).timeout(10000);
  });
});
