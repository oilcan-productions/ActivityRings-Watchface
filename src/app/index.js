import document from "document";
import clock from "clock";
import userActivity from "user-activity";
import { display } from "display";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import * as battery from "./battery.js";
import * as heartMonitor from "./hrm.js";
import { me as appbit } from "appbit";
import { minuteHistory, dayHistory, goals, today } from "user-activity";
import * as util from "../common/utils";
import * as weather from "./weather.js";
import * as messaging from "messaging";
import * as fs from "fs";

// set if running in simulator
const bIsSimulator = isSimulator();

// version
const app_version = "1.1.7";
let appVersionLabel = document.getElementById("app-version");
appVersionLabel.text = app_version;

// Cache setup
const CACHE_FILE = "cache.txt";
const CACHE_TYPE = "json";
const CACHE_DIRTY = false;

// interval settings
const weatherRefreshInterval        = 30;
const hourlyStepsRefreshInterval    = 30;

// Set up all necessary variables
let clockLabel = document.getElementById("clockLabel");
clock.granularity = "seconds";

let weekDay       = document.getElementById("weekDay");
let date          = document.getElementById("date");
let lblSecondTzCity  = document.getElementById("secondTzCity");
let secondTzTime  = document.getElementById("secondTzData");
let secondTzDiff  = document.getElementById("secondTzDiff");
let currentDay    = "";
let monthArray    = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug","Sep", "Oct", "Nov", "Dec" ];
let dayArray      = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let secondTzOffset="0";
let secondTzShortName = "N/A"

let cumulativeStepHours   = 0;
let hourlyStepGoal        = 250;
let INITIAL_STEP_CALC     = true;
let minutesToFetch        = 60;

let dataTypes     = [ "steps", "calories", "activeZoneMinutes" ];
let dataProgress  = [];

// check log File
util.checkLogFileSize();

if(util.dbg)
{
  util.deleteLogFile();
}

// Setup Click Event handlers globally here
// weatherInfo
let weatherInfo = document.getElementById("weatherInfo");

weatherInfo.addEventListener("click", (evt) => {
  util.dbgWrite("Weather Info tapped.",util.messageType.DBG_MESSAGE);
});

// secondTz
let secondTzInfo = document.getElementById("secondTz");

secondTzInfo.addEventListener("click", (evt) => {
  util.dbgWrite("Second Timezone tapped.",util.messageType.DBG_MESSAGE);
});

// heartRate
let heartRateInfo = document.getElementById("heartRate");

heartRateInfo.addEventListener("click", (evt) => {
  util.dbgWrite("Heartrate tapped.",util.messageType.DBG_MESSAGE);
});

// activityRings
let activityRingsInfo = document.getElementById("activityRings");

activityRingsInfo.addEventListener("click", (evt) => {
  util.dbgWrite("activityRings tapped.",util.messageType.DBG_MESSAGE);
});

// batteryInfo
let batteryInfo = document.getElementById("batteryInfo");

batteryInfo.addEventListener("click", (evt) => {
  util.dbgWrite("batteryInfo tapped.",util.messageType.DBG_MESSAGE);
});

// mainDate
let mainDateInfo = document.getElementById("mainDate");

mainDateInfo.addEventListener("click", (evt) => {
  util.dbgWrite("mainDate tapped.",util.messageType.DBG_MESSAGE);
});
// mainClock
let mainClockInfo = document.getElementById("mainClock");

mainClockInfo.addEventListener("click", (evt) => {
  util.dbgWrite("mainClock tapped.",util.messageType.DBG_MESSAGE);
});

// all global variables need to go above this line ...
// load cached values
loadCache();

let getCurrentDataProgress = function(dataType) {
  let dataContainer = document.getElementById(dataType);
  return {
    dataType: dataType,
    dataContainer: dataContainer,
    arcBack: dataContainer.getElementById("arcSBack"),
    arcFront: dataContainer.getElementById("arcFront"),
  }
}

for(var i=0; i < dataTypes.length; i++) {
  var currentData = dataTypes[i];
  dataProgress.push(getCurrentDataProgress(currentData));
}

