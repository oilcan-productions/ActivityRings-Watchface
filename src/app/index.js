import * as document from "document";
import clock from "clock";
import * as userActivity from "user-activity";
import * as powerUtil from "./battery.js";
import * as heartMonitor from "./hrm.js";
import { me as appbit } from "appbit";
import * as weather from "./weather.js";
import * as fs from "fs";
import { launchApp as launchApp} from "system";
import * as logger from "../common/logger.js";
import * as cache from "./cacheManager.js";
import * as global from "../common/globals.js";
import * as timeDate from "./timeDate.js";
import { units as units } from "user-settings";
import * as messaging from "messaging";
import * as util from "../common/utils";
import { memory as memory } from "system";
import { vibration as vibration} from "haptics";

// version
let appVersionLabel = document.getElementById("app-version");
if(global.settings.isDebug) {appVersionLabel.text = global.settings.appVersion;}

// document elements
// setup the fields for detailed activity information
let mainDoc = document.getElementById("mainView");

let caloriePercentText  = document.getElementById("caloriePercent");
let calorieLabelText  = document.getElementById("calorieLabel");
let calorieNumbersText  = document.getElementById("calorieNumbers");

let activityPercentText  = document.getElementById("activityPercent");
let activityLabelText  = document.getElementById("activityLabel");
let activityNumbersText  = document.getElementById("activityNumbers");

let standPercentText  = document.getElementById("standPercent");
let standLabelText  = document.getElementById("standLabel");
let standNumbersText  = document.getElementById("standNumbers");
let stepGoalDrillDownModule = document.getElementById("stepGoalDrillDown");
let adjustedStepsText = document.getElementById("adjustedSteps");
let lastMinuteStepsText = document.getElementById("lastMinuteSteps");
let currentMinuteStepsText = document.getElementById("currentMinuteSteps");
let stepDetailFrameObject = document.getElementById("stepDetailFrame");

let activeMinutesGoalDetailText = document.getElementById("activeMinutesGoal");
let calorieGoalDetailText = document.getElementById("calorieGoal");
let standGoalDetailText = document.getElementById("standGoal");
let stepGoalDetailText = document.getElementById("stepGoal");


// App IDs
const weatherAppId="000013fe-0000-4000-8000-000000f17b17";
const agendaAppId="9646a9da-fdef-47ba-81a2-a1f6f82c101c";
const workoutAppId="000013f2-0000-4000-8000-000000f17b17";
const ecgAppId="00001413-0000-4000-8000-000000f17b17";

// interval settings
const weatherRefreshInterval        = 15;
const hourlyStepsRefreshInterval    = 30;

let dataTypes     = [ "steps", "calories", "activeZoneMinutes","stepsDetail", "caloriesDetail", "activeMinutesDetail" ];
let dataProgress  = [];

let hourlySteps           = 0;
let bHourCounted          = false;
let lastHourCounted       = 0;
let standGoalProgress     = 0;
let previousMinuteSteps   = 0;
let lastMinuteSteps       = 0;
let bStandGoalActive      = false;

// Register for the unload event
appbit.onunload = saveCurrentState;

// Register for activation event
//document.addEventListener("activate", (evt) => {
loadCurrentState("app activate");
//});

// memory monitor setup
function memoryMonitor() {
  console.warn(`JavaScript memory: used=${memory.js.used},
  peak=${memory.js.peak}, total=${memory.js.total}`)

  memory.monitor.addEventListener('memorypressurechange', () => {
    console.err(`Memory pressure is ${memory.monitor.pressure}`)
  });
}

// check the user temp unit setting
if(units.temperature=='C') {
  global.settings.tempUnit='celcius';
} else {
   global.settings.tempUnit='fahrenheit';
}

// all global variables need to go above this line ...

