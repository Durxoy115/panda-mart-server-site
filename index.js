const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nwitteh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("panda_mart").collection("products");
    const orderCollection = client.db("panda_mart").collection("orders");
    const userCollection = client.db("panda_mart").collection("users");
    const reviewCollection = client.db("panda_mart").collection("reviews");

    // Show product in home page
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleProduct = await productCollection.findOne(query);
      res.send(singleProduct);
    });

    app.post("/addproduct", async (req, res) => {
      const addProduct = req.body;
      const result = await productCollection.insertOne(addProduct);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateItem = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: updateItem,
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(result);
    });
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    //order get
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    //Users
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const users = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: users,
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.roll === "admin";
      res.send({ admin: isAdmin });
    });

    // Make user admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { roll: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //Delete order
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    //Delete User
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // get users
    app.get("/user", async (req, res) => {
      const query = {};
      const cursour = userCollection.find(query);
      const users = await cursour.toArray();
      res.send(users);
    });

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const query = {};
      const cursour = reviewCollection.find(query);
      const review = await cursour.toArray();
      res.send(review);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("WELCOME TO Panda Mart!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
