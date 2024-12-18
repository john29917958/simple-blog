"use strict";

const BlogPost = require("../models/BlogPost");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

module.exports.getPost = asyncHandler(async (req, res) => {
  const blogPost = await BlogPost.findById(req.params.id).populate("userid");
  res.render("post/show", { blogPost: blogPost, title: blogPost.title });
});

module.exports.newPost = (req, res) => {
  const post = {
    title: null,
    body: null,
  };
  setPrevDataToPost(req.flash("data"), post);
  res.render("post/create", {
    validationErrors: req.flash("validationErrors"),
    title: "New Post",
    blogPost: post,
    createPost: true,
  });
};

module.exports.storePost = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    req.flash("validationErrors", ["Please upload a heading image"]);
    req.flash("data", req.body);
    res.redirect("/post/new");
  } else {
    handleUploadImage(req.files.image, req.session.userId).then(
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
        console.error("Upload image failed: ", error);
      }
    );
  }
});

module.exports.editPost = asyncHandler(async (req, res) => {
  const post = await getPostViewData(req.params.id);
  setPrevDataToPost(req.flash("data"), post);
  res.render("post/edit", {
    blogPost: post,
    title: "Edit",
    createPost: true,
    validationErrors: req.flash("validationErrors"),
  });
});

module.exports.updatePost = asyncHandler(async (req, res) => {
  if (req.files && req.files.image) {
    handleUploadImage(req.files.image, req.session.userId).then(
      async (imageLink) => {
        const post = await BlogPost.findById(req.params.id).exec();
        const originalPostImagePath = getPostImageAbsPath(post.image);
        updateBlogPost(req.params.id, req.body, imageLink).then(() => {
          onUpdateSuccess();
          fs.unlink(originalPostImagePath, () => {});
        }, onUpdateFailure);
      },
      (error) => {
        req.flash("validationErrors", [
          "Failed to upload the image, please try again later.",
        ]);
        res.redirect("/post/" + req.params.id + "/edit");
        console.error("Upload updated image failed: ", error);
      }
    );
  } else {
    updateBlogPost(req.params.id, req.body).then(
      onUpdateSuccess,
      onUpdateFailure
    );
  }

  function onUpdateSuccess() {
    res.redirect("/post/" + req.params.id);
  }

  function onUpdateFailure(error) {
    const validationErrors = getValiationErrorMessages(error);
    req.flash("validationErrors", validationErrors);
    req.flash("data", req.body);
    res.redirect("/post/" + req.params.id + "/edit");
    console.error("Update post error: ", error);
  }
});

module.exports.destroy = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await BlogPost.findById(postId);
  await BlogPost.findByIdAndDelete(postId);
  const postImagePath = getPostImageAbsPath(post.image);
  fs.unlink(postImagePath, () => {});
  res.redirect("/");
});

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

function setPrevDataToPost(prevData, post) {
  if (prevData != null && prevData.length > 0) {
    post.title = prevData[0].title;
    post.body = prevData[0].body;
  }
}

function updateBlogPost(id, post, imageUploadLink) {
  var updateData = {
    title: post.title.trim(),
    body: post.body.trim(),
    dateUpdated: new Date(),
  };
  if (imageUploadLink) {
    updateData.image = imageUploadLink;
  }
  return BlogPost.findByIdAndUpdate(id, updateData, {
    runValidators: true,
  });
}

function handleUploadImage(image, userId) {
  const uploadDirPath = path.join("img", "uploads");
  const absUploadDirPath = path.resolve(
    __dirname,
    "..",
    "public",
    uploadDirPath
  );
  createUploadImageDirIfNotExists(absUploadDirPath);
  const formattedImageName = getFormattedImageNameWithoutExtension(
    image.name,
    userId
  );
  const uploadImagePath =
    path.join(absUploadDirPath, formattedImageName) + ".jpg";
  const imageLinkPath =
    path.join("/", uploadDirPath, formattedImageName) + ".jpg";
  const compressImagePromise = new Promise((resolve, reject) => {
    compressImage(image, uploadImagePath).then(
      resolve.bind(null, imageLinkPath),
      (error) => {
        reject(error);
        console.error("Compress image failed", error);
      }
    );
  });
  return compressImagePromise;
}

function createUploadImageDirIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

function getFormattedImageNameWithoutExtension(imageName, userId) {
  const currDate = new Date();
  let formattedImageName =
    currDate.getFullYear().toString() +
    (currDate.getMonth() + 1).toString() +
    currDate.getDate().toString() +
    currDate.getHours().toString() +
    currDate.getMinutes().toString() +
    currDate.getSeconds().toString() +
    currDate.getMilliseconds().toString() +
    "-" +
    userId;
  return formattedImageName;
}

function compressImage(image, uploadImagePath) {
  return sharp(image.data).jpeg({ quality: 40 }).toFile(uploadImagePath);
}

function getValiationErrorMessages(error) {
  const validationErrors = Object.keys(error.errors).map(
    (key) => error.errors[key].message
  );
  return validationErrors;
}

function getPostImageAbsPath(imageLink) {
  let normalizedImageLink = "";
  if (imageLink.startsWith("/")) {
    normalizedImageLink = imageLink.substring(1);
  } else {
    normalizedImageLink = imageLink;
  }
  const absImagePath = path.resolve(
    __dirname,
    "..",
    "public",
    normalizedImageLink
  );
  return absImagePath;
}