// set the goal details view
// console.log(`setting default goal settings`);
activeMinutesGoalDetailText.text = `${userActivity.goals.activezoneminutes} MIN`;
stepGoalDetailText.text = `${userActivity.goals.steps} STEPS`;
standGoalDetailText.text = "12 HOURS";
calorieGoalDetailText.text = `${userActivity.goals.calories} CALS`;

// migrate Cache Onetime
cache.migrateCache();
// list all cached keys when in debug mode
if(global.settings.isDebug) {
  let keys = cache.getKeys();
  logger.dbgWrite(fs,`Cached keys are: ${keys}`);
}
// load cached values
loadCurrentState("app startup");
timeDate.initialize();
let getCurrentDataProgress = function(dataType) {
  let dataContainer = document.getElementById(dataType);
  return {
    dataType: dataType,
    dataContainer: dataContainer,
    arcBack: dataContainer.getElementById("arcSBack"),
    arcFront: dataContainer.getElementById("arcFront"),
  }
}
getWeatherForecast("app Startup");

for(var i=0; i < dataTypes.length; i++) {
  var currentData = dataTypes[i];
  dataProgress.push(getCurrentDataProgress(currentData));
}

// Refresh data, all other logic is in separate files
function refreshData(type) {
  let currentType = type.dataType;
  if(logger.log_tick_events) {
    logger.dbgWrite(fs,"app.refreshData: Entering " + currentType + " refresh.",logger.messageType.DBG_INFO,true);
  }
  let currentDataProg;
  let currentDataGoal
  switch(currentType) {
    case "steps":
    case "stepsDetail":
      if(bStandGoalActive) {
        logger.dbgWrite(fs,`Refreshing Standgoal progress. ${standGoalProgress}`);
        currentDataProg = standGoalProgress;
        if(isNaN(currentDataProg)) {
          logger.dbgWrite(fs,`No current Progress! Resetting`);
          currentDataProg = 0;
          hourlySteps = 0;
          countMinuteSteps();
        }
        if(currentDataProg == null) {
          currentDataProg=0;
        }
          currentDataGoal = global.settings.dailyStandGoal;
          standLabelText.text = "STAND";
          standNumbersText.text = currentDataProg + "/" + currentDataGoal + " HR";
          standPercentText.text = Math.round(currentDataProg/currentDataGoal*100) + "%";
      } else {
          logger.dbgWrite(fs,`Refreshing daily steps progress.`);
          currentDataProg = userActivity.today.adjusted.steps;
          currentDataGoal = userActivity.goals.steps;
          standLabelText.text = "STEPS";
          standNumbersText.text = currentDataProg + "/" + currentDataGoal;
          standPercentText.text = Math.round(currentDataProg/currentDataGoal*100) + "%";
      }
      break;
    case "activeZoneMinutes":
    case "activeMinutesDetail":
      currentDataProg = (userActivity.today.adjusted.activeZoneMinutes.total || 0);
      currentDataGoal = userActivity.goals.activeZoneMinutes.total || 0;
      if(currentDataProg == null) {
        currentDataProg = 0;
      }
      if(currentDataGoal == null) {
        currentDataGoal = 30;
      }
      activityNumbersText.text = currentDataProg + "/" + currentDataGoal + " MIN";
      activityPercentText.text = Math.round(currentDataProg/currentDataGoal*100) + "%";
      break;
    case "calories":
    case "caloriesDetail":
      currentDataProg = (userActivity.today.adjusted.calories || 0);
      currentDataGoal = userActivity.goals.calories;
      
      calorieNumbersText.text = currentDataProg + "/" + currentDataGoal + " CAL";
      caloriePercentText.text = Math.round(currentDataProg/currentDataGoal*100) + "%";
      break;
    default:
      currentDataProg = (userActivity.today.adjusted[currentType] || 0);
      currentDataGoal = userActivity.goals[currentType];
      break;
  }
  
  let currentDataArc = (currentDataProg / currentDataGoal) * 360;
  logger.dbgWrite(fs,`dataType: ${currentType}, currentDataProg: ${currentDataProg}, currentDataGoal: ${currentDataGoal}, currentDataArc: ${currentDataArc}`);
  type.arcFront.sweepAngle = currentDataArc;
}

