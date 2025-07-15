import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String }
});

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  product: {
    name: { type: String, required: true },
    imageUrl: { type: String },
  },
  status: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true }, // Hash in production
  role: { type: String, default: "USER", enum: ["USER", "ADMIN"] },
  address: addressSchema,
  orderItemList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

export default mongoose.model("User", userSchema);