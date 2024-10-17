"use strict";

function redirectIfAuthenticatedMiddleware() {
  return (req, res, next) => {
    if (req.session.userId) {
      return res.redirect("/");
    } else {
      next();
    }
  };
}

module.exports = redirectIfAuthenticatedMiddleware;
