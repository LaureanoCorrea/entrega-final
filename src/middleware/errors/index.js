import { logger } from "../../utils/logger.js";
import EErrors from "../../utils/errors/enums.js";

const errorHandler = (error, req, res, next) => {
  logger.error(error.cause);

  switch (error.code) {
    case EErrors.INVALID_TYPE_ERROR:
      return res.send({ status: "error", error: error.name });
      break;

    case EErrors.DATABASE_ERROR:
      return res.send({ status: "error", error: error.name });
      break;

    case EErrors.MISSING_PRODUCT_FIELDS:
      return res.send({ status: "error", error: error.name });
      break;

    case EErrors.INVALID_FIELDS:
      return res.send({ status: "error", error: error.name });
      break;

    case EErrors.ROUTING_ERROR:
      return res.send({ status: "error", error: error.name });
      break;

    default:
      return res.send({ status: "error", error: "Unhandled error" });
      break;
  }
};

export default errorHandler;
