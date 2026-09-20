import { ApiError } from "./ApiError.js";

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Invalid query parameters", errors));
    }
    req.query = result.data;
    next();
  };
}
