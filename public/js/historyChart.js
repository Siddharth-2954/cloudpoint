// const HISTORY_WEATHER_API_KEY = "369f1029b150406ea35131245251901"; // Your new API key
// let weatherChart = null; // Variable to store the chart instance

// async function fetchWeatherHistory(latitude, longitude) {
//   const endDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
//   const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 7 days ago

//   try {
//     const response = await fetch(
//       `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto&apikey=${HISTORY_WEATHER_API_KEY}`
//     );
//     const data = await response.json();

//     if (data.error) {
//       console.error("API Error:", data.error);
//       document.getElementById("weather-history").innerHTML = `<p>Error: ${data.error}</p>`;
//       return;
//     }

//     console.log("API Response:", data);
//     renderWeatherChart(data);
//   } catch (error) {
//     console.error("Error fetching weather history:", error);
//     document.getElementById("weather-history").innerHTML = `<p>Something went wrong: ${error.message}</p>`;
//   }
// }

// function renderWeatherChart(weatherData) {
//   const ctx = document.getElementById("weatherChart").getContext("2d");

//   // Check if weatherData and weatherData.hourly exist
//   if (!weatherData || !weatherData.hourly) {
//     console.error("Invalid weather data:", weatherData);
//     document.getElementById("weather-history").innerHTML = `<p>No historical data available.</p>`;
//     return;
//   }

//   // Destroy the existing chart if it exists
//   if (weatherChart) {
//     weatherChart.destroy();
//   }

//   // Extract unique dates from the hourly data
//   const uniqueDates = [...new Set(weatherData.hourly.time.map((timestamp) => timestamp.split("T")[0]))];

//   // Aggregate data by date
//   const aggregatedData = uniqueDates.map((date) => {
//     const dailyData = weatherData.hourly.time
//       .map((timestamp, index) => {
//         if (timestamp.startsWith(date)) {
//           return {
//             temperature: weatherData.hourly.temperature_2m[index],
//             humidity: weatherData.hourly.relative_humidity_2m[index],
//             precipitation: weatherData.hourly.precipitation[index],
//             windSpeed: weatherData.hourly.wind_speed_10m[index],
//           };
//         }
//         return null;
//       })
//       .filter((item) => item !== null);

//     return {
//       date,
//       temperature: (dailyData.reduce((sum, item) => sum + item.temperature, 0) / dailyData.length).toFixed(2),
//       humidity: (dailyData.reduce((sum, item) => sum + item.humidity, 0) / dailyData.length).toFixed(2),
//       precipitation: dailyData.reduce((sum, item) => sum + item.precipitation, 0).toFixed(2),
//       windSpeed: (dailyData.reduce((sum, item) => sum + item.windSpeed, 0) / dailyData.length).toFixed(2),
//     };
//   });

//   const labels = aggregatedData.map((item) => item.date);
//   const temperatures = aggregatedData.map((item) => item.temperature);
//   const humidities = aggregatedData.map((item) => item.humidity);
//   const precipitations = aggregatedData.map((item) => item.precipitation);
//   const windSpeeds = aggregatedData.map((item) => item.windSpeed);

//   // Create a new chart
//   weatherChart = new Chart(ctx, {
//     type: "line",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Temperature (°C)",
//           data: temperatures,
//           borderColor: "#007BFF",
//           fill: false,
//           tension: 0.4, // Smooth lines
//         },
//         {
//           label: "Humidity (%)",
//           data: humidities,
//           borderColor: "#28a745",
//           fill: false,
//           tension: 0.4, // Smooth lines
//         },
//         {
//           label: "Precipitation (Rain, showers, snow) (mm)",
//           data: precipitations,
//           borderColor: "#dc3545",
//           fill: false,
//           tension: 0.4, // Smooth lines
//         },
//         {
//           label: "Wind Speed (m/s)",
//           data: windSpeeds,
//           borderColor: "#ffc107",
//           fill: false,
//           tension: 0.4, // Smooth lines
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false, // Allow custom sizing
//       plugins: {
//         title: {
//           display: true,
//           text: "7-Day Weather History",
//           font: { size: 18 },
//         },
//         legend: {
//           position: "top",
//           labels: {
//             font: { size: 14 },
//           },
//         },
//       },
//       scales: {
//         x: {
//           title: { display: true, text: "Date", font: { size: 14 } },
//           grid: { display: false },
//         },
//         y: {
//           title: { display: true, text: "Value", font: { size: 14 } },
//           grid: { color: "#e0e0e0" },
//         },
//       },
//     },
//   });
// }










const HISTORY_WEATHER_API_KEY = "369f1029b150406ea35131245251901"; // Your new API key
let weatherChart = null; // Variable to store the chart instance
let historicalData = []; // Array to store the last 7 days of weather data

async function fetchWeatherHistory(latitude, longitude) {
  const endDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 7 days ago

  try {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto&apikey=${HISTORY_WEATHER_API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.error);
      document.getElementById("weather-history").innerHTML = `<p>Error: ${data.error}</p>`;
      return;
    }

    console.log("API Response:", data);

    // Store historical data
    historicalData = processHistoricalData(data);

    // Render charts with historical data
    renderWeatherChart(historicalData);

    // Calculate and display upcoming weather
    const upcomingWeather = calculateUpcomingWeather(historicalData);
    displayUpcomingWeather(upcomingWeather);
  } catch (error) {
    console.error("Error fetching weather history:", error);
    document.getElementById("weather-history").innerHTML = `<p>Something went wrong: ${error.message}</p>`;
  }
}

