const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");  // Import the cors package
const userRoute = require('./routes/userRoute');
const categoryRoute = require('./routes/categoryRoute');
const newsRoute = require('./routes/newsRoute');
const formData = require('express-form-data');

require("dotenv").config();
require("colors");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formData.parse());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use('/api/users', userRoute);
app.use('/api/category', categoryRoute);
app.use('/api/news', newsRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Test endpoint
app.get('/', (req, res) => {
  console.log('Endpoint is working fine.');
  res.json({ message: 'Endpoint is working fine.' });
});

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(
    `Server is connected in ${process.env.NODE_ENV} mode on port ${PORT}`.blue
  )
);
