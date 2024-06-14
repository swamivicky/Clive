const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser"); // Import cookie-parser module
const { Signvalidate, Logvalidate } = require("./controllers/validateform");
const pool = require("./dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "Clive0100100101000001";
const moment = require("moment");
let TF = 0;

require("dotenv").config();

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.ENVIRONMENT === "production",
      httpOnly: true,
      sameSite: process.env.ENVIRONMENT === "production" ? "none" : "Lax",
    },
  })
);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.post("/register", async (req, res) => {
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
        "INSERT INTO users(phonenumber,username, passhash,status) VALUES ($1, $2, $3,$4) RETURNING username",
        [req.body.PhoneNumber, req.body.UserName, hashedPass, 0]
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

app.post("/login", async (req, res) => {
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
        const info = {
          UToken: token,
          loged: 1,
        };
        res.json(info);
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

app.get("/Clive", async (req, res) => {
  const jwtToken = req.headers.authorization;

  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");

        const Owner = await pool.query(
          "SELECT phonenumber,username,status FROM users WHERE phonenumber=$1",
          [verify.phonenumber]
        );
        const Auth = Owner.rows[0]; // This should directly contain the user data, not an array of rows

        const Clist = await pool.query(
          "SELECT  owner,c_name,c_phonenum FROM contacts WHERE owner=$1",
          [verify.phonenumber]
        );

        console.log(Auth.status);

        const updatedList = Clist.rows.map((contact) => {
          if (Auth && contact.owner === Auth.phonenumber) {
            // Check if Auth is not undefined/null
            return { ...contact, status: Auth.status };
          } else {
            // If no matching owner is found in Auth, return the contact as is
            return contact;
          }
        });
        const response = {
          list: updatedList,
          v: {
            owner: Auth.username,
            phone_N: Auth.phonenumber,
          },
        };

        console.log(response);

        res.json(response);
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
app.post("/Create", async (req, res) => {
  const jwtToken = req.headers.authorization;
  console.log(jwtToken);
  if (!jwtToken) {
    console.error("JWT token not provided in headers");
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
      "SELECT phonenumber, username,status FROM users WHERE phonenumber=$1",
      [req.body.PhoneNumber]
    );
    const existingContactsQuery = await pool.query(
      "SELECT c_phonenum FROM contacts WHERE owner=$1",
      [verify.phonenumber]
    );

    const userName = userNameQuery.rows[0];
    const newContactUser = newContactUserQuery.rows[0];
    const existingContacts = existingContactsQuery.rows;
    let isValidContact = true;
    console.log(newContactUser);
    for (const contact of existingContacts) {
      console.log(contact.c_phonenum);
      console.log(req.body.PhoneNumber);
      if (
        contact.c_phonenum === req.body.PhoneNumber ||
        verify.phonenumber === req.body.PhoneNumber
      ) {
        isValidContact = false;
        break; // Exit the loop early since we found a match
      }
    }

    console.log(`isValidContact var: ${isValidContact}`);
    if (newContactUserQuery.rowCount === 1 && isValidContact) {
      const newContact = {
        c_name: newContactUser.username,
        c_phonenum: req.body.PhoneNumber,
        owner: verify.phonenumber,
        status: newContactUser.status,
      };

      await pool.query(
        "INSERT INTO contacts(owner, c_name, c_phonenum) VALUES ($1, $2, $3)",
        [newContact.owner, newContact.c_name, newContact.c_phonenum]
      );

      await pool.query(
        "INSERT INTO contacts(owner, c_name, c_phonenum) VALUES ($1, $2, $3)",
        [req.body.PhoneNumber, userName.username, verify.phonenumber]
      );

      res.json(newContact);
      console.log("New contact added successfully");
    } else {
      res.status(400).json({ error: "Contact is not valid or already exists" });
      console.log("Contact is not valid or already exists");
    }
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    res.status(401).json({ error: "Invalid JWT token" });
  }
});

app.get("/Chats", async (req, res) => {
  try {
    const jwtToken = req.headers.authorization;
    const verify = jwt.verify(jwtToken, secretKey);

    console.log(verify);

    if (verify) {
      console.log("Token is valid");
      const Rdata = req.headers.data; // Assuming Rdata is a JSON string
      const data = JSON.parse(Rdata);
      console.log(data);
      const dataList = await pool.query(
        "SELECT id, authname, author_n, sentt_num, message, TO_CHAR(date, 'YYYY-MM-DD') AS date, time " +
          "FROM m_data " +
          "WHERE author_n = $1 AND sentt_num = $2 " +
          "ORDER BY id ASC",
        [data.owner, data.c_phonenum]
      );

      // Query 2: Sort by id for reversed author_n and sentt_num
      const dataL = await pool.query(
        "SELECT id, authname, author_n, sentt_num, message, TO_CHAR(date, 'YYYY-MM-DD') AS date, time " +
          "FROM m_data " +
          "WHERE author_n = $1 AND sentt_num = $2 " +
          "ORDER BY id ASC",
        [data.c_phonenum, data.owner]
      );

      const list = dataList.rows;
      const listL = dataL.rows;
      console.log(list);
      console.log(listL);
      const combinedData = list.concat(listL);
      combinedData.sort((a, b) => a.id - b.id);
      console.log(combinedData);
      res.json(combinedData);
    }
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    res.status(401).json({ error: "Invalid JWT token" });
  }
});

io.on("connection", async (socket) => {
  const CuserD = socket.handshake.headers.token;
  console.log("Received token:", CuserD);

  if (CuserD) {
    // This checks for both null and undefined
    try {
      const veri = jwt.verify(CuserD, secretKey);
      console.log("Decoded token:", veri);
      console.log("Phone number:", veri.phonenumber);
      socket.join(veri.phonenumber);
      const con = await pool.query(
        "SELECT c_phonenum FROM contacts WHERE owner = $1",
        [veri.phonenumber]
      );
      const contacts = con.rows;

      if (contacts.length === 0) {
        console.log("No contacts available.");
      } else {
        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          socket.to(contact.c_phonenum).emit("onStatus", veri.phonenumber);
        }
      }
      pool.query("UPDATE users SET status = $1 WHERE phonenumber = $2", [
        1,
        veri.phonenumber,
      ]);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      socket.emit("authentication error", "Invalid token");
    }
  } else {
    console.error("No token provided or token is null/undefined");
    socket.emit("authentication error", "No token provided");
  }
  socket.on("send_message", async (data) => {
    socket.to(data.sentt_num).emit("receive_message", data);
    console.log(data.time);
    console.log(data.date);
    let formattedDate = moment(data.date, "DD/MM/YYYY").format("YYYY-MM-DD");
    if (!moment(formattedDate, "YYYY-MM-DD", true).isValid()) {
      throw new Error("Invalid date format");
    }

    // Convert and format time to HH:mm:ss
    let formattedTime = moment(data.time, "H:m:s").format("HH:mm:ss");
    if (!moment(formattedTime, "HH:mm:ss", true).isValid()) {
      throw new Error("Invalid time format");
    }

    // Output formatted date and time
    console.log(formattedDate); // "2024-06-13"
    if (data.key === "vicky") {
      await pool.query(
        "INSERT INTO m_data( authname, author_n, sentt_num, message,date, time) VALUES ($1, $2, $3, $4, $5,$6)RETURNING *",
        [
          data.authname,
          data.author_n,
          data.sentt_num,
          data.message,
          formattedDate,
          formattedTime,
        ]
      );
    }
  });

  socket.on("custom-disconnect", async (data) => {
    console.log(`disconnected vicky:${data.token}`);
    const CuserD = data.token;
    console.log("Received token:", CuserD);

    if (CuserD) {
      // This checks for both null and undefined
      try {
        const veri = jwt.verify(CuserD, secretKey);
        console.log("Decoded token:", veri);
        console.log("Phone number:", veri.phonenumber);
        const con = await pool.query(
          "SELECT c_phonenum FROM contacts WHERE owner = $1",
          [veri.phonenumber]
        );
        const contacts = con.rows;

        if (contacts.length === 0) {
          console.log("No contacts available.");
        } else {
          for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            socket.to(contact.c_phonenum).emit("offStatus", veri.phonenumber);
          }
        }
        pool.query("UPDATE users SET status = $1 WHERE phonenumber = $2", [
          0,
          veri.phonenumber,
        ]);
      } catch (err) {
        console.error("JWT verification error:", err.message);
        socket.emit("authentication error", "Invalid token");
      }
    } else {
      console.error("No token provided or token is null/undefined");
      socket.emit("authentication error", "No token provided");
    }
  });
  socket.on("disconnect", (data) => {
    console.log(data);
  });
});
const port = 5001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});