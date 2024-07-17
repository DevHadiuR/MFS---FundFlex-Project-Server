const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// middleweare
app.use(cors());
app.use(express.json());

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://assignment-12-novahomes-proj.web.app",
//       "https://assignment-12-novahomes-proj.firebaseapp.com",
//     ],
//   })
// );

app.get("/", async (req, res) => {
  res.send("Funflex Server Site Activate!");
});

app.listen(port, () => {
  console.log("Server is running on port : ", port);
});