function getHourlyStepCount() {
  util.dbgWrite("Getting Hourly Step Count.");
  loadCache();
  let currentDate = new Date();
  let currentHour = currentDate.getHours();
  let minuteSteps = 0;
  let SKIP = false;
  util.dbgWrite("Starting hourly step count for hour " + currentHour);
  util.dbgWrite("Current Hour Count: " + cumulativeStepHours);
  util.dbgWrite("Time to refresh the hourly steps.");
  util.dbgWrite("Current hours: " + cumulativeStepHours);
  util.dbgWrite("Querying minuteHistory");
  const minuteRecords = null;
  if(currentHour == 0) {
    // we are in the midnight hour. Reset the hourly count and save the cache
    cumulativeStepHours = 0;
    saveCache();
  }
  if(INITIAL_STEP_CALC) {
    // change the minutes to fetch to all hours of the day.
    minutesToFetch = currentHour * 60;
    util.dbgWrite("This is our first run so calculate from today's steps.");
    cumulativeStepHours = today.adjusted.steps / currentHour;
    if(isSimulator) {
      if(cumulativeStepHours >= 1000) {
        cumulativeStepHours = Math.round(cumulativeStepHours / 200);
      }
    }
    util.dbgWrite("Initial step hour estimate for today: " + cumulativeStepHours + " in " + currentHour + " hours.");
    INITIAL_STEP_CALC = false;
    saveCache();
  }
  else {
    try {
      minuteRecords = minuteHistory.query({ limit: minutesToFetch });
    }
    catch {
      util.dbgWrite("Failed to query minuteHistory",2);
    }
    util.dbgWrite("Got " + minuteRecords.length + " activity records.");
    minuteRecords.forEach((minute, index) => {
      if(isNaN(minute.steps)) {
        if(minuteSteps < hourlyStepGoal) {
          // simulate some steps per minute
          minuteSteps = minuteSteps + Math.floor(Math.random() * 10);
        }
      }
      else {
         if(minuteSteps < hourlyStepGoal) {
          minuteSteps = minuteSteps + minute.steps;
         }
      }
      util.dbgWrite("Steps in Hour: " + minuteSteps);
    });    
  }
  util.dbgWrite("Cummulative hours: " + cumulativeStepHours);

  saveCache();
  loadCache();
  util.dbgWrite("Done with Hourly Step count");
}

// Refresh data, all other logic is in separate files
function refreshData(type) {
  let currentType = type.dataType;
  util.dbgWrite("Entering " + currentType + " refresh.",util.messageType.DBG_INFO,true);
  if(currentType=="steps") {
      let currentDataProg = cumulativeStepHours;
      let currentDataGoal = 12;
  }
  else if(currentType=="activeZoneMinutes") {
   let currentDataProg = (today.adjusted.activeZoneMinutes.total || 0);
   let currentDataGoal = goals.activeZoneMinutes.total || 0;
   if(currentDataProg == null) {
     currentDataProg = 0;
   }
   if(currentDataGoal == null) {
     currentDataGoal = 30;
   }
  }
  else {
     let currentDataProg = (userActivity.today.adjusted[currentType] || 0);
     let currentDataGoal = userActivity.goals[currentType];
  }
  util.dbgWrite("Data for activity " + currentType);
  util.dbgWrite("Progress: " + currentDataProg);
  util.dbgWrite("Goal: " + currentDataGoal);
  
  let currentDataArc = (currentDataProg / currentDataGoal) * 360;
  if (currentDataArc > 360) {
    currentDataArc = 360;
  }
  type.arcFront.sweepAngle = currentDataArc;
}

function refreshAllData() {
  for(var i=0; i<dataTypes.length; i++) {
    refreshData(dataProgress[i]);
  }
}

clock.ontick = evt => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    hours = util.zeroPad(hours % 12 || 12);
  } else {
    hours = util.zeroPad(hours);
  }
  let mins          = util.zeroPad(today.getMinutes());
  clockLabel.text = hours + ":" + mins;
  
  let year = today.getFullYear();
  let monthNum = today.getMonth();
  let month    = monthArray[monthNum];
  let day      = today.getDate();
  let dayNum   = today.getDay();
  let dayName  = dayArray[dayNum];

  weekDay.text = dayName;
  date.text = day;

  // lblSecondTzCity.text = secondTzShortName;
  var secondTzResult =  calcTime(secondTzShortName,secondTzOffset);
  util.dbgWrite("Second Tz: " + secondTzResult);
  secondTzTime.text = secondTzResult[0] + ":" + secondTzResult[1];
  if(secondTzResult[2] != "+0"){
    secondTzDiff.text=secondTzResult[2];
  }
  battery.setLevel();
  refreshAllData();
}

