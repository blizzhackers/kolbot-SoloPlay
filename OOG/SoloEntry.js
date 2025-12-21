/**
*  @filename    SoloEntry.dbj
*  @author      theBGuy
*  @desc        Entry script for SoloPlay leveling system
*
*
*  @typedef {import("./sdk/globals")}
*  @typedef {import("./libs/SoloPlay/globals")}
*/

// No touchy!
include("critical.js"); // required

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
const { StarterConfig } = (function () {
  if (!FileTools.exists("libs/SoloPlay/OOG/StarterConfig.js")) {
    throw new Error("Missing SoloPlay StarterConfig.js file. Please run setup.bat to generate it.");
  }
  
  return require("./StarterConfig");
})();

/**
 * @todo
 *   - re-structure to use datafile for login info instead of writing to d2bot#
 *   - need to hanlde single player and online logging in
 *   - need to handle someone using a premade account
 */

// the only things we really need from these are their oog checks
includeSystemLibs();

// solo specific
include("SoloPlay/critical.js");
include("SoloPlay/OOG/OOGOverrides.js");

// is this needed? soloplay doesn't run in default.dbj anymore
include("SoloPlay/Core/ConfigOverrides.js");

if (typeof Starter.AdvancedConfig[me.profile] === "object") {
  Object.assign(Starter.Config, Starter.AdvancedConfig[me.profile]);
}
delete Starter.AdvancedConfig;

// initialize data files
if (DataFile.init()) {
  Starter.firstRun = true;
}

!FileTools.exists(CharData.filePath) && CharData.create();
!FileTools.exists(CharData.login.filePath) && CharData.login.create();
Settings.logPerformance && Tracker.initialize();

function main () {
  debugLog(me.profile);
  addEventListener("copydata", Starter.receiveCopyData);
  addEventListener("scriptmsg", Starter.scriptMsgEvent);

  let oogTick = getTickCount();

  while (!Starter.handle) {
    delay(3);
  }

  DataFile.updateStats("handle", Starter.handle);
  D2Bot.handle = Starter.handle;
  delay(500);

  load("threads/heartbeat.js");

  if (Profile().type === sdk.game.profiletype.TcpIpJoin) {
    D2Bot.printToConsole("TcpJoin is unsupported.");
    D2Bot.stop();
  }

  Starter.gameCount = (DataFile.getStats().runs + 1 || 1);

  while (!Object.keys(Starter.gameInfo).length) {
    delay(rand(200, 1500));
    D2Bot.requestGameInfo();
    delay(500);
  }

  if (Starter.gameInfo.error) {
    ControlAction.timeoutDelay("Crash Delay", Starter.Config.CrashDelay * 1e3);
    Starter.BNET && D2Bot.updateRuns();
  }

  DataFile.updateStats("debugInfo", JSON.stringify({ currScript: "none", area: "out of game" }));

  while (!Object.keys(Starter.profileInfo).length) {
    delay(rand(200, 1500));
    D2Bot.getProfile();
    delay(500);
  }

  while (true) {
    // returns true before actually in game so we can't only use this check
    while (me.ingame) {
      // returns false when switching acts so we can't use while
      if (me.gameReady) {
        Starter.isUp = "yes";

        if (!Starter.inGame) {
          Starter.gameStart = getTickCount();
          Starter.lastGameStatus = "ingame";
          Starter.inGame = true;
          DataFile.updateStats("runs", Starter.gameCount);
          DataFile.updateStats("ingameTick");
          Settings.logPerformance && Tracker.update((getTickCount() - oogTick));
          oogTick = 0;
          D2Bot.updateStatus("In-Game :: Initializing threads...");
        } else {
          // Tracker
          if (Settings.logPerformance) {
            if (getTickCount() - Tracker.tick > Time.minutes(3)) {
              Tracker.tick = getTickCount();

              try {
                Tracker.update();
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      }

      delay(1000);
    }

    // was in game so start recording oog time
    Starter.inGame && oogTick === 0 && (oogTick = getTickCount());
    Starter.isUp = "no";

    LocationAction.run();
    delay(1000);
  }
}
