"use strict";

const homeController = require("./controllers/home");
const postController = require("./controllers/postController");
const newUserController = require("./controllers/user/newUser");
const storeUserController = require("./controllers/user/storeUser");
const loginController = require("./controllers/user/login");
const logoutController = require("./controllers/user/logout");
const loginUserController = require("./controllers/user/loginUser");
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
  app.get("/post/:id", postController.getPost);
  app.get("/posts/new", authMiddleware(), postController.newPost);
  app.post(
    "/posts/store",
    authMiddleware(),
    /*validateStorePostImageMiddleWare(), */ postController.storePost
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
