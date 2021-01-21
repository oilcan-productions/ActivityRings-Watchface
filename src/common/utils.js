////#region globals and imports
import * as fs from "fs";
import { listDirSync } from "fs";
import { outbox } from "file-transfer";

// log file constants
export const LOG_FILE = "log.txt";
export const LOG_TYPE = "ascii";

// set debug output to on/off
export const dbg = false;
export const messageType = {
    DBG_INFO:       4,
    DBG_ERROR:      3,
    DBG_WARNING:    2,
    DBG_MESSAGE:    1,
    DBG_PLAIN:      0
}
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

// Debug Console Writer
export function dbgWrite(message,severity,noOutput) {
  if(!noOutput) {
    if(isNaN(severity)) {
      severity = 1;
    }
    switch(severity) {
      case 3:
        message = "WARNING:" + message;
        if(dbg){console.warn (message);}
        break;
      case  2:
        message = "ERROR: " + message;
        if(dbg){console.error (message);}
        break;
      case 1:
        message = "MESSAGE: " + message;
        if(dbg){console.log (message);}
        break;
      case 4: 
        message = "INFO: " + message;
        if(dbg){console.log (message);}
        break;
      default:
        if(dbg){console.log (message);}
      break;
    }
    
    if(severity == 4) {
      message = "INFO: " + message;
      console.log(message);
    }
  }
  // write to the log file.
  writeLog(message);
}

// delete the log file
export function deleteLogFile() {
  fs.unlinkSync(LOG_FILE);
}

// truncate log file if larger than 200k bytes
export function checkLogFileSize(maxFileSize) {
  if (fs.existsSync(LOG_FILE)) {
    let stats = fs.statSync(LOG_FILE);
    if (stats) {
      console.log("File size: " + stats.size + " bytes");
      console.log("Last modified: " + stats.mtime);
      if(stats.size >= 200000) {
          deleteLogFile();
          dbgWrite("Truncated logfile.",DBG_WARNING);
      }
    }
  }
}

// list files in the device directory 
function listFiles() {
  let dirIter = null;
  const listDir = listDirSync("/private/data/");
  while((dirIter = listDir.next()) && !dirIter.done) {
    console.log(dirIter.value);
  }
}

// write to log file
export function writeLog(message) {
  let buffer = str2ab((new Date()).toString() + ": " + message + "\n");
  let fd = fs.openSync(LOG_FILE, 'a+');
  fs.writeSync(fd, buffer);
  fs.closeSync(fd);
}

// send the log to the companion
export function sendLog() {
  outbox
   .enqueueFile(LOG_FILE)
   .then((ft) => {
     console.log(`Transfer of $‌{ft.name} successfully queued.`);
   })
   .catch((error) => {
     console.log(`Failed to schedule transfer: $‌{error}`);
   })
}

// convert string to buffer for log writing.
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
////#endregion
