"use strict";

const validateStorePostImageMiddleWare = () => {
  return (req, res, next) => {
    if (req.files === null) {
      let validationErrors = req.flash("validationErrors") || [];
      validationErrors.push("Please upload an heading image"); // TODO: Refactor duplicate code.
      req.flash("validationErrors", validationErrors);
      res.redirect("/posts/new");
    } else {
      next();
    }
  };
};

module.exports = validateStorePostImageMiddleWare;
