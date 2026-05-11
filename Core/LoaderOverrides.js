/**
*  @filename    LoaderOverrides.js
*  @author      theBGuy
*  @credit      kolton
*  @desc        script loader, based on mBot's Sequencer.js
*
*/

includeIfNotIncluded("core/Loader.js");

Loader.getScripts = function () {
  let fileList = dopen("libs/SoloPlay/Scripts").getFiles();

  for (let i = 0; i < fileList.length; i += 1) {
    if (fileList[i].indexOf(".js") > -1) {
      this.fileList.push(fileList[i].substring(0, fileList[i].indexOf(".js")));
    }
  }
};

Loader.scriptName = function (offset = 0) {
  let index = this.scriptIndex + offset;

  if (index >= 0 && index < SoloIndex.scripts.length) {
    return SoloIndex.scripts[index];
  }

  return "SoloPlay";
};

/**
 * @deprecated Loader.run is used instead
 */
Loader.loadScripts = function () {
  return Loader.run();
};

Loader.run = function () {
  const _toolsThread = "libs/SoloPlay/Threads/ToolsThread.js";
  
  let updatedDifficulty = Check.nextDifficulty();
  if (updatedDifficulty) {
    CharData.updateData("me", "setDifficulty", updatedDifficulty);
    !me.realm && Messaging.sendToScript("D2BotSoloPlay.dbj", "diffChange");
  }

  for (Loader.scriptIndex = 0; Loader.scriptIndex < SoloIndex.scripts.length; Loader.scriptIndex++) {
    const ctx = {};
    const script = SoloIndex.scripts[this.scriptIndex];
    
    if (!me.inTown && !Loader.skipTown.includes(script)) {
      Town.goToTown();
    }
    
    Check.checkSpecialCase();
    if (!SoloIndex.index[script]) continue;
    if (!SoloIndex.index[script].shouldRun()) continue;

    let j;
    let tick;
    let expStart;

    try {
      includeIfNotIncluded("SoloPlay/Scripts/" + script + ".js");

      Loader.currentScript = global[script];

      // Preload the next script
      if (Loader.scriptIndex < Loader.scriptList.length - 1) {
        let nextScript = this.scriptList[Loader.scriptIndex + 1];
        if (include("SoloPlay/Scripts/" + nextScript + ".js")) {
          if (global[nextScript] instanceof Runnable && global[nextScript].startArea) {
            Loader.nextScript = global[nextScript];
          }
        }
      }

      if (Loader.currentScript instanceof Runnable) {
        const { startArea, bossid, preAction, setup } = Loader.currentScript;
            
        if (startArea && Loader.scriptIndex === 0) {
          Loader.firstScriptAct = sdk.areas.actOf(startArea);
        }

        if (bossid && Attack.haveKilled(bossid)) {
          console.log("ÿc2Skipping script: ÿc9" + script + " ÿc2- Boss already killed.");
          continue;
        }

        if (setup && typeof setup === "function") {
          setup(ctx);
        }
            
        if (preAction && typeof preAction === "function") {
          preAction(ctx);
        }

        if (startArea && me.inArea(startArea)) {
          this.skipTown.push(script);
        }
      } else if (typeof (Loader.currentScript) !== "function") {
        throw new Error(
          "Invalid script function name. "
              + "Typeof: " + typeof (Loader.currentScript)
              + " Name: " + script
        );
      }
      
      tick = getTickCount();
      expStart = me.getStat(sdk.stats.Experience);
      Messaging.sendToScript(_toolsThread, JSON.stringify({ currScript: script }));
      DataFile.updateStats("lastScript", script);

      for (j = 0; j < 5; j += 1) {
        if (Loader._runCurrent(ctx)) {
          
          if (Loader.currentScript instanceof Runnable) {
            const { postAction } = Loader.currentScript;
              
            if (postAction && typeof postAction === "function") {
              postAction(ctx);
            }
          }
          break;
        }
      }

      (j === 5) && myPrint("script " + script + " failed.");
    } catch (e) {
      console.error(e);
    } finally {
      SoloIndex.doneList.push(script);
      // skip logging if we didn't actually finish it
      if (!SoloIndex.retryList.includes(script) && Settings.logPerformance) {
        Tracker.script(tick, script, expStart);
      }
      console.log("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Time.format(me.maxgametime));
      me.maxgametime += (getTickCount() - tick);
      console.log("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Time.format(me.maxgametime));
      
      let gain = Math.max(me.getStat(sdk.stats.Experience) - expStart, 0);
      let duration = Time.elapsed(tick);
      console.log(
        "ÿc8Kolbot-SoloPlayÿc0 :: ÿc8" + script
        + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(duration) + "\n"
        + "ÿc7 - Experience Gained: ÿc0" + gain + "\n"
        + "ÿc7 - Exp/minute: ÿc0" + (gain / (duration / 60000)).toFixed(2)
      );

      // remove script function from function scope, so it can be cleared by GC
      if (Loader.scriptIndex < SoloIndex.scripts.length) {
        delete global[script];
        Loader.currentScript = null;
        Loader.nextScript = null;
      }
    }

    if (me.sorceress && me.hell && script === "bloodraven" && me.charlvl < 68) {
      console.info(false, "End-run, we are not ready to keep pushing yet");
        
      break;
    }

    if (me.dead) {
      // not sure how we got here but we are dead, why did toolsthread not quit lets check it
      let tThread = getScript("libs/SoloPlay/Threads/ToolsThread.js");
      if (!tThread || !tThread.running) {
        // well that explains why, toolsthread seems to have crashed lets restart it so we quit properly
        load("libs/SoloPlay/Threads/ToolsThread.js");
      }
    }
  }

  // Re-check to see if after this run we now meet difficulty requirments
  if (!updatedDifficulty) {
    updatedDifficulty = Check.nextDifficulty(false);
    if (updatedDifficulty) {
      CharData.updateData("me", "setDifficulty", updatedDifficulty);
      !me.realm && Messaging.sendToScript("D2BotSoloPlay.dbj", "diffChange");
    }
  }

  return true;
};

Loader.runScript = function (script, configOverride) {
  let tick;
  let currentExp;
  let failed = false;
  let reconfiguration, unmodifiedConfig = {};
  let mainScript = this.scriptName();
    
  function buildScriptMsg () {
    let str = "ÿc9" + mainScript + " ÿc0:: ";

    if (Loader.tempList.length && Loader.tempList[0] !== mainScript) {
      Loader.tempList.forEach(s => str += "ÿc9" + s + " ÿc0:: ");
    }
      
    return str;
  }

  this.copy(Config, unmodifiedConfig);

  if (includeIfNotIncluded("SoloPlay/Scripts/" + script + ".js")) {
    const ctx = {
      _parent: Loader.currentScript
    };
    Loader.currentScript = global[script];
    
    try {
      if (Loader.currentScript instanceof Runnable) {
        const { startArea, bossid, preAction, setup } = Loader.currentScript;

        if (startArea && me.inArea(startArea)) {
          Loader.skipTown.push(script);
        }
          
        if (bossid && Attack.haveKilled(bossid)) {
          console.log("ÿc2Skipping script: ÿc9" + script + " ÿc2- Boss already killed.");
          return true;
        }

        if (setup && typeof setup === "function") {
          setup(ctx);
        }
          
        if (preAction && typeof preAction === "function") {
          preAction(ctx);
        }
      } else if (typeof (Loader.currentScript) !== "function") {
        throw new Error("Invalid script function name");
      }

      if (this.skipTown.includes(script) || Town.goToTown()) {
        let mainScriptStr = (mainScript !== script ? buildScriptMsg() : "");
        this.tempList.push(script);
        console.log(mainScriptStr + "ÿc2Starting script: ÿc9" + script);
        Messaging.sendToScript("libs/SoloPlay/Threads/ToolsThread.js", JSON.stringify({ currScript: script }));
        DataFile.updateStats("lastScript", script);

        if (typeof configOverride === "function") {
          reconfiguration = true;
          configOverride();
        }

        tick = getTickCount();
        currentExp = me.getStat(sdk.stats.Experience);

        if (Loader._runCurrent(ctx)) {
          console.log(
            mainScriptStr + "ÿc7" + script
              + " :: ÿc0Complete ÿc0- ÿc7Duration: ÿc0" + (Time.format(getTickCount() - tick))
          );
          let gain = Math.max(me.getStat(sdk.stats.Experience) - exp, 0);
          let duration = Time.elapsed(tick);
          console.log(
            mainScriptStr + "ÿc7" + script + " :: ÿc0Complete\n"
              + "ÿc2 Statistics:\n"
              + "ÿc7 - Duration: ÿc0" + (Time.format(duration)) + "\n"
              + "ÿc7 - Experience Gained: ÿc0" + gain + "\n"
              + "ÿc7 - Exp/minute: ÿc0" + (gain / (duration / 60000)).toFixed(2)
          );
          this.doneScripts.add(script);

          if (Loader.currentScript instanceof Runnable) {
            const { postAction } = Loader.currentScript;
              
            if (postAction && typeof postAction === "function") {
              postAction(ctx);
            }
          }
        }
      }
    } catch (e) {
      failed = true;
      console.warn("ÿc8Kolbot-SoloPlayÿc0: " + (e.message ? e.message : e));
    } finally {
      SoloIndex.doneList.push(script);
      Settings.logPerformance && Tracker.script(tick, script, currentExp);
      // Dont run for last script as that will clear everything anyway
      if (this.scriptIndex < this.scriptList.length) {
        // remove script function from global scope, so it can be cleared by GC
        delete global[script];
      } else if (this.tempList.length) {
        delete global[script];
      }
      // run cleanup if applicable
      if (Loader.currentScript instanceof Runnable) {
        if (Loader.currentScript.cleanup && typeof Loader.currentScript.cleanup === "function") {
          Loader.currentScript.cleanup(ctx);
        }
      }
      Loader.currentScript = ctx._parent;
      Loader.tempList.pop();
        
      if (reconfiguration) {
        console.log("ÿc2Reverting back unmodified config properties.");
        this.copy(unmodifiedConfig, Config);
      }
    }
  } else {
    console.warn("Failed to include: " + script);
  }

  return !failed;
};
