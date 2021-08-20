import * as messaging from "messaging";
import * as logger from "../common/logger.js"
import * as fs from "fs";
import * as global from "../common/globals.js";

messaging.peerSocket.addEventListener("open", (evt) => {
  // sendMessage();
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});

function sendMessage() {
  // Sample data
  const data = {
    command: 'checkIfSimulator',
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
  }
}

export function isSimulator() {
  var result = global.settings.isSimulator;
  logger.dbgWrite(fs,"app.isSimulator: " + result);
  return result;
}
