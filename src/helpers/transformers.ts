import sharp, { FitEnum } from "sharp";
import { Readable } from "stream";

interface TranformerOptions {
  width?: number;
  height?: number;
  fit?: FitEnum;
  extension?: string;
  bg?: boolean;
  bw?: boolean;
}

const base64ToBuffer = function (input) {
  let base64Data = input.replace(/^.*base64,/, "");
  base64Data += base64Data.replace("+", " ");
  const byteString = Buffer.from(base64Data, "base64");

  return byteString;
};

function Base64ToStream(base64) {
  const bufferStream = Readable.from(base64ToBuffer(base64));

  return bufferStream;
}

function SharpTransformer(options) {
  const { width, height, quality, fit, extension, bg, bw } = options;
  const transfomerMap = {
    jpeg: sharp().jpeg({ quality }),
    jpg: sharp().jpeg({ quality }),
    png: sharp().png({ quality }),
    webp: sharp().webp({ quality }),
  };

  const transformer = transfomerMap[extension] ?? transfomerMap.webp;

  if (width || height) {
    transformer.resize(width, height, {
      fit: fit as keyof FitEnum,
    });
  }

  if (bg?.length) {
    transformer.ensureAlpha();
    transformer.flatten({ background: `#${bg.match(/[0-9a-f]+/i)}` });
  }

  if (bw) {
    transformer.toColourspace("b-w");
  }

  return transformer;
}

export { Base64ToStream, SharpTransformer };
