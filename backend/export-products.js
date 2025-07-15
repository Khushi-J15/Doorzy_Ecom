import { MongoClient } from "mongodb";
import fs from "fs";

const uri = "mongodb://localhost:27017"; // update if needed
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("ecommerce");
  const products = await db.collection("products").find({}, {
    projection: { id: 1, name: 1, keywords: 1, _id: 0 }
  }).toArray();

  const csvRows = ["id,name,keywords"];
  for (const product of products) {
    const row = `"${product.id}","${product.name}","${(product.keywords || []).join(";")}"`;
    csvRows.push(row);
  }

  fs.writeFileSync("products.csv", csvRows.join("\n"), "utf-8");
  console.log("✅ products.csv generated successfully");
} catch (err) {
  console.error("❌ Error:", err);
} finally {
  await client.close();
}
