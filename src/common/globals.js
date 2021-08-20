
export var settings = {
    /* Data properties */
    defSecondTzOffset: "+00:00", 
    defSecondTzShortName: "UTC",
    defCumulativeStepHours: 0,
    defHourlyStepGoal: 250,
    defDailyStandGoal: 12,
    defInitalStepCalc: false,
    defMinutesToFetch: 60,
    defAppVersion: "1.7.0",
    defIsDebug: false,
    defIsSimulator: false,
    defTempUnit: "fahrenheit",
    defLastLocationLat: 47.60357,
    defLastLocationLon: -122.32945,
    defWelcomeMessage: "Hello From Seattle",
  
    /* Accessor properties (getters) */
    get lastLocationLat() {
      return this.defLastLocationLat;
    },
    get lastLocationLon() {
      return this.defLastLocationLon;
    },
    get welcomeMessage() {
      return this.defWelcomeMessage;
    },
    get isDebug() { 
         return this.defIsDebug; 
    }, 
    get isSimulator() { 
         return this.defIsSimulator; 
    }, 
    get secondTzShortName() { 
         return this.defSecondTzShortName; 
    }, 
    get secondTzOffset() { 
         return this.defSecondTzOffset; 
    },
    get cumulativeStepHours() { 
         return this.defCumulativeStepHours; 
    }, 
    get hourlyStepGoal() { 
         return this.defHourlyStepGoal; 
    },
    get dailyStandGoal() { 
     return this.defDailyStandGoal; 
},
    get doInitialStepCalc() { 
         return this.defInitalStepCalc; 
    },
    get minutesToFetch() { 
         return this.defMinutesToFetch; 
    },
   get appVersion() { 
         return this.defAppVersion; 
    },
    get tempUnit() {
      return this.defTempUnit;
    },
    
    /* Accessor properties (setters) */
    set lastLocationLat(newValue) {
      this.defLastLocationLat=newValue;
    },
    set lastLocationLon(newValue) {
      this.defLastLocationLon=newValue;
    },
    set welcomeMessage(newValue) {
      this.defWelcomeMessage=newValue;
    },
    set secondTzShortName(newValue) {
	    this.defSecondTzShortName = newValue;
    },
    set secondTzOffset(newValue) {
	    this.defSecondTzOffset = newValue;
    },
    set doInitialStepCalc(newValue) { 
       this.defInitalStepCalc= newValue; 
    },
    set cumulativeStepHours(newValue) {
       this.defCumulativeStepHours = newValue;
    },
    set tempUnit(newValue) {
       this.defTempUnit = newValue;
    }
};