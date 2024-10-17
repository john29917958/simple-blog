"use strict";

const BlogPost = require("../models/BlogPost");
const htmlParser = require("node-html-parser");

module.exports = async (req, res) => {
  const blogPosts = await BlogPost.find({
    $or: [
      {
        title: new RegExp(req.query.keywords),
      },
      {
        body: new RegExp(req.query.keywords),
      },
    ],
  })
    .sort({ datePosted: -1 })
    .populate("userid")
    .exec();

  addPreviewBodies(blogPosts);

  res.render("index", {
    blogPosts: blogPosts,
    title: "Home",
  });
};

function addPreviewBodies(blogPosts) {
  for (let blogPost of blogPosts) {
    addPreviewBody(blogPost);
  }
}

function addPreviewBody(blogPost) {
  const postBody = htmlParser.parse(blogPost.body);
  const previewPostBodyElems = getPreviewPostBodyElems(postBody);
  const previewPostBody = htmlParser.parse("");
  for (let previewPostBodyElem of previewPostBodyElems) {
    previewPostBody.appendChild(previewPostBodyElem);
  }
  blogPost.previewBody = previewPostBody.toString();
}

function getPreviewPostBodyElems(postBody) {
  const firstThreeElems = [];
  for (let i = 0; i < 3 && i < postBody.childNodes.length; i += 1) {
    firstThreeElems.push(postBody.childNodes[i]);
  }
  return firstThreeElems;
}
