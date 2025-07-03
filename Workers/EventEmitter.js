/**
 * @filename    EventEmitter.js
 * @author      theBGuy
 * @credit      jaenster
 * @desc        Global modifying UMD module to handle emitting events
 * 
 */

(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    let v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "../../modules/Worker", "../Modules/Events"], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });

  const Worker = require("../../modules/Worker");
  require("../Modules/Events");
  const old = {
    level: me.charlvl,
  };
  const gainedLevels = function () {
    return me.charlvl - old.level;
  };

  let levelTimeout = getTickCount();

  const _AutoBuild = new function () {
    this.enabled = true;

    this.run = function () {
      if (!this.enabled) return;

      try {
        let levels = gainedLevels();

        if (levels > 0 && (Config.AutoSkill.Enabled || Config.AutoStat.Enabled)) {
          scriptBroadcast("toggleQuitlist");
          AutoBuild.print("Level up detected (", old.level, "-->", me.charlvl, ")");
          AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
          AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
          scriptBroadcast({ event: "level up" });
          AutoBuild.applyConfigUpdates(); // scriptBroadcast() won't trigger listener on this thread.

          AutoBuild.print("Incrementing cached character level to", old.level + 1);
          Tracker.leveling();

          // prevLevel doesn't get set to me.charlvl because
          // we may have gained multiple levels at once
          old.level += 1;

          scriptBroadcast("toggleQuitlist");
        }
      } catch (e) {
        this.enabled = false;
        console.error(e);
        console.warn("Something broke! StackWalk :: ", e.stack);
      }
    };
  };

  // Start
  Worker.runInBackground.EventWatcher = function () {
    // AutoBuild
    if (getTickCount() - levelTimeout > 1000) {
      levelTimeout = getTickCount();
      _AutoBuild.run();
    }

    return true;
  };

  AutoBuild.print("Loaded AutoBuild");
  console.log("ÿc8Kolbot-SoloPlayÿc0: Start AutoBuild");
});
