////#region globals and imports
import * as global from "../common/globals.js";

// set debug output to on/off
export const dbg = global.settings.isDebug;
export let IS_SIMULATOR=false;

////#endregion

////#region functions
// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

// Convert decimal colors to HEX
export function convertColor(color) {
  // Ensures the sent color is an integer
  let intColor = color - 0;
  
  // All colors need to follow this pattern
  let colorStr = "#000000";
  
  // Get the red, green, and blue values of the color
  let red      = (intColor&0x0000ff) << 16;
  let green    = intColor&0x00ff00;
  let blue     = (intColor&0xff0000) >>> 16;
  
  // Combine the separated colors in the proper order
  intColor     = red|green|blue;
  
  // Create the hex color with # by using the colorStr as a template
  let hexColor = intColor.toString(16);
  
  // Colors are in reverse order, substr them to place them in the proper order
  hexColor     = colorStr.substring(0,7 - hexColor.length) + hexColor;
  let actualRed   = hexColor.substring(5,7);
  let actualGreen = hexColor.substring(3,5);
  let actualBlue  = hexColor.substring(1,3);
  
  return "#"+actualRed+actualGreen+actualBlue;
}

// color modifier function
export function colorModifier(color, percent) {
  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}
////#endregion

/**
* Convert Celsius to Fahrenheit
* @param {object} data - WeatherData -
*/
export function toFahrenheit(data) {
  
  if (data.unit.toLowerCase() === "celsius") {
     data.temperature =  Math.round((data.temperature * 1.8)+32);
     data.unit = "Fahrenheit";
  }
  
  return data
}

/**
* Convert Celsius to Fahrenheit
* @param {object} data - WeatherData -
*/
export function toCelsius(data) {
  
  if (data.unit.toLowerCase() === "fahrenheit") {
     data.temperature =  Math.round((data.temperature - 32)/1.8);
     data.unit = "celsius";
  }
  
  return data
}

function dstOffsetAtDate(dateInput) {
  var fullYear = dateInput.getFullYear();
// "Leap Years are any year that can be exactly divided by 4 (2012, 2016, etc)
 //   except if it can be exactly divided by 100, then it isn't (2100,2200,etc)
 //	  except if it can be exactly divided by 400, then it is (2000, 2400)"
// (https://www.mathsisfun.com/leap-years.html).
  var isLeapYear = ((fullYear & 3) | (fullYear/100 & 3)) === 0 ? 1 : 0;
// (fullYear & 3) = (fullYear % 4), but faster
  //Alternative:var isLeapYear=(new Date(currentYear,1,29,12)).getDate()===29?1:0
  var fullMonth = dateInput.getMonth()|0;
  return (
      // 1. We know what the time since the Epoch really is
      (+dateInput) // same as the dateInput.getTime() method
      // 2. We know what the time since the Epoch at the start of the year is
      - (+new Date(fullYear, 0, 0)) // day defaults to 1 if not explicitly zeroed
      // 3. Now, subtract what we would expect the time to be if daylight savings
      //      did not exist. This yields the time-offset due to daylight savings.
      - ((
          ((
              // Calculate the day of the year in the Gregorian calendar
              // The code below works based upon the facts of signed right shifts
              //    • (x) >> n: shifts n and fills in the n highest bits with 0s 
              //    • (-x) >> n: shifts n and fills in the n highest bits with 1s
              // (This assumes that x is a positive integer)
              (31 & ((-fullMonth) >> 4)) + // January // (-11)>>4 = -1
              ((28 + isLeapYear) & ((1-fullMonth) >> 4)) + // February
              (31 & ((2-fullMonth) >> 4)) + // March
              (30 & ((3-fullMonth) >> 4)) + // April
              (31 & ((4-fullMonth) >> 4)) + // May
              (30 & ((5-fullMonth) >> 4)) + // June
              (31 & ((6-fullMonth) >> 4)) + // July
              (31 & ((7-fullMonth) >> 4)) + // August
              (30 & ((8-fullMonth) >> 4)) + // September
              (31 & ((9-fullMonth) >> 4)) + // October
              (30 & ((10-fullMonth) >> 4)) + // November
              // There are no months past December: the year rolls into the next.
              // Thus, fullMonth is 0-based, so it will never be 12 in Javascript
              
              (dateInput.getDate()|0) // get day of the month
      
          )&0xffff) * 24 * 60 // 24 hours in a day, 60 minutes in an hour
          + (dateInput.getHours()&0xff) * 60 // 60 minutes in an hour
          + (dateInput.getMinutes()&0xff)
      )|0) * 60 * 1000 // 60 seconds in a minute * 1000 milliseconds in a second
      - (dateInput.getSeconds()&0xff) * 1000 // 1000 milliseconds in a second
      - dateInput.getMilliseconds()
  );
}

export function isDST(dateInput) {
  // To satisfy the original question
  return dstOffsetAtDate(dateInput) !== 0;
}