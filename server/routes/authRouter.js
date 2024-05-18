const express = require("express");
const router = express.Router();
const { Signvalidate, Logvalidate } = require("../controllers/validateform");
const pool = require("../dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "Clive0100100101000001";
let TF = 0;
router.post("/register", async (req, res) => {
  try {
    await Signvalidate(req, res);

    const existingUser = await pool.query(
      "SELECT username FROM users WHERE username=$1",
      [req.body.PhoneNumber]
    );

    if (existingUser.rowCount === 0) {
      if (!req.body.PassWord || req.body.PassWord.trim() === "") {
        throw new Error("Password cannot be empty");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.PassWord, salt);

      const newUserQuery = pool.query(
        "INSERT INTO users(phonenumber,username, passhash) VALUES ($1, $2, $3) RETURNING username",
        [req.body.PhoneNumber, req.body.UserName, hashedPass]
      );
      let c = "c_" + req.body.PhoneNumber;
      console.log(typeof c);

      await pool.query(`
    CREATE TABLE ${c} (
      contacts VARCHAR(23)
    );
  `);

      TF = 1;
      res.json(TF);
    } else {
      TF = 2;
      res.json(TF);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    await Logvalidate(req, res);

    const existingUser = await pool.query(
      "SELECT phonenumber, passhash FROM users WHERE phonenumber=$1",
      [req.body.PhoneNumber]
    );

    if (existingUser.rowCount === 1) {
      const user = existingUser.rows[0];

      if (bcrypt.compareSync(req.body.PassWord, user.passhash)) {
        const token = jwt.sign({ phonenumber: user.phonenumber }, secretKey);
        res.cookie("jwtToken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        TF = 1;
        res.json(TF);
      } else {
        TF = 2;
        res.json(TF);
      }
    } else {
      TF = 3;
      res.json(TF)
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.get("/Clive", (req, res) => {

  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");
        res.json("hello");
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
router.post("/Create", async (req, res) => {
  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        const user = "c_" + verify.phonenumber;
        const NC = "c_" + req.body.PhoneNumber;
        const Contact = verify.phonenumber + "_C_" + req.body.PhoneNumber;
        const Rcontact = req.body.PhoneNumber + "_C_" + verify.phonenumber;
        console.log("hello1");
        const Econtact = await pool.query(
          `SELECT contacts FROM ${user} WHERE contacts=$1`,
          [Contact]);
        const REcontact = await pool.query(`SELECT contacts FROM ${user} WHERE contacts=$1`,
          [Rcontact]);
        const existingUser = await pool.query(
          "SELECT username FROM users WHERE username=$1",
          [req.body.PhoneNumber]
        );

        if (existingUser.rowCount !== 0) {
          console.log("hello2");

          if (Econtact.rowCount === 0 && REcontact.rowCount === 0) {
console.log("hello3");
            pool.query(
              `INSERT INTO ${user} (contacts) VALUES ($1)`,
              [Contact]
            );
            pool.query(
              `INSERT INTO ${NC} (contacts) VALUES ($1)`,
              [Contact]
            );
            TF = 1;
            res.json(TF);
          } else {
            TF = 0;
            res.json(TF);
          }
        } else { res.json("User not exist") }
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
