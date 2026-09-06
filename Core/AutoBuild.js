/**
*  @filename    AutoBuild.js
*  @author      theBGuy
*  @credit      alogwe - orignal author
*  @desc        modified AutoBuild for easier use with Kolbot-SoloPlay
*
*/
js_strict(true);

const AutoBuild = new function AutoBuild () {
  Config.AutoBuild.DebugMode && (Config.AutoBuild.Verbose = true);
  const debug = !!Config.AutoBuild.DebugMode;
  const verbose = !!Config.AutoBuild.Verbose;

  const log = function (message) {
    FileTools.appendText(getLogFilename(), message + "\n");
  };
  const getCurrentScript = function () {
    return getScript(true).name.toLowerCase();
  };

  const buildTemplate = me.currentBuild.AutoBuildTemplate;
  let configUpdateLevel = 0;
  let lastSuccessfulUpdateLevel = 0;

  // Apply all Update functions from the build template in order from level 1 to me.charlvl.
  // By reapplying all of the changes to the Config object, we preserve
  // the state of the Config file without altering the saved char config.
  /**
   * Re-applies every build-template Update from `configUpdateLevel` up to `me.charlvl`, in order.
   */
  function applyConfigUpdates () {
    let cLvl = me.charlvl;
    debug && this.print("Updating Config from level " + configUpdateLevel + " to " + cLvl);
    let reapply = true;

    while (configUpdateLevel < cLvl) {
      configUpdateLevel += 1;
      Skill.init();
      if (buildTemplate[configUpdateLevel] !== undefined) {
        buildTemplate[configUpdateLevel].Update.apply(Config);
        lastSuccessfulUpdateLevel = configUpdateLevel;
      } else if (reapply) {
        // re-apply from the last successful update - this is helpful if inside the build file there are conditional statements
        buildTemplate[lastSuccessfulUpdateLevel].Update.apply(Config);
        reapply = false;
      }
    }
  }

  /** @returns {string} Log file path for today, scoped to this realm and character. */
  function getLogFilename () {
    let d = new Date();
    let dateString = d.getMonth() + "_" + d.getDate() + "_" + d.getFullYear();
    return "logs/AutoBuild." + me.realm + "." + me.charname + "." + dateString + ".log";
  }

  /**
   * Registers the level-up listener (outside soloplay.js) and resynchronizes Config with the
   * AutoBuild changes already applied at the character's current level.
   */
  function initialize () {
    let currentScript = getCurrentScript();
    this.print("Including build template " + SetUp._buildTemplate + " into " + currentScript);

    if (!buildTemplate) throw new Error("Failed to include template: " + SetUp._buildTemplate);

    // All threads except soloplay.js use this event listener
    // to update their thread-local Config object
    if (currentScript !== "libs\\soloplay\\soloplay.js") {
      addEventListener("scriptmsg", levelUpHandler);
    }

    // Resynchronize our Config object with all past changes
    // made to it by AutoBuild system
    applyConfigUpdates();
  }

  /** @param {{event?: string}} obj - Broadcast scriptmsg payload; triggers on `event === "level up"`. */
  function levelUpHandler (obj) {
    if (typeof obj === "object" && obj.hasOwnProperty("event") && obj.event === "level up") {
      applyConfigUpdates();
    }
  }

  // Only print to console from autobuildthread.js,
  // but log from all scripts
  /**
   * Only prints to console when verbose, but always logs to file when debug is enabled.
   * @param {...unknown} args - Values to print, joined with spaces (like `console.log`).
   */
  function myPrint () {
    if (!debug && !verbose) return;
    let args = Array.prototype.slice.call(arguments);
    args.unshift("AutoBuild:");
    let result = args.join(" ");
    verbose && print.call(this, result);
    debug && log.call(this, result);
  }

  this.levelUpHandler = levelUpHandler;
  this.print = myPrint;
  this.initialize = initialize;
  this.applyConfigUpdates = applyConfigUpdates;
};
