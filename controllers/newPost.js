module.exports = (req, res) => {
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
