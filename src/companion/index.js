import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { geolocation } from "geolocation";
import * as util from "../common/utils";


var API_KEY = "a075f4037118dd3d66fd2f3ccecd730f";
var ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
let currentDate = new Date();
let lastFetchHour = currentDate.getHours();

let lat = 0;
let lon = 0;

geolocation.getCurrentPosition(locationSuccess, locationError, {
  timeout: 60 * 1000
});

var watchID = geolocation.watchPosition(locationSuccess, locationError, { timeout: 60 * 1000 });

function locationSuccess(position) {
 util.dbgWrite(
    "Latitude: " + position.coords.latitude,
    "Longitude: " + position.coords.longitude
 );

    lat = position.coords.latitude;
    lon = position.coords.longitude;
    queryOpenWeather();
}

function locationError(error) {
  util.dbgWrite("Error: " + error.code, "Message: " + error.message,util.messageType.DBG_ERROR);
}


// Message socket opens
messaging.peerSocket.onopen = () => {
  util.dbgWrite("Companion Socket Open",util.messageType.DBG_INFO);
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  util.dbgWrite("Companion Socket Closed",util.messageType.DBG_INFO);
};

// A user changes settings
settingsStorage.onchange = evt => {
  util.dbgWrite("Change Event Received: " + JSON.stringify(evt));
  let data = {
    key: evt.key,
    value: JSON.parse(evt.newValue)
  };
  util.dbgWrite("Setting " + evt.key + " changed to " + evt.newValue,util.messageType.DBG_INFO);
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    util.dbgWrite("Restoring " + settingsStorage.length + " Settings",util.messageType.DBG_INFO);
    let key = settingsStorage.key(index);
    util.dbgWrite("Restoring setting: " + settingsStorage.key(index) +  " Value: " + JSON.stringify(JSON.parse(settingsStorage.getItem(key))),util.messageType.DBG_INFO);
    if (key) {
      let data = {
        key: key,
        value: JSON.parse(settingsStorage.getItem(key))
      };
      sendVal(data);
    }
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

function queryOpenWeather() {
  fetch(ENDPOINT + "?lat=" + lat + "&lon=" + lon + "&units=metric&APPID=" + API_KEY)
  .then(function (response) {
      response.json()
      .then(function(data) {
        util.dbgWrite("Weather Data (RAW): " +JSON.stringify(data),,util.messageType.DBG_INFO);
        util.dbgWrite ("got weather data");
        // Send on the data blob
        var weather = {
          // temperature: data["main"]["temp"]
          weatherData: data
        }
        // Send the weather data to the device
        returnWeatherData(weather);
      });
  })
  .catch(function (err) {
    util.dbgWrite("Error fetching weather: " + err,util.messageType.DBG_ERROR);
  });
}

function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    util.dbgWrite("Error: Connection is not open", ,util.messageType.DBG_ERROR);
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  util.dbgWrite("Message received: " + evt.data.command ,util.messageType.DBG_INFO);
  if (evt.data && evt.data.command === "weather") {
    queryOpenWeather();
  }
    if (evt.data && evt.data.command === "resetCacheFalse") {
    settingsStorage.setItem("resetCache", "false");
    resetSettings();
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  util.dbgWrite(`Connection error: ${err.code} - ${err.message}`,util.messageType.DBG_ERROR);
});

function resetSettings()
{
    util.dbgWrite("Resetting Settings: ", ,util.messageType.DBG_INFO)
    // reset the settings
  settingsStorage.clear();
}
  