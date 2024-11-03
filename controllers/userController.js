"use strict";

const User = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const asyncHandler = require("express-async-handler");

module.exports.login = (req, res) => {
  let username = "";
  const data = req.flash("data");
  if (data && data.length > 0) {
    username = data[0].username;
  }
  res.render("user/login", {
    validationError: req.flash("validationError"),
    username,
    title: "Login",
  });
};

module.exports.loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .exec()
    .then(
      (user) => {
        if (user) {
          bcrypt.compare(password, user.password, (error, isSame) => {
            if (isSame) {
              req.session.userId = user._id;
              req.session.username = user.username;
              res.redirect("/");
            } else {
              req.flash("validationError", "Incorrect password");
              req.flash("data", req.body);
              res.redirect("/auth/login");
            }
          });
        } else {
          req.flash("validationError", "Incorrect username");
          res.redirect("/auth/login");
        }
      },
      (error) => {
        console.log("Login error: ", error);
      }
    );
});

module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

module.exports.newUser = (req, res) => {
  var username = "";
  var password = "";
  const data = req.flash("data")[0];

  if (typeof data != "undefined") {
    username = data.username;
    password = data.password;
  }
  res.render("user/register", {
    errors: req.flash("validationErrors"),
    username,
    password,
    title: "Register",
  });
};

module.exports.storeUser = (req, res) => {
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
