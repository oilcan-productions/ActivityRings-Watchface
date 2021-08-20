import * as document from "document";
import clock from "clock";
import * as logger from "../common/logger.js";
import * as cache from "./cacheManager.js";
import * as global from "../common/globals.js";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import * as fs from "fs";
import * as messaging from "messaging";

// Set up all necessary variables
let clockLabel = document.getElementById("clockLabel");
clock.granularity = "seconds";

let weekDay       = document.getElementById("weekDay");
let date          = document.getElementById("date");
let lblSecondTzCity  = document.getElementById("secondTzCity");
let secondTzTime  = document.getElementById("secondTzData");
let secondTzDiff  = document.getElementById("secondTzDiff");
let secondTzSvg   = document.getElementById("secondTz");
let monthArray    = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug","Sep", "Oct", "Nov", "Dec" ];
let dayArray      = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

let bShowSecondTz = false;
secondTzSvg.style.display = "none";

export var timeZoneName = "";

export function initialize() {
  global.settings.secondTzOffset = "00:00";
  global.settings.secondTzShortName = "Not set";
  timeZoneName = "Not set";
}

messaging.peerSocket.addEventListener("message", (evt) => {
  switch(evt.data.key) {
      case "secondTimeZone":
        logger.dbgWrite(fs,"timeDate.peerSocket: Second Timzone message: " + JSON.stringify(evt.data.value.values[0]));
        global.settings.secondTzOffset = evt.data.value.values[0].offset;
        logger.dbgWrite(fs,"timeDate.peerSocket: Set Second TZ offset to: " + global.settings.secondTzOffset);
        timeZoneName = evt.data.value.values[0].name;
        cache.saveCache();
        break;
      case "secondTimeZoneShortName":
        logger.dbgWrite(fs,"timeDate.peerSocket: Second Timzone Short Name message: " + JSON.stringify(evt.data));
        global.settings.secondTzShortName = evt.data.value.name;
        logger.dbgWrite(fs,"timeDate.peerSocket: Set Second TZ City to: " + global.settings.secondTzShortName);
        updateSecondTzCity(global.settings.secondTzShortName);
        timeZoneName = global.settings.secondTzShortName;
        cache.saveCache();
        break;
      case "timeZoneToggle":
        if(evt.data.value == true) {
          secondTzSvg.style.display="inline";
          bShowSecondTz = true;
        } else {
          secondTzSvg.style.display="none";
          bShowSecondTz=false;
        }
        break;
      default:
        logger.dbgWrite(fs,"timeDate.peerSocket: Unknown Message received. (" + evt.data.key +")");
        break; 
    }
});

// update the primary Timezone Date and Time
export function updatePrimaryTz (evt) {
  // logger.dbgWrite(fs, `Updating primary Tz: ${evt.date}`);
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    hours = util.zeroPad(hours % 12 || 12);
  } else {
    hours = util.zeroPad(hours);
  }
  let mins        = util.zeroPad(today.getMinutes());
  clockLabel.text = hours + ":" + mins;
  
  let year     = today.getFullYear();
  let monthNum = today.getMonth();
  let month    = monthArray[monthNum];
  let day      = today.getDate();
  let dayNum   = today.getDay();
  let dayName  = dayArray[dayNum];

  weekDay.text = dayName;
  date.text = day;
}

// update the second Timezone
export function updateSecondaryTzTime(evt) {
  // logger.dbgWrite(fs, `Updating secondary Tz: ${evt.date}`);
    // get current local time in milliseconds
    var date = evt.date;
    var localTime = date.getTime();
 
    // get local timezone offset and convert to milliseconds
    var localOffset = date.getTimezoneOffset() * 60000;
 
    // obtain the UTC time in milliseconds
    var utc = localTime + localOffset;
    var newDateTime = utc + (3600000 * global.settings.secondTzOffset);
    var convertedDateTime = new Date(newDateTime);
  
    var secondTzResult =  calculateTimeDiff(global.settings.secondTzOffset);
    if(logger.log_tick_events) {
      logger.dbgWrite(fs,"timeDate.updateSecondaryTzTime: Second Tz: " + secondTzResult);
    }

    if(bShowSecondTz) {
      if(timeZoneName == "Not set") {
        secondTzTime.text = "--:--";
        lblSecondTzCity.text = timeZoneName;
      } else {
        secondTzTime.text = secondTzResult[0] + ":" + secondTzResult[1];
        if(secondTzResult[2] != "+0") {
          secondTzDiff.text=secondTzResult[2];
        }
        updateSecondTzCity(global.settings.secondTzShortName);
      }
    }
}
// calculate the time difference between local TZ and second TZ
function calculateTimeDiff(offset) {   
    var result = ["00","00","+0"];
    var d = new Date();
    var nd = calcSecondTzDateTime(parseInt(offset));
    let hours = nd.getHours();
    if(!(util.isDST(nd))) {
      hours = hours + 1;
    }
    if (preferences.clockDisplay === "12h") {
      hours = util.zeroPad(hours % 12 || 12);
    } else {
      hours = util.zeroPad(hours);
    }
    let mins = util.zeroPad(nd.getMinutes());
    let tzDate = nd.getDate();
    if(isNaN(hours)) {
      hours = "";
    } else {
      result[0] = hours;
    }
    
    if(isNaN(mins)) {
      mins = "";
    } else {
      result[1] = mins;
    }

    if(tzDate > d.getDate()) {
      result[2] = "+1";
    } else if(tzDate < d.getDate()) {
      result[2] = "-1";
    } else {
      result[2] = "";
    }
    if(logger.log_tick_events === true) {
      logger.dbgWrite(fs,"timeDate.calculateTimeDiff: TZ Date: " + tzDate);
      logger.dbgWrite(fs,"timeDate.calculateTimeDiff: TZ Time: " + result);
      logger.dbgWrite(fs,"timeDate.calculateTimeDiff: Current Date: " + d.getDate());
    }
    return result;
}

// calculate the Second Timezone Date and Time
function calcSecondTzDateTime(offset) {
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

function updateSecondTzCity(shortName) {

  if(shortName ==  "Not set" ) {
    shortName = getDisplayName(timeZoneName);
  }
  
  lblSecondTzCity.text = shortName;
}

function getDisplayName(fullName) {
  let result = "Not set";
  switch (fullName) {
    case undefined:
    case NaN:
    case "None":
    case "Not set":
      logger.dbgWrite(fs,`timeDate.getDisplayName: fullName=${fullName}`);
      break;
    default:
      result = fullName.split(': ')[1].trim();
      if(result.indexOf(" ") >= 1 ) {
        result = result.split(" ")[0];
      }
      break;
  }
  return result;
}
