"use strict";

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const expressSession = require("express-session");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const config = require("config");
const router = require("./router");
const connectFlash = require("connect-flash");
const path = require("path");

global.loggedIn = null;
global.appName = config.get("appName");

const mongooseConnStr = config.get("database.mongooseConnStr");
mongoose.connect(mongooseConnStr);

const app = new express();
app.use(express.static("public"));
app.use(expressLayouts);
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
app.set("layout", path.join(__dirname, "views", "layouts", "layout"));
app.set("layout extractMetas", true);
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
app.set("views", path.join(__dirname, "views"));

router.route(app);
app.use((req, res) =>
  res.status(404).render("notfound", { title: "Not Found" })
);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
