async function fetchTravelRecommendations(weatherCondition) {
  const activities = {
    Clear: ["Hiking", "Beach Visit", "Picnic"],
    Clouds: ["Sightseeing", "Museum Visit", "Shopping"],
    Rain: ["Indoor Games", "Café Visit", "Movie Marathon"],
    Snow: ["Skiing", "Snowboarding", "Hot Chocolate by the Fireplace"],
  };

  // Default recommendation if weatherCondition is not found
  const recommendations = activities[weatherCondition] || ["Explore Local Attractions"];

  // Get the travel-tips element
  const travelTips = document.getElementById("travel-tips");

  // Check if the travel-tips element exists
  if (!travelTips) {
    console.error("Travel tips element not found in the DOM.");
    return;
  }

  // Update the inner HTML with recommendations
  travelTips.innerHTML = `
    <h3>Travel Recommendations</h3>
    <ul>
      ${recommendations.map((activity) => `<li>${activity}</li>`).join("")}
    </ul>
  `;
}