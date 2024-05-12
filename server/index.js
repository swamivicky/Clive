const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser"); // Import cookie-parser module
const router = require("./routes/authRouter");

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
app.use("/auth", router);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("send_message", (data) => {
    console.log(data);
    socket.to(data.room).emit("receive_message", data);
  });
  socket.on("join_room", (room) => {
    socket.join(room);
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});
const port = 5001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
