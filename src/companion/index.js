import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { geolocation } from "geolocation";


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
 // console.log(
 //   "Latitude: " + position.coords.latitude,
 //   "Longitude: " + position.coords.longitude
 // );
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    queryOpenWeather();
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}


// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

// A user changes settings
settingsStorage.onchange = evt => {
  console.log("Change Event Received: " + JSON.stringify(evt));
  let data = {
    key: evt.key,
    value: JSON.parse(evt.newValue)
  };
  console.log("Setting " + evt.key + " changed to " + evt.newValue);
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    console.log("Restoring " + settingsStorage.length + " Settings");
    let key = settingsStorage.key(index);
    //console.log("Setting: " + settingsStorage.key(index)); // +  " Value: " + JSON.parse(settingsStorage.getItem(key)));
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
        // console.log(JSON.stringify(data)));
        // console.log ("got weather data");
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
    console.error(`Error fetching weather: ${err}`);
  });
}

function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Error: Connection is not open");
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  console.log("Message received: " + evt.data.command);
  if (evt.data && evt.data.command === "weather") {
    queryOpenWeather();
  }
    if (evt.data && evt.data.command === "resetCacheFalse") {
    settingsStorage.setItem("resetCache", "false");
    resetSettings();
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});


function resetSettings()
{
    // reset the settings
  settingsStorage.clear();
}
  