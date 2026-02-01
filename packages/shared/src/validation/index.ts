import { ZodError } from "zod";

import { ValidationErrors } from "@worm/types/src/validation";

export function formatValidationErrors(zodError: ZodError): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const issue of zodError.errors) {
    const path = issue.path.join(".");

    if (!errors[path]) {
      errors[path] = [];
    }

    errors[path].push(issue.message);
  }

  return errors;
}
