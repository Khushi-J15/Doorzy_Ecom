import mongoose from "mongoose";
import fs from "fs";
import Product from "./models/product.js";

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read products.json (assumed in project root)
const data = JSON.parse(fs.readFileSync("../products.json", "utf-8"));

// Insert into MongoDB
Product.insertMany(data)
  .then(() => {
    console.log("Products inserted successfully.");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error inserting products:", err);
  });
