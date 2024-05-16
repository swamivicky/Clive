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
      [req.body.UserName]
    );

    if (existingUser.rowCount === 0) {
      if (!req.body.PassWord || req.body.PassWord.trim() === "") {
        throw new Error("Password cannot be empty");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.PassWord, salt);

      const newUserQuery = await pool.query(
        "INSERT INTO users(phonenumber,username, passhash) VALUES ($1, $2, $3) RETURNING username",
        [req.body.PhoneNumber,req.body.UserName, hashedPass]
      );
      await pool.query(
        `ALTER TABLE contacts ADD COLUMN "${req.body.PhoneNumber}" VARCHAR(20)`
      );
      TF = 1;
      res.json(TF);
    } else {
      TF=2;
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
        TF=2;
        res.json(TF);
      }
    } else {
      TF=3;
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
const UserP = verify.phonenumber;
const CreateP = req.body.PhoneNumber;
console.log(UserP,CreateP);
        const existingNum = await pool.query(
          "SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = $1",
          [req.body.PhoneNumber]
        );
        if(existingNum.rowCount === 1){
const Contact = UserP + CreateP;
console.log(Contact);
        }else{
          TF = 0;
          res.json(TF);
        }
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
