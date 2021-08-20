import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { geolocation } from "geolocation";
import { me as companion } from "companion";
import * as logger from "../common/logger.js";
import * as global from "../common/globals.js";
import { weather} from "weather";

const fs=null;

const weather_num_icon = {
  33: "33.png",
  7: "7.png",
  31: "31.png",
  19: "19.png",
  11: "11.png",
  26: "26.png",
  37: "37.png",
  5: "5.png",
  30: "30.png",
  24: "24.png",
  4: "4.png",
  36: "36.png",
  34: "34.png",
  6: "6.png",
  38: "38.png",
  20: "20.png",
  43: "43.png",
  13: "13.png",
  40: "40.png",
  23: "23.png",
  44: "44.png",
  16: "16.png",
  42: "42.png",
  2: "2.png",
  8: "8.png",
  35: "35.png",
  39: "39.png",
  41: "41.png",
  3: "3.png",
  21: "21.png",
  14: "14.png",
  17: "17.png",
  18: "18.png",
  29: "29.png",
  12: "12.png",
  25: "25.png",
  22: "22.png",
  1: "1.png",
  15: "15.png",
  32: "32.png"         
}

const weather_num_text = {
  33: "Clear Night",
  7: "Cloudy",
  31: "Cold",
  19: "Flurries",
  11: "Fog",
  26: "Freezing Rain",
  37: "Hazy Moonlight",
  5: "Hazy Sunshine",
  30: "Hot",
  24: "Ice",
  4: "Intermittent Clouds",
  36: "Intermittent Clouds",
  34: "Mostly Clear",
  6: "Mostly Cloudy",
  38: "Mostly Cloudy",
  20: "MostlyCloudy with Flurries",
  43: "MostlyCloudy with Flurries",
  13: "MostlyCloudy with Showers",
  40: "MostlyCloudy with Showers",
  23: "MostlyCloudy with Snow",
  44: "MostlyCloudy with Snow",
  16: "Mostly Cloudy with Thunderstorms",
  42: "Mostly Cloudy with Thunderstorms",
  2: "Mostly Sunny",
  8: "Overcast",
  35: "Partly Cloudy",
  39: "Partly Cloudy with Showers",
  41: "Partly Cloudy with Thunderstorms",
  3: "Partly Sunny",
  21: "Partly Sunny with Flurries",
  14: "Partly Sunny with Showers",
  17: "Partly Sunny with Thunderstorms",
  18: "Rain",
  29: "Rain and Snow",
  12: "Showers",
  25: "Sleet",
  22: "Snow",
  1: "Sunny",
  15: "Thunderstorms",
  32: "Windy"       
}

