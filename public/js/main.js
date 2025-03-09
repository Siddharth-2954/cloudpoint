const WEATHER_API_KEY = "8997203fcea5529ef47370e50f987b6d";

let map;
let currentMarker = null; // Variable to store the current marker

function initMap() {
  const defaultLocation = [28.6139, 77.2090]; // Delhi, India as default location
  map = L.map('map').setView(defaultLocation, 10);

  // Base map layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  }).addTo(map);

  // Add temperature layer (interactive weather map)
  L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`, {
    maxZoom: 18,
    opacity: 0.6
  }).addTo(map);

  map.on("click", async (event) => {
    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;
  
    // Remove the previous marker if it exists
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }
  
    // Add a new marker for the clicked location
    currentMarker = L.marker([latitude, longitude])
      .addTo(map)
      .openPopup();
  
    try {
      // Fetch current weather data from the backend
      const response = await fetch("/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
      });
  
      // Log the response status for debugging
      console.log("Response status:", response.status);
  
      if (response.ok) {
        const weatherData = await response.json();
        console.log("Weather data received:", weatherData);
        displayWeatherInfo(weatherData, latitude, longitude);
        openModal(weatherData, latitude, longitude);
        fetchWeatherHistory(latitude, longitude); // Fetch historical weather data
        const weatherCondition = weatherData.weather[0].main; // e.g., "Clear", "Clouds", "Rain", "Snow"
        fetchTravelRecommendations(weatherCondition);
      } else {
        const errorMessage = await response.text();
        console.error("Backend returned an error:", errorMessage);
        document.getElementById("weather-info").innerHTML = `<p>Error fetching weather data: ${errorMessage}</p>`;
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      document.getElementById("weather-info").innerHTML = `<p>Something went wrong: ${error.message}</p>`;
    }
  });
}

function displayWeatherInfo(data, lat, lng) {
  const weatherInfo = `
    <h3>Weather Information</h3>
    <p><strong>Location:</strong> (${lat.toFixed(2)}, ${lng.toFixed(2)})</p>
    <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
    <p><strong>Weather:</strong> ${data.weather[0].description}</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <div class="weather-icons">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon">
    </div>
  `;

  document.getElementById("weather-info").innerHTML = weatherInfo;
}

function openModal(data, lat, lng) {
  // Ensure all modal elements exist
  const modalLocation = document.getElementById("modal-location");
  const modalTemperature = document.getElementById("modal-temperature");
  const modalCondition = document.getElementById("modal-condition");
  const modalHumidity = document.getElementById("modal-humidity");
  const modalIcon = document.getElementById("modal-icon");

  if (!modalLocation || !modalTemperature || !modalCondition || !modalHumidity || !modalIcon) {
    console.error("Modal elements are missing in the DOM.");
    return;
  }

  // Set the content of the modal elements
  modalLocation.textContent = `(${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  modalTemperature.textContent = `${data.main.temp}°C`;
  modalCondition.textContent = data.weather[0].description;
  modalHumidity.textContent = `${data.main.humidity}%`;
  modalIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

  // Show the modal and overlay
  document.querySelector(".weather-modal").classList.add("active");
  document.querySelector(".overlay").classList.add("active");
}

function closeModal() {
  const modal = document.querySelector(".weather-modal");
  const overlay = document.querySelector(".overlay");

  if (!modal || !overlay) {
    console.error("Modal or overlay elements are missing in the DOM.");
    return;
  }

  // Hide the modal and overlay
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

window.onload = initMap;
