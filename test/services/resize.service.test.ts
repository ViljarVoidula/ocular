import assert from "assert";
import { Server } from "http";
import axios from "axios";
import app from "../../src/app";
import url from "url";

const port = app.get("port") || 8998;
const host = app.get("host");

describe("Resize service tests", async function () {
  let server: Server;

  before(async function () {
    server = await app.listen(port);
  });

  after(async function () {
    await server?.close();
  });
  describe("Resize service works as expected", async function () {
    let uncachedResponseTime: number = 0;
    it("Resizing external URL works", async () => {
      let start = new Date().getTime();
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png`
      );

      let end = new Date().getTime();
      uncachedResponseTime = end - start;
      assert.ok(image.data, "No data in respnse");
      assert.ok(image.data.length === 8385, "Image size seems to be wrong");
    });
    it("Resizing external URL works with base64 output", async () => {
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png&format=base64`
      );
      assert.ok(image.data.base64, "No base64 object in response");
      assert.ok(
        image.data.base64.length === 11766,
        "Image size seems to be wrong"
      );
    });

    it("Resizing external URL works with base64 output height and width", async () => {
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png&format=base64&width=100&height=100`
      );
      assert.ok(image.data.base64, "No base64 object in response");
      assert.ok(
        image.data.base64.length === 3434,
        "Image size seems to be wrong"
      );
    });

    it("Resizing external URL works with base64 output fit fill", async () => {
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png&format=base64&width=200&height=100&fit=fill`
      );
      assert.ok(image.data.base64, "No base64 object in response");
      assert.ok(
        image.data.base64.length === 4798,
        "Image size seems to be wrong"
      );
    });
    it("Resizing external URL works with base64 output fit inside", async () => {
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png&format=base64&width=200&height=100&fit=inside`
      );
      assert.ok(image.data.base64, "No base64 object in response");
      assert.ok(
        image.data.base64.length === 3358,
        "Image size seems to be wrong"
      );
    });
    it("Resizing external URL works with base64 output fit inside and bw true", async () => {
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png&format=base64&width=200&height=100&fit=inside&bw=1`
      );

      assert.ok(image.data.base64, "No base64 object in response");
      assert.ok(
        image.data.base64.length === 3318,
        "Image size seems to be wrong"
      );
    });

    it("Resizing external URL works with base64 output fit inside and bw true", async () => {
      let start = new Date().getTime();
      const image = await axios.get(
        `http://${host}:${port}/resize/?url=http://${host}:${port}/logo.png&format=base64&width=200&height=100&fit=inside&bw=1`
      );
      let end = new Date().getTime();
      let cachedResponse = end - start;

      assert.ok(
        cachedResponse < uncachedResponseTime,
        "Cache perfomance is not matching expectation"
      );
      assert.ok(image.data.base64, "No base64 object in response");
      assert.ok(
        image.data.base64.length === 3318,
        "Image size seems to be wrong"
      );
    });
  });
});
