import * as util from "../common/utils";

// logging  variables
export const LOG_FILE = "log.txt";
export const LOG_TYPE = "ascii";
export const log_tick_events=false;

export const messageType = {
    DBG_INFO:       4,
    DBG_ERROR:      3,
    DBG_WARNING:    2,
    DBG_MESSAGE:    1,
    DBG_PLAIN:      0
}

// Debug Console Writer
export function dbgWrite(fs,message,severity,noOutput) {
  if(!noOutput) {
    if(isNaN(severity)) {
      severity = 1;
    }
    switch(severity) {
      case  3:
        message = "ERROR: " + message;
        if(util.dbg){console.error (message);}
        break;
      case 2:
        message = "WARNING:" + message;
        if(util.dbg){console.warn (message);}
        break;
      case 1:
        message = "MESSAGE: " + message;
        if(util.dbg){console.log (message);}
        break;
      case 4: 
        message = "INFO: " + message;
        if(util.dbg){console.log (message);}
        break;
      default:
        if(util.dbg){console.log (message);}
        break;
    }
  }
}
