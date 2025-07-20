/**
*  @filename    SoloPlay.js
*  @author      theBGuy
*  @desc        Base thread for Kolbot-SoloPlay system
*
*/
js_strict(true);
include("critical.js");

// globals needed for core gameplay
includeCoreLibs({ exclude: ["Storage.js"] });

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");

// Include critical files
include("SoloPlay/critical.js");

// Include SoloPlay's librarys
include("SoloPlay/Tools/SoloIndex.js");
include("SoloPlay/Core/ConfigOverrides.js");
include("SoloPlay/Core/Globals.js");

// main thread specific
const LocalChat = require("../modules/LocalChat", null, false);

/**
 * @todo
 *  - Add priority to runewords/cubing
 *  - proper script skipping + gold runs when needed
 *  - fix autoequip issues with rings and dual wielding
 *  - remove all the logic from main so all it does is call functions
 */

function main () {
  D2Bot.init(); // Get D2Bot# handle
  D2Bot.ingame();

  (function (global, original) {
    global.load = function (...args) {
      original.apply(this, args);
      delay(500);
    };
  })([].filter.constructor("return this")(), load);

  /**
   * Fixes d2bs bug where this returns the "function"
   */
  (function (original) {
    me.move = function (...args) {
      original.apply(this, args);
      return true;
    };
  })(me.move);

  // wait until game is ready
  while (!me.gameReady) {
    delay(50);
  }

  clearAllEvents(); // remove any event listeners from game crash

  // load heartbeat if it isn't already running
  !getScript("threads/heartbeat.js") && load("threads/heartbeat.js");

  SetUp.include();
  SetUp.init();

  let sojCounter = 0;
  let sojPause = false;
  let startTime = getTickCount();

  /**
   * Handle script/thread communications
   * @param {string} msg 
   * @returns {void}
   */
  const scriptEvent = function (msg) {
    if (!msg || typeof msg !== "string") return;
    let obj;

    if (msg.includes("--")) {
      let sub = msg.match(/\w+?--/gm).first();

      switch (sub) {
      case "config--":
        console.debug("update config");
        Config = JSON.parse(msg.split("config--")[1]);

        return;
      case "skill--":
        console.debug("update skillData");
        obj = JSON.parse(msg.split("skill--")[1]);
        Misc.updateRecursively(CharData.skillData, obj);

        return;
      case "data--":
        console.debug("update me.data");
        obj = JSON.parse(msg.split("data--")[1]);
        Misc.updateRecursively(me.data, obj);

        return;
      }
    }

    switch (msg) {
    case "testing":
    case "finishDen":
    case "dodge":
    case "skip":
    case "killdclone":
      me.emit("soloEvent", msg);

      break;
    case "addDiaEvent":
      console.log("Added dia lightning listener");
      addEventListener("gamepacket", SoloEvents.diaEvent);

      break;
    case "removeDiaEvent":
      console.log("Removed dia lightning listener");
      removeEventListener("gamepacket", SoloEvents.diaEvent);

      break;
    case "addBaalEvent":
      console.log("Added baal wave listener");
      addEventListener("gamepacket", SoloEvents.baalEvent);

      break;
    case "removeBaalEvent":
      console.log("Removed baal wave listener");
      removeEventListener("gamepacket", SoloEvents.baalEvent);

      break;
    case "nextScript":
      // testing - works so maybe can handle other events as well?
      me.emit("nextScript");

      break;
    case "soj":
      sojPause = true;
      sojCounter = 0;
      
      break;
    case "test":
      {
        console.debug(sdk.colors.Green + "//-----------DataDump Start-----------//",
          "\nÿc8ThreadData ::\n", getScript(true),
          "\nÿc8MainData ::\n", me.data,
          "\nÿc8BuffData ::\n", CharData.pots,
          "\nÿc8SkillData ::\n", CharData.skillData,
          "\nÿc8GlobalVariabls ::\n", Object.keys(global),
          "\n" + sdk.colors.Red + "//-----------DataDump End-----------//");
      }
      break;
    }
  };

  const copyDataEvent = function (mode, msg) {
    // "Mule Profile" option from D2Bot#
    if (mode === 0 && msg === "mule") {
      if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
        if (AutoMule.getMuleItems().length > 0) {
          D2Bot.printToConsole("Mule triggered");
          scriptBroadcast("mule");
          scriptBroadcast("quit");
        } else {
          D2Bot.printToConsole("No items to mule.");
        }
      } else {
        D2Bot.printToConsole("Profile not enabled for muling.");
      }
    } else if (mode === 70) {
      Messaging.sendToScript("D2BotSoloPlay.dbj", "event");
      delay(100 + me.ping);
      scriptBroadcast("quit");
    } else if ([55, 60, 65].includes(mode)) {
      // torch/anni sharing event - does this even still work? Haven't tested in awhile
      me.emit("processProfileEvent", mode, msg);
    }
  };

  // Initialize libs - load config variables, build pickit list, attacks, containers and cubing and runeword recipes
  Config.init(true);
  Pickit.init(true);
  Attack.init();
  Storage.Init();
  CraftingSystem.buildLists();
  Runewords.init();
  Cubing.init();
  LocalChat.init();

  // Load event listeners
  addEventListener("scriptmsg", scriptEvent);
  addEventListener("copydata", copyDataEvent);

  // AutoMule/TorchSystem/Gambling/Crafting handler
  if (AutoMule.inGameCheck()
    || TorchSystem.inGameCheck()
    || Gambling.inGameCheck()
    || CraftingSystem.inGameCheck()
    || SoloEvents.inGameCheck()) {
    return true;
  }

  me.maxgametime = Time.seconds(Config.MaxGameTime);
  const stats = DataFile.getStats();

  // Check for experience decrease -> log death. Skip report if life chicken is disabled.
  if (stats.name === me.name && me.getStat(sdk.stats.Experience) < stats.experience && Config.LifeChicken > 0) {
    D2Bot.printToConsole(
      "You died in last game. | Area :: " + stats.lastArea + " | Script :: " + stats.lastScript + "\n"
      + "Experience decreased by " + (stats.experience - me.getStat(sdk.stats.Experience)),
      sdk.colors.D2Bot.Red
    );
    DataFile.updateStats("deaths");
    D2Bot.updateDeaths();
  }

  DataFile.updateStats(["experience", "name"]);

  // Load threads
  load("libs/SoloPlay/Threads/ToolsThread.js");

  require("./Workers/EventEmitter");
  require("./Workers/EventHandler");
  require("./Workers/TownChicken");
  SoloEvents.filePath = "libs/SoloPlay/SoloPlay.js"; // hacky for now, don't want to mess up others running so we just broadcast to ourselves
  
  // Load guard if we want to see the stack as it runs
  if (Settings.debugging.showStack) {
    // check in case we reloaded and guard was still running
    let guard = getScript("libs/SoloPlay/Modules/Guard.js");
    !!guard && guard.running && guard.stop();
    require("../SoloPlay/Modules/Guard");
    delay(1000);
  }

  if (Config.PublicMode) {
    Config.PublicMode === true ? require("libs/modules/SimpleParty") : load("threads/Party.js");
  }

  // One time maintenance - check cursor, get corpse, clear leftover items, pick items in case anything important was dropped
  Cubing.cursorCheck();
  Town.getCorpse();
  me.clearBelt();
  Pather.init(); // initialize wp data
  
  let { x, y } = me;
  Config.ClearInvOnStart && Town.clearInventory();
  [x, y].distance > 3 && Pather.moveTo(x, y);
  Pickit.pickItems();
  me.hpPercent <= 10 && Town.heal() && me.cancelUIFlags();

  me.automap = Config.AutoMap || Settings.debugging.pathing;

  // Next game = drop keys
  TorchSystem.keyCheck() && scriptBroadcast("torch");

  // Auto skill and stat
  if (Config.AutoSkill.Enabled && include("core/Auto/AutoSkill.js")) {
    AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
  }

  if (Config.AutoStat.Enabled && include("core/Auto/AutoStat.js")) {
    AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
  }

  // offline - ensure we didn't just reload the thread and are still in the same game
  if (!me.realm && getTickCount() - me.gamestarttime < Time.minutes(1)) {
    D2Bot.updateRuns();
  }

  // Start Running Script
  myPrint("start setup");
  const { nipItems, impossibleClassicBuilds, impossibleNonLadderBuilds } = require("./Modules/General");
  NTIP.buildList(nipItems.Quest, nipItems.General);

  try {
    if (impossibleClassicBuilds.includes(SetUp.finalBuild) && me.classic) {
      throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down");
    }

    if (impossibleNonLadderBuilds.includes(SetUp.finalBuild) && !Settings.addLadderRW) {
      throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in non-ladder as they require ladder runewords. Change the info tag or remake as an ladder character...Shutting down");
    }
  } catch (e) {
    D2Bot.printToConsole(e, sdk.colors.D2Bot.Red);
    FileTools.remove("data/" + me.profile + ".json");
    FileTools.remove("libs/SoloPlay/.soloplay/" + me.profile + ".GameTime" + ".json");
    D2Bot.stop();
  }

  if (me.charlvl === 1) {
    let buckler = me.getItem(sdk.items.Buckler);
    !!buckler && buckler.isEquipped && buckler.drop();
  }

  Town.heal() && me.cancelUIFlags();
  Check.checkSpecialCase();

  // check if any of our currently equipped items are no longer usable - can happen after respec
  for (let item of me.getEquippedItems()) {
    if (me.getStat(sdk.stats.Strength) < item.strreq
      || me.getStat(sdk.stats.Dexterity) < item.dexreq
      || (item.ethereal && item.isBroken)
    ) {
      myPrint("No longer able to use: " + item.fname);
      Item.removeItem(null, item);
    } else if (sdk.quest.items.includes(item.classid)) {
      myPrint("Removing Quest Item: " + item.fname);
      Item.removeItem(null, item);
    } else if (me.charlvl >= 16 && item.isOnSwap
          && [
            sdk.items.type.AmazonBow, sdk.items.type.Bow,
            sdk.items.type.Crossbow, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver
          ].includes(item.itemType)
    ) {
      myPrint("Removing old swap Item: " + item.fname);
      try {
        me.switchWeapons(sdk.player.slot.Secondary);
        item.drop();
        CharData.skillData.bow.resetBowData();
      } finally {
        me.switchWeapons(sdk.player.slot.Main);
      }
    }
  }
    
  me.getItemsEx()
    .filter(function (item) {
      return (
        item.isInInventory
        && sdk.quest.items.includes(item.classid)
        && item.classid !== sdk.quest.item.Cube
      );
    })
    .forEach(function (item) {
      Quest.stashItem(item);
    });
    
  me.cancelUIFlags();
  // initialize final charms if we have any
  CharmEquip.init();

  // log threads - track memory use
  if (Config.DebugMode.Memory) {
    console.log("//~~~~~~~Current Threads~~~~~~~//");
    getThreads()
      .sort((a, b) => b.memory - a.memory)
      .forEach(t => console.log(t));
    console.log("//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//");
  }

  // Start Developer mode - this stops the script from progressing past this point and allows running specific scripts/functions through chat commands
  if (Settings.developerMode) {
    Settings.debugging.pathing && (me.automap = true);
    Loader.runScript("developermode");
  }

  if (Check.brokeCheck()) return true;
  if (Check.usePreviousSocketQuest()) return true; // Currently only supports going back to nightmare to socket a lidless if one is equipped.
  
  myPrint("starting run");
  Loader.run();
  // we have scripts to retry so lets run them
  if (SoloIndex.retryList.length) {
    SoloIndex.scripts = SoloIndex.retryList.slice(0);
    Loader.run();
  }

  if (Config.MinGameTime && getTickCount() - startTime < Time.seconds(Config.MinGameTime)) {
    try {
      Town.goToTown();

      while (getTickCount() - startTime < Time.seconds(Config.MinGameTime)) {
        me.overhead(
          "Stalling for "
          + Math.round(((startTime + Time.seconds(Config.MinGameTime)) - getTickCount()) / 1000) + " Seconds"
        );
        delay(1000);
      }
    } catch (e1) {
      console.error(e1);
    }
  }

  DataFile.updateStats("gold");

  if (sojPause) {
    try {
      Town.doChores();
      me.maxgametime = 0;

      while (sojCounter < Config.SoJWaitTime) {
        me.overhead("Waiting for SoJ sales... " + (Config.SoJWaitTime - sojCounter) + " min");
        delay(6e4);

        sojCounter += 1;
      }
    } catch (e2) {
      console.error(e2);
    }
  }

  if (Config.LastMessage) {
    switch (typeof Config.LastMessage) {
    case "string":
      say(Config.LastMessage.replace("$nextgame", DataFile.getStats().nextGame, "i"));

      break;
    case "object":
      for (let i = 0; i < Config.LastMessage.length; i += 1) {
        say(Config.LastMessage[i].replace("$nextgame", DataFile.getStats().nextGame, "i"));
      }

      break;
    }
  }

  AutoMule.muleCheck() && scriptBroadcast("mule");
  CraftingSystem.checkFullSets() && scriptBroadcast("crafting");
  TorchSystem.keyCheck() && scriptBroadcast("torch");

  // Anni handler. Mule Anni if it's in unlocked space and profile is set to mule torch/anni.
  let anni = me.findItem(sdk.items.SmallCharm, sdk.items.mode.inStorage, -1, sdk.items.quality.Unique);

  if (anni && !Storage.Inventory.IsLocked(anni, Config.Inventory)
    && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
    scriptBroadcast("muleAnni");
  }

  scriptBroadcast("quit");

  return true;
}
