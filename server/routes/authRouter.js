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
    const user = {
      username: req.body.UserName,
      password: req.body.PassWord,
      phonenumber: req.body.PhoneNumber,
    };

    const existingUserPN = await pool.query(
      "SELECT phonenumber FROM users WHERE phonenumber=$1",
      [req.body.PhoneNumber]
    );

    let Pnumber = 1;
    if (existingUserPN.rowCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.PassWord, salt);

      const newUserQuery = await pool.query(
        "INSERT INTO users(phonenumber,username, passhash) VALUES ($1, $2,$3)",
        [user.phonenumber, user.username, hashedPass]
      );
      Pnumber = 1;
    } else {
      Pnumber = 0;
    }
    res.json(Pnumber);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    await validateLog(req, res);

    const user = {
      number: req.body.PhoneNumber,
      password: req.body.PassWord,
    };

    const existingUser = await pool.query(
      "SELECT phonenumber, passhash FROM users WHERE phonenumber=$1",
      [req.body.PhoneNumber]
    );

    userpg = existingUser.rows[0];

    const pgusers = {
      phonenumber: userpg.phonenumber,
      passhash: userpg.passhash,
    };

    if (
      user.number === pgusers.phonenumber &&
      bcrypt.compareSync(user.password, pgusers.passhash)
    ) {
      const token = jwt.sign(user, secretKey);
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.json({ loggedIn: true });
    } else {
      res.status(401).json({ loggedIn: false, error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.get("/Clive", (req, res) => {
  console.log(req.cookies);

  // Extract JWT token from cookies
  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    try {
      // Verify JWT token directly without stringification
      const verify = jwt.verify(jwtToken, secretKey);

      // Log verification result
      console.log(verify);

      if (verify) {
        console.log("Token is valid");
        // Do something when token is valid
      } else {
        console.log("Token is invalid");
        // Do something when token is invalid
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