function processHistoricalData(weatherData) {
  const uniqueDates = [...new Set(weatherData.hourly.time.map((timestamp) => timestamp.split("T")[0]))];
   // Get today's date in YYYY-MM-DD format
   const today = new Date().toISOString().split("T")[0];

   // Filter out today's date
   const filteredDates = uniqueDates.filter((date) => date !== today);

   return filteredDates.map((date) => {
    const dailyData = weatherData.hourly.time
      .map((timestamp, index) => {
        if (timestamp.startsWith(date)) {
          return {
            temperature: weatherData.hourly.temperature_2m[index],
            humidity: weatherData.hourly.relative_humidity_2m[index],
            precipitation: weatherData.hourly.precipitation[index],
            windSpeed: weatherData.hourly.wind_speed_10m[index],
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    return {
      date,
      temperature: (dailyData.reduce((sum, item) => sum + item.temperature, 0) / dailyData.length).toFixed(2),
      humidity: (dailyData.reduce((sum, item) => sum + item.humidity, 0) / dailyData.length).toFixed(2),
      precipitation: dailyData.reduce((sum, item) => sum + item.precipitation, 0).toFixed(2),
      windSpeed: (dailyData.reduce((sum, item) => sum + item.windSpeed, 0) / dailyData.length).toFixed(2),
    };
  });
}

function calculateUpcomingWeather(historicalData) {
  // Simple trend calculation (average of last 7 days)
  const upcomingWeather = {
    temperature: (historicalData.reduce((sum, day) => sum + parseFloat(day.temperature), 0) / historicalData.length).toFixed(2),
    humidity: (historicalData.reduce((sum, day) => sum + parseFloat(day.humidity), 0) / historicalData.length).toFixed(2),
    precipitation: (historicalData.reduce((sum, day) => sum + parseFloat(day.precipitation), 0) / historicalData.length).toFixed(2),
    windSpeed: (historicalData.reduce((sum, day) => sum + parseFloat(day.windSpeed), 0) / historicalData.length).toFixed(2),
  };

  // Store the calculation results in localStorage
  localStorage.setItem("upcomingWeather", JSON.stringify(upcomingWeather));

  return upcomingWeather;
}

function displayUpcomingWeather(upcomingWeather) {
  const upcomingWeatherDiv = document.getElementById("upcoming-weather");
  if (!upcomingWeatherDiv) {
    console.error("Upcoming weather element not found in the DOM.");
    return;
  }

  upcomingWeatherDiv.innerHTML = `
    <div class="weather-section">
      <h3>Upcoming Weather Trends</h3>
      <div class="weather-details">
        <p><strong>Temperature:</strong> ${upcomingWeather.temperature}°C</p>
        <p><strong>Humidity:</strong> ${upcomingWeather.humidity}%</p>
        <p><strong>Precipitation:</strong> ${upcomingWeather.precipitation} mm</p>
        <p><strong>Wind Speed:</strong> ${upcomingWeather.windSpeed} m/s</p>
      </div>
    </div>
  `;
}

function renderWeatherChart(historicalData) {
  const ctx = document.getElementById("weatherChart").getContext("2d");

  // Check if historicalData exists
  if (!historicalData || historicalData.length === 0) {
    console.error("Invalid historical data:", historicalData);
    document.getElementById("weather-history").innerHTML = `<p>No historical data available.</p>`;
    return;
  }

  // Destroy the existing chart if it exists
  if (weatherChart) {
    weatherChart.destroy();
  }

  const labels = historicalData.map((item) => item.date);
  const temperatures = historicalData.map((item) => item.temperature);
  const humidities = historicalData.map((item) => item.humidity);
  const precipitations = historicalData.map((item) => item.precipitation);
  const windSpeeds = historicalData.map((item) => item.windSpeed);

  // Create a new bar chart
  weatherChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          backgroundColor: "rgba(0, 123, 255, 0.6)", // Blue
          borderColor: "#007BFF",
          borderWidth: 1,
        },
        {
          label: "Humidity (%)",
          data: humidities,
          backgroundColor: "rgba(40, 167, 69, 0.6)", // Green
          borderColor: "#28a745",
          borderWidth: 1,
        },
        {
          label: "Precipitation (Rain, showers, snow) (mm)",
          data: precipitations,
          backgroundColor: "rgba(220, 53, 69, 0.6)", // Red
          borderColor: "#dc3545",
          borderWidth: 1,
        },
        {
          label: "Wind Speed (m/s)",
          data: windSpeeds,
          backgroundColor: "rgba(255, 193, 7, 0.6)", // Yellow
          borderColor: "#ffc107",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow custom sizing
      plugins: {
        title: {
          display: true,
          text: "7-Day Weather History",
          font: { size: 18 },
        },
        legend: {
          position: "top",
          labels: {
            font: { size: 14 },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Date", font: { size: 14 } },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "Value", font: { size: 14 } },
          grid: { color: "#e0e0e0" },
          beginAtZero: true, // Start y-axis from 0
        },
      },
    },
  });
}