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
      "SELECT phonenumber FROM users WHERE phonenumber=$1",
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
      res.json(TF);
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});

router.get("/Clive", async (req, res) => {
  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");
        const Clist = await pool.query(
          "SELECT  roomid,owner,c_name,c_phonenum FROM contacts WHERE owner=$1",
          [verify.phonenumber]
        );
        const res = {
          list: Clist.rows,
          owner: verify.phonenumber,
        };
        console.log(Clist.rows);
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

  if (!jwtToken) {
    console.error("JWT token not provided in cookies");
    return res.status(401).json({ error: "JWT token must be provided" });
  }

  try {
    const verify = jwt.verify(jwtToken, secretKey);

    if (!verify) {
      console.log("Token is invalid");
      return res.status(401).json({ error: "Invalid JWT token" });
    }

    console.log("Token is valid");
    const userNameQuery = await pool.query(
      "SELECT username FROM users WHERE phonenumber=$1",
      [verify.phonenumber]
    );
    const newContactUserQuery = await pool.query(
      "SELECT phonenumber, username FROM users WHERE phonenumber=$1",
      [req.body.PhoneNumber]
    );
    const existingContactsQuery = await pool.query(
      "SELECT roomid FROM contacts WHERE owner=$1",
      [verify.phonenumber]
    );

    const userName = userNameQuery.rows[0];
    const newContactUser = newContactUserQuery.rows[0];
    const existingContacts = existingContactsQuery.rows;
    let isValidContact = true;

    for (const contact of existingContacts) {
      if (
        contact.roomid === verify.phonenumber + req.body.PhoneNumber ||
        contact.roomid === req.body.PhoneNumber + verify.phonenumber ||
        verify.phonenumber === req.body.PhoneNumber
      ) {
        isValidContact = false;
        break;
      }
    }

    if (newContactUserQuery.rowCount === 1 && isValidContact) {
      const newContact = {
        roomid: verify.phonenumber + req.body.PhoneNumber,
        owner: verify.phonenumber,
        participant: newContactUser.username,
        participant_N: req.body.PhoneNumber,
      };

      await pool.query(
        "INSERT INTO contacts(owner, roomid, c_name, c_phonenum) VALUES ($1, $2, $3, $4)",
        [
          newContact.owner,
          newContact.roomid,
          newContact.participant,
          newContact.participant_N,
        ]
      );

      await pool.query(
        "INSERT INTO contacts(owner, roomid, c_name, c_phonenum) VALUES ($1, $2, $3, $4)",
        [
          req.body.PhoneNumber,
          newContact.roomid,
          userName.username,
          verify.phonenumber,
        ]
      );

      res.json(newContact);
      console.log(true);
    } else {
      console.log(false);
    }
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    res.status(401).json({ error: "Invalid JWT token" });
  }
});

module.exports = router;
