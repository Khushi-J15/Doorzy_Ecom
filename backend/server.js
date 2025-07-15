import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import stripe from "stripe";
import Product from "./models/product.js";
import User from "./models/user.js";

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: String, required: true }, // Match product.id (string)
      quantity: { type: Number, required: true, min: 1 },
      deliveryOptionId: { type: String, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  paymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);


dotenv.config();
const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_your_stripe_secret_key";

const stripeClient = stripe(STRIPE_SECRET_KEY);


app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB fails
  });

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ message: "Authentication required" });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = user.userId;
    next();
  });
};

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Products endpoint
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Products error:", err.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// New endpoint to fetch products by IDs
app.post("/api/products/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Array of product IDs required" });
    }
    const products = await Product.find({ id: { $in: ids } });
    res.json({ result: products });
  } catch (err) {
    console.error("Products by IDs error:", err.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


// Register endpoint
app.post("/auth/register", async (req, res) => {
  const { email, name, phoneNumber, password } = req.body;
  if (!email || !name || !phoneNumber || !password) {
    console.error("Missing fields in register request:", req.body);
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const user = new User({ email, name, phoneNumber, password, role: "USER" });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Registration successful", token, role: user.role });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.error("Missing email or password in login request:", req.body);
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      console.error("Invalid credentials for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// User info endpoint
app.get("/user/my-info", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      console.error("User not found for ID:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("User info error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/products/bulk", authenticateToken, async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products array required" });
    }

    await Product.insertMany(products);
    res.status(201).json({ message: "Products imported successfully" });
  } catch (error) {
    console.error("Bulk import error:", error.message);
    res.status(500).json({ message: "Failed to import products" });
  }
});

app.post("/user/address", authenticateToken, async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;

    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = { street, city, state, zipCode, country };
    await user.save();

    res.status(200).json({ message: "Address added successfully", address: user.address });
  } catch (err) {
    console.error("Address error:", err.message);
    res.status(500).json({ message: "Failed to add address" });
  }
});





// Create order endpoint with Stripe payment
app.post("/create-order", authenticateToken, async (req, res) => {
  if (!req.body) {
    console.error("Request body is undefined");
    return res.status(400).json({ message: "Request body is required" });
  }
  const { totalPrice, items } = req.body;
  if (!totalPrice || !items || !Array.isArray(items) || items.length === 0) {
    console.error("Invalid order request:", req.body);
    return res.status(400).json({ message: "Total price and items are required" });
  }
  try {
    // Validate products and deliveryOptionId
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (!item.deliveryOptionId || !['1', '2', '3'].includes(item.deliveryOptionId)) {
        return res.status(400).json({ message: `Invalid deliveryOptionId: ${item.deliveryOptionId}` });
      }
    }
    // Create Stripe payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { userId: req.userId },
    });
    // Create order
    const order = new Order({
      userId: req.userId,
      items,
      totalPrice,
      paymentIntentId: paymentIntent.id,
    });
    await order.save();
    res.status(200).json({
      message: "Order created, proceed to payment",
      orderId: order._id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Order creation error:", err.message);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Confirm payment endpoint
app.post("/confirm-payment", authenticateToken, async (req, res) => {
  const { orderId, paymentIntentId } = req.body;
  if (!orderId || !paymentIntentId) {
    return res.status(400).json({ message: "Order ID and Payment Intent ID are required" });
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === "succeeded") {
      order.paymentStatus = "completed";
      await order.save();
      res.json({ message: "Payment confirmed, order completed" });
    } else {
      order.paymentStatus = "failed";
      await order.save();
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (err) {
    console.error("Payment confirmation error:", err.message);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});