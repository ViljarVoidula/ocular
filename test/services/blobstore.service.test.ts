import assert from "assert";
import { Server } from "http";
import axios from "axios";
import app from "../../src/app";
import crypto from "crypto";
const FormData = require("form-data");
const fs = require("fs");

const port = app.get("port") || 8998;
const host = app.get("host");

const checksum = (data) => {
  return crypto.createHash("md5").update(data, "utf8").digest("hex");
};

describe("Blobstore service tests", async function () {
  let server: Server, user: any, bucket: any;
  let pngId: string, jpgId: string, jpegId: string;
  let invalidUser;
  before(async function () {
    server = await app.listen(port);
    user = await app.services.users.create({
      email: "user@example.com",
      password: "password",
    });
    invalidUser = await app.services.users.create({
      email: "user1@example.com",
      password: "password",
    });
    bucket = await app.services.bucket.create({}, { user });
  });

  after(async function () {
    try {
      await app.services.bucket._remove(bucket?._id?.toString());
      await app.services.users._remove(user?._id?.toString());
      await app.services.users._remove(invalidUser?._id?.toString());
      if (jpgId) {
        app.services.blobstore._remove(jpgId);
      }
      if (pngId) {
        app.services.blobstore._remove(pngId);
      }
    } catch (error) {
    } finally {
      await server.close();
    }
  });

  describe("Blob store service works as expected", async function () {
    it("I can upload PNG", async function () {
      try {
        const formData = new FormData();
        formData.append(
          "image",
          fs.createReadStream("./test/test_data/testing_pyramid.png")
        );
        const res = await axios.post(
          `http://${host}:${port}/blobstore?bucket=${bucket._id.toString()}&path=/`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              "x-ocular-token": user.apiKey,
            },
          }
        );
        pngId = res.data._id;
        assert.ok(
          res.data.checksum === "efb0aeb18d22263b13e34724b2c69568",
          "Wrong checksum based on data provided"
        );
      } catch (error) {
        assert.fail("Should not get here");
      }
    });
    it("I can upload JPG", async function () {
      const formData = new FormData();
      formData.append(
        "image",
        fs.createReadStream("./test/test_data/testing_pyramid.jpg")
      );
      const res = await axios.post(
        `http://${host}:${port}/blobstore?bucket=${bucket._id.toString()}&path=/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "x-ocular-token": user.apiKey,
          },
        }
      );
      jpgId = res.data._id;
      assert.ok(
        res.data.path === "/testing_pyramid.jpg",
        "File path is not correct"
      );
      assert.ok(
        res.data.checksum === "99fbb4414c807d4cf5bd2be3037a9b22",
        "Wrong checksum based on data provided"
      );
    });
    it("I same checksum on same bucket and path will not result a write", async function () {
      const formData = new FormData();
      formData.append(
        "image",
        fs.createReadStream("./test/test_data/testing_pyramid.jpg")
      );
      const res = await axios.post(
        `http://${host}:${port}/blobstore?bucket=${bucket._id.toString()}&path=/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "x-ocular-token": user.apiKey,
          },
        }
      );
      jpgId = res.data._id;
      assert.ok(
        res.data.path === "/testing_pyramid.jpg",
        "File path is not correct"
      );
      assert.ok(
        res.data.checksum === "99fbb4414c807d4cf5bd2be3037a9b22",
        "Wrong checksum based on data provided"
      );
    });
    it("I can upload JPEG", async function () {});
    it("I can fetch image from server ", async function () {
      const res = await axios.get(`http://localhost:3030/blobstore/${jpgId}`, {
        headers: {
          "x-ocular-token": user.apiKey,
        },
      });

      assert.ok(
        checksum(res.data) === "6dcf90a0900879bfb5c9592e2396d6ad",
        "Image checksum does not match"
      );
    });
    it("I can fetch image from server with bw", async function () {
      const res = await axios.get(
        `http://localhost:3030/blobstore/${jpgId}?bw=1`,
        {
          headers: {
            "x-ocular-token": user.apiKey,
          },
        }
      );

      assert.ok(
        checksum(res.data) === "528c1095702e4450c316c5300591c741",
        "Image checksum does not match"
      );
    });
    it("I can fetch image from server with fit cover", async function () {
      const res = await axios.get(
        `http://localhost:3030/blobstore/${jpgId}?fit=cover`,
        {
          headers: {
            "x-ocular-token": user.apiKey,
          },
        }
      );
      assert.ok(
        checksum(res.data) === "fe0135bd078950359df04d71c1b08007",
        "Image checksum does not match"
      );
    });
    it("I can fetch image from server with fit cover and custom height", async function () {
      const res = await axios.get(
        `http://localhost:3030/blobstore/${jpgId}?height=200&width=200&fit=cover`,
        {
          headers: {
            "x-ocular-token": user.apiKey,
          },
        }
      );

      assert.ok(
        checksum(res.data) === "4992a3db3ca18b6496714f573a9fd8a1",
        "Image checksum does not match"
      );
    });
    it("I can get bucket file tree object", async function () {
      const res = await axios.get(
        `http://localhost:3030/blobstore/?bucket=${bucket._id.toString()}&tree=1`,

        {
          headers: {
            "x-ocular-token": user.apiKey,
          },
        }
      );

      assert.ok(
        res.data.data[0].children.length === 2,
        "Files from tree seem to be missing"
      );
    });
    it("I will get an error if not specificing bucket while trying to fetch tree", async function () {
      try {
        const res = await axios.get(
          `http://localhost:3030/blobstore/?tree=1`,

          {
            headers: {
              "x-ocular-token": user.apiKey,
            },
          }
        );
        assert.fail("should never get here");
      } catch (error) {
        assert.ok(
          error.response.data.message ===
            "Please specify bucket for query /blobstore?bucket={bucket_id}"
        );
      }
    });
    it("I will get an error if not specificing bucket while trying to fetch tree", async function () {
      try {
        const res = await axios.get(
          `http://localhost:3030/blobstore/?bucket=${bucket._id.toString()}&tree=1`,

          {
            headers: {
              "x-ocular-token": invalidUser.apiKey,
            },
          }
        );
        assert.fail("should never get here");
      } catch (error) {
        assert.ok(
          error.response.data.message ===
            "Bucket access is not allowed for this user"
        );
      }
    });
    it("I will get an error if fetching from blacklisted of bucket", async function () {});
  });
});
