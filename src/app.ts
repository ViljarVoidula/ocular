import compress from "compression";
import helmet from "helmet";
import cors from "cors";

import express from "@feathersjs/express";
import feathers from "@feathersjs/feathers";
import configuration from "@feathersjs/configuration";
import { Application } from "./declarations";

import caching from "./cache";

import nats from "./nats";
import mongodb from "./mongodb";
import appdb from "./appdb";

import logger from "./logger";
import services from "./services";
import appHooks from "./app.hooks";
import authentication from "./authentication";

import prometheus from "express-prom-bundle";

const prometheusMetrics = prometheus({
  includeMethod: true,
  includePath: true,
  customLabels: {
    application: "ocular",
  },
  urlValueParser: {
    minHexLength: 5,
    extraMasks: [
      "^[0-9]+\\.[0-9]+\\.[0-9]+$", // replace dot-separated dates with #val
    ],
  },
  metricType: "summary",
});

const app: Application = express(feathers());

app.configure(configuration());

app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(app.get("public")));
app.use(prometheusMetrics);

app.configure(caching);
app.configure(nats);
app.configure(mongodb);
app.configure(appdb);

app.configure(express.rest());

app.configure(authentication);
app.configure(services);
app.get("/health", (_req, res) => {
  const data = {
    uptime: process.uptime(),
    message: "OK",
    date: new Date(),
  };

  res.status(200).json(data);
});
// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

export default app;
