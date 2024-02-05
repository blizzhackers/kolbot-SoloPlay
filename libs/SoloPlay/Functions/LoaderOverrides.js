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
  let updatedDifficulty = Check.nextDifficulty();
  const _toolsThread = "libs/SoloPlay/Threads/ToolsThread.js";
  if (updatedDifficulty) {
    CharData.updateData("me", "setDifficulty", updatedDifficulty);
    !me.realm && Messaging.sendToScript("D2BotSoloPlay.dbj", "diffChange");
  }

  for (this.scriptIndex = 0; this.scriptIndex < SoloIndex.scripts.length; this.scriptIndex++) {
    const scriptName = SoloIndex.scripts[this.scriptIndex];
    !me.inTown && !Loader.skipTown.includes(scriptName) && Town.goToTown();
    Check.checkSpecialCase();
    if (!SoloIndex.index[scriptName]) continue;
    if (!SoloIndex.index[scriptName].shouldRun()) continue;

    let j;
    let tick;
    let currentExp;

    try {
      includeIfNotIncluded("SoloPlay/Scripts/" + scriptName + ".js");

      tick = getTickCount();
      currentExp = me.getStat(sdk.stats.Experience);
      Messaging.sendToScript(_toolsThread, JSON.stringify({ currScript: scriptName }));
      DataFile.updateStats("lastScript", scriptName);

      for (j = 0; j < 5; j += 1) {
        if (global[scriptName]()) {
          break;
        }
      }

      (j === 5) && myPrint("script " + scriptName + " failed.");
    } catch (e) {
      console.error(e);
    } finally {
      SoloIndex.doneList.push(scriptName);
      // skip logging if we didn't actually finish it
      if (!SoloIndex.retryList.includes(scriptName) && Developer.logPerformance) {
        Tracker.script(tick, scriptName, currentExp);
      }
      console.log("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Time.format(me.maxgametime));
      me.maxgametime += (getTickCount() - tick);
      console.log("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Time.format(me.maxgametime));
      console.log(
        "ÿc8Kolbot-SoloPlayÿc0 :: ÿc8" + scriptName
        + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
      );

      // remove script function from function scope, so it can be cleared by GC
      if (this.scriptIndex < SoloIndex.scripts.length) {
        delete global[scriptName];
      }
    }

    if (me.sorceress && me.hell && scriptName === "bloodraven" && me.charlvl < 68) {
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
    try {
      if (typeof (global[script]) !== "function") throw new Error("Invalid script function name");
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

        if (global[script]()) {
          console.log(
            mainScriptStr + "ÿc7" + script
            + " :: ÿc0Complete ÿc0- ÿc7Duration: ÿc0" + (Time.format(getTickCount() - tick))
          );
        }
      }
    } catch (e) {
      failed = true;
      console.warn("ÿc8Kolbot-SoloPlayÿc0: " + (e.message ? e.message : e));
    } finally {
      SoloIndex.doneList.push(script);
      Developer.logPerformance && Tracker.script(tick, script, currentExp);
      delete global[script];
      this.tempList.pop();
        
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
