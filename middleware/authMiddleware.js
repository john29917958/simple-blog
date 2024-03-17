const User = require("../models/User");

function authMiddleware() {
  return (req, res, next) => {
    User.findById(req.session.userId)
      .exec()
      .then(
        (user) => {
          if (!user) {
            res.redirect("/");
          } else {
            next();
          }
        },
        (error) => {
          console.log("Find user failed, error is: ", error);
          res.redirect("/");
        }
      );
  };
}

module.exports = authMiddleware;
