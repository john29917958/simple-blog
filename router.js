"use strict";

const homeController = require("./controllers/home");
const postController = require("./controllers/postController");
const userController = require("./controllers/userController");
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
  app.get("/post/new", authMiddleware(), postController.newPost);
  app.get("/post/:id", postController.getPost);
  app.post(
    "/post/store",
    authMiddleware(),
    /*validateStorePostImageMiddleWare(), */ postController.storePost
  );
  app.get(
    "/auth/register",
    redirectIfAuthenticatedMiddleware(),
    userController.newUser
  );
  app.get(
    "/auth/login",
    redirectIfAuthenticatedMiddleware(),
    userController.login
  );
  app.get("/auth/logout", authMiddleware(), userController.logout);
  app.post(
    "/users/register",
    redirectIfAuthenticatedMiddleware(),
    userController.storeUser
  );
  app.post(
    "/users/login",
    redirectIfAuthenticatedMiddleware(),
    userController.loginUser
  );
}

module.exports = {
  route: route,
};
