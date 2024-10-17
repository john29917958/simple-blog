const express = require("express");
const expressSession = require("express-session");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const config = require("config");
const connectFlash = require("connect-flash");
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

global.loggedIn = null;
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
app.get("/auth/login", redirectIfAuthenticatedMiddleware(), loginController);
app.get("/auth/logout", authMiddleware(), logoutController);
app.use((req, res) => res.render("notfound", { title: "Not Found" }));

let port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
