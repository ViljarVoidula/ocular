import Ajv from "ajv";
import { BadRequest } from "@feathersjs/errors";

export default function validate(schema: {}, data: {}) {
  const ajv = new Ajv();
  const valid = ajv.validate(schema, data);
  if (!valid) {
    throw new BadRequest("Input data validation failed", {
      errors: ajv.errors,
    });
  }
}
