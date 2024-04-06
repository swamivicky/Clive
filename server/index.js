const express = require("express");
const http = require("http"); // Moved http require statement up
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const router = require("./routes/authRouter");
require("dotenv").config();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());
app.use("/auth", router);

// Moved session configuration before defining the io instance

// Removed unnecessary cors middleware declaration
// app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update this line to match your client's port
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

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
