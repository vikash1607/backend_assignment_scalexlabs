const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

MONGO_URL = "mongodb+srv://2105083:vikash@backend.rpw1iia.mongodb.net/?retryWrites=true&w=majority&appName=backend"
// Connect to MongoDB Atlas cluster

//locally: ('mongodb://127.0.0.1:27017/backend')
//mongodb+srv://2105083:<password>@backend.rpw1iia.mongodb.net/
//mongodb+srv://2105083:vikash@backend.rpw1iia.mongodb.net/?retryWrites=true&w=majority&appName=backend
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;


// Define event listeners for database connection
db.on("connected", () => {
  console.log("Connected to MongoDB server");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

const app = express();
const port = 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Create mongoose schema
const dataSchema = new mongoose.Schema({
  symbol: String,
  price: Number,
  volume: Number,
});

// Create mongoose model
const Data = mongoose.model("Data", dataSchema);


// const fetchData = async () => {
//   try {
//     const response = await axios.get('https://api.dexscreener.com/latest/dex/tokens/inj19dtllzcquads0hu3ykda9m58llupksqwekkfnw');
//     const data = response.data;
//     const formattedData = data.map(item => {
//         return {
//           symbol: item.symbol,
//           price: item.price,
//           volume: item.volume 
//         };
//       });
//     await Data.insertMany(formattedData);
//     console.log('Data fetched and stored successfully');
//   } catch (err) {
//     console.error(err);
//   }
// };

// Endpoint to save data into database
app.post("/saveData", async (req, res) => {
  const { symbol, price, volume } = req.body;
  console.log(req.body);
  try {
    const newData = new Data({
      symbol,
      price,
      volume,
    });
    // const newData = new MenuItem(data);
    const response = await newData.save();
    console.log("data saved");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch price and volume data from database
app.get("/data", async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update the data into database
app.put("/:id", async (req, res) => {
  try {
    const menuId = req.params.id; // Extract the id from the URL parameter
    const updatedMenuData = req.body; // Updated data for the Data

    const response = await Data.findByIdAndUpdate(menuId, updatedMenuData, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validation
    });

    if (!response) {
      return res.status(404).json({ error: "Menu Item not found" });
    }

    console.log("data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete data from database
app.delete("/:id", async (req, res) => {
  try {
    const menuId = req.params.id; // Extract the Menu's ID from the URL parameter

    // Assuming you have a newData model
    const response = await Data.findByIdAndDelete(menuId);
    if (!response) {
      return res.status(404).json({ error: "Item not found" });
    }
    console.log("data delete");
    res.status(200).json({ message: "Item Deleted Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
