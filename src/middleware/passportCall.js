import passport from "passport";

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        // Si el usuario no está autenticado, devolver un error de "Unauthorized request"
        return res
          .status(401)
          .send({
            status: "error",
            error: info.message ? info.message : info.toString(),
          });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const optionalPassportCall = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
