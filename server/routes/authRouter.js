const express = require("express");
const router = express.Router();
const validateForm = require("../controllers/validateform");
const pool = require("../dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "Clive0100100101000001";

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    // Move the validation inside the try block
    await validateForm(req, res);
    console.log(req.body);

    const existingUser = await pool.query(
      "SELECT username FROM users WHERE username=$1",
      [req.body.UserName]
    );

    if (existingUser.rowCount === 0) {
      if (!req.body.PassWord || req.body.PassWord.trim() === "") {
        throw new Error("Password cannot be empty");
      }

      // Assuming the user credentials are validated and retrieved from the database
      const user = {
        username: req.body.UserName,
        password: req.body.PassWord,
      };

      // Assuming JWT token is generated and set as a cookie upon successful login
      const token = jwt.sign(user, secretKey);
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      // The following code should be inside the if block
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.PassWord, salt);

      const newUserQuery = await pool.query(
        "INSERT INTO users(username, passhash) VALUES ($1, $2) RETURNING username",
        [user.username, hashedPass]
      );
      res.json("Account created");
    } else {
      // Here you were trying to reference user.username which was not defined in this scope
      res.json(`User ${req.body.UserName} exists. Please log in.`);
      res.status(200);
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
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
});

router.get("/Clive", (req,res)  =>{

});*/
module.exports = router;
