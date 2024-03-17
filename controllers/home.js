const BlogPost = require("../models/BlogPost");

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
    .populate("userid")
    .exec();
  res.render("index", {
    blogPosts,
  });
};