function refreshAllActivityData(strReason) {
  logger.dbgWrite(fs,`refreshing activity data ${strReason}`);
  for(var i=0; i<dataTypes.length; i++) {
    refreshData(dataProgress[i]);
  }
}

// get the latest weather forecast
function getWeatherForecast(strReason) {
  weather.fetchWeather2(strReason,"getWeatherForcast","app::index");
}

function hapticFeedback(feedbackType) {
  vibration.start(feedbackType);
  vibration.stop();
}

// clock tick event handler
clock.ontick = evt => {
  timeDate.updatePrimaryTz(evt);
  timeDate.updateSecondaryTzTime(evt);
  let eventDate     = evt.date;
  let hour          = eventDate.getHours();
  let minute        = eventDate.getMinutes();
  let second        = eventDate.getSeconds();

  if(minute == 0) {
    logger.dbgWrite(fs,`Minute is ${minute}, resetting hourly count.`);
    hourlySteps = 0;
    bHourCounted = false;
    if(hour == 0) {
      standGoalProgress=0;
      updateTzInfo();
    }
  }

  if(second == 0 ) {
    logger.dbgWrite(fs,`Second is ${second}, allowing next minute to be counted.`);
    let minuteSteps = countMinuteSteps();
    logger.dbgWrite(fs,`Counted ${minuteSteps} minutes.`);
    hourlySteps = hourlySteps + minuteSteps;
    logger.dbgWrite(fs,`this Hour has ${hourlySteps} steps.`);
    logger.dbgWrite(fs,`this Hour has been counted already ${bHourCounted}.`);
    logger.dbgWrite(fs,`total standgoal hours in the day: ${standGoalProgress}`);
    saveStepGoalCache("counting steps for last minute");
    minuteSteps = 0;
    refreshAllActivityData("60s refresh");
  }
  
  if(hourlySteps >= 250) {
    if(hour != lastHourCounted) {
      if(bHourCounted === false) {
        logger.dbgWrite(fs,"hourly goal reached.");
        standGoalProgress++;
        bHourCounted = true;
        lastHourCounted = hour;
        saveStepGoalCache("hour added");
      }
    }
  }
}

// add a messaging event listener and handle incoming messages
messaging.peerSocket.addEventListener("message", (evt) => {
  if(global.settings.isDebug) {
    vibration.start("confirmation");
    vibration.stop();
  }
  switch(evt.data.key) {
      case "resetCache":
        logger.dbgWrite(fs,"app.peerSocket: Reset Cache command: " + evt.data.value);
        if(evt.data.value == true) {
         cache.resetCache();
        }
        break;
      case "tempUnitToggle":
          logger.dbgWrite(fs,"app.peerSocket: TempUnit Changed: " + JSON.stringify(evt.data));
          hapticFeedback("confirmation");
          if(evt.data.value) {
            weather.setTempUnit("celsius");
          } else {
            weather.setTempUnit("fahrenheit");
          }
          weather.fetchWeather2("tempUnit Changed","send message","app::index");
          break;
      case "standGoalActive":
        if(evt.data.value == true) {
          bStandGoalActive = true;
          refreshAllActivityData("stand goal has been activated");
        } else {
          bStandGoalActive=false;
          refreshAllActivityData("step goal has been activated");
        }
        hapticFeedback("confirmation");
        break;
      case "batteryIconToggle":
        if(evt.data.value == true) {
          powerUtil.setBatteryIconVisibility(true);
        } else {
          powerUtil.setBatteryIconVisibility(false);
        }
        hapticFeedback("confirmation");
        break;
      default:
        logger.dbgWrite(fs,"app.peerSocket: Unknown Message received. (" + evt.data.key +")");
        break;   
    }
});

