import * as messaging from "messaging";
import * as document from "document";
import * as logger from "../common/logger.js"
import * as fs from "fs";
import * as cache from "./cacheManager.js";
import { units as units } from "user-settings";

let weatherIcon = document.getElementById("weatherImage");
let currentTemp = document.getElementById("weatherCurrentTemp");
let weatherCity = document.getElementById("weatherCity");
let lowHighTemp = document.getElementById("weatherTemps");
let tempUnit = "fahrenheit";

// check the user temp unit setting
if(units.temperature=='C') {
  tempUnit='celsius';
} else {
   tempUnit='fahrenheit';
}

export function fetchWeather2(strReason="",strFunction="",strSource="") {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion to get the weather
    messaging.peerSocket.send({
      command: "getFitbitWeather",
      source: `${strSource},${strFunction}`,
      reason: strReason,
      unit: tempUnit
    });
  }
}

messaging.peerSocket.addEventListener("open", (evt) => {
  fetchWeather2;
});

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data.kind =="weatherData") {
    logger.dbgWrite(fs,`Weather::ReceivedWeatherData from Companion`);
    processWeatherData2(evt.data);
  }
  else
  {
    logger.dbgWrite(fs,"app.weather.peerSocket: ignoring unrelated message: " + JSON.stringify(evt.data));
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  logger.dbgWrite(fs,`app.weather.peerSocket: Connection error: ${err.code} - ${err.message}`,logger.messageType.DBG_ERROR);
});

function processWeatherData2(weatherData) {
  let data = weatherData;
  if(null == data) {
    data = cache.retrieveKeyValuePair("fitbitWeatherData");
  }
  else {
    cache.storeKeyValuePair("fitbitWeatherData",data);
  }
  logger.dbgWrite(fs,"app.weather.processWeatherData2: Received Weather Data: " + JSON.stringify(data));
  logger.dbgWrite(fs,"app.weather.processWeatherData.currentTemp: " + data.temperature);
  logger.dbgWrite(fs,"app.weather.processWeatherData.condition: " + data.condition);
  logger.dbgWrite(fs,"app.weather.processWeatherData.locationName: " + data.locationName);
  logger.dbgWrite(fs,"app.weather.processWeatherData.temperatureUnit: " + data.temperatureUnit);

  let conditionIcon = `weather/${data.icon}`;

  logger.dbgWrite(fs,"app.weather.processWeatherData: Selected Weather Icon: " + conditionIcon);
  weatherIcon.href = conditionIcon;
  let tempUnitText = "";
  if(data.temperatureUnit == "celsius") {
    tempUnitText = "C";
  } else {
    tempUnitText = "F";
  }
  currentTemp.text = `${Math.round(data.temperature)}º ${tempUnitText}`;
  weatherCity.text = `${data.locationName}`;
  lowHighTemp.text = `${data.condition_text}`;
}

export function setTempUnit(newTempUnit) {
  tempUnit = newTempUnit;
}