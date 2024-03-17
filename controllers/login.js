module.exports = (req, res) => {
  let username = "";
  const data = req.flash("data");
  if (data && data.length > 0) {
    username = data[0].username;
  }
  res.render("login", {
    validationError: req.flash("validationError"),
    username,
  });
};
