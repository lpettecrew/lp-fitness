import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
  const errors: Array<{ field: string | undefined; message: string }> = [];
  err.inner.forEach((e) => {
    errors.push({
      field: e.path,
      message: e.message,
    });
  });

  return errors;
};
