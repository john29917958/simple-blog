"use strict";

const User = require("../models/User");
const path = require("path");

module.exports = (req, res) => {
  User.create(req.body).then(
    (user) => {
      res.redirect("/");
    },
    (error) => {
      const validationErrors = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      req.flash("validationErrors", validationErrors);
      req.flash("data", req.body);
      res.redirect("/auth/register");
    }
  );
};
