import assert from "assert";
import { Server } from "http";
import axios from "axios";
import app from "../src/app";
import url from "url";

const port = app.get("port") || 8998;
const getUrl = (pathname?: string) =>
  url.format({
    hostname: app.get("host") || "localhost",
    protocol: "http",
    port,
    pathname,
  });

describe("Feathers application tests", () => {
  let server: Server;

  before(async function () {
    server = await app.listen(port);
  });

  after(async function () {
    await server.close();
  });
  describe("404", async function () {
    it("shows a 404 HTML page", async () => {
      try {
        await axios.get(getUrl("path/to/nowhere"), {
          headers: {
            Accept: "text/html",
          },
        });
        assert.fail("should never get here");
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 404);
        assert.ok(response.data.indexOf("<html>") !== -1);
      }
    });

    it("shows a 404 JSON error without stack trace", async () => {
      try {
        await axios.get(getUrl("path/to/nowhere"));
        assert.fail("should never get here");
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 404);
        assert.equal(response.data.code, 404);
        assert.equal(response.data.message, "Page not found");
        assert.equal(response.data.name, "NotFound");
      }
    });
  });

  describe("/health", async function () {
    it("shows a 404 HTML page", async () => {
      const response = await axios.get(getUrl("health"));
      assert.ok(response.data.date, "date is not present");
      assert.ok(
        response.data.message === "OK",
        "Status is not ok on health check"
      );
      assert.ok(Number(response.data.uptime), "Uptime missing from health");
    });
  });
});
