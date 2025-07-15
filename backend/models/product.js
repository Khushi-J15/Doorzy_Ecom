import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: String,
  image: String,
  name: String,
  imageUrl: { type: String, required: true }, // Alias for CartPage.jsx
  rating: {
    stars: Number,
    count: Number,
  },
  priceCents: Number,
  price: { type: Number, required: true }, // For CartPage.jsx
  keywords: [String],
});


// Pre-save hook to sync price and imageUrl
productSchema.pre('save', function (next) {
  this.price = this.priceCents / 100;
  this.imageUrl = this.image;
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