function calcTime(city, offset) {   
    var result = ["00","00","+0"];
    var d = new Date();
    var nd = calculateDateTzTime(parseInt(offset));
  
    let hours = nd.getHours();
    if (preferences.clockDisplay === "12h") {
      hours = util.zeroPad(hours % 12 || 12);
    } else {
      hours = util.zeroPad(hours);
    }
    let mins = util.zeroPad(nd.getMinutes());
    let tzDate = nd.getDate();
    result[0] = hours;
    result[1] = mins;
    util.dbgWrite("TZ Date: " + tzDate);
    util.dbgWrite("current Date: " + d.getDate());
    result[2] = "";  
    if(tzDate > d.getDate()) {
      util.dbgWrite("Setting +1 day");
      result[2] = "+1";
    }
    else if(tzDate < d.getDate()) {
      util.dbgWrite("Setting -1 day");
      result[2] = "-1";
    }  
    return result;
}

function calculateDateTzTime(offset) {
    // get current local time in milliseconds
    var date = new Date();
    var localTime = date.getTime();
 
    // get local timezone offset and convert to milliseconds
    var localOffset = date.getTimezoneOffset() * 60000;
 
    // obtain the UTC time in milliseconds
    var utc = localTime + localOffset;
    var newDateTime = utc + (3600000 * offset);
    var convertedDateTime = new Date(newDateTime);
    return convertedDateTime;
}

function getWeatherForecast() {
  weather.fetchWeather();
}




// Fetch the weather every 30 minutes
setInterval(weather.fetchWeather, weatherRefreshInterval * 1000 * 60);
getWeatherForecast();
// refresh the hourly steps every 30 minutes
setInterval(getHourlyStepCount, hourlyStepsRefreshInterval * 1000 * 60);
getHourlyStepCount();

// start the Heart Rate Monitor
heartMonitor.initialize();

messaging.peerSocket.addEventListener("message", (evt) => {
 // util.dbgWrite("app/index.js received message: " + JSON.stringify(evt.data));
 if (evt && evt.data && evt.data.key === "resetCache") {
    util.dbgWrite("Reset Cache command: " + evt.data.value);
    if(evt.data.value == true) {
      resetCache();
    }
  }
  if (evt && evt.data && evt.data.key === "secondTimeZone") {
    util.dbgWrite("Second Timzone message: " + JSON.stringify(evt.data.value[0]));
    secondTzOffset = evt.data.value.values[0].offset;
    secondTzShortName = evt.data.value.values[0].shortName;
    util.dbgWrite("Set Second TZ offset to: " + secondTzOffset);
    saveCache();
    refreshAllData();
  }
  if (evt && evt.data && evt.data.key === "secondTimeeZoneShortName") {
    util.dbgWrite("Second Timzone Short Name message: " + JSON.stringify(evt.data));
    secondTzShortName = evt.data.value.name;
    lblSecondTzCity.text = secondTzShortName;
    util.dbgWrite("Set Second TZ City to: " + secondTzShortName);
    saveCache();
    refreshAllData();
  }
  if (evt && evt.data && evt.data.key === "getlog") {
    util.dbgWrite("Get LogFile message: " + JSON.stringify(evt.data));
    util.sendLog();
  }
  else {
    util.dbgWrite("Unknonw Message received. (" + evt.data.key +")");
  }
  // 
});

// cache functions
// Register for the unload event
appbit.onunload = saveCache();

// Register for activation event
document.addEventListener("activate", (evt) => {
  console.log("app activate triggered");
  loadCache();
});

function saveCache() {
  util.dbgWrite("Saving Cache.");
  let json_data = {
    "cumulativeStepHours" : cumulativeStepHours,
    "INITIAL_STEP_CALC" : INITIAL_STEP_CALC,
    "secondTzOffset" : secondTzOffset,
    "secondTzShortName" : secondTzShortName
  };
  util.dbgWrite("Saving Cache: " + JSON.stringify(json_data),4);
  fs.writeFileSync(CACHE_FILE, json_data, CACHE_TYPE);
}

function loadCache() {
  util.dbgWrite("Loading Cache.");
  if (fs.existsSync(CACHE_FILE)) {
    util.dbgWrite(CACHE_FILE + " exists! Loading Data.");
    let json_object  = fs.readFileSync(CACHE_FILE, CACHE_TYPE);
    util.dbgWrite("JSON loaded: " + JSON.stringify(json_object));
    // set the variables
    cumulativeStepHours = json_object.cumulativeStepHours;
    INITIAL_STEP_CALC = json_object.INITIAL_STEP_CALC;
    secondTzOffset = json_object.secondTzOffset;
    secondTzShortName = json_object.secondTzShortName;

  }
}

function resetCache() {
  util.dbgWrite("Resetting Cache per User Request.");
  fs.unlinkSync(CACHE_FILE);
  messaging.peerSocket.send({
      command: "resetCacheFalse"
   });
}
 function isSimulator() {
  var result = false;
  
  util.dbgWrite("Utils: isSimulator: " + result);
  return result;
}