// Hack to solve for missing WeatherCondition on devices without the latest firmware. 
// TODO: Once the update is out more broadly need to change this
const WeatherCondition = {
  "ClearNight":"ClearNight",
  "Cloudy":"Cloudy",
  "Cold":"Cold",
  "Flurries":"Flurries",
  "Fog":"Fog",
  "FreezingRain":"FreezingRain",
  "HazyMoonlight":"HazyMoonlight",
  "HazySunshineDay":"HazySunshineDay",
  "Hot":"Hot",
  "Ice":"Ice",
  "IntermittentCloudsDay":"IntermittentCloudsDay",
  "IntermittentCloudsNight":"IntermittentCloudsNight",
  "MostlyClearNight":"MostlyClearNight",
  "MostlyCloudyDay":"MostlyCloudyDay",
  "MostlyCloudyNight":"MostlyCloudyNight",
  "MostlyCloudyWithFlurriesDay":"MostlyCloudyWithFlurriesDay",
  "MostlyCloudyWithFlurriesNight":"MostlyCloudyWithFlurriesNight",
  "MostlyCloudyWithShowersDay":"MostlyCloudyWithShowersDay",
  "MostlyCloudyWithShowersNight":"MostlyCloudyWithShowersNight",
  "MostlyCloudyWithSnowDay":"MostlyCloudyWithSnowDay",
  "MostlyCloudyWithSnowNight":"MostlyCloudyWithSnowNight",
  "MostlyCloudyWithThunderstormsDay":"MostlyCloudyWithThunderstormsDay",
  "MostlyCloudyWithThunderstormsNight":"MostlyCloudyWithThunderstormsNight",
  "MostlySunnyDay":"MostlySunnyDay",
  "Overcast":"Overcast",
  "PartlyCloudyNight":"PartlyCloudyNight",
  "PartlyCloudyWithShowersNight":"PartlyCloudyWithShowersNight",
  "PartlyCloudyWithThunderstormsNight":"PartlyCloudyWithThunderstormsNight",
  "PartlySunnyDay":"PartlySunnyDay",
  "PartlySunnyWithFlurriesDay":"PartlySunnyWithFlurriesDay",
  "PartlySunnyWithShowersDay":"PartlySunnyWithShowersDay",
  "PartlySunnyWithThunderstormsDay":"PartlySunnyWithThunderstormsDay",
  "Rain":"Rain",
  "RainAndSnow":"RainAndSnow",
  "Showers":"Showers",
  "Sleet":"Sleet",
  "Snow":"Snow",
  "SunnyDay":"SunnyDay",
  "Thunderstorms":"Thunderstorms",
  "Windy":"Windy"
}
const weather_icon = {
  [WeatherCondition.ClearNight]: "33.png",
  [WeatherCondition.Cloudy]: "7.png",
  [WeatherCondition.Cold]: "31.png",
  [WeatherCondition.Flurries]: "19.png",
  [WeatherCondition.Fog]: "11.png",
  [WeatherCondition.FreezingRain]: "26.png",
  [WeatherCondition.HazyMoonlight]: "37.png",
  [WeatherCondition.HazySunshineDay]: "5.png",
  [WeatherCondition.Hot]: "30.png",
  [WeatherCondition.Ice]: "24.png",
  [WeatherCondition.IntermittentCloudsDay]: "4.png",
  [WeatherCondition.IntermittentCloudsNight]: "36.png",
  [WeatherCondition.MostlyClearNight]: "34.png",
  [WeatherCondition.MostlyCloudyDay]: "6.png",
  [WeatherCondition.MostlyCloudyNight]: "38.png",
  [WeatherCondition.MostlyCloudyWithFlurriesDay]: "20.png",
  [WeatherCondition.MostlyCloudyWithFlurriesNight]: "43.png",
  [WeatherCondition.MostlyCloudyWithShowersDay]: "13.png",
  [WeatherCondition.MostlyCloudyWithShowersNight]: "40.png",
  [WeatherCondition.MostlyCloudyWithSnowDay]: "23.png",
  [WeatherCondition.MostlyCloudyWithSnowNight]: "44.png",
  [WeatherCondition.MostlyCloudyWithThunderstormsDay]: "16.png",
  [WeatherCondition.MostlyCloudyWithThunderstormsNight]: "42.png",
  [WeatherCondition.MostlySunnyDay]: "2.png",
  [WeatherCondition.Overcast]: "8.png",
  [WeatherCondition.PartlyCloudyNight]: "35.png",
  [WeatherCondition.PartlyCloudyWithShowersNight]: "39.png",
  [WeatherCondition.PartlyCloudyWithThunderstormsNight]: "41.png",
  [WeatherCondition.PartlySunnyDay]: "3.png",
  [WeatherCondition.PartlySunnyWithFlurriesDay]: "21.png",
  [WeatherCondition.PartlySunnyWithShowersDay]: "14.png",
  [WeatherCondition.PartlySunnyWithThunderstormsDay]: "17.png",
  [WeatherCondition.Rain]: "18.png",
  [WeatherCondition.RainAndSnow]: "29.png",
  [WeatherCondition.Showers]: "12.png",
  [WeatherCondition.Sleet]: "25.png",
  [WeatherCondition.Snow]: "22.png",
  [WeatherCondition.SunnyDay]: "1.png",
  [WeatherCondition.Thunderstorms]: "15.png",
  [WeatherCondition.Windy]: "32.png"          
}
const weather_text = {
  [WeatherCondition.ClearNight]: "Clear Night",
  [WeatherCondition.Cloudy]: "Cloudy",
  [WeatherCondition.Cold]: "Cold",
  [WeatherCondition.Flurries]: "Flurries",
  [WeatherCondition.Fog]: "Fog",
  [WeatherCondition.FreezingRain]: "Freezing Rain",
  [WeatherCondition.HazyMoonlight]: "Hazy Moonlight",
  [WeatherCondition.HazySunshineDay]: "Hazy Sunshine",
  [WeatherCondition.Hot]: "Hot",
  [WeatherCondition.Ice]: "Ice",
  [WeatherCondition.IntermittentCloudsDay]: "Intermittent Clouds",
  [WeatherCondition.IntermittentCloudsNight]: "Intermittent Clouds",
  [WeatherCondition.MostlyClearNight]: "Mostly Clear",
  [WeatherCondition.MostlyCloudyDay]: "Mostly Cloudy",
  [WeatherCondition.MostlyCloudyNight]: "Mostly Cloudy",
  [WeatherCondition.MostlyCloudyWithFlurriesDay]: "MostlyCloudy with Flurries",
  [WeatherCondition.MostlyCloudyWithFlurriesNight]: "MostlyCloudy with Flurries",
  [WeatherCondition.MostlyCloudyWithShowersDay]: "MostlyCloudy with Showers",
  [WeatherCondition.MostlyCloudyWithShowersNight]: "MostlyCloudy with Showers",
  [WeatherCondition.MostlyCloudyWithSnowDay]: "MostlyCloudy with Snow",
  [WeatherCondition.MostlyCloudyWithSnowNight]: "MostlyCloudy with Snow",
  [WeatherCondition.MostlyCloudyWithThunderstormsDay]: "Mostly Cloudy with Thunderstorms",
  [WeatherCondition.MostlyCloudyWithThunderstormsNight]: "Mostly Cloudy with Thunderstorms",
  [WeatherCondition.MostlySunnyDay]: "Mostly Sunny",
  [WeatherCondition.Overcast]: "Overcast",
  [WeatherCondition.PartlyCloudyNight]: "Partly Cloudy",
  [WeatherCondition.PartlyCloudyWithShowersNight]: "Partly Cloudy with Showers",
  [WeatherCondition.PartlyCloudyWithThunderstormsNight]: "Partly Cloudy with Thunderstorms",
  [WeatherCondition.PartlySunnyDay]: "Partly Sunny",
  [WeatherCondition.PartlySunnyWithFlurriesDay]: "Partly Sunny with Flurries",
  [WeatherCondition.PartlySunnyWithShowersDay]: "Partly Sunny with Showers",
  [WeatherCondition.PartlySunnyWithThunderstormsDay]: "Partly Sunny with Thunderstorms",
  [WeatherCondition.Rain]: "Rain",
  [WeatherCondition.RainAndSnow]: "Rain and Snow",
  [WeatherCondition.Showers]: "Showers",
  [WeatherCondition.Sleet]: "Sleet",
  [WeatherCondition.Snow]: "Snow",
  [WeatherCondition.SunnyDay]: "Sunny",
  [WeatherCondition.Thunderstorms]: "Thunderstorms",
  [WeatherCondition.Windy]: "Windy"          
}

var API_KEY = "a075f4037118dd3d66fd2f3ccecd730f";
var ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";

if (
  !companion.permissions.granted("access_location") ||
  !companion.permissions.granted("run_background")
) {
  logger.dbgWrite(fs,"We're not allowed to access to GPS Position or run in the background!");
}

// open messaging connection before sending
function openConnection(){
  messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Ready to send or receive messages");
  });
}
openConnection();

// Message socket opens
messaging.peerSocket.onopen = () => {
  logger.dbgWrite(fs,"Companion Socket Open",logger.messageType.DBG_INFO);
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  logger.dbgWrite(fs,"Companion Socket Closed",logger.messageType.DBG_INFO);
};


// add messaging error event handler
messaging.peerSocket.addEventListener("error", (err) => {
  logger.dbgWrite(fs,`Companion.peerSocket: Connection error: ${err.code} - ${err.message}`,logger.messageType.DBG_ERROR);
});

// message inbox handler
messaging.peerSocket.addEventListener("message", (evt) => {
  logger.dbgWrite(fs,"companion.peerSocket: Message received: " + evt.data.command ,logger.messageType.DBG_INFO);
  switch (evt.data.command) {
    case "timezoneinfo":
      queryTimeZoneInfoForCity(evt.data.value);
      break;
    case "resetCacheFalse":
      settingsStorage.setItem("resetCache", "false");
      break;
    case "resetSettings":
      resetSettings();
      break;
    case "checkIfSimulator":
      checkPermissions();
      break;
    case "getFitbitWeather":
      logger.dbgWrite(fs,`companion::getFitbitWeather command ${JSON.stringify(evt.data)} received. Reason: ${evt.data.reason}, Source: ${evt.data.source}`);
      getWeather(evt.data.unit,"message");
      break;
    default:
      logger.dbgWrite(fs,"companion.peersocket.invalid message received: " + evt.data.command);
      break;
    }
  });


// Monitor for significant changes in physical location
companion.monitorSignificantLocationChanges = true;

// Listen for the significant location change event
companion.addEventListener("significantlocationchange", significantLocationChange, logger.messageType.DBG_INFO);

// catch the locationChanged companion launch event
if (companion.launchReasons.locationChanged) {
  significantLocationChange(companion.launchReasons.locationChanged.position);
}

// A user changes settings
settingsStorage.onchange = evt => {
  logger.dbgWrite(fs,"companion.settingsStorage.onchange: " + JSON.stringify(evt));
  let data = {
    key: evt.key,
    value: JSON.parse(evt.newValue)
  };
  logger.dbgWrite(fs,"companion.settingsStorage.onchange: Setting " + evt.key + " changed to " + evt.newValue,logger.messageType.DBG_INFO);
  sendVal(data);
  // if(evt.key=="tempUnitToggle") {
  //   if(evt.newValue==='true') {
  //     global.settings.tempUnit = "celsius";
  //   } else {
  //     global.settings.tempUnit = "fahrenheit";
  //   }
  //   settingsStorage.setItem("tempUnit", JSON.stringify(global.settings.tempUnit));
  //   getWeather(global.settings.tempUnit,"Setting Changed","companion");
  // }
};

// handle any location related errors.
function locationError(error) {
  logger.dbgWrite(fs,"companion.locationError: Error: " + error.code, "Message: " + error.message,logger.messageType.DBG_ERROR);
}

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    logger.dbgWrite(fs,"companion.settingsStorage.restoreSettings: Found " + settingsStorage.length + " Settings",logger.messageType.DBG_INFO);
    let key = settingsStorage.key(index);
    let value = settingsStorage.getItem(key);
    logger.dbgWrite(fs,"companion.settingsStorage: " + key + " = " + value);
    if (key) {
      let data = {
        key: key,
        value: JSON.parse(value)
      };
      sendVal(data);
      // if(key=="tempUnitToggle") {
      //   if(value==='true') {
      //     global.settings.tempUnit = "celsius";
      //   } else {
      //     global.settings.tempUnit = "fahrenheit";
      //   }
      //   getWeather(global.settings.tempUnit,"restore settings","companion");
      // }
    }
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

