"use strict";

const express = require("express");
const expressSession = require("express-session");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const config = require("config");
const router = require("./router");
const connectFlash = require("connect-flash");

global.loggedIn = null;
global.appName = config.get("appName");

const mongooseConnStr = config.get("database.mongooseConnStr");
mongoose.connect(mongooseConnStr);

const app = new express();
app.use(express.static("public"));
app.use(express.json());
app.use(expressSession({ secret: "keyboard cat" }));
app.use(connectFlash());
app.use(express.urlencoded());
app.use(fileUpload());
app.use("*", (req, res, next) => {
  loggedIn = req.session.userId;
  next();
});
app.set("view engine", "ejs");
router.route(app);
app.use((req, res) => res.render("notfound", { title: "Not Found" }));

let port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
