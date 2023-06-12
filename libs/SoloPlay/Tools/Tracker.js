/**
*  @filename    Tracker.js
*  @author      theBGuy, isid0re
*  @desc        Track bot game performance and send to CSV file
*
*/

includeIfNotIncluded("core/experience.js");
includeIfNotIncluded("SoloPlay/Tools/Developer.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

const Tracker = {
  GTPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-GameTime.json",
  LPPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-LevelingPerformance.csv",
  SPPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-ScriptPerformance.csv",
  // Leveling Performance
  LPHeader: "Total Time,InGame,Split Time,Area,Charlevel,Gained EXP,EXP/Minute,Difficulty,Gold,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n",
  // Script Performance
  SPHeader: "Total Time,InGame,Sequence,Script,Charlevel,Gained EXP,EXP/Minute,EXP Gain %,Difficulty,Gold,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n",
  tick: 0,
  /**
   * @typedef {Object} GameTracker
   * @property {number} Total - Total time spent in game
   * @property {number} InGame - Total time spent in game
   * @property {number} OOG - Total time spent out of game
   * @property {number} LastLevel - Time Last level reached
   * @property {number} LastSave - Time Last save occurred
   */
  _default: {
    "Total": 0,
    "InGame": 0,
    "OOG": 0,
    "LastLevel": 0,
    "LastSave": getTickCount()
  },

  initialize: function () {
    const GameTracker = Object.assign({}, this._default);

    // Create Files
    if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
      let folder = dopen("libs/SoloPlay/Data");
      folder.create(me.profile);
    }

    !FileTools.exists(this.GTPath) && Tracker.writeObj(GameTracker, this.GTPath);
    !FileTools.exists(this.LPPath) && FileAction.write(this.LPPath, this.LPHeader);
    !FileTools.exists(this.SPPath) && FileAction.write(this.SPPath, this.SPHeader);

    return true;
  },

  /**
   * @param {string} path 
   * @returns {GameTracker}
   */
  getObj: function (path) {
    let obj, OBJstring = FileAction.read(path);

    try {
      obj = JSON.parse(OBJstring);
    } catch (e) {
      // If we failed, file might be corrupted, so create a new one
      Misc.errorReport(e, "Tracker");
      FileTools.remove(path);
      Tracker.initialize();
      OBJstring = FileAction.read(path);
      obj = JSON.parse(OBJstring);
    }

    if (obj) {
      return obj;
    }

    console.error("ÿc8Kolbot-SoloPlayÿc0: Failed to read Obj. (Tracker.getObj)");

    return false;
  },

  /**
   * @param {string} jsonPath 
   * @returns {GameTracker}
   */
  readObj: function (jsonPath) {
    let obj = this.getObj(jsonPath);
    return clone(obj);
  },

  writeObj: function (obj, path) {
    let string;
    try {
      string = JSON.stringify(obj, null, 2);
      // try to parse the string to ensure it converted correctly
      JSON.parse(string);
      // JSON.parse throws an error if it fails so if we are here now we are good
      FileAction.write(path, string);
    } catch (e) {
      console.warn("Malformed JSON object");
      console.error(e);
      return false;
    }

    return true;
  },

  resetGameTime: function () {
    Tracker.writeObj(Object.assign({}, this._default), this.GTPath);
  },

  reset: function () {
    this.resetGameTime();
    // for now just re-init the header so it's easier to look at the file and see where we restarted
    // might later save the files to a sub folder and re-init a new one
    FileTools.exists(this.LPPath) && FileAction.append(this.LPPath, this.LPHeader);
    FileTools.exists(this.SPPath) && FileAction.append(this.SPPath, this.SPHeader);
  },

  checkValidity: function () {
    const GameTracker = Tracker.readObj(this.GTPath);
    let found = false;
    GameTracker && Object.keys(GameTracker).forEach(function (key) {
      if (GameTracker[key] < 0) {
        console.debug("Negative value found");
        GameTracker[key] = 0;
        found = true;
      }
    });
    found && Tracker.writeObj(GameTracker, this.GTPath);
  },

  totalDays: function (milliseconds) {
    let days = Math.floor(milliseconds / 86.4e6).toFixed(0);
    return days.toString().padStart(1, "0");
  },

  script: function (starttime, subscript, startexp) {
    const GameTracker = Tracker.readObj(Tracker.GTPath);

    // GameTracker
    // this seems to happen when my pc restarts so set last save equal to current tick count and then continue
    GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

    const newTick = me.gamestarttime >= GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;
    GameTracker.InGame += Time.elapsed(newTick);
    GameTracker.Total += Time.elapsed(newTick);
    GameTracker.LastSave = getTickCount();
    Tracker.writeObj(GameTracker, Tracker.GTPath);

    // csv file
    const scriptTime = Time.elapsed(starttime);
    const currLevel = me.charlvl;
    const diffString = sdk.difficulty.nameOf(me.diff);
    const gainAMT = me.getStat(sdk.stats.Experience) - startexp;
    const gainTime = (gainAMT / (scriptTime / 60000)).toFixed(2);
    const gainPercent = currLevel === 99
      ? 0
      : (gainAMT * 100 / Experience.nextExp[currLevel]).toFixed(2);
    const currentBuild = SetUp.currentBuild;
    const [GOLD, FR, CR, LR, PR] = [me.gold, me.realFR, me.realCR, me.realLR, me.realPR];
    const string = (
      Time.format(GameTracker.Total) + "," + Time.format(GameTracker.InGame) + "," + Time.format(scriptTime)
      + "," + subscript + "," + currLevel + "," + (gainAMT).toFixed(2)
      + "," + gainTime + "," + gainPercent + "," + diffString
      + "," + GOLD + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n"
    );

    FileAction.append(Tracker.SPPath, string);
    Tracker.tick = GameTracker.LastSave;

    return true;
  },

  leveling: function () {
    const GameTracker = Tracker.readObj(this.GTPath);

    // GameTracker
    // this seems to happen when my pc restarts so set last save equal to current tick count and then continue
    GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

    const newSave = getTickCount();
    const newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;
    const splitTime = Time.elapsed(GameTracker.LastLevel);
    GameTracker.InGame += Time.elapsed(newTick);
    GameTracker.Total += Time.elapsed(newTick);
    GameTracker.LastLevel = newSave;
    GameTracker.LastSave = newSave;
    Tracker.writeObj(GameTracker, Tracker.GTPath);

    // csv file
    const diffString = sdk.difficulty.nameOf(me.diff);
    const areaName = getAreaName(me.area);
    const currentBuild = SetUp.currentBuild;
    const gainAMT = me.getStat(sdk.stats.Experience) - Experience.totalExp[me.charlvl - 1];
    const gainTime = gainAMT / (splitTime / 60000);
    const [GOLD, FR, CR, LR, PR] = [me.gold, me.realFR, me.realCR, me.realLR, me.realPR];
    const string = (
      Time.format(GameTracker.Total) + "," + Time.format(GameTracker.InGame) + "," + Time.format(splitTime) + ","
      + areaName + "," + me.charlvl + "," + gainAMT + "," + gainTime + "," + diffString + ","
      + GOLD + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n"
    );

    FileAction.append(Tracker.LPPath, string);
    Tracker.tick = GameTracker.LastSave;

    return true;
  },

  update: function (oogTick = 0) {
    let heartBeat = getScript("threads/heartbeat.js");
    if (!heartBeat) {
      console.debug("Couldn't find heartbeat");
      return false;
    }
    if (!me.ingame) {
      console.debug("Not in game");
      return false;
    }

    const GameTracker = Tracker.readObj(this.GTPath);

    // this seems to happen when my pc restarts so set last save equal to current tick count and then continue
    GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

    // make sure we aren't attempting to use a corrupted file (only way we get negative values)
    const newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;

    GameTracker.OOG += oogTick;
    GameTracker.InGame += Time.elapsed(newTick);
    GameTracker.Total += (Time.elapsed(newTick) + oogTick);
    GameTracker.LastSave = getTickCount();
    Tracker.writeObj(GameTracker, Tracker.GTPath);
    Tracker.tick = GameTracker.LastSave;

    return true;
  }
};
