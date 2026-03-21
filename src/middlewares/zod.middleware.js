const formatValidationErrors = (issues = []) => {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
};

export const validateRequest = (schemas) => {
  return (req, res, next) => {
    const validationErrors = [];
    req.validated = req.validated || {};

    if (schemas.body) {
      const bodyResult = schemas.body.safeParse(req.body);
      if (!bodyResult.success) {
        validationErrors.push(
          ...bodyResult.error.issues.map((issue) => ({
            ...issue,
            path: ["body", ...issue.path],
          })),
        );
      } else {
        req.body = bodyResult.data;
        req.validated.body = bodyResult.data;
      }
    }

    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(req.params);
      if (!paramsResult.success) {
        validationErrors.push(
          ...paramsResult.error.issues.map((issue) => ({
            ...issue,
            path: ["params", ...issue.path],
          })),
        );
      } else {
        req.params = paramsResult.data;
        req.validated.params = paramsResult.data;
      }
    }

    if (schemas.query) {
      const queryResult = schemas.query.safeParse(req.query);
      if (!queryResult.success) {
        validationErrors.push(
          ...queryResult.error.issues.map((issue) => ({
            ...issue,
            path: ["query", ...issue.path],
          })),
        );
      } else {
        req.validated.query = queryResult.data;
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Error de validacion en la solicitud.",
        errors: formatValidationErrors(validationErrors),
      });
    }

    return next();
  };
};
