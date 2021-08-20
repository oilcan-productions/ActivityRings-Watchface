import { me } from "appbit";
import * as document from "document";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import * as logger from "../common/logger.js"
import * as fs from "fs";

let hrm, checkInterval;

let heartText = document.getElementById("hrm-data");

export function initialize() {
  if(logger.log_tick_events) {
    logger.dbgWrite(fs,"hrm.initialize: entering");
  }
  if (me.permissions.granted("access_heart_rate")) {
    hrm = new HeartRateSensor();
    heartRateSetup();
    startReading();
  } else {
    logger.dbgWrite(fs,"hrm.initialize: Heart Rate Permission was denied.");
    heartText.text = "N/A";
  }
}

function getReading() {
  if(logger.log_tick_events) {
    logger.dbgWrite(fs,"hrm.getReading: entering");
  }
  heartText.text = hrm.heartRate ? hrm.heartRate : 0;
}

function heartRateSetup() {
  logger.dbgWrite(fs,"hrm.heartRateSetup: entering");
  display.addEventListener("change", function() {
    if (display.on) {
      startReading();
    } else {
      stopReading();
    }
  });
}

function startReading() {
 logger.dbgWrite(fs,"hrm.startReading: entering"); 
  if (!checkInterval) {
    hrm.start();
    getReading();
    checkInterval = setInterval(getReading, 30000);
  }
}

function stopReading() {
  logger.dbgWrite(fs,"hrm.stopReading: entering");
  hrm.stop();
  clearInterval(checkInterval);
  checkInterval = null;
}

