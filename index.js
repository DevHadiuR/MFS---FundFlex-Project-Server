const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");
const saltRounds = 5;
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

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.vuymtad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // All Collections are here
    const userCollection = client.db("fundFlexDB").collection("allUsers");

    // jwt area
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.Access_Secret_token, {
        expiresIn: "10d",
      });
      res.send({ token });
    });

    // All users collection
    app.post("/allUsers", async (req, res) => {
      const userInfo = req.body;
      const email = userInfo.email;

      const query = { email: email };
      const isEmailExist = await userCollection.findOne(query);
      if (isEmailExist) {
        return res.send({ message: "Email Already Exist!" });
      }
      const plainPin = userInfo.pinNumber;

      // hashing the pin
      bcrypt.hash(plainPin, saltRounds, async (err, hashedPin) => {
        if (err) {
          console.error("Error hashing PIN:", err);
          return res.status(500).send({ message: "Error hashing PIN" });
        }

        if (hashedPin) {
          const userData = {
            photoUrl: userInfo.photoUrl,
            name: userInfo.name,
            number: userInfo.number,
            email: userInfo.email,
            status: userInfo.status,
            pinNumber: hashedPin,
          };
          console.log(userData);
          const result = await userCollection.insertOne(userData);
          res.send(result);
        }
      });
    });

    app.post("/login-for-userInfo", async (req, res) => {
      const { identifier, loginPinNumber } = req.body;
      const query1 = { email: identifier };
      const query2 = { number: identifier };
      try {
        let user = await userCollection.findOne(query1);
        if (!user) {
          user = await userCollection.findOne(query2);
        }
        if (!user) {
          return res.status(404).send({ message: "User Not Found!" });
        }

        const hashedPin = user.pinNumber;
        const isPinMatch = await bcrypt.compare(loginPinNumber, hashedPin);
        if (!isPinMatch) {
          return res.status(401).send({ message: "Invalid PIN" });
        }

        res.send(user);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running on port : ", port);
});
