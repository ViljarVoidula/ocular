import assert from "assert";
import { Server } from "http";
import axios from "axios";
import app from "../../src/app";
import crypto from "crypto";
import FormData from "form-data";
import fs from "fs";

const port = app.get("port") || 8998;
const host = app.get("host");

describe("Blobstore service tests", async function () {
  let server: Server, user: any, bucket: any, image: string | undefined;

  let invalidUser;
  before(async function () {
    try {
      server = await app.listen(Number(port));
      user = await app.services.users.create({
        email: "user@example.com",
        password: "password",
      });
      invalidUser = await app.services.users.create({
        email: "user1@example.com",
        password: "password",
      });

      bucket = await app.services.bucket.create({}, { user });
      const formData = new FormData();

      formData.append(
        "image",
        fs.createReadStream("./test/test_data/testing_pyramid.png")
      );
    } catch (error) {
      debugger;
    }
  });

  after(async function () {
    await app.services.users._remove(user?._id?.toString());
    await app.services.users._remove(invalidUser?._id?.toString());
    if (bucket) {
      await app.services.bucket._remove(bucket._id?.toString());
    }
    if (image) {
      await app.services.blobstore._remove(image);
    }
    await server.close();
  });

  describe("Bucket store service works as expected", async function () {
    it("I can add path to bucket", async function () {
      const result = await app.services.bucket.patch(bucket._id?.toString(), {
        paths: ["/", "/new/"],
      });
    });
    it("I can remove path to bucket", async function () {
      const formData = new FormData();

      formData.append(
        "image",
        fs.createReadStream("./test/test_data/testing_pyramid.png")
      );
      /*
        creating image 
        */
      const _image1 = await axios.post(
        `http://${host}:${port}/blobstore?bucket=${bucket._id.toString()}&path=/new/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "x-ocular-token": user.apiKey,
          },
        }
      );

      const result = await app.services.bucket.patch(bucket._id?.toString(), {
        paths: ["/"],
      });

      const noimage = await app.services.blobstore.find({
        query: { bucket: bucket._id.toString() },
      });
      assert.ok(noimage.total === 0, "Images left in bucket");
      assert.ok(
        result._id.toString() === bucket._id.toString(),
        "Wrong bucket"
      );

      assert.ok(result.paths.length === 1, "Paths not correct");
      assert.ok(result.paths[0] === "/", "Paths item is not correct");
    });
    it("I can delete bucket with files", async function () {
      const formData = new FormData();

      formData.append(
        "image",
        fs.createReadStream("./test/test_data/testing_pyramid.png")
      );
      /*
          creating image 
          */
      await axios.post(
        `http://${host}:${port}/blobstore?bucket=${bucket._id.toString()}&path=/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "x-ocular-token": user.apiKey,
          },
        }
      );
      const ___image = await app.services.blobstore.find({
        query: { bucket: bucket._id.toString() },
      });

      assert.ok(___image.total === 1, "Image not created in bucket");

      await app.services.bucket.remove(bucket._id.toString());

      const noimage = await app.services.blobstore.find({
        query: { bucket: bucket._id.toString() },
      });
      bucket = undefined;
      assert.ok(noimage.total === 0, "Images left in bucket");
    });
  });
});
