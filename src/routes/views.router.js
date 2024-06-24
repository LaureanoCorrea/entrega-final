import { Router } from "express";
import ViewController from "../controllers/views.controller.js";
import {
  optionalPassportCall,
  passportCall,
} from "../middleware/passportCall.js";
import authorization from "../middleware/authentication.middleware.js";

const viewRouter = Router();
const viewController = new ViewController();

viewRouter.get("/", viewController.login);
viewRouter.get("/login", viewController.login);
viewRouter.get("/register", viewController.register);
viewRouter.get("/cart", passportCall(["jwt"]), viewController.cart);
viewRouter.get(
  "/products",
  optionalPassportCall(["jwt"]),
  viewController.products
);
viewRouter.get(
  "/productDetails/:pid",
  optionalPassportCall(["jwt"]),
  viewController.productDetails
);
viewRouter.get("/forgotPassword", viewController.forgotPassword);
viewRouter.get("/expiredResetLink", viewController.expiredResetLink);
viewRouter.get("/loggerTest", viewController.loggerTest);

viewRouter.get(
  "/chat",
  passportCall(["jwt"]),
  authorization(["user"]),
  viewController.chat
);

viewRouter.get(
  "/realtimeproducts",
  passportCall(["jwt"]),
  authorization(["premium", "admin"]),
  viewController.realtimeproducts
);

viewRouter.get(
  "/current",
  passportCall(["jwt"]),
  authorization(["user", "admin", "premium"]),
  viewController.current
);

viewRouter.get(
  "/ticket/:oid",
  passportCall(["jwt"]),
  authorization(["user", "admin", "premium"]),
  viewController.ticket
);

viewRouter.get(
  "/changeRole",
  passportCall(["jwt"]),
  authorization(["admin"]),
  viewController.changeRole
);

export default viewRouter;