// refresh the activity rings every 60 seconds
// setInterval(refreshAllActivityData("interval refresh"), 60 * 1000);
refreshAllActivityData("initial refresh");

// Fetch the weather every 15 minutes
setInterval(getWeatherForecast, weatherRefreshInterval * 1000 * 60);
getWeatherForecast("initial load.");

// start the Heart Rate Monitor
heartMonitor.initialize();

// Setup Battery meter
powerUtil.initialize();

// setup memory monitor
memoryMonitor();

// Setup Click Event handlers globally here

// weatherInfo
logger.dbgWrite(fs,"app.EventHandlers.WeatherInfo",logger.messageType.DBG_INFO);
let weatherInfo = document.getElementById("weatherInfo");
weatherInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.weatherInfo.click",logger.messageType.DBG_MESSAGE);
  getWeatherForecast("weather Click");
  try{ 
    launchApp(weatherAppId);
  }
  catch (err) {
    logger.dbgWrite(fs,"app.weatherInfo.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});

// second Time Zone
logger.dbgWrite(fs,"app.EventHandlers.secondTimeZone",logger.messageType.DBG_INFO);
let secondTzInfo = document.getElementById("secondTz");
secondTzInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.secondTz.click.",logger.messageType.DBG_MESSAGE);
});

