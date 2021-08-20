import * as logger from "../common/logger.js"
import * as fs from "fs";
import * as global from "../common/globals.js";
import * as messaging from "messaging";

// Cache setup
const CACHE_FILE = "cache.txt";
const CACHE_TYPE = "json";

export function saveCache() {
  logger.dbgWrite(fs,"app.saveCache: Entering.");
  storeKeyValuePair("cumulativeStepHours",global.settings.cumulativeStepHours);
  storeKeyValuePair("INITIAL_STEP_CALC",global.settings.doINitialStepCalc);
  storeKeyValuePair("secondTzOffset",global.settings.secondTzOffset);
  storeKeyValuePair("secondTzShortName",global.settings.secondTzShortName);
}

export function loadCache() {
  logger.dbgWrite(fs,"cacheManager.loadCache: Entering.");
  global.settings.cumulativeStepHours = retrieveKeyValuePair("cumulativeStepHours");
  global.settings.doInitialStepCalc = retrieveKeyValuePair("doInitialStepCalc");
  global.settings.secondTzOffset = retrieveKeyValuePair("secondTzOffset");
  global.settings.secondTzShortName = retrieveKeyValuePair("secondTzShortName");;
}

export function storeKeyValuePair(key, value) {
  if(key) {
    let fileName = `${key}.json`;
    let json_data = {
      "key" : key,
      "value" : value
    };
    logger.dbgWrite(fs,"cacheManager.storeKeyValuePair: Data: " + JSON.stringify(json_data),4);
    fs.writeFileSync(fileName, json_data, CACHE_TYPE)
  }
}

export function retrieveKeyValuePair(key) {

  let fileName = `${key}.json`;

  if (fs.existsSync(fileName)) {
    logger.dbgWrite(fs,"cacheManager.retrieveKeyValuePair: " + fileName + " exists! Loading Data.");
    let json_object  = fs.readFileSync(fileName, CACHE_TYPE);
    logger.dbgWrite(fs,"cacheManager.retrieveKeyValuePair: JSON loaded: " + JSON.stringify(json_object));
    return json_object;
  }
  let json_object = {
    "key" : key,
    "value" : null
  };
  return json_object;
}
export function resetCache() {
  logger.dbgWrite(fs,"cacheManager.resetCache: Resetting Cache.");
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
    messaging.peerSocket.send({
        command: "resetCacheFalse"
    });
  }
  resetAllCachedKeys();
}

function resetAllCachedKeys() {
  let dirIter = null;
  const listDir = fs.listDirSync("/private/data");
  while((dirIter = listDir.next()) && !dirIter.done) {
    fs.unlinkSync(dirIter.value);
    logger.dbgWrite(fs,`cacheManager.resetAllCachedKeys: removed ${dirIter.value}`)
  }
}

export function migrateCache() {
  logger.dbgWrite(fs,"cacheManager.migrateCache: migrating Cache.");
  let cacheMigrationComplete = retrieveKeyValuePair("cacheMigrationComplete");
  if(!cacheMigrationComplete) {
    if (fs.existsSync(CACHE_FILE)) {
      logger.dbgWrite(fs,"cacheManager.loadCache: " + CACHE_FILE + " exists! Loading Data.");
      let json_object  = fs.readFileSync(CACHE_FILE, CACHE_TYPE);
      logger.dbgWrite(fs,"cacheManager.loadCache: JSON loaded: " + JSON.stringify(json_object));
      // set the variables
      global.settings.cumulativeStepHours = Number(json_object.cumulativeStepHours);
      global.settings.doInitialStepCalc = Boolean(json_object.INITIAL_STEP_CALC);
      global.settings.secondTzOffset = json_object.secondTzOffset;
      global.settings.secondTzShortName = json_object.secondTzShortName;
      saveCache();
      storeKeyValuePair("cacheMigrationComplete",true);
      removeOldCache();
    }
  }
}

function removeOldCache() {
  logger.dbgWrite(fs,"cacheManager.removeOldCache.");
  fs.unlinkSync(CACHE_FILE);
}

export function getKeys() {
  var result = [];
  let dirIter = null;
  const listDir = fs.listDirSync("/private/data");
  while((dirIter = listDir.next()) && !dirIter.done) {
    let key = dirIter.value.replace('.json','');
    logger.dbgWrite(fs,`cacheManager.getKeys: Key found ${key}`)
    result.push(key);
  }
  return result;
}