"use strict";

const BlogPost = require("../models/BlogPost");
const path = require("path");
const fs = require("fs");

module.exports.getPost = async (req, res) => {
  const blogPost = await BlogPost.findById(req.params.id).populate("userid");
  res.render("post/show", { blogPost: blogPost, title: blogPost.title });
};

module.exports.newPost = (req, res) => {
  let title = "";
  let body = "";
  let data = req.flash("data");
  if (data && data.length > 0) {
    title = data[0].title;
    body = data[0].body;
  }
  res.render("post/create", {
    validationErrors: req.flash("validationErrors"),
    title,
    body,
    createPost: true,
  });
};

module.exports.storePost = async (req, res) => {
  if (!req.files || !req.files.image) {
    req.flash("validationErrors", ["Please upload a heading image"]);
    req.flash("data", req.body);
    res.redirect("/posts/new");
  } else {
    const image = req.files.image;
    const uploadDirPath = path.join("img", "uploads");
    const relativeUploadDirPath = path.resolve(
      __dirname,
      "..",
      "public",
      uploadDirPath
    );
    if (!fs.existsSync(relativeUploadDirPath)) {
      fs.mkdirSync(relativeUploadDirPath);
    }
    const relativeUploadPath = path.join(relativeUploadDirPath, image.name);
    const imageLinkPath = path.join("/", uploadDirPath, image.name);

    image.mv(relativeUploadPath, (error) => {
      BlogPost.create({
        ...req.body,
        image: imageLinkPath,
        userid: req.session.userId,
      }).then(
        (blogPost) => {
          res.redirect("/");
        },
        (error) => {
          const validationErrors = Object.keys(error.errors).map(
            (key) => error.errors[key].message
          );
          req.flash("validationErrors", validationErrors);
          req.flash("data", req.body);
          res.redirect("/posts/new");
        }
      );
    });
  }
};