// heartRate
logger.dbgWrite(fs,"app.EventHandlers.HeartRate",logger.messageType.DBG_INFO);
let heartRateInfo = document.getElementById("heartRate");
heartRateInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.heartRate.click.",logger.messageType.DBG_MESSAGE);
  try{
    launchApp(ecgAppId);
  }
  catch (err) {
    logger.dbgWrite(fs,"app.heartRate.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});

// activityRings
logger.dbgWrite(fs,"app.EventHandlers.ActivityRings",logger.messageType.DBG_INFO);
let activityRingsInfo = document.getElementById("activityRings");
let activitRingsView = document.getElementById("activityDetailView");
let activeMinutesDetailView = document.getElementById("activeMinutesDetail");

activityRingsInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.activityRings.click.",logger.messageType.DBG_MESSAGE);
   try{ 
    mainDoc.style.display = "none";  // Hide
    activitRingsView.style.display = "inline"; // Show
    refreshAllActivityData("activity Rings click");
  }
  catch (err) {
    logger.dbgWrite(fs,"app.activityRings.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});

logger.dbgWrite(fs,"app.EventHandlers.ActivityRingsDetailView",logger.messageType.DBG_INFO);
activitRingsView.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.activityRingsView.click.",logger.messageType.DBG_MESSAGE);
   try{ 
    mainDoc.style.display = "inline";  // Show
    activitRingsView.style.display = "none"; // Hide
    refreshAllActivityData("activity rings view click");
  }
  catch (err) {
    logger.dbgWrite(fs,"app.activityRings.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});
// batteryInfo
let batteryInfo = document.getElementById("batteryInfo");
logger.dbgWrite(fs,"app.EventHandlers.BatteryInfo",logger.messageType.DBG_INFO);
batteryInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.batteryInfo.click.",logger.messageType.DBG_MESSAGE);
});

// mainDate
let mainDateInfo = document.getElementById("mainDate");
logger.dbgWrite(fs,"app.EventHandlers.MainDate",logger.messageType.DBG_INFO);
mainDateInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.mainDate.click.",logger.messageType.DBG_MESSAGE);
  try{ 
    launchApp(agendaAppId);
  }
  catch (err) {
    logger.dbgWrite(fs,"app.mainDate.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});
// mainClock
let mainClockInfo = document.getElementById("mainClock");
logger.dbgWrite(fs,"app.EventHandlers.MainClock",logger.messageType.DBG_INFO);
mainClockInfo.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.mainClock.click.",logger.messageType.DBG_MESSAGE);
});

stepDetailFrameObject.addEventListener("click", (evt) => {
  if(util.dbg) {
    activitRingsView.style.display="none";
    stepGoalDrillDownModule.style.display="inline";
  }
});
let activeMinDetailFrame = document.getElementById("activeMinDetailFrame");
activeMinDetailFrame.addEventListener("click", (evt) => {
  if(util.dbg) {
    activitRingsView.style.display="none";
    activeMinutesDetailView.style.display="inline";
  }
});

stepGoalDrillDownModule.addEventListener("click", (evt) => {
  logger.dbgWrite(fs,"app.activeMinutesDetailView.click.",logger.messageType.DBG_MESSAGE);
  try{ 
    activeMinutesDetailView.style.display="none";
    stepGoalDrillDownModule.style.display="none";
    activitRingsView.style.display="inline";
  }
  catch (err) {
    logger.dbgWrite(fs,"app.activeMinutesDetailView.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});

activeMinutesDetailView.addEventListener("click", (evt) => {

logger.dbgWrite(fs,"app.activeMinutesDetailView.click.",logger.messageType.DBG_MESSAGE);
  try{ 
    activeMinutesDetailView.style.display="none";
    activitRingsView.style.display="inline";
  }
  catch (err) {
    logger.dbgWrite(fs,"app.activeMinutesDetailView.click: " + err.message,logger.messageType.DBG_ERROR);
  }
});

function countMinuteSteps() {
  logger.dbgWrite(fs,"Counting Minutes.");
  let currentSteps = userActivity.today.adjusted.steps;

  if(previousMinuteSteps == 0) {
    previousMinuteSteps = currentSteps;
    logger.dbgWrite(fs,"no previous minute steps.");
  } else {
    lastMinuteSteps = currentSteps - previousMinuteSteps;
    logger.dbgWrite(fs,`${currentSteps}-${previousMinuteSteps}=${lastMinuteSteps}`);
    previousMinuteSteps = currentSteps;
  }
  saveStepGoalCache("countMinuteSteps");
  currentMinuteStepsText.text = `P: ${previousMinuteSteps}`;
  lastMinuteStepsText.text = `L: ${lastMinuteSteps}`;
  adjustedStepsText.text = `T: ${userActivity.today.adjusted.steps}`;
  if(bStandGoalActive) {
    return lastMinuteSteps;
  }
  else {
    return currentSteps;
  }
}

function loadStepGoalCache(strReason) {
  logger.dbgWrite(fs,`loading current stepGoalCache. ${strReason}`);
  previousMinuteSteps     = cache.retrieveKeyValuePair("previousMinuteSteps").value;
  lastMinuteSteps         = cache.retrieveKeyValuePair("lastMinuteSteps").value;
  standGoalProgress       = cache.retrieveKeyValuePair("standGoalProgress").value;
  hourlySteps             = cache.retrieveKeyValuePair("hourlySteps").value;
  lastHourCounted         = cache.retrieveKeyValuePair("lastHourCounted").value;
}

function saveStepGoalCache(strReason) {
  logger.dbgWrite(fs,`saving current stepGoalCache. ${strReason}`);
  cache.storeKeyValuePair("previousMinuteSteps",previousMinuteSteps);
  cache.storeKeyValuePair("lastMinuteSteps",lastMinuteSteps);
  cache.storeKeyValuePair("standGoalProgress",standGoalProgress);
  cache.storeKeyValuePair("hourlySteps",hourlySteps);
  cache.storeKeyValuePair("lastHourCounted",lastHourCounted);
}

function saveCurrentState(strReason="App unload.") {
  logger.dbgWrite(fs,`saving current state. ${strReason}`);
  cache.saveCache();
  saveStepGoalCache();
}

function loadCurrentState(strReason) {
  logger.dbgWrite(fs,`loading current state. ${strReason}`);
  cache.loadCache();
  loadStepGoalCache();
}