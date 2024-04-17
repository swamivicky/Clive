const express = require("express");
const router = express.Router();
const validateForm = require("../controllers/validateform");
const pool = require("../dataBase");
const jwt = require("jsonwebtoken");
//const bcrypt = require("bcrypt");
const secretKey = "Clive0100100101000001";

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    validateForm(req, res);
    console.log(req.body);
    /*
    const existingUser = await pool.query(
      "SELECT username FROM users WHERE username=$1",
      [req.body.UserName]
    );

    if (existingUser.rowCount === 0) {
      if (!req.body.PassWord || req.body.PassWord.trim() === "") {
        throw new Error("Password cannot be empty");
      }
    }*/
    const user = {
      username: req.body.UserName,
      password: req.body.PassWord,
    };
    const token = jwt.sign(user, secretKey);
    console.log("Generated JWT token:", token);
    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    console.log("Cookie set with JWT token");
  
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ loggedIn: false, status: "Internal Server Error" });
  }
});
/*
router.post("/login", async (req, res) => {
  try {
    validateForm(req, res);

    const existingUser = await pool.query(
      "SELECT username FROM users WHERE username=$1",
      [req.body.UserName]
    );

    if (existingUser.rowCount === 0) {
      if (!req.body.PassWord || req.body.PassWord.trim() === "") {
        throw new Error("Password cannot be empty");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.PassWord, salt);

      const newUserQuery = await pool.query(
        "INSERT INTO users(username, passhash) VALUES ($1, $2) RETURNING username",
        [req.body.UserName, hashedPass]
      );
      res.json({ loggedIn: true, username: req.body.UserName });
    } else {
      res.json({ loggedIn: false, status: "Username taken" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ loggedIn: false, status: "Internal Server Error" });
  }
});*/

module.exports = router;
