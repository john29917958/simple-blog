"use strict";

const BlogPost = require("../models/BlogPost");
const path = require("path");
const fs = require("fs");

module.exports.getPost = async (req, res) => {
  const blogPost = await BlogPost.findById(req.params.id).populate("userid");
  res.render("post/show", { blogPost: blogPost, title: blogPost.title });
};

module.exports.newPost = (req, res) => {
  const post = {
    title: null,
    body: null,
  };
  setPrevDataIfExistsToPost(req.flash("data"), post);
  res.render("post/create", {
    validationErrors: req.flash("validationErrors"),
    title: "New Post",
    blogPost: post,
    createPost: true,
  });
};

module.exports.storePost = async (req, res) => {
  if (!req.files || !req.files.image) {
    req.flash("validationErrors", ["Please upload a heading image"]);
    req.flash("data", req.body);
    res.redirect("/post/new");
  } else {
    handleUploadImage(req.files.image).then(
      (imageUploadLink) => {
        BlogPost.create({
          title: req.body.title.trim(),
          body: req.body.body.trim(),
          image: imageUploadLink,
          userid: req.session.userId,
        }).then(
          () => {
            res.redirect("/");
          },
          (error) => {
            const validationErrors = getValiationErrorMessages(error);
            req.flash("validationErrors", validationErrors);
            req.flash("data", req.body);
            res.redirect("/post/new");
          }
        );
      },
      (error) => {
        req.flash("validationErrors", [
          "Failed to upload the image, please try again later.",
        ]);
        res.redirect("/post/new");
        console.log("Upload image failed: ", error);
      }
    );
  }
};

module.exports.editPost = async (req, res) => {
  const post = await getPostViewData(req.params.id);
  setPrevDataIfExistsToPost(req.flash("data"), post);
  res.render("post/edit", {
    blogPost: post,
    title: "Edit",
    createPost: true,
    validationErrors: req.flash("validationErrors"),
  });
};

module.exports.updatePost = async (req, res) => {
  if (req.files && req.files.image) {
    handleUploadImage(req.files.image).then(updateBlogPost, (error) => {
      req.flash("validationErrors", [
        "Failed to upload the image, please try again later.",
      ]);
      res.redirect("/post/" + req.params.id + "/edit");
      console.log("Upload updated image failed: ", error);
    });
  } else {
    updateBlogPost();
  }

  function updateBlogPost(imageUploadLink) {
    var updateData = {
      title: req.body.title.trim(),
      body: req.body.body.trim(),
      dateUpdated: new Date(),
    };
    if (imageUploadLink) {
      updateData.image = imageUploadLink;
    }
    BlogPost.findByIdAndUpdate(req.params.id, updateData, {
      runValidators: true,
    }).then(
      () => {
        res.redirect("/post/" + req.params.id);
      },
      (error) => {
        const validationErrors = getValiationErrorMessages(error);
        req.flash("validationErrors", validationErrors);
        req.flash("data", req.body);
        res.redirect("/post/" + req.params.id + "/edit");
        console.log("Update post error: ", error);
      }
    );
  }
};

module.exports.destroy = async (req, res) => {
  const postId = req.params.id;
  const post = await BlogPost.findById(postId);
  await BlogPost.findByIdAndDelete(postId);
  let postImageUrl = post.image;
  if (postImageUrl.startsWith("/")) {
    postImageUrl = postImageUrl.substring(1);
  }
  const postImagePath = path.resolve(__dirname, "..", "public", postImageUrl);
  fs.unlink(postImagePath, () => {});
  res.redirect("/");
};

async function getPostViewData(id) {
  const postEntity = await BlogPost.findById(id);
  const post = {
    id: id,
    title: postEntity.title,
    body: postEntity.body,
    image: postEntity.image,
  };
  return post;
}

function setPrevDataIfExistsToPost(prevData, post) {
  if (prevData != null && prevData.length > 0) {
    post.title = prevData[0].title;
    post.body = prevData[0].body;
  }
}

function handleUploadImage(image) {
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
  const imageMovedPromise = new Promise((resolve, reject) => {
    image.mv(relativeUploadPath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(imageLinkPath);
      }
    });
  });
  return imageMovedPromise;
}

function getValiationErrorMessages(error) {
  const validationErrors = Object.keys(error.errors).map(
    (key) => error.errors[key].message
  );
  return validationErrors;
}
