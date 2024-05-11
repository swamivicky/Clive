const express = require("express");
const router = express.Router();
const { validateSign, validateLog } = require("../controllers/validateform");
const pool = require("../dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "Clive0100100101000001";

router.post("/register", async (req, res) => {
  try {
    await validateSign(req, res);

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
      res.json("Account created");
    } else {
      res.json(`User ${req.body.UserName} exists. Please log in.`);
      res.status(200);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    await validateLog(req, res);

    const existingUser = await pool.query(
      "SELECT username, passhash FROM users WHERE username=$1",
      [req.body.UserName]
    );

    if (existingUser.rowCount === 1) {
      const user = existingUser.rows[0];

      if (bcrypt.compareSync(req.body.PassWord, user.passhash)) {
        const token = jwt.sign({ username: user.username }, secretKey);
        res.cookie("jwtToken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        res.json({ loggedIn: true });
      } else {
        res.status(401).json({ loggedIn: false, error: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ loggedIn: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.get("/Clive", (req, res) => {
  console.log(req.cookies);

  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");
      } else {
        console.log("Token is invalid");
      }
    } catch (error) {
      console.error("Error verifying JWT token:", error);
      res.status(401).json({ error: "Invalid JWT token" });
    }
  } else {
    console.error("JWT token not provided in cookies");
    res.status(401).json({ error: "JWT token must be provided" });
  }
});

module.exports = router;
