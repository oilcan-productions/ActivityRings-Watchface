import * as messaging from "messaging";
import document from "document";
import * as util from "../common/utils";

let weatherIcon = document.getElementById("weatherImage");
let currentTemp = document.getElementById("weatherCurrentTemp");
let weatherCity = document.getElementById("weatherCity");
let lowHighTemp = document.getElementById("weatherTemps");
let conditionIcon = "../resources/icons/whiteSun.png";

export function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: "weather"
    });
  }
}

function processWeatherData(data) {
  util.dbgWrite("Received Data: " + JSON.stringify(data));
  util.dbgWrite(data.weatherData["main"]["temp"]);
  util.dbgWrite(data.weatherData["main"]["temp_min"]);
  util.dbgWrite(data.weatherData["main"]["temp_max"]);
  util.dbgWrite(data.weatherData["weather"][0]["main"]);
  util.dbgWrite(data.weatherData["name"]);
  let condition = data.weatherData["weather"][0]["main"];
 
  switch(condition) {
    case "Clear Sky": //ClearSky
      if (isDay)
        conditionIcon = "..resources/icons/whiteSun.png";
      else
        conditionIcon = "../resources/icons/whiteMoon.png" ;
      break;
    case "Scattered Clouds": //Scattered Clouds
      if (isDay)
        conditionIcon = "../resources/icons/whitePartlySunny.png";
      else
        conditionIcon = "../resources/icons/whitePartlyMoon.png";
      break;
    case "Clouds": //BrokenClouds
      conditionIcon = "../resources/icons/whiteCloud.png";
      break;
    case "Showers": //ShowerRain
    case "Rain": //Rain
     conditionIcon = "../resources/icons/whiteRain.png";
      break;
    case "Thunderstorm": //Thunderstorm
      if (wordStartsWith("T", description))
        conditionIcon = "../resources/icons/whiteStorm.png";
      else
        conditionIcon = "../resources/icons/whiteRain.png";
      break;
    case "Snow": //Snow
      conditionIcon = "../resources/icons/whiteSnow.png";
      break;
    case "Mist": //Mist
      conditionIcon = "../resources/icons/whiteHaze.png";
      break;
    default: //Other
      util.dbgWrite("Condition defaulted: " + condition);
      if (isDay)
        conditionIcon = "../resources/icons/whiteSun.png";
      else
        conditionIcon = "../resources/icons/whiteMoon.png";
      break; 
  }
  util.dbgWrite(conditionIcon);
  weatherIcon.href = conditionIcon;
  currentTemp.text = Math.round(data.weatherData["main"]["temp"]) + "º";
  weatherCity.text = data.weatherData["name"];
  lowHighTemp.text = "L: " + Math.round(data.weatherData["main"]["temp_min"]) + "º / H: " + Math.round(data.weatherData["main"]["temp_max"]) + "º";
}

function isDay(){
  return (Date.now() + 60000 * new Date().getTimezoneOffset() + 21600000) % 86400000 / 3600000 > 12;
}

messaging.peerSocket.addEventListener("open", (evt) => {
  fetchWeather();
});

messaging.peerSocket.addEventListener("message", (evt) => {
  util.dbgWrite("Weather received message: " + JSON.stringify(evt.data));
  if (evt.data["weatherData"]) {
    processWeatherData(evt.data);
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});
