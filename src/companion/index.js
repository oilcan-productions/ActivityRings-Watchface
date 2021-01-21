import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { geolocation } from "geolocation";

import { inbox } from "file-transfer";

const dbg=true;
const messageType = {
  DBG_INFO:       4,
  DBG_ERROR:      3,
  DBG_WARNING:    2,
  DBG_MESSAGE:    1,
  DBG_PLAIN:      0
}

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
 dbgWrite(
    "Latitude: " + position.coords.latitude,
    "Longitude: " + position.coords.longitude
 );
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    queryOpenWeather();
}

function locationError(error) {
  dbgWrite("Error: " + error.code, "Message: " + error.message,messageType.DBG_ERROR);
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  dbgWrite("Companion Socket Open",messageType.DBG_INFO);
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  dbgWrite("Companion Socket Closed",messageType.DBG_INFO);
};

// A user changes settings
settingsStorage.onchange = evt => {
  dbgWrite("Change Event Received: " + JSON.stringify(evt));
  let data = {
    key: evt.key,
    value: JSON.parse(evt.newValue)
  };
  dbgWrite("Setting " + evt.key + " changed to " + evt.newValue,messageType.DBG_INFO);
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    dbgWrite("Restoring " + settingsStorage.length + " Settings",messageType.DBG_INFO);
    let key = settingsStorage.key(index);
    dbgWrite("Restoring setting: " + settingsStorage.key(index) +  " Value: " + JSON.stringify(JSON.parse(settingsStorage.getItem(key))),messageType.DBG_INFO);
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
        dbgWrite("Weather Data (RAW): " + JSON.stringify(data), messageType.DBG_INFO);
        dbgWrite ("got weather data");
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
    dbgWrite("Error fetching weather: " + err, messageType.DBG_ERROR);
  });
}

function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    dbgWrite("Error: Connection is not open", messageType.DBG_ERROR);
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  dbgWrite("Message received: " + evt.data.command ,messageType.DBG_INFO);
  if (evt.data && evt.data.command === "weather") {
    queryOpenWeather();
  }
  else if (evt.data && evt.data.command === "resetCacheFalse") {
    settingsStorage.setItem("resetCache", "false");
    // resetSettings();
  }
  else if (evt.data && evt.data.command === "getLog") {
    settingsStorage.setItem("getLog", "true");
    processAllFiles();
    settingsStorage.setItem("getLog", "false");
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  dbgWrite(`Connection error: ${err.code} - ${err.message}`,messageType.DBG_ERROR);
});

function resetSettings() {
    dbgWrite("Resetting Settings: ", messageType.DBG_INFO)
    // reset the settings
  settingsStorage.clear();
}

async function processAllFiles() {
  let file;
  while ((file = await inbox.pop())) {
    const payload = await file.text();
    console.log(`file contents: ${payload}`);
  }
}

inbox.addEventListener("newfile", processAllFiles);

function dbgWrite(message,severity,noOutput) {
  if(!noOutput) {
    if(isNaN(severity)) {severity = 1;}
    if(dbg) {
      switch(severity) {
        case 3:
          console.warn("WARNING:" + message);
          break;
        case  2:
          console.error("ERROR: " + message);
          break;
        case 1:
          console.log("MESSAGE: " + message);
          break;
        case 4: 
          console.log("INFO: " + message);
          break;
        default:
          console.log(message);
        break;
      }
    }
    else {
      if(severity == 4) {
        console.log("INFO: " + message);
      }
    }
  }
}