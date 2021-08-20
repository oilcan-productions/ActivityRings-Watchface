import * as document from "document";
import { battery } from "power";
import { charger } from "power";
import * as logger from "../common/logger.js"
import * as fs from "fs";
import * as cache from "./cacheManager.js";

const batData = document.getElementById("batteryLevel");
const batIcon = document.getElementById("batteryIcon");
const batInfo = document.getElementById("batteryInfo");

let bShowBatteryIcon = false;

export function setBatteryIconVisibility(value) {
  if(value) {
    bShowBatteryIcon = true;
  }
  else {
    bShowBatteryIcon = false;
  }
  cache.storeKeyValuePair("showBatteryInfo",bShowBatteryIcon);
  initialize();
}

export function initialize() {
  bShowBatteryIcon = cache.retrieveKeyValuePair("showBatteryInfo").value;
  // battery and charging state change
  if(bShowBatteryIcon) {
      batInfo.style.display = "inline";
      charger.onchange = evt => {
        setChargingState();
      }
      setChargingState();

      battery.onchange = evt => {
        setLevel();
      }
      setLevel();
  } else {
    batInfo.style.display = "none";
  }
}

function batteryLevelColor(percentage) {
  if(percentage <= 15) {
    return 'fb-red';
  } else if (percentage <= 35) {
    return 'fb-peach';
  }
  return 'fb-green';
}

export function setChargingState(){
  if(charger.connected) {
      logger.dbgWrite(fs,"battery.setChargingState: Charging");
      batIcon.href="icons/charging.png";
      batData.style.opacity = 0.6;
  }
  else {
    logger.dbgWrite(fs,"battery.setChargingState: Not Charging");
    batIcon.href="icons/battery.png";
    batData.style.opacity = 1;
  }
}

export function setLevel() {
  logger.dbgWrite(fs,"battery.setLevel: Entering");
  batData.width = Math.round(battery.chargeLevel * 26 / 100);
  batData.style.fill = batteryLevelColor(Math.round(battery.chargeLevel));
}
