const BlogPost = require("../models/BlogPost");
const path = require("path");

module.exports = async (req, res) => {
  if (!req.files || !req.files.image) {
    req.flash("validationErrors", ["Please upload a heading image"]);
    req.flash("data", req.body);
    res.redirect("/posts/new");
  } else {
    const image = req.files.image;
    image.mv(
      path.resolve(__dirname, "../", "public/img", image.name),
      (error) => {
        BlogPost.create({
          ...req.body,
          image: "/img/" + image.name,
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
      }
    );
  }
};
