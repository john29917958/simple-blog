"use strict";

const newPostController = require("./controllers/newPost");
const homeController = require("./controllers/home");
const getPostController = require("./controllers/getPost");
const storePostController = require("./controllers/storePost");
const newUserController = require("./controllers/newUser");
const storeUserController = require("./controllers/storeUser");
const loginController = require("./controllers/login");
const logoutController = require("./controllers/logout");
const loginUserController = require("./controllers/loginUser");
const validateStorePostImageMiddleWare = require("./middleware/validateStorePostImageMiddleWare");
const authMiddleware = require("./middleware/authMiddleware");
const redirectIfAuthenticatedMiddleware = require("./middleware/redirectIfAuthenticatedMiddleware");

function route(app) {
  app.get("/", homeController);
  app.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact" });
  });
  app.get("/about", (req, res) => {
    res.render("about", { title: "About" });
  });
  app.get("/post/:id", getPostController);
  app.get("/posts/new", authMiddleware(), newPostController);
  app.post(
    "/posts/store",
    authMiddleware(),
    /*validateStorePostImageMiddleWare(), */ storePostController
  );
  app.get(
    "/auth/register",
    redirectIfAuthenticatedMiddleware(),
    newUserController
  );
  app.get("/auth/login", redirectIfAuthenticatedMiddleware(), loginController);
  app.get("/auth/logout", authMiddleware(), logoutController);
  app.post(
    "/users/register",
    redirectIfAuthenticatedMiddleware(),
    storeUserController
  );
  app.post(
    "/users/login",
    redirectIfAuthenticatedMiddleware(),
    loginUserController
  );
}

module.exports = {
  route: route,
};