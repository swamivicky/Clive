const express = require("express");
const router = express.Router();
const validateForm = require("../controllers/validateform");
const pool = require("../dataBase");
const bcrypt = require("bcrypt");
router.post("/login", async (req, res) => {
  validateForm(req, res);
  console.log(req.body);
  const potentialLogin = await pool.query(
    "SELECT id, username, passhash FROM users u WHERE u.username=$1",
    [req.body.username]
  );
  if (potentialLogin.rowsCount === 0) {
    const isSamePass = await bcrypt.compare(
      req.body.password,
      potentialLogin.rows[0].passhash
    );
  }
  if (isSamePass) {
    req.session.user = {
      username: req.body.username,
      id: newUserQuery.row[0].id,
    };
  } else {
    res.json({ LoggedIn: false, status: "Wrong username or password" });
    console.log("not good");
  }
});
router.post("/register", async (req, res) => {
  validateForm(req, res);
  const existingUser = await pool.query(
    "SELECT username FROM users WHERE username=$1",
    [req.body.username]
  );
  if (existingUser.rowsCount === 0) {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUserQuery = await pool.query(
      "INSERT INTO users(username,passhash) values($1,$2)RETURNING username",

      [req.body.username, hashedPass]
    );
    req.session.user = {
      username,
      id: newUserQuery.rows[0].id,
    };
    res.json({ loggedIn: true, username: req.body.username });
  } else {
    res.json({ loggedIn: false, status: "Username taken" });
  }
});
module.exports = router;
