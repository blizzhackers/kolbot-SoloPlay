/**
*  @filename    Globals.js
*  @author      theBGuy
*  @credit      alogwe
*  @desc        Global functions for Kolbot-SoloPlay functionality
*
*/

/**
 * @todo
 *  - split up this file into appropriate sections
 */

// all we really need from oog is D2Bot
includeIfNotIncluded("oog/D2Bot.js");
includeIfNotIncluded("SoloPlay/Tools/Developer.js");
includeIfNotIncluded("SoloPlay/Tools/CharData.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

// not every thread needs these
/** @global */
const Overrides = require("../../modules/Override");
/** @global */
const Coords_1 = require("../Modules/Coords");
/** @global */
const GameData = require("../Modules/GameData/GameData");

const MYCLASSNAME = sdk.player.class.nameOf(me.classid).toLowerCase();
includeIfNotIncluded("SoloPlay/BuildFiles/" + MYCLASSNAME + "/" + MYCLASSNAME + ".js");

function myPrint (str = "", toConsole = false, color = 0) {
  console.log("ÿc8Kolbot-SoloPlayÿc0: " + str);
  me.overhead(str);

  if (toConsole && typeof color === "string") {
    color = color.capitalize(true);
    color = !!sdk.colors.D2Bot[color] ? sdk.colors.D2Bot[color] : 0;
  }
  toConsole && D2Bot.printToConsole("Kolbot-SoloPlay :: " + str, color);
}

// general settings
const SetUp = {
  mercEnabled: true,
  _buildTemplate: "",

  init: function () {
    // ensure finalBuild is properly formatted
    const checkBuildTemplate = function () {
      let build = (["Bumper", "Socketmule", "Imbuemule"].includes(SetUp.finalBuild)
        ? ["Javazon", "Cold", "Bone", "Hammerdin", "Whirlwind", "Wind", "Trapsin"][me.classid]
        : SetUp.finalBuild) + "Build";
      return ("libs/SoloPlay/BuildFiles/" + MYCLASSNAME + "/" + MYCLASSNAME + "." + build + ".js").toLowerCase();
    };
    SetUp._buildTemplate = checkBuildTemplate();

    if (!FileTools.exists(SetUp._buildTemplate)) {
      let errors = [];
      /** @type {string[]} */
      let possibleBuilds = dopen("libs/SoloPlay/BuildFiles/" + MYCLASSNAME + "/")
        .getFiles()
        .filter(file => file.includes("Build"))
        .map(file => file.substring(file.indexOf(".") + 1, file.indexOf("Build")));

      // try to see if we can correct the finalBuild
      for (let build of possibleBuilds) {
        let match = me.data.finalBuild.match(build, "gi");
        
        if (match) {
          console.log(match);
          let old = me.data.finalBuild;
          me.data.finalBuild = match[0].trim().capitalize(true);
          errors.push(
            "~Info tag :: " + old + " was incorrect, I have attempted to remedy this."
            + " If it is still giving you an error please re-read the documentation. \n"
            + "New InfoTag/finalBuild :: " + SetUp.finalBuild
          );

          break;
        }
      }

      if (errors.length) {
        D2Bot.printToConsole("Kolbot-SoloPlay Final Build Error :: \n" + errors.join("\n"), sdk.colors.D2Bot.Red);
        SetUp._buildTemplate = checkBuildTemplate(); // check again
        if (!FileTools.exists(SetUp._buildTemplate)) {
          console.error(
            "ÿc8Kolbot-SoloPlayÿc0: Failed to find finalBuild template."
            + " Please check that you have actually entered it in correctly,"
            + " and that you have the build in to BuildFiles folder."
            + " Here is what you currently have: " + SetUp.finalBuild);
          throw new Error("finalBuild(): Failed to find template: " + SetUp._buildTemplate);
        }
        D2Bot.setProfile(null, null, null, null, null, SetUp.finalBuild);
        CharData.updateData("me", "finalBuild", SetUp.finalBuild);
      }
    }

    if (!me.data.initialized) {
      me.data.startTime = me.gamestarttime;
      me.data.level = me.charlvl;
      me.data.classid = me.classid;
      me.data.charName = me.name;
      me.data.strength = me.rawStrength;
      me.data.dexterity = me.rawDexterity;
      
      if (me.expansion) {
        me.data.charms = Check.finalBuild().finalCharms;
      }

      me.data.initialized = true;
      CharData.updateData("me", me.data);
    }

    let temp = copyObj(me.data);

    if (me.data.currentBuild !== CharInfo.getActiveBuild()) {
      me.data.currentBuild = CharInfo.getActiveBuild();
    }

    let currDiffStr = sdk.difficulty.nameOf(me.diff).toLowerCase();

    if (sdk.difficulty.Difficulties.indexOf(me.data.highestDifficulty) < me.diff) {
      me.data.highestDifficulty = sdk.difficulty.nameOf(me.diff);
    }

    if (me.smith && me.data[currDiffStr].imbueUsed === false) {
      me.data[currDiffStr].imbueUsed = true;
    }

    if (me.respec && me.data[currDiffStr].respecUsed === false) {
      me.data[currDiffStr].respecUsed = true;
    }

    me.data.level !== me.charlvl && (me.data.level = me.charlvl);
    me.data.strength !== me.rawStrength && (me.data.strength = me.rawStrength);
    me.data.dexterity !== me.rawDexterity && (me.data.dexterity = me.rawDexterity);

    // expansion check
    let [cUpdate, mUpdate] = [false, false];

    if (me.expansion) {
      if (!me.data.merc.gear) {
        me.data.merc.gear = [];
        mUpdate = true;
      }
      
      // merc check
      /** @type {MercUnit} */
      let merc = me.getMercEx();
      if (merc) {
        // TODO: figure out how to ensure we are already using the right merc to prevent re-hiring
        // can't do an aura check as merc auras are bugged, only useful info from getUnit is the classid
        let _tempMerc = copyObj(me.data.merc);
        let mercItems = merc.getItemsEx();
        let preLength = me.data.merc.gear.length;
        let check = me.data.merc.gear.filter(function (i) {
          return mercItems.some(function (item) {
            return item.prefixnum === i;
          });
        });

        if (check !== preLength) {
          mUpdate = true;
          me.data.merc.gear = check;
        }

        let mercInfo = Mercenary.getMercInfo(merc);
        if (merc.classid !== me.data.merc.classid) {
          me.data.merc.classid = merc.classid;
        }
        if (mercInfo.act !== me.data.merc.act) {
          me.data.merc.act = mercInfo.act;
        }
        if (mercInfo.difficulty !== me.data.merc.difficulty) {
          me.data.merc.difficulty = mercInfo.difficulty;
        }
        if (merc.charlvl !== me.data.merc.level) {
          me.data.merc.level = merc.charlvl;
        }
        if (merc.rawStrength !== me.data.merc.strength) {
          me.data.merc.strength = merc.rawStrength;
        }
        if (merc.rawDexterity !== me.data.merc.dexterity) {
          me.data.merc.dexterity = merc.rawDexterity;
        }

        if (merc.classid !== sdk.mercs.Guard) {
          try {
            if (mercInfo.skillName !== me.data.merc.skillName) {
              me.data.merc.skillName = mercInfo.skillName;
              me.data.merc.skill = MercData.findByName(me.data.merc.skillName, me.data.merc.act).skill;
            }
          } catch (e) {
            //
          }
        }

        // if (merc.classid === sdk.mercs.Guard && !Mercenary.checkMercSkill(me.data.merc.type)) {
        // // go back, need to make sure this works properly.
        // // only "go back" if we are past the difficulty we need to be in to hire merc. Ex. In hell but want holy freeze merc
        // // only if we have enough gold on hand to hire said merc
        // // return to our orignal difficulty afterwards
        // }
        let changed = Misc.recursiveSearch(me.data.merc, _tempMerc);
  
        if (Object.keys(changed).length > 0) {
          CharData.updateData("merc", me.data);
          // mUpdate = true;
        }
      }

      // charm check
      if (!me.data.charms || !Object.keys(me.data.charms).length) {
        me.data.charms = Check.finalBuild().finalCharms;
        cUpdate = true;
      }

      if (!me.data.charmGids || me.data.charmGids.length > 0) {
        me.data.charmGids = [];
        cUpdate = true;
      }

      const finalCharmKeys = Object.keys(me.data.charms);
      // gids change from game to game so reset our list
      for (let key of finalCharmKeys) {
        if (me.data.charms[key].have.length) {
          me.data.charms[key].have = [];
          cUpdate = true;
        }
      }

      if (!!me.shenk && me.data[currDiffStr].socketUsed === false) {
        me.data[currDiffStr].socketUsed = true;
      }
    }

    let changed = Misc.recursiveSearch(me.data, temp);
  
    if (cUpdate || mUpdate || Object.keys(changed).length > 0) {
      CharData.updateData("me", me.data);
    }
  },

  // Should this be moved elsewhere? Currently have to include Globals then call this to include rest of overrides
  // which in doing so would include globals anyway but does this always need to be included first?
  // really need a centralized way to make sure all files use/have the custom functions and all threads stay updated without having to
  // scriptBroadcast all the time
  include: function () {
    let files = dopen("libs/SoloPlay/Functions/").getFiles();
    if (!files.length) throw new Error("Failed to find my files");
    if (!files.includes("Globals.js")) {
      console.warn("Incorrect Files?", files);
      // something went wrong?
      while (!files.includes("Globals.js")) {
        files = dopen("libs/SoloPlay/Functions/").getFiles();
        delay(50);
      }
    }
    Array.isArray(files) && files
      .filter(file => file.endsWith(".js"))
      .sort(a => a.startsWith("PrototypeOverrides.js") ? 0 : 1) // Dirty fix to load new prototypes first
      .forEach(function (x) {
        if (!isIncluded("SoloPlay/Functions/" + x)) {
          if (!include("SoloPlay/Functions/" + x)) {
            throw new Error("Failed to include " + "SoloPlay/Functions/" + x);
          }
        }
      });
  },

  // Storage Settings
  sortSettings: {
    ItemsSortedFromLeft: [], // default: everything not in Config.ItemsSortedFromRight
    ItemsSortedFromRight: [
      // (NOTE: default pickit is fastest if the left side is open)
      sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm, // sort charms from the right
      sdk.items.TomeofIdentify, sdk.items.TomeofTownPortal, sdk.items.Key, // sort tomes and keys to the right
      // sort all inventory potions from the right
      sdk.items.RejuvenationPotion, sdk.items.FullRejuvenationPotion,
      sdk.items.MinorHealingPotion, sdk.items.LightHealingPotion,
      sdk.items.HealingPotion, sdk.items.GreaterHealingPotion,
      sdk.items.SuperHealingPotion, sdk.items.MinorManaPotion,
      sdk.items.LightManaPotion, sdk.items.ManaPotion,
      sdk.items.GreaterManaPotion, sdk.items.SuperManaPotion
    ],
    PrioritySorting: true,
    ItemsSortedFromLeftPriority: [/*605, 604, 603, 519, 518*/], // (NOTE: the earlier in the index, the further to the Left)
    ItemsSortedFromRightPriority: [
      // (NOTE: the earlier in the index, the further to the Right)
      // sort charms from the right, GC > LC > SC
      sdk.items.GrandCharm, sdk.items.LargeCharm, sdk.items.SmallCharm,
      sdk.items.TomeofIdentify, sdk.items.TomeofTownPortal, sdk.items.Key
    ],
  },

  currentBuild: this.currentBuild,
  finalBuild: this.finalBuild,

  // setter for Developer option to stop a profile once it reaches a certain level
  stopAtLevel: (function () {
    if (!Developer.stopAtLevel.enabled) return false;
    let level = Developer.stopAtLevel.profiles.find(prof => String.isEqual(prof[0], me.profile)) || false;
    return level ? level[1] : false;
  })(),

  // pulls respec requirments from final build file
  finalRespec: function () {
    let respec = Check.finalBuild().respec() ? me.charlvl : 100;

    if (respec === me.charlvl && me.charlvl < 60) {
      showConsole();
      console.log(
        "ÿc8Kolbot-SoloPlayÿc0: Bot has respecTwo items but is too low a level to respec." + "\n"
        + "This only happens with user intervention. Remove the items you gave the bot until at least level 60"
      );
      respec = 100;
    }

    return respec;
  },

  autoBuild: function () {
    let build = me.currentBuild;
    if (!build) throw new Error("Failed to include template: " + SetUp._buildTemplate);

    /* AutoStat configuration. */
    Config.AutoStat.Enabled = true;
    Config.AutoStat.Save = 0;
    Config.AutoStat.BlockChance = me.paladin ? 75 : 57;
    Config.AutoStat.UseBulk = true;
    Config.AutoStat.Build = JSON.parse(JSON.stringify(build.stats));

    /* AutoSkill configuration. */
    Config.AutoSkill.Enabled = true;
    Config.AutoSkill.Save = 0;
    Config.AutoSkill.Build = JSON.parse(JSON.stringify(build.skills));

    /* AutoBuild configuration. */
    Config.AutoBuild.Enabled = true;
    Config.AutoBuild.Verbose = false;
    Config.AutoBuild.DebugMode = false;
    Config.AutoBuild.Template = SetUp.currentBuild;

    return true;
  },

  makeNext: function () {
    includeIfNotIncluded("SoloPlay/Tools/Tracker.js");
    let gameObj, printTotalTime = Developer.logPerformance;
    printTotalTime && (gameObj = Tracker.readObj(Tracker.GTPath));

    // log info
    myPrint(this.finalBuild + " goal reached. On to the next.");
    D2Bot.printToConsole(
      "Kolbot-SoloPlay: " + this.finalBuild + " goal reached"
      + (printTotalTime ? " (" + (Time.format(gameObj.Total + Time.elapsed(gameObj.LastSave))) + "). " : ". ")
      + "Making next...",
      sdk.colors.D2Bot.Gold
    );
    D2Bot.setProfile(null, null, require("../Tools/NameGen")());
    CharData.delete(true);
    delay(250);
    D2Bot.restart();
  },

  belt: function () {
    let beltSlots = Math.max(1, Storage.BeltSize() - 1);
    Config.BeltColumn.forEach(function (col, index) {
      Config.MinColumn[index] = col.toLowerCase() !== "rv" ? beltSlots : 0;
    });
  },

  buffers: function () {
    const isCaster = Check.currentBuild().caster;
    const beltModifer = 4 - Storage.BeltSize();
    const mpFactor = isCaster ? 80 : 50;
    Config.MPBuffer = Math.floor(mpFactor / Math.sqrt(me.mpmax)) + (beltModifer * 2);
    !me.data.merc.gear.includes(sdk.locale.items.Insight) && (Config.MPBuffer += 2);
    const hpFactor = isCaster ? 65 : 80;
    Config.HPBuffer = Math.floor(hpFactor / Math.sqrt(me.hpmax)) + (beltModifer * 2);
  },

  bowQuiver: function () {
    NTIP.Runtime.clear();
    if (CharData.skillData.bow.onSwitch) {
      if ([sdk.items.type.Bow, sdk.items.type.AmazonBow].includes(CharData.skillData.bow.bowType)) {
        NTIP.addToRuntime("[type] == bowquiver # # [maxquantity] == 1");
      } else if (CharData.skillData.bow.bowType === sdk.items.type.Crossbow) {
        NTIP.addToRuntime("[type] == crossbowquiver # # [maxquantity] == 1");
      } else if (me.charlvl < 10) {
        NTIP.addToRuntime("[type] == bowquiver # # [maxquantity] == 1");
      }
    }
  },

  imbueItems: function () {
    if (SetUp.finalBuild === "Imbuemule") return [];
    let temp = [];
    for (let imbueItem of Config.imbueables) {
      try {
        if (imbueItem.condition()) {
          temp.push(
            "[name] == " + imbueItem.name
            + " && [quality] >= normal && [quality] <= superior && [flag] != ethereal"
            + " # [Sockets] == 0 # [maxquantity] == 1"
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
    return temp;
  },

  config: function () {
    me.equipped.init();
    // just initializes the data
    Check.currentBuild();
    Check.finalBuild();

    Config.socketables = [];
    Config.AutoEquip = true;

    if (me.ladder > 0 || Developer.addLadderRW) {
      // Runewords.ladderOverride = true;
      Config.LadderOveride = true;
    }
    
    // common items
    NTIP.buildList([
      "([type] == helm || [type] == circlet) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // Belt
      "[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      "me.normal && [type] == belt && [quality] >= lowquality && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // Boots
      "[type] == boots && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // Armor
      "[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // Gloves
      "[type] == gloves && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // Amulet
      "[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // Rings
      "[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
      // non runeword white items
      "([type] == armor) && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && [sockets] == 1 # [tier] == tierscore(item)",
      "([type] == helm || [type] == circlet) && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 3) # [tier] == tierscore(item)",
    ]);
    
    if (me.expansion) {
      if (Storage.Stash === undefined) {
        Storage.Init();
      }
      // sometimes it seems hard to find skillers, if we have the room lets try to cube some
      if (Storage.Stash.UsedSpacePercent() < 60
        && CharmEquip.grandCharm().keep.length < CharData.charms.get("grand").count().max) {
        Config.Recipes.push([Recipe.Reroll.Magic, "Grand Charm"]);
      }
      // switch bow - only for zon/sorc/pal/necro classes right now
      if (me.charlvl < 12 && !me.barbarian && !me.assassin && !me.druid) {
        NTIP.addLine(
          "([type] == bow || [type] == crossbow) && [quality] >= normal # [itemchargedskill] >= 0 # [secondarytier] == tierscore(item)"
        );
        this.bowQuiver();
      }
      const expansionExtras = [
        // Special Charms
        "[name] == smallcharm && [quality] == unique # [itemallskills] == 1 # [charmtier] == 100000",
        "[name] == largecharm && [quality] == unique # [itemaddclassskills] == 3 # [charmtier] == 100000",
        "[name] == grandcharm && [quality] == unique # [itemmagicbonus] >= 30 || [itemgoldbonus] >= 150 # [charmtier] == 100000",
        // Merc
        "([type] == circlet || [type] == helm) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
        "[type] == armor && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
        // Rogue
        "me.mercid === 271 && [type] == bow && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
        // A2 Guard
        "me.mercid === 338 && ([type] == polearm || [type] == spear) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
      ];
      NTIP.buildList(expansionExtras);
    }

    /* General configuration. */
    Config.MinGameTime = 400;
    Config.MaxGameTime = 7200;
    Config.MiniShopBot = true;
    Config.PacketShopping = true;
    Config.TownCheck = true;
    Config.LogExperience = false;
    Config.PingQuit = [{ Ping: 600, Duration: 10 }];
    Config.Silence = true;
    Config.OpenChests.Enabled = true;
    Config.LowGold = me.normal ? 25000 : me.nightmare ? 50000 : 100000;
    Config.PrimarySlot = 0;
    Config.PacketCasting = 1;
    Config.WaypointMenu = true;
    Config.Cubing = !!me.getItem(sdk.items.quest.Cube);
    Config.MakeRunewords = true;

    /* Chicken configuration. */
    Config.LifeChicken = me.hardcore ? 45 : 10;
    Config.ManaChicken = 0;
    Config.MercChicken = 0;
    Config.TownHP = me.hardcore ? 0 : 35;
    Config.TownMP = 0;

    /* Potions configuration. */
    Config.UseHP = me.hardcore ? 90 : 80;
    Config.UseRejuvHP = me.hardcore ? 65 : 50;
    Config.UseMP = me.hardcore ? 75 : 65;
    Config.UseMercHP = 75;

    /* Belt configuration. */
    Config.BeltColumn = ["hp", "mp", "mp", "rv"];
    SetUp.belt();

    /* Gambling configuration. */
    Config.Gamble = true;
    Config.GambleGoldStart = 1250000;
    Config.GambleGoldStop = 750000;

    /* AutoMule configuration. */
    Config.AutoMule.Trigger = [];
    Config.AutoMule.Force = [];
    Config.AutoMule.Exclude = [
      "[name] >= Elrune && [name] <= Lemrune",
    ];

    /* Shrine scan configuration. */
    if (Check.currentBuild().caster) {
      Config.ScanShrines = [
        sdk.shrines.Refilling, sdk.shrines.Health,
        sdk.shrines.Mana, sdk.shrines.Gem,
        sdk.shrines.Monster, sdk.shrines.HealthExchange,
        sdk.shrines.ManaExchange, sdk.shrines.Experience,
        sdk.shrines.Armor, sdk.shrines.ResistFire,
        sdk.shrines.ResistCold, sdk.shrines.ResistLightning,
        sdk.shrines.ResistPoison, sdk.shrines.Skill,
        sdk.shrines.ManaRecharge, sdk.shrines.Stamina
      ];
    } else {
      Config.ScanShrines = [
        sdk.shrines.Refilling, sdk.shrines.Health,
        sdk.shrines.Mana, sdk.shrines.Gem,
        sdk.shrines.Monster, sdk.shrines.HealthExchange,
        sdk.shrines.ManaExchange, sdk.shrines.Experience,
        sdk.shrines.Combat, sdk.shrines.Skill,
        sdk.shrines.Armor, sdk.shrines.ResistFire,
        sdk.shrines.ResistCold, sdk.shrines.ResistLightning,
        sdk.shrines.ResistPoison, sdk.shrines.ManaRecharge, sdk.shrines.Stamina
      ];
    }

    /* General logging. */
    Config.ItemInfo = false;
    Config.LogKeys = false;
    Config.LogOrgans = false;
    Config.LogMiddleRunes = true;
    Config.LogHighRunes = true;
    Config.ShowCubingInfo = true;

    /* DClone. */
    Config.StopOnDClone = !!me.expansion;
    Config.SoJWaitTime = 5; // Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
    Config.KillDclone = !!me.expansion;
    Config.DCloneQuit = false;

    /* Town configuration. */
    Config.HealHP = 99;
    Config.HealMP = 99;
    Config.HealStatus = true;
    Config.UseMerc = me.expansion;
    Config.MercWatch = SetUp.mercwatch;
    Config.StashGold = me.charlvl * 1000;
    Config.ClearInvOnStart = false;

    /* Inventory buffers and lock configuration. */
    Config.HPBuffer = 0;
    Config.MPBuffer = 0;
    Config.RejuvBuffer = 4;
    Config.Inventory[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    Config.Inventory[1] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    Config.Inventory[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    Config.Inventory[3] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    Config.SkipId.push(sdk.monsters.FireTower);

    /* FastMod configuration. */
    Config.FCR = 0;
    Config.FHR = 0;
    Config.FBR = 0;
    Config.IAS = 0;

    SetUp.autoBuild();
  }
};

Object.defineProperties(SetUp, {
  currentBuild: {
    get: function () {
      return me.data.currentBuild;
    },
  },
  finalBuild: {
    get: function () {
      return me.data.finalBuild;
    },
  },
  mercwatch: {
    get: function () {
      const myGold = me.gold;
      const cLvl = me.charlvl;
      let lowGold = Math.min(Math.floor(500 + (cLvl * 150 * Math.sqrt(cLvl - 1))), 250000);
      return (SetUp.mercEnabled && (myGold > lowGold) && (myGold > me.mercrevivecost));
    }
  },
});

// misc
const goToDifficulty = function (diff = undefined, reason = "") {
  try {
    if (diff === undefined) throw new Error("diff is undefined");
    
    let diffString;
    switch (typeof diff) {
    case "string":
      diff = diff.capitalize(true);
      if (!sdk.difficulty.Difficulties.includes(diff)) throw new Error("difficulty doesn't exist" + diff);
      if (sdk.difficulty.Difficulties.indexOf(diff) === me.diff) throw new Error("already in this difficulty" + diff);
      diffString = diff;

      break;
    case "number":
      if (diff === me.diff || diff < 0) throw new Error("invalid diff" + diff);
      diffString = sdk.difficulty.nameOf(diff);

      break;
    default:
      throw new Error("?");
    }

    CharData.updateData("me", "setDifficulty", diffString);
    myPrint("Going to " + diffString + " " + reason, true);
    delay(1000);
    if (CharData.getStats().setDifficulty !== diffString) {
      throw new Error("Failed to set difficulty");
    }
    scriptBroadcast("quit");

    while (me.ingame) {
      delay(3);
    }
  } catch (e) {
    console.debug(e.message ? e.message : e);
    return false;
  }

  return true;
};

// General Game functions
const Check = {
  lowGold: false,

  gold: function () {
    let gold = me.gold;
    let goldLimit = [25000, 50000, 100000][me.diff];

    if ((me.normal && !me.accessToAct(2)) || gold >= goldLimit) {
      return true;
    }

    me.overhead("low gold");

    return false;
  },

  brokeAf: function (announce = true) {
    let gold = me.gold;
    let lowGold = Math.min(Math.floor(500 + (me.charlvl * 100 * Math.sqrt(me.charlvl - 1))), 250000);

    switch (true) {
    case (me.charlvl < 15):
    case (me.normal && !me.accessToAct(2)):
    case (gold >= lowGold):
    case (me.charlvl >= 15 && gold > Math.floor(lowGold / 2) && gold > me.getRepairCost()):
      return false;
    }

    if (announce) {
      myPrint("very low gold. My Gold: " + gold);
      NTIP.addLine("[name] == gold # [gold] >= 1");
    }

    return true;
  },

  broken: function () {
    const gold = me.gold;
    const rightArm = me.equipped.get(sdk.body.RightArm);
    const leftArm = me.equipped.get(sdk.body.LeftArm);

    // Almost broken but not quite
    if (((rightArm.durability <= 30 && rightArm.durability > 0)
      || (leftArm.durability <= 30 && leftArm.durability > 0)
      && !me.getMerc() && me.charlvl >= 15 && !me.normal && !me.nightmare && gold < 1000)) {
      return 1;
    }

    // Broken
    if ((rightArm.durability === 0 || leftArm.durability === 0)
      && me.charlvl >= 15 && !me.normal && gold < 1000) {
      return 2;
    }

    return 0;
  },

  brokeCheck: function () {
    Town.doChores();

    let myGold = me.gold;
    let repairCost = me.getRepairCost();
    let items = (me.getItemsForRepair(100, false) || []);
    let meleeChar = !Check.currentBuild().caster;
    let msg = "";
    let diff = -1;

    switch (true) {
    case myGold > repairCost:
      return false;
    case me.normal:
    case !meleeChar && me.nightmare:
      Check.lowGold = myGold < repairCost;
      return false;
    case meleeChar && !me.normal:
      // check how broke we are - only for melee chars since casters don't care about weapons
      let wep = me.equipped.get(sdk.body.RightArm);
      if (!!wep && meleeChar && wep.durabilityPercent === 0) {
        // we are really broke - go back to normal
        msg = " We are broken - lets get some easy gold in normal.";
        diff = sdk.difficulty.Normal;
      }

      break;
    case !meleeChar && me.hell:
      msg = " We are pretty broke, lets run some easy stuff in nightmare for gold";
      diff = sdk.difficulty.Nightmare;

      break;
    }

    if (diff > -1) {
      console.debug("My gold: " + myGold + ", Repair cost: " + repairCost);
      goToDifficulty(diff, msg + (" My gold: " + myGold + ", Repair cost: " + repairCost));

      return true;
    }

    return false;
  },

  resistance: function () {
    let resPenalty = me.getResPenalty(me.diff + 1);
    let [frRes, lrRes, crRes, prRes] = [
      (me.realFR - resPenalty),
      (me.realLR - resPenalty),
      (me.realCR - resPenalty),
      (me.realPR - resPenalty)
    ];

    return {
      Status: ((frRes > 0) && (lrRes > 0) && (crRes > 0)),
      FR: frRes,
      CR: crRes,
      LR: lrRes,
      PR: prRes,
    };
  },

  nextDifficulty: function (announce = true) {
    let currDiff = me.diff;
    if (currDiff === sdk.difficulty.Hell) return false;
    if (["Bumper", "Socketmule"].includes(SetUp.finalBuild)) return false;
    if (me.charlvl < CharInfo.levelCap) return false;
    if (!me.diffCompleted) return false;
    let nextDiff = null;
    let res = this.resistance();
    let lvlReq = !!(!this.broken());
    let [str, color] = ["", sdk.colors.D2Bot.Black];

    if (lvlReq) {
      if (res.Status) {
        nextDiff = currDiff + 1;
        [str, color] = ["next difficulty requirements met. Starting: " + sdk.difficulty.nameOf(nextDiff), sdk.colors.D2Bot.Blue];
      } else {
        if (me.charlvl >= CharInfo.levelCap + (!me.normal ? 5 : 2)) {
          nextDiff = currDiff + 1;
          str = "Over leveled. Starting: " + sdk.difficulty.nameOf(nextDiff);
        } else {
          announce && myPrint(
            sdk.difficulty.nameOf(currDiff + 1)
            + " requirements not met. Negative resistance. FR: " + res.FR + " | CR: " + res.CR + " | LR: " + res.LR
          );
        }
      }
    }

    if (!nextDiff) return false;
    if (announce && str) {
      D2Bot.printToConsole("Kolbot-SoloPlay: " + str, color);
    }

    return sdk.difficulty.nameOf(nextDiff);
  },

  runes: function () {
    if (me.classic) return false;
    let needRunes = true;

    switch (me.diff) {
    case sdk.difficulty.Normal:
      // Have runes or stealth and ancients pledge
      if (me.haveRunes([sdk.items.runes.Tal, sdk.items.runes.Eth])
        || me.checkItem({ name: sdk.locale.items.Stealth }).have) {
        needRunes = false;
      }

      break;
    case sdk.difficulty.Nightmare:
      if ((me.haveRunes([sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.runes.Ort, sdk.items.runes.Amn])
        && Check.currentBuild().caster)
        || (!me.paladin && me.checkItem({ name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Sword }).have)
        || (me.paladin && me.haveAll([
          {
            name: sdk.locale.items.Spirit,
            itemtype: sdk.items.type.Sword
          },
          {
            name: sdk.locale.items.Spirit,
            itemtype: sdk.items.type.AuricShields
          }
        ]))
        || (me.necromancer && me.checkItem({ name: sdk.locale.items.White }).have
          && (
            me.checkItem({ name: sdk.locale.items.Rhyme, itemtype: sdk.items.type.VoodooHeads }).have
            || me.equipped.get(sdk.body.LeftArm).tier > 800
          ))
        || (me.barbarian && (me.checkItem({ name: sdk.locale.items.Lawbringer }).have || me.baal))) {
        needRunes = false;
      }

      break;
    case sdk.difficulty.Hell:
      if (!me.baal || (me.sorceress && !["Blova", "Lightning"].includes(SetUp.currentBuild))) {
        needRunes = false;
      }

      break;
    }

    return needRunes;
  },

  /**
   * @deprecated Use me.checkItem() instead
   * @param {number | string} type 
   * @param {string} [flag] 
   * @param {string} [iName] 
   * @returns 
   */
  haveItem: function (type, flag, iName) {
    let [isClassID, itemCHECK, typeCHECK] = [false, false, false];

    flag && typeof flag === "string" && (flag = flag.capitalize(true));
    typeof iName === "string" && (iName = iName.toLowerCase());

    let items = me.getItemsEx()
      .filter(function (item) {
        return !item.questItem && (flag === "Runeword" ? item.isRuneword : item.quality === sdk.items.quality[flag]);
      });

    switch (typeof type) {
    case "string":
      typeof type === "string" && (type = type.toLowerCase());
      if (type !== "dontcare" && !NTIPAliasType[type] && !NTIPAliasClassID[type]) return false;
      if (type === "dontcare") {
        typeCHECK = true; // we don't care about type
        break;
      }

      // check if item is a classid but with hacky fix for items like belt which is a type and classid...sigh
      isClassID = !!NTIPAliasClassID[type] && !NTIPAliasType[type];
      type = isClassID ? NTIPAliasClassID[type] : NTIPAliasType[type];
      
      break;
    case "number":
      if (!Object.values(sdk.items.type).includes(type) && !Object.values(sdk.items).includes(type)) return false;
      // check if item is a classid but with hacky fix for items like belt which is a type and classid...sigh
      isClassID = Object.values(sdk.items).includes(type) && !Object.values(sdk.items.type).includes(type);

      break;
    }

    // filter out non-matching item types/classids
    if (typeof type === "number") {
      items = items.filter(function (item) {
        return (isClassID ? item.classid === type : item.itemType === type);
      });
    }

    const quality = (flag === "Set" || flag === "Unique" || flag === "Crafted")
      ? sdk.items.quality[flag]
      : undefined;

    for (let item of items) {
      switch (flag) {
      case "Set":
      case "Unique":
      case "Crafted":
        itemCHECK = !!(item.quality === quality) && (iName ? item.fname.toLowerCase().includes(iName) : true);
        break;
      case "Runeword":
        itemCHECK = !!(item.isRuneword) && (iName ? item.fname.toLowerCase().includes(iName) : true);
        break;
      }

      // don't waste time if first condition wasn't met
      if (itemCHECK && typeof type === "number") {
        typeCHECK = isClassID ? item.classid === type : item.itemType === type;
      }

      if (itemCHECK && typeCHECK) {
        return true;
      }
    }

    return false;
  },

  itemSockables: function (type, quality, iName) {
    quality && typeof quality === "string" && (quality = sdk.items.quality[quality.capitalize(true)]);
    typeof iName === "string" && (iName = iName.toLowerCase());
    let [isClassID, itemCHECK, typeCHECK] = [false, false, false];

    switch (typeof type) {
    case "string":
      typeof type === "string" && (type = type.toLowerCase());
      if (!NTIPAliasType[type] && !NTIPAliasClassID[type]) return false;
      isClassID = !!NTIPAliasClassID[type];
      type = isClassID ? NTIPAliasClassID[type] : NTIPAliasType[type];
      
      break;
    case "number":
      if (!Object.values(sdk.items.type).includes(type) && !Object.values(sdk.items).includes(type)) return false;
      isClassID = Object.values(sdk.items).includes(type);

      break;
    }

    let socketableCHECK = isClassID ? Config.socketables.find(({ classid }) => type === classid) : false;
    let items = me.getItemsEx()
      .filter(function (item) {
        return item.quality === quality && !item.questItem && !item.isRuneword
          && (isClassID ? item.classid === type : item.itemType === type)
          && getBaseStat("items", item.classid, "gemsockets") > 0;
      });

    for (let item of items) {
      itemCHECK = !!(item.quality === quality) && (iName ? item.fname.toLowerCase().includes(iName) : true);

      // don't waste time if first condition wasn't met
      itemCHECK && (typeCHECK = isClassID ? item.classid === type : item.itemType === type);

      if (itemCHECK && typeCHECK) {
        if (!socketableCHECK && item.getItemsEx().length === 0) {
          return true;
        } else if (socketableCHECK) {
          SoloWants.addToList(item);

          return true;
        }
      }
    }

    return false;
  },

  getMaxValue: function (buildInfo, stat) {
    if (!buildInfo || !buildInfo.stats || stat === undefined) return 0;
    let highest = 0;
    const shorthandStr = [sdk.stats.Strength, "s", "str", "strength"];
    const shorthandDex = [sdk.stats.Dexterity, "d", "dex", "dexterity"];
    const statToCheck = shorthandStr.includes(stat) ? "str" : shorthandDex.includes(stat) ? "dex" : "";
    
    buildInfo.stats.forEach(function (s) {
      switch (true) {
      case (shorthandStr.includes(s[0]) && statToCheck === "str"):
      case (shorthandDex.includes(s[0]) && statToCheck === "dex"):
        if (typeof s[1] === "number" && s[1] > highest) {
          highest = s[1];
        }

        break;
      default:
        break;
      }
    });

    return highest;
  },

  // repetitive code - FIX THIS
  currentBuild: function () {
    let build = me.currentBuild;
    
    if (!build) throw new Error("currentBuild(): Failed to include template: " + SetUp._buildTemplate);

    return {
      caster: build.caster,
      tabSkills: build.skillstab,
      wantedSkills: build.wantedskills,
      usefulSkills: build.usefulskills,
      precastSkills: build.hasOwnProperty("precastSkills") ? build.precastSkills : [],
      usefulStats: build.hasOwnProperty("usefulStats") ? build.usefulStats : [],
      wantedMerc: build.hasOwnProperty("wantedMerc") ? build.wantedMerc : null,
      finalCharms: build.hasOwnProperty("charms") ? (build.charms || {}) : {},
      maxStr: Check.getMaxValue(build, "strength"),
      maxDex: Check.getMaxValue(build, "dexterity"),
      respec: build.hasOwnProperty("respec") ? build.respec : () => {},
      active: build.active,
    };
  },

  // repetitive code - FIX THIS
  finalBuild: function () {
    let finalBuild = me.finalBuild;

    if (!finalBuild) throw new Error("finalBuild(): Failed to include template: " + SetUp._buildTemplate);

    return {
      caster: finalBuild.caster,
      tabSkills: finalBuild.skillstab,
      wantedSkills: finalBuild.wantedskills,
      usefulSkills: finalBuild.usefulskills,
      precastSkills: finalBuild.precastSkills,
      usefulStats: (!!finalBuild.usefulStats ? finalBuild.usefulStats : []),
      wantedMerc: finalBuild.wantedMerc,
      finalCharms: (finalBuild.charms || {}),
      maxStr: Check.getMaxValue(finalBuild, "strength"),
      maxDex: Check.getMaxValue(finalBuild, "dexterity"),
      respec: finalBuild.respec,
      active: finalBuild.active,
    };
  },

  checkSpecialCase: function () {
    const questCompleted = (id) => !!Misc.checkQuest(id, sdk.quest.states.ReqComplete);
    let goalReached = false, goal = "";

    switch (true) {
    case SetUp.finalBuild === "Bumper" && me.charlvl >= 40:
    case (SetUp.finalBuild === "Socketmule" && questCompleted(sdk.quest.id.SiegeOnHarrogath)):
    case (SetUp.finalBuild === "Imbuemule" && questCompleted(sdk.quest.id.ToolsoftheTrade) && me.charlvl >= Developer.imbueStopLevel):
      goal = SetUp.finalBuild;
      goalReached = true;

      break;
    case SetUp.stopAtLevel && me.charlvl >= SetUp.stopAtLevel:
      goal = "Level: " + SetUp.stopAtLevel;
      goalReached = true;

      break;
    case sdk.difficulty.Difficulties.indexOf(sdk.difficulty.nameOf(me.diff)) < sdk.difficulty.Difficulties.indexOf(me.data.highestDifficulty):
      // TODO: fill this out, if we go back to normal from hell I want to be able to do whatever it was imbue/socket/respec then return to our orignal difficulty
      // as it is right now if we go back it would take 2 games to get back to hell
      // but this needs a check to ensure that one of the above reasons are why we went back in case we had gone back because low gold in which case we need to stay in the game
      break;
    default:
      break;
    }

    if (goalReached) {
      const gameObj = Developer.logPerformance ? Tracker.readObj(Tracker.GTPath) : null;

      switch (true) {
      case (SetUp.finalBuild === "Bumper" && Developer.fillAccount.bumpers):
      case (SetUp.finalBuild === "Socketmule" && Developer.fillAccount.socketMules):
      case (SetUp.finalBuild === "Imbuemule" && Developer.fillAccount.imbueMule):
        SetUp.makeNext();
        
        break;
      default:
        D2Bot.printToConsole("Kolbot-SoloPlay " + goal + " goal reached." + (gameObj ? " (" + (Time.format(gameObj.Total + Time.elapsed(gameObj.LastSave))) + ")" : ""), sdk.colors.D2Bot.Gold);
        Developer.logPerformance && Tracker.update();
        D2Bot.stop();
      }
    }
  },

  // TODO: enable this for other items, i.e maybe don't socket tal helm in hell but instead go back and use nightmare so then we can use hell socket on tal armor?
  usePreviousSocketQuest: function () {
    if (me.classic) return;
    if (!Check.resistance().Status) {
      if (me.weaponswitch === 0
        && me.equipped.get(sdk.body.LeftArm).fname.includes("Lidless Wall")
        && !me.equipped.get(sdk.body.LeftArm).socketed) {
        if (!me.normal) {
          if (!me.data.normal.socketUsed) goToDifficulty(sdk.difficulty.Normal, " to use socket quest");
          if (me.hell && !me.data.nightmare.socketUsed) goToDifficulty(sdk.difficulty.Nightmare, " to use socket quest");
        }
      }
    }
  },
};
