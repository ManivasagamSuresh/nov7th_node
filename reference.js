const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
const dotenv = require("dotenv").config();
const URL = process.env.DB;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
// Dont use @ symbol in password

// Midleware
app.use(
  cors({
    // origin: "https://lucent-pudding-6526a3.netlify.app",
    origin: "*",
  })
);

app.use(express.json());

let authorize = (req, res, next) => {
  try {
    // Check if authorization token present
    console.log(req.headers);
    if (req.headers.authorization) {
      // Check if the token is valid
      let decodedToken = jwt.verify(req.headers.authorization, JWT_SECRET);
      if (decodedToken) {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
      // if valid say next()
      // if not valid say unauthorized
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

let products = [];

app.post("/user/register", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    // Hash the password
    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt); // $2a$10$nM/BXB6Pfz9r0m3yznVjouOENpKdqnMxqRuZWmlQgaU1XLOrL14KW
    req.body.password = hash;

    // Select Collection
    // Do operation (CRUD)
    const user = await db.collection("users").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({ message: "User created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });

    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        // Issue Token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "2m",
        });
        res.json({ message: "Success", token });
      } else {
        res.json({ message: "Incorrect Username/Password" });
      }
    } else {
      res.status(404).json({ message: "Incorrect Username/Password" });
    }
  } catch (error) {}
});

// Create
app.post("/product", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    // Select Collection
    // Do operation (CRUD)
    const product = await db.collection("products").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({ message: "Product created", id: product.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // req.body.id = products.length + 1;
  // products.push(req.body);
  // res.json({ message: "Product added",id : products.length });
});

// Read
app.get("/products", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    // Select Collection
    // Do operation (CRUD)
    const product = await db.collection("products").find({}).toArray();

    // Close the connection
    await connection.close();

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// URL Parameter // 3
app.put("/product/:productId", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    const productData = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    if (productData) {
      // Select Collection
      // Do operation (CRUD)
      delete req.body._id;
      const product = await db
        .collection("products")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.productId) },
          { $set: req.body }
        );

      // Close the connection
      await connection.close();

      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // const productId = req.params.productId;

  // const productIndex = products.findIndex((prod) => prod.id == productId);

  // if (productIndex != -1) {
  //   const keys = Object.keys(req.body); // [ 'price', 'name', 'instock' ]

  //   keys.forEach((key) => {
  //     products[productIndex][key] = req.body[key];
  //   });

  //   res.json({ message: "Done" });
  // } else {
  //   res.status(404).json({ message: "Product not found" });
  // }
});

app.get("/product/:productId", authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    // Select Collection
    // Do operation (CRUD)
    const product = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    // Close the connection
    await connection.close();

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.delete(`/product/:productId`, authorize, async (req, res) => {
  try {
    // Connect the Database
    const connection = await mongoclient.connect(URL);

    // Select the DB
    const db = connection.db("B29WDT2");

    const productData = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    if (productData) {
      // Select Collection
      // Do operation (CRUD)
      const product = await db
        .collection("products")
        .deleteOne({ _id: mongodb.ObjectId(req.params.productId) });

      // Close the connection
      await connection.close();

      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }

  // const productId = req.params.productId;
  // const productIndex = products.findIndex((prod) => prod.id == productId);
  // products.splice(productIndex, 1);
  // res.json({ message: "Deleted" });
});

app.listen(process.env.PORT || 3003);