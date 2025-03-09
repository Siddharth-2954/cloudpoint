const express = require("express");
const exphbs = require("express-handlebars");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static("public"));

// Set Handlebars as the view engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Routes
app.get("/", (req, res) => {
  res.render("home", { weatherApiKey: process.env.WEATHER_API_KEY });
});

// Route to fetch current weather data
app.post("/weather", async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    // Fetch current weather data from OpenWeatherMap API
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    // Return the weather data to the frontend
    res.json(weatherResponse.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);

    // Handle specific API errors
    if (error.response) {
      // OpenWeatherMap API returned an error
      return res.status(error.response.status).json({ error: error.response.data.message });
    } else if (error.request) {
      // No response received from the API
      return res.status(500).json({ error: "No response received from OpenWeatherMap API" });
    } else {
      // Other errors (e.g., network issues)
      return res.status(500).json({ error: "Error fetching weather data" });
    }
  }
});

app.get("/weather/history", async (req, res) => {
  const { lat, lon, start, end } = req.query;

  try {
    // Validate required parameters
    if (!lat || !lon || !start || !end) {
      return res.status(400).json({ error: "Missing required parameters: lat, lon, start, or end" });
    }

    // Fetch historical weather data from OpenWeatherMap API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${start}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    // Check if the response contains valid data
    if (!response.data || !response.data.hourly) {
      return res.status(500).json({ error: "Invalid data received from OpenWeatherMap API" });
    }

    // Return the historical weather data to the frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching historical weather data:", error);

    // Handle specific API errors
    if (error.response) {
      // OpenWeatherMap API returned an error
      return res.status(error.response.status).json({ error: error.response.data.message });
    } else if (error.request) {
      // No response received from the API
      return res.status(500).json({ error: "No response received from OpenWeatherMap API" });
    } else {
      // Other errors (e.g., network issues)
      return res.status(500).json({ error: "Error fetching historical weather data" });
    }
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:3000`));