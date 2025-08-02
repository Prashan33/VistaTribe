const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

router
  .route("/register")
  .get(users.renderRegister)
  .post(users.register);

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