function queryTimeZoneInfoForCity(cityName) {
  fetch(ENDPOINT + "?q=" + cityName + "&units=" + global.settings.tempUnit + "&APPID=" + API_KEY)
  .then(function (response) {
      response.json()
      .then(function(data) {
        logger.dbgWrite(fs,"companion.queryTimeZoneInfoForCity: RAW response: " + JSON.stringify(data), logger.messageType.DBG_INFO);
        // Send on the data blob
        var timeZoneData = {
          // temperature: data["main"]["temp"]
          kind: "timeZoneInformation",
          timeZoneInformation: data
        }
        // Send the timezone data to the device
        sendJSONData(timeZoneData);
      });
  })
  .catch(function (err) {
    logger.dbgWrite(fs,"companion.queryTimeZoneInfoForCity: Error fetching weather: " + err, logger.messageType.DBG_ERROR);
  });
}

// new Weather API to get primary weather from Fitbit weather API
function getWeather(strTempUnit, strReason="", strSource="") {
  console.warn(`${strTempUnit},${strReason},${strSource}`);
  if (typeof(strTempUnit) == 'undefined' || strTempUnit == null)
{
    strTempUnit = "fahrenheit";
}
logger.dbgWrite(fs,`Getting Weather with Unit ${strTempUnit}`);
  if (companion.permissions.granted("access_location")) {
    weather
      .getWeatherData({temperatureUnit: strTempUnit})
      .then((data) => {
        if (data.locations.length > 0) {
          const temp = Math.floor(data.locations[0].currentWeather.temperature);
          const cond = data.locations[0].currentWeather.weatherCondition;
          const loc = data.locations[0].name;
          const unit = data.temperatureUnit;
          let icon = "";
          let condText = "";
          if(Number.isInteger(cond)){
              // on the simumlator the conditions are numbers
              icon = weather_num_icon[data.locations[0].currentWeather.weatherCondition];
              condText = weather_num_text[data.locations[0].currentWeather.weatherCondition];
          } else {
            // on device the conditions are strings
            icon = weather_icon[data.locations[0].currentWeather.weatherCondition];
            condText = weather_text[data.locations[0].currentWeather.weatherCondition];
          }
          logger.dbgWrite(fs,`It's ${temp}\u00B0 ${unit} and ${cond} in ${loc}`);
          logger.dbgWrite(fs,`got ${data.locations.length} locations.`);
          let weatherData = {
            kind: "weatherData",
            condition: cond,
            temperature: temp,
            locationName: loc,
            temperatureUnit: unit,
            icon: icon,
            condition_text: condText
          }
          openConnection();
          sendJSONData(weatherData);
        }
      })
      .catch((ex) => {
        console.error(ex);
        logger.dbgWrite(fs,ex,logger.messageType.DBG_ERROR);
      });
 }
}

// Send a JSON data blob
function sendJSONData(data) {
  let retryCounter = 0;
  while(retryCounter <=10){
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(data);
    } else {
      logger.dbgWrite(fs,`companion.returnWeatherData: Connection is not open. Retry(${retryCounter})`, logger.messageType.DBG_ERROR);
    }
    retryCounter++;
  }
}

function resetSettings() {
  logger.dbgWrite(fs,"Companion.resetSettings: Resetting Settings: ", logger.messageType.DBG_INFO)
  // reset the settings
  settingsStorage.clear();
  settingsStorage.setItem("resetSettings", "false");
}

// handle significant location change
function significantLocationChange(position) {
  logger.dbgWrite(fs,`Significant location change! ${JSON.stringify(position)}`, logger.messageType.DBG_INFO);
  global.settings.lastLocationLat = position.coords.latitude;
  global.settings.lastLocationLon = position.coords.longitude;
  getWeather(global.settings.tempUnit,"significant location change","companion");
}

function locationSuccess(position) {
  logger.dbgWrite(fs,`Successfully retrieved location: ${JSON.stringify(position)}`);
}

// get the current location of the companion
function getCompanionLocation() {
  geolocation.getCurrentPosition(locationSuccess, locationError, {
    timeout: 60 * 1000
  });
}

/// main
getCompanionLocation();