/**
*  @filename    OOGOverrides.js
*  @author      theBGuy
*  @desc        OOG.js fixes to improve functionality
*
*/

/**
 * @typedef {import("../../modules/Control")} Controls
 */
includeIfNotIncluded("OOG.js");

(function (global, original) {
  global.login = function (...args) {
    console.trace();
    return original.apply(this, args);
  };
})([].filter.constructor("return this")(), login);

const locations = {};
(function() {
  let joinInfo;
  
  Starter.Config.StopOnDeadHardcore = false;
  const Controls = require("../../modules/Control");
  const Overrides = require("../../modules/Override");
  const SoloEvents = (() => {
    let { outOfGameCheck, check, gameInfo } = require("../Functions/SoloEvents");
    return {
      check: check,
      gameInfo: gameInfo,
      outOfGameCheck: outOfGameCheck,
    };
  })();

  new Overrides.Override(Starter, Starter.receiveCopyData, function (orignal, mode, msg) {
    switch (mode) {
    case 1: // Join Info
      console.log("Got Join Info");
      joinInfo = JSON.parse(msg);

      SoloEvents.gameInfo.gameName = joinInfo.gameName.toLowerCase();
      SoloEvents.gameInfo.gamePass = joinInfo.gamePass.toLowerCase();

      break;
    case 1638:
      try {
        /** @type {Map<string, string>} */
        const classMap = new Map();
        classMap.set("ZON", "amazon");
        classMap.set("SOR", "sorceress");
        classMap.set("NEC", "necromancer");
        classMap.set("PAL", "paladin");
        classMap.set("BAR", "barbarian");
        classMap.set("DRU", "druid");
        classMap.set("SIN", "assassin");
        let [modePrefix, charClass] = me.profile.toUpperCase().split("-");

        if (!modePrefix || !charClass || !(charClass = classMap.get(charClass.substring(0, 3)))) {
          D2Bot.printToConsole(
            "*** Invalid profile name ***\n"
            + "Profile :: " + me.profile + " | Prefix: " + modePrefix + " | CharClass: " + charClass + "\n"
            + "@see https://github.com/blizzhackers/kolbot-SoloPlay#possible-profile-names \n"
            + "**********************************************************************************",
            sdk.colors.D2Bot.Red
          );
          CharData.delete(true);
          throw new Error("Invalid profile name :: " + me.profile);
        }

        let obj = JSON.parse(msg);
        let infoTag = obj.Tag.trim().capitalize(true) || "";
        if (!infoTag) {
          D2Bot.printToConsole(
            "*** Invalid profile InfoTag ***\n"
            + "Tag :: " + obj.Tag + "\n"
            + "@see https://github.com/blizzhackers/kolbot-SoloPlay#available-characters-and-builds \n"
            + "**********************************************************************************",
            sdk.colors.D2Bot.Red
          );
          throw new Error("Invalid profile InfoTag :: " + obj.Tag);
        }

        Starter.profileInfo.profile = me.profile;
        Starter.profileInfo.account = obj.Account;
        if (Starter.profileInfo.account.length < 2 || Starter.profileInfo.account.length > 15) {
          // console.warn("Invalid account name length");
          Starter.profileInfo.account = "";
        }
        Starter.profileInfo.password = "";
        Starter.profileInfo.charName = obj.Character;
        Starter.profileInfo.difficulty = obj.Difficulty;
        obj.Realm = obj.Realm.toLowerCase();
        Starter.profileInfo.realm = ["east", "west"].includes(obj.Realm) ? "us" + obj.Realm : obj.Realm;
        Starter.profileInfo.mode = Profile().type;
        Starter.profileInfo.tag = infoTag;

        /**
         * @example SCL-ZON123
         */
        Starter.profileInfo.hardcore = modePrefix.includes("HC"); // SC softcore = false
        Starter.profileInfo.expansion = modePrefix.indexOf("CC") === -1; // not CC so not classic - true
        Starter.profileInfo.ladder = modePrefix.indexOf("NL") === -1; // not NL so its ladder - true
        Starter.profileInfo.charClass = charClass;

        if (["druid", "assassin"].includes(charClass) && !Starter.profileInfo.expansion) {
          D2Bot.printToConsole(
            "*** Invalid character class for mode ***\n"
            + "CharClass :: " + charClass + "\n"
            + "Expansion characters cannot be made in classic\n"
            + "**********************************************************************************",
            sdk.colors.D2Bot.Red
          );
          throw new Error("Expansion characters cannot be made in classic");
        }

        {
          let soloStats = CharData.getStats();
          let update = false;
          // new profile
          if (!soloStats.finalBuild) {
            soloStats.finalBuild = Starter.profileInfo.tag;
            CharData.updateData("me", soloStats);
          } else if (soloStats.finalBuild !== Starter.profileInfo.tag) {
            soloStats.finalBuild = Starter.profileInfo.tag;
            update = true;
          }

          if (soloStats.currentBuild !== soloStats.finalBuild
            && !["Start", "Stepping", "Leveling"].includes(soloStats.currentBuild)) {
            soloStats.currentBuild = "Leveling";
          }

          if (update) {
            soloStats.charms = {};
            CharData.updateData("me", soloStats);
          }
        }
      } catch (e) {
        console.error(e);
        D2Bot.stop();
      }

      break;
    default:
      orignal(mode, msg);
    }
  }).apply();

  new Overrides.Override(Starter, Starter.scriptMsgEvent, function (orignal, msg) {
    if (typeof msg !== "string") return;
    if (msg === "event") {
      SoloEvents.check = true;
    } else if (msg === "diffChange") {
      Starter.checkDifficulty();
    } else if (msg === "test") {
      console.debug(
        sdk.colors.Green
        + "//-----------DataDump Start-----------//",
        "\nÿc8ThreadData ::\n", getScript(true),
        "\nÿc8GlobalVariabls ::\n", Object.keys(global),
        "\n" + sdk.colors.Red
        + "//-----------DataDump End-----------//"
      );
    } else if (msg === "deleteAndRemake") {
      Starter.deadCheck = true;
    } else {
      orignal(msg);
    }
  }).apply();

  ControlAction.scrollDown = function () {
    me.blockMouse = true;
    for (let i = 0; i < 4; i++) {
      sendKey(sdk.keys.code.DownArrow);
    }
    me.blockMouse = false;
  };

  ControlAction.makeCharacter = function (info) {
    const NameGen = require("./NameGen");
    !info.charClass && (info.charClass = "barbarian");
    !info.charName && (info.charName = NameGen());
    me.blockMouse = true;

    let clickCoords = [];
    let soloStats = CharData.getStats();
    let timeout = getTickCount() + Time.minutes(5);

    /** @type {Map<string, [number, number]} */
    const coords = new Map();
    coords.set("barbarian", [400, 280]);
    coords.set("amazon", [100, 280]);
    coords.set("necromancer", [300, 290]);
    coords.set("sorceress", [620, 270]);
    coords.set("assassin", [200, 280]);
    coords.set("druid", [700, 280]);
    coords.set("paladin", [521, 260]);

    soloStats.startTime !== 0 && Tracker.reset();
    if (soloStats.currentBuild !== "Start" || soloStats.level > 1) {
      CharData.delete(false);
      CharData.updateData("me", "finalBuild", Starter.profileInfo.tag);
      Developer.logPerformance && Tracker.initialize();
    }

    D2Bot.updateStatus("Making Character: " + info.charName);

    // cycle until in lobby
    while (getLocation() !== sdk.game.locations.Lobby && !me.ingame) {
      switch (getLocation()) {
      case sdk.game.locations.CharSelect:
      case sdk.game.locations.CharSelectConnecting:
      case sdk.game.locations.CharSelectNoChars:
        let control = Controls.CharSelectCreate.control;

        // Create Character greyed out
        if (control && control.disabled === sdk.game.controls.Disabled) {
          me.blockMouse = false;

          return false;
        }

        Controls.CharSelectCreate.click();

        break;
      case sdk.game.locations.LobbyPleaseWait:
        D2Bot.restart(); // single player error on finding character

        break;
      case sdk.game.locations.CharacterCreate:
        clickCoords = coords.get(info.charClass.toLowerCase()) || coords.get("paladin");
        getControl().click(clickCoords[0], clickCoords[1]);
        delay(500);

        break;
      case sdk.game.locations.NewCharSelected:
        // hardcore char warning
        if (Controls.CharCreateHCWarningOk.control) {
          Controls.CharCreateHCWarningOk.click();
        } else {
          Controls.CharCreateCharName.setText(info.charName);

          if (!info.expansion) {
            // @credit isid0re
            if (["druid", "assassin"].includes(info.charClass)) {
              D2Bot.printToConsole("Error in profile name. Expansion characters cannot be made in classic", sdk.colors.D2Bot.Red);
              D2Bot.stop();

              return false;
            }

            Controls.CharCreateExpansion.click();
          }

          !info.ladder && Controls.CharCreateLadder.click();
          info.hardcore && Controls.CharCreateHardcore.click();
          Controls.BottomRightOk.click();
        }

        break;
      case sdk.game.locations.OkCenteredErrorPopUp:
        // char name exists (text box 4, 268, 320, 264, 120)
        ControlAction.timeoutDelay("Character Name exists: " + info.charName + ". Making new Name.", 5e3);
        Starter.profileInfo.charName = info.charName = NameGen();
        Controls.OkCentered.click();
        D2Bot.updateStatus("Making Character: " + info.charName);

        break;
      default:
        break;
      }

      // Singleplayer loop break fix.
      if (me.ingame) {
        break;
      }

      if (getTickCount() > timeout) {
        D2Bot.printToConsole("Failed to create character: " + info.charName + " Location: " + getLocation(), sdk.colors.D2Bot.Red);
        return false;
      }

      delay(500);
    }

    me.blockMouse = false;
    D2Bot.setProfile(null, null, info.charName, "Normal");
    let gamename = Starter.profileInfo.charName.substring(0, 7) + "-" + Starter.randomString(3, false) + "-";
    DataFile.updateStats("gameName", gamename);

    return true;
  };

  ControlAction.findCharacter = function (info) {
    let count = 0;
    let singlePlayer = ![sdk.game.gametype.OpenBattlenet, sdk.game.gametype.BattleNet].includes(Profile().type);
    // offline doesn't have a character limit cap
    let cap = singlePlayer ? 999 : 24;
    let tick = getTickCount();
    let firstCheck;

    while (getLocation() !== sdk.game.locations.CharSelect) {
      if (getTickCount() - tick >= 5000) {
        break;
      }

      delay(25);
    }

    // Wrong char select screen fix
    if ([sdk.game.locations.CharSelect, sdk.game.locations.CharSelectNoChars].includes(getLocation())) {
      hideConsole(); // seems to fix odd crash with single-player characters if the console is open to type in
      let spCheck = Profile().type === sdk.game.profiletype.Battlenet;
      let realmControl = !!Controls.CharSelectCurrentRealm.control;
      if ((spCheck && !realmControl) || ((!spCheck && realmControl))) {
        Controls.BottomLeftExit.click();
        return false; // what about a recursive call to loginCharacter?
      }
    }

    if (getLocation() === sdk.game.locations.CharSelectConnecting) {
      if (!Starter.charSelectConnecting()) {
        D2Bot.printToConsole("Stuck at connecting screen");
        D2Bot.restart();
      }
    }

    // start from beginning of the char list
    sendKey(sdk.keys.code.Home);

    while (getLocation() === sdk.game.locations.CharSelect && count < cap) {
      let control = Controls.CharSelectCharInfo0.control;

      if (control) {
        firstCheck = control.getText();
        do {
          let text = control.getText();

          if (text instanceof Array && typeof text[1] === "string") {
            count++;

            if (String.isEqual(text[1], info.charName)) {
              return control;
            }
          }
        } while (count < cap && control.getNext());
      }

      // check for additional characters up to 24 (online) or 999 offline (no character limit cap)
      if (count > 0 && count % 8 === 0) {
        if (Controls.CharSelectChar6.click()) {
          this.scrollDown();
          let check = Controls.CharSelectCharInfo0.control;

          if (firstCheck && check) {
            let nameCheck = check.getText();

            if (String.isEqual(firstCheck[1], nameCheck[1])) {
              return false;
            }
          }
        }
      } else {
        // no further check necessary
        break;
      }
    }

    return false;
  };

  ControlAction.loginCharacter = function (info, startFromTop = true) {
    me.blockMouse = true;

    // start from beginning of the char list
    startFromTop && sendKey(sdk.keys.code.Home);

    MainLoop:
    // cycle until in lobby or in game
    while (getLocation() !== sdk.game.locations.Lobby) {
      switch (getLocation()) {
      case sdk.game.locations.SplashScreen:
      case sdk.game.locations.MainMenu:
      case sdk.game.locations.Login:
        if (getLocation() === sdk.game.locations.MainMenu
          && Profile().type === sdk.game.profiletype.SinglePlayer
          && Controls.SinglePlayer.click()) {
          Starter.checkDifficulty();
          break;
        } else if (Starter.BNET) {
          Starter.LocationEvents.login();
        }

        break;
      case sdk.game.locations.CharSelect:
        let control = ControlAction.findCharacter(info);

        if (control) {
          control.click();
          Controls.BottomRightOk.click();
          me.blockMouse = false;

          if (getLocation() === sdk.game.locations.SelectDifficultySP) {
            try {
              Starter.LocationEvents.selectDifficultySP();
              Starter.locationTimeout(Time.seconds(3), sdk.game.locations.SelectDifficultySP);
            } catch (err) {
              break MainLoop;
            }

            if (me.ingame) {
              return true;
            }
          }

          return true;
        } else if (getLocation() !== sdk.game.locations.CharSelect) {
          break;
        }

        break MainLoop;
      case sdk.game.locations.CharSelectNoChars:
        Controls.BottomLeftExit.click(); // why exit rather than returning false?

        break;
      case sdk.game.locations.Disconnected:
      case sdk.game.locations.OkCenteredErrorPopUp:
        break MainLoop;
      default:
        break;
      }

      delay(100);
    }

    me.blockMouse = false;

    return false;
  };

  // need open bnet check
  ControlAction.makeAccount = function (info) {
    me.blockMouse = true;

    let tick;
    let realms = { "uswest": 0, "useast": 1, "asia": 2, "europe": 3 };
    D2Bot.updateStatus("Making Account: " + info.account);

    // cycle until in empty char screen
    while (getLocation() !== sdk.game.locations.CharSelectNoChars) {
      switch (getLocation()) {
      case sdk.game.locations.MainMenu:
        ControlAction.clickRealm(realms[info.realm]);
        Controls.BattleNet.click();

        break;
      case sdk.game.locations.Login:
        Controls.CreateNewAccount.click();

        break;
      case sdk.game.locations.LoginError:
      case sdk.game.locations.LoginUnableToConnect:
        return false;
      case sdk.game.locations.SplashScreen:
        Controls.SplashScreen.click();

        break;
      case sdk.game.locations.MainMenuConnecting:
        tick = getTickCount();

        while (getLocation() === sdk.game.locations.MainMenuConnecting) {
          if (getTickCount() - tick > 10000) {
            Controls.LoginCancelWait.click();
          }

          delay(500);
        }

        break;
      case sdk.game.locations.CharacterCreate:
        Controls.BottomLeftExit.click();

        break;
      case sdk.game.locations.OkCenteredErrorPopUp:
        info.account = "";
        info.password = "";
        D2Bot.setProfile(info.account, info.password);
        D2Bot.restart(true);

        break;
      case sdk.game.locations.TermsOfUse:
        Controls.TermsOfUseAgree.click();

        break;
      case sdk.game.locations.CreateNewAccount:
        Controls.EnterAccountName.setText(info.account);
        Controls.EnterAccountPassword.setText(info.password);
        Controls.ConfirmPassword.setText(info.password);
        Controls.BottomRightOk.click();

        break;
      case sdk.game.locations.PleaseRead:
        Controls.PleaseReadOk.click();

        break;
      case sdk.game.locations.RegisterEmail:
        if (Developer.setEmail.enabled
          && (!Developer.setEmail.profiles.length || Developer.setEmail.profiles.includes(me.profile))
          && (!Developer.setEmail.realms.length || Developer.setEmail.realms.includes(Profile().gateway.toLowerCase()))) {
          ControlAction.setEmail();
        } else {
          Controls.EmailDontRegisterContinue.control ? Controls.EmailDontRegisterContinue.click() : Controls.EmailDontRegister.click();
        }

        break;
      default:
        break;
      }

      delay(100);
    }

    me.blockMouse = false;

    return true;
  };

  ControlAction.deleteAndRemakeChar = function (info) {
    /** @type {Control} */
    let control = ControlAction.findCharacter(info);
    if (!control) return false;
    let cInfo = control.getText();
    console.debug(cInfo);
    
    me.blockMouse = true;

    control.click();
    Controls.CharSelectDelete.click();
    delay(500);
    Controls.PopupYes.click();

    me.blockMouse = false;

    // Delete old files - leaving csv file's for now as I don't think they interfere with the overlay
    CharData.delete(true);
    DataFile.create();
    DataFile.updateStats("handle", Starter.handle);
    CharData.updateData("me", "finalBuild", Starter.profileInfo.tag);
    Developer.logPerformance && Tracker.initialize();
    D2Bot.printToConsole("Deleted: " + info.charName + ". Now remaking...", sdk.colors.D2Bot.Gold);
    Starter.deadCheck = false;

    return ControlAction.makeCharacter(Starter.profileInfo);
  };

  ControlAction.saveInfo = function (info) {
    // Data-file already exists
    if (FileTools.exists("logs/Kolbot-SoloPlay/" + info.realm + "/" + info.charClass + "-" + info.charClass + "-" + info.charName + ".json")) {
      return;
    }

    let folder;

    if (!FileTools.exists("logs/Kolbot-SoloPlay")) {
      folder = dopen("logs");
      folder.create("Kolbot-SoloPlay");
    }

    if (!FileTools.exists("logs/Kolbot-SoloPlay/" + info.realm)) {
      folder = dopen("logs/Kolbot-SoloPlay");
      folder.create(info.realm);
    }

    if (!FileTools.exists("logs/Kolbot-SoloPlay/" + info.realm + "/" + info.charClass + "-" + info.charName + ".json")) {
      FileTools.writeText("logs/Kolbot-SoloPlay/" + info.realm + "/" + info.charClass + "-" + info.charName + ".json", JSON.stringify(info));
    }

    // Developer Options (BSI)
    if (Developer.fillAccountBumper.bumpers || Developer.fillAccountSocket.socketMules || Developer.fillAccountImbue.imbueMules) {
      // Create Save Folder Location
      if (FileTools.exists("logs/Kolbot-SoloPlay/Account-List/" + info.realm + "/" + (info.ladder > 0 ? "Ladder" : "Non-Ladder"))) {
        return;
      }

      if (!FileTools.exists("logs/Kolbot-SoloPlay")) {
        folder = dopen("logs");
        folder.create("Kolbot-SoloPlay");
      }

      if (!FileTools.exists("logs/Kolbot-SoloPlay/Account-List")) {
        folder = dopen("logs/Kolbot-SoloPlay");
        folder.create("Account-List");
      }

      if (!FileTools.exists("logs/Kolbot-SoloPlay/Account-List/" + info.realm)) {
        folder = dopen("logs/Kolbot-SoloPlay/Account-List");
        folder.create(info.realm);
      }

      if (!FileTools.exists("logs/Kolbot-SoloPlay/Account-List/" + info.realm + "/" + (info.ladder > 0 ? "Ladder" : "Non-Ladder"))) {
        folder = dopen("logs/Kolbot-SoloPlay/Account-List" + info.realm);
        folder.create((info.ladder > 0 ? "Ladder" : "Non-Ladder"));
      }
    }
  };

  ControlAction.loginAccount = function (info) {
    me.blockMouse = true;

    let locTick;
    let tick = getTickCount();
    let realms = { "uswest": 0, "useast": 1, "asia": 2, "europe": 3 };

    MainLoop:
    while (true) {
      switch (getLocation()) {
      case sdk.game.locations.PreSplash:
        break;
      case sdk.game.locations.MainMenu:
        info.realm && ControlAction.clickRealm(realms[info.realm]);
        Controls.BattleNet.click();

        break;
      case sdk.game.locations.Login:
        Controls.EnterAccountName.setText(info.account);
        Controls.EnterAccountPassword.setText(info.password);
        Controls.Login.click();

        break;
      case sdk.game.locations.LoginUnableToConnect:
      case sdk.game.locations.RealmDown:
        // Unable to connect, let the caller handle it.
        me.blockMouse = false;

        return false;
      case sdk.game.locations.CharSelect:
        break MainLoop;
      case sdk.game.locations.SplashScreen:
        Controls.SplashScreen.click();

        break;
      case sdk.game.locations.CharSelectPleaseWait:
      case sdk.game.locations.MainMenuConnecting:
      case sdk.game.locations.CharSelectConnecting:
        break;
      case sdk.game.locations.CharSelectNoChars:
        // make sure we're not on connecting screen
        locTick = getTickCount();

        while (getTickCount() - locTick < 3000 && getLocation() === sdk.game.locations.CharSelectNoChars) {
          delay(25);
        }

        if (getLocation() === sdk.game.locations.CharSelectConnecting) {
          break;
        }

        break MainLoop; // break if we're sure we're on empty char screen
      case sdk.game.locations.Lobby:
      case sdk.game.locations.LobbyChat:
        // somehow we are in the lobby?
        Control.LobbyQuit.click();
        
        break;
      default:
        console.log(getLocation());

        me.blockMouse = false;

        return false;
      }

      if (getTickCount() - tick >= 20000) {
        return false;
      }

      delay(100);
    }

    delay(1000);

    me.blockMouse = false;

    return getLocation() === sdk.game.locations.CharSelect || getLocation() === sdk.game.locations.CharSelectNoChars;
  };

  Starter.randomNumberString = function (len) {
    len === undefined && (len = rand(2, 5));

    let rval = "";
    let vals = "0123456789";

    for (let i = 0; i < len; i += 1) {
      rval += vals[rand(0, vals.length - 1)];
    }

    return rval;
  };

  Starter.CharacterCountmsg = function (string) {
    if (ControlAction.getCharacters().length >= 18) string = "Account is full.";
    if (ControlAction.getCharacters().length <= 17) string = "Account is ready.";

    return string;
  };

  Starter.getNextNum = function () {
    const SaveLocation = "logs/Kolbot-SoloPlay/GlobalAccount.json";
    const AccountName = (Starter.Config.GlobalAccount);
    const AccountData = {
      data: {
        account: "",
        accNum: 0
      },

      // Create a new Json file.
      create: function () {
        let string = JSON.stringify(this.data);
        FileTools.writeText(SaveLocation, string);
      },

      // Read data from the Json file and return the data object.
      read: function () {
        let string = FileTools.readText(SaveLocation);
        let obj = JSON.parse(string);

        return obj;
      },

      // Read data from the Json file and return the account info.
      readAcc: function () {
        let string = FileTools.readText(SaveLocation);
        let jsontext = JSON.parse(string);

        return jsontext.account;
      },

      // Write a data object to the Json file.
      write: function (obj) {
        let string = JSON.stringify(obj);
        FileTools.writeText(SaveLocation, string);
      },

      // Set next account - increase account number in the Json file.
      nextAccount: function () {
        let obj = AccountData.read();
        obj.accNum += 1;
        obj.account = AccountName + obj.accNum;
        AccountData.write(Object.assign(this.data, { accNum: obj.accNum, account: obj.account }));

        return obj.account;
      },

      createFolder: function () {
        const folderPath = "logs/Kolbot-SoloPlay";
        if (!FileTools.exists(folderPath)) {
          print(sdk.colors.DarkGreen + "Global Settings" + sdk.colors.White + " :: " + sdk.colors.Blue + "Creating Kolbot-SoloPlay Folder.");
          const folder = dopen("logs");
          folder.create("Kolbot-SoloPlay");
        }
      },

      initialize: function () {
        // If file exists check for valid info.
        if (FileTools.exists(SaveLocation)) {
          try {
            let jsonStr = FileTools.readText(SaveLocation);
            let jsonObj = JSON.parse(jsonStr);

            // Return filename containing correct info.
            if (AccountName && jsonObj.account && jsonObj.account.match(AccountName)) {
              delay(500);
              print(sdk.colors.DarkGreen + "Global Settings" + sdk.colors.White + " :: " + sdk.colors.Blue + "Next Sequential Number.");
              delay(250);
              AccountData.nextAccount();
              delay(500);

              return AccountData.readAcc();
            }
            
            // File exists but doesn't contain valid info - Remaking .json file.
            if (AccountName && jsonObj.account !== AccountName) {
              print(sdk.colors.DarkGreen + "Global Settings" + sdk.colors.White + " :: " + sdk.colors.Red + "Remove Save Location.");
              FileTools.remove(SaveLocation);
              delay(800);

              return this.initialize();
            }
          } catch (e) {
            print(e);
          }
        } else {
          // Check to see if main folder exist.
          AccountData.createFolder();
          delay(500);
          // Creating a new .json file.
          print(sdk.colors.DarkGreen + "Global Settings" + sdk.colors.White + " :: " + sdk.colors.Blue + "Creating New Account.");
          AccountData.create();
          delay(500);
          AccountData.nextAccount();
          delay(rand(5000, 10000));

          return AccountData.readAcc();
        }
        return AccountData.create();
      }
    };

    print(sdk.colors.DarkGreen + "Initializing " + sdk.colors.White + " :: " + sdk.colors.DarkGreen + "Global Settings.");
    AccountData.initialize();

    return AccountData.readAcc();
  };

  Starter.charSelectConnecting = function () {
    if (getLocation() === sdk.game.locations.CharSelectConnecting) {
      // bugged? lets see if we can unbug it
      // Click create char button on infinite "connecting" screen
      Controls.CharSelectCreate.click() && delay(1000);
      Controls.BottomLeftExit.click() && delay(1000);

      return (getLocation() !== sdk.game.locations.CharSelectConnecting);
    } else {
      return true;
    }
  };

  Starter.BNET = ([sdk.game.profiletype.Battlenet, sdk.game.profiletype.OpenBattlenet].includes(Profile().type));
  Starter.LocationEvents.oogCheck = function () {
    return (AutoMule.outOfGameCheck() || TorchSystem.outOfGameCheck() || Gambling.outOfGameCheck() || CraftingSystem.outOfGameCheck() || SoloEvents.outOfGameCheck());
  };

  Starter.checkDifficulty = function () {
    let setDiff = CharData.getStats().setDifficulty;
    if (setDiff) {
      console.debug(setDiff);
      Starter.gameInfo.difficulty = setDiff;
    }
  };

  Starter.LocationEvents.login = function () {
    Starter.inGame && (Starter.inGame = false);
    let pType = Profile().type;

    if (getLocation() === sdk.game.locations.MainMenu && Starter.firstRun
      && pType === sdk.game.profiletype.SinglePlayer
      && Controls.SinglePlayer.click()) {
      return;
    }

    // Wrong char select screen fix
    if ([sdk.game.locations.CharSelect, sdk.game.locations.CharSelectNoChars].includes(getLocation())) {
      hideConsole(); // seems to fix odd crash with single-player characters if the console is open to type in
      let spCheck = pType === sdk.game.profiletype.Battlenet;
      let realmControl = !!Controls.CharSelectCurrentRealm.control;
      if ((spCheck && !realmControl) || ((!spCheck && realmControl))) {
        Controls.BottomLeftExit.click();
        
        return;
      }
    }

    // Multiple realm botting fix in case of R/D or disconnect
    Starter.firstLogin && getLocation() === sdk.game.locations.Login && Controls.BottomLeftExit.click();
          
    D2Bot.updateStatus("Logging In");

    try {
      // make battlenet accounts/characters
      if (Starter.BNET) {
        ControlAction.timeoutDelay("Login Delay", Starter.Config.DelayBeforeLogin * 1e3);
        D2Bot.updateStatus("Logging in");
        // existing account
        if (Starter.profileInfo.account !== "") {
          try {
            // ControlAction.loginAccount(Starter.profileInfo);
            login(me.profile);
          } catch (error) {
            if (DataFile.getStats().AcctPswd) {
              Starter.profileInfo.account = DataFile.getStats().AcctName;
              Starter.profileInfo.password = DataFile.getStats().AcctPswd;

              for (let i = 0; i < 5; i++) {
                if (ControlAction.loginAccount(Starter.profileInfo)) {
                  break;
                }

                if (getLocation() === sdk.game.locations.CharSelectConnecting) {
                  if (Starter.charSelectConnecting()) {
                    break;
                  }
                }

                ControlAction.timeoutDelay("Unable to Connect", Starter.Config.UnableToConnectDelay * 6e4);
                Starter.profileInfo.account = DataFile.getStats().AcctName;
                Starter.profileInfo.password = DataFile.getStats().AcctPswd;
              }
            }
          }
        } else {
          // new account
          if (Starter.profileInfo.account === "") {
            if (Starter.Config.GlobalAccount || Starter.Config.GlobalAccountPassword) {
              Starter.profileInfo.account = Starter.Config.GlobalAccount.length > 0 ? Starter.Config.GlobalAccount + Starter.randomNumberString(Starter.Config.AccountSuffixLength) : Starter.randomString(12, true);
              Starter.profileInfo.password = Starter.Config.GlobalAccountPassword.length > 0 ? Starter.Config.GlobalAccountPassword : Starter.randomString(12, true);

              try {
                if (Starter.profileInfo.account.length > 15) throw new Error("Account name exceeds MAXIMUM length (15). Please enter a shorter name to restart the count.");
                if (Starter.profileInfo.password.length > 15) throw new Error("Password name exceeds MAXIMUM length (15). Please enter a shorter name under StarterConfig");
              } catch (e) {
                D2Bot.printToConsole("Kolbot-SoloPlay: " + e.message, sdk.colors.D2Bot.Gold);
                D2Bot.setProfile("", "", null, "Normal");
                D2Bot.stop();
              }

              console.log("Kolbot-SoloPlay :: Generated account information. " + (Starter.Config.GlobalAccount.length > 0 ? "Pre-defined " : "Random ") + "account used");
              console.log("Kolbot-SoloPlay :: Generated password information. " + (Starter.Config.GlobalAccountPassword.length > 0 ? "Pre-defined " : "Random ") + "password used");
              ControlAction.timeoutDelay("Generating Account Information", Starter.Config.DelayBeforeLogin * 1e3);
            } else {
              Starter.profileInfo.account = Starter.randomString(12, true);
              Starter.profileInfo.password = Starter.randomString(12, true);
              console.log("Generating Random Account Information");
              ControlAction.timeoutDelay("Generating Random Account Information", Starter.Config.DelayBeforeLogin * 1e3);
            }

            if (ControlAction.makeAccount(Starter.profileInfo)) {
              D2Bot.setProfile(Starter.profileInfo.account, Starter.profileInfo.password, null, "Normal");
              DataFile.updateStats("AcctName", Starter.profileInfo.account);
              DataFile.updateStats("AcctPswd", Starter.profileInfo.password);

              return;
            } else {
              Starter.profileInfo.account = "";
              Starter.profileInfo.password = "";
              D2Bot.setProfile(Starter.profileInfo.account, Starter.profileInfo.password, null, "Normal");
              D2Bot.restart(true);
            }
          }
        }
      } else {
        // SP/TCP  characters
        try {
          if (getLocation() === sdk.game.locations.MainMenu) {
            pType === sdk.game.profiletype.SinglePlayer
              ? Controls.SinglePlayer.click()
              : ControlAction.loginOtherMultiplayer();
          }
          Starter.checkDifficulty();
          Starter.LocationEvents.charSelect(getLocation());
        } catch (err) {
          console.error(err);
          // Try to find the character and if that fails, make character
          if (!ControlAction.findCharacter(Starter.profileInfo)) {
            // Pop-up that happens when choosing a dead HC char
            if (getLocation() === sdk.game.locations.OkCenteredErrorPopUp) {
              Controls.OkCentered.click();	// Exit from that pop-up
              D2Bot.printToConsole("Character died", sdk.colors.D2Bot.Red);
              ControlAction.deleteAndRemakeChar(Starter.profileInfo);
            } else {
              switch (true) {
              case (Starter.profileInfo.tag === "Bumper" && ControlAction.getCharacters().length == (Developer.fillAccount.Bumper.Count)):               
              case (Starter.profileInfo.tag === "Socketmule" && ControlAction.getCharacters().length == (Developer.fillAccount.SocketMules.Count)):
              case (Starter.profileInfo.tag === "Imbuemule" && ControlAction.getCharacters().length == (Developer.fillAccount.ImbueMules.Count)):
                D2Bot.printToConsole("Kolbot-SoloPlay: " + Starter.CharacterCountmsg(), sdk.colors.D2Bot.Orange);

                if (Developer.fillAccountBumper.NextAccount) {
                  D2Bot.setProfile("", "", "", "Normal");
                  D2Bot.restart(true);
                } else {
                  D2Bot.stop();
                }

                break; 
              default:
                ControlAction.makeCharacter(Starter.profileInfo);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e + " " + getLocation());
    }
  };

  Starter.accountExists = false;

  Starter.LocationEvents.loginError = function () {
    let string = "";
    let text = Controls.LoginErrorText.getText();

    if (text) {
      for (let i = 0; i < text.length; i++) {
        string += text[i];

        if (i !== text.length - 1) {
          string += " ";
        }
      }

      switch (string) {
      case getLocaleString(sdk.locale.text.UsernameIncludedIllegalChars):
      case getLocaleString(sdk.locale.text.UsernameIncludedDisallowedwords):
      case getLocaleString(sdk.locale.text.UsernameMustBeAtLeast):
      case getLocaleString(sdk.locale.text.PasswordMustBeAtLeast):
      case getLocaleString(sdk.locale.text.AccountMustBeAtLeast):
      case getLocaleString(sdk.locale.text.PasswordCantBeMoreThan):
      case getLocaleString(sdk.locale.text.AccountCantBeMoreThan):
      case getLocaleString(sdk.locale.text.InvalidPassword):
        D2Bot.printToConsole(string);
        D2Bot.stop();

        break;
      case getLocaleString(5208): // Invalid account
        D2Bot.updateStatus("Invalid Account Name");
        D2Bot.printToConsole("Invalid Account Name :: " + Starter.profileInfo.account);
        Starter.profileInfo.account = "";
        Starter.profileInfo.password = "";
        D2Bot.setProfile(Starter.profileInfo.account, Starter.profileInfo.password);
        D2Bot.restart(true);

        break;
      case getLocaleString(5249): // Unable to create account
      case getLocaleString(5239): // An account name already exists
        if (!Starter.accountExists) {
          Starter.accountExists = true;
          Control.LoginErrorOk.click();
          delay(100);
          Control.BottomLeftExit.click();
          Starter.LocationEvents.login();
          return;
        }
        D2Bot.updateStatus("Account name already exists :: " + Starter.profileInfo.account);
        D2Bot.printToConsole("Account name already exists :: " + Starter.profileInfo.account);
        Starter.profileInfo.account = "";
        Starter.profileInfo.password = "";
        D2Bot.setProfile(Starter.profileInfo.account, Starter.profileInfo.password);

        break;
      case getLocaleString(sdk.locale.text.CdKeyInUseBy):
        string += (" " + Controls.LoginCdKeyInUseBy.getText());
        D2Bot.printToConsole(Starter.gameInfo.mpq + " " + string, sdk.colors.D2Bot.Gold);
        D2Bot.CDKeyInUse();

        if (Starter.gameInfo.switchKeys) {
          cdkeyError = true;
        } else {
          Controls.UnableToConnectOk.click();
          ControlAction.timeoutDelay("LoD key in use", Starter.Config.CDKeyInUseDelay * 6e4);
          
          return;
        }

        break;
      case getLocaleString(5202): // cd key intended for another product
      case getLocaleString(10915): // lod key intended for another product
        D2Bot.updateStatus("Invalid CDKey");
        D2Bot.printToConsole("Invalid CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
        D2Bot.CDKeyDisabled();

        if (Starter.gameInfo.switchKeys) {
          ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
          D2Bot.restart(true);
        } else {
          D2Bot.stop();
        }

        break;
      case getLocaleString(5199):
        D2Bot.updateStatus("Disabled CDKey");
        D2Bot.printToConsole("Disabled CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
        D2Bot.CDKeyDisabled();

        if (Starter.gameInfo.switchKeys) {
          ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
          D2Bot.restart(true);
        } else {
          D2Bot.stop();
        }

        break;
      case getLocaleString(10913):
        D2Bot.updateStatus("Disabled LoD CDKey");
        D2Bot.printToConsole("Disabled LoD CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
        D2Bot.CDKeyDisabled();

        if (Starter.gameInfo.switchKeys) {
          ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
          D2Bot.restart(true);
        } else {
          D2Bot.stop();
        }

        break;
      case getLocaleString(5347):
        D2Bot.updateStatus("Disconnected from battle.net.");
        D2Bot.printToConsole("Disconnected from battle.net.");
        Controls.OkCentered.click();
        Controls.LoginErrorOk.click();

        return;
      default:
        D2Bot.updateStatus("Login Error");
        D2Bot.printToConsole("Login Error - " + string);

        if (Starter.gameInfo.switchKeys) {
          ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
          D2Bot.restart(true);
        } else {
          D2Bot.stop();
        }

        break;
      }
    }

    Controls.LoginErrorOk.click();
    delay(1000);
    Controls.BottomLeftExit.click();
  };

  Starter.LocationEvents.charSelect = function (loc) {
    let string = "";
    let text = Controls.CharSelectError.getText();

    if (text) {
      for (let i = 0; i < text.length; i++) {
        string += text[i];

        if (i !== text.length - 1) {
          string += " ";
        }
      }

      // CDKey disabled from realm play
      if (string === getLocaleString(sdk.locale.text.CdKeyDisabledFromRealm)) {
        D2Bot.updateStatus("Realm Disabled CDKey");
        D2Bot.printToConsole("Realm Disabled CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
        D2Bot.CDKeyDisabled();

        if (Starter.gameInfo.switchKeys) {
          ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
          D2Bot.restart(true);
        } else {
          D2Bot.stop();
        }
      }
    }

    if (Starter.deadCheck && ControlAction.deleteAndRemakeChar(Starter.profileInfo)) {
      Starter.deadCheck = false;
      
      return;
    }

    if (!Controls.CharSelectCreate.control) {
      // We aren't in the right place
      return;
    }

    if (Object.keys(Starter.profileInfo).length) {
      if (!ControlAction.findCharacter(Starter.profileInfo)) {
        let currLoc = getLocation();
        if (Starter.profileInfo.charName === DataFile.getObj().name
          && currLoc !== sdk.game.locations.CharSelectNoChars
          && ControlAction.getCharacters().length === 0) {
          ControlAction.timeoutDelay("[R/D] Character not found ", 18e4);
          D2Bot.printToConsole("Avoid Creating New Character - Restart");
          D2Bot.restart();
        } else {
          if (!ControlAction.makeCharacter(Starter.profileInfo)) {
            if (ControlAction.getCharacters().length >= 18) {
              D2Bot.printToConsole("Kolbot-SoloPlay: Account is full", sdk.colors.D2Bot.Red);
              D2Bot.stop();
            }
          }
        }
      } else {
        ControlAction.loginCharacter(Starter.profileInfo, false);
      }
    }

    if (!Starter.locationTimeout(Starter.Config.ConnectingTimeout * 1e3, loc)) {
      Controls.BottomLeftExit.click();
      Starter.gameInfo.rdBlocker && D2Bot.restart();
    }
  };

  Starter.LocationEvents.lobbyChat = function () {
    D2Bot.updateStatus("Lobby Chat");
    Starter.lastGameStatus === "pending" && (Starter.gameCount += 1);

    if (Starter.inGame || Starter.gameInfo.error) {
      !Starter.gameStart && (Starter.gameStart = DataFile.getStats().ingameTick);

      if (getTickCount() - Starter.gameStart < Starter.Config.MinGameTime * 1e3) {
        ControlAction.timeoutDelay("Min game time wait", Starter.Config.MinGameTime * 1e3 + Starter.gameStart - getTickCount());
      }
    }

    if (Starter.inGame) {
      if (oogCheck()) return;

      console.log("updating runs");
      D2Bot.updateRuns();

      Starter.gameCount += 1;
      Starter.lastGameStatus = "ready";
      Starter.inGame = false;

      if (Starter.Config.ResetCount && Starter.gameCount > Starter.Config.ResetCount) {
        Starter.gameCount = 1;
        DataFile.updateStats("runs", Starter.gameCount);
      }

      Starter.chanInfo.afterMsg = Starter.Config.AfterGameMessage;

      if (Starter.chanInfo.afterMsg) {
        !Array.isArray(Starter.chanInfo.afterMsg) && (Starter.chanInfo.afterMsg = [Starter.chanInfo.afterMsg]);

        for (let i = 0; i < Starter.chanInfo.afterMsg.length; i++) {
          Starter.sayMsg(Starter.chanInfo.afterMsg[i]);
          delay(500);
        }
      }
    }

    if (!Starter.chatActionsDone) {
      Starter.chatActionsDone = true;

      Starter.chanInfo.joinChannel = Starter.Config.JoinChannel;
      Starter.chanInfo.firstMsg = Starter.Config.FirstJoinMessage;

      if (Starter.chanInfo.joinChannel) {
        !Array.isArray(Starter.chanInfo.joinChannel) && (Starter.chanInfo.joinChannel = [Starter.chanInfo.joinChannel]);
        !Array.isArray(Starter.chanInfo.firstMsg) && (Starter.chanInfo.firstMsg = [Starter.chanInfo.firstMsg]);

        for (let i = 0; i < Starter.chanInfo.joinChannel.length; i++) {
          ControlAction.timeoutDelay("Chat delay", Starter.Config.ChatActionsDelay * 1e3);

          if (ControlAction.joinChannel(Starter.chanInfo.joinChannel[i])) {
            Starter.useChat = true;
          } else {
            console.log("ÿc1Unable to join channel, disabling chat messages.");

            Starter.useChat = false;
          }

          if (Starter.chanInfo.firstMsg[i] !== "") {
            Starter.sayMsg(Starter.chanInfo.firstMsg[i]);
            delay(500);
          }
        }
      }
    }

    // Announce game
    Starter.chanInfo.announce = Starter.Config.AnnounceGames;

    if (Starter.chanInfo.announce) {
      Starter.sayMsg("Next game is " + Starter.gameInfo.gameName + Starter.gameCount + (Starter.gameInfo.gamePass === "" ? "" : "//" + Starter.gameInfo.gamePass));
    }

    Starter.LocationEvents.openCreateGameWindow();
  };

  const oogCheck = () => (
    AutoMule.outOfGameCheck() || TorchSystem.outOfGameCheck()
    || Gambling.outOfGameCheck() || CraftingSystem.outOfGameCheck() || SoloEvents.outOfGameCheck()
  );

  locations[sdk.game.locations.PreSplash] = () => ControlAction.click();
  locations[sdk.game.locations.GatewaySelect] = () => Controls.GatewayCancel.click();
  locations[sdk.game.locations.SplashScreen] = () => Starter.LocationEvents.login();
  locations[sdk.game.locations.MainMenu] = () => Starter.LocationEvents.login();
  locations[sdk.game.locations.Login] = () => Starter.LocationEvents.login();
  locations[sdk.game.locations.OtherMultiplayer] = () => Starter.LocationEvents.otherMultiplayerSelect();
  locations[sdk.game.locations.TcpIp] = () => Profile().type === sdk.game.profiletype.TcpIpHost ? Controls.TcpIpHost.click() : Controls.TcpIpCancel.click();
  locations[sdk.game.locations.TcpIpEnterIp] = () => Controls.TcpIpCancel.click();
  locations[sdk.game.locations.LoginError] = () => Starter.LocationEvents.loginError();
  locations[sdk.game.locations.LoginUnableToConnect] = () => Starter.LocationEvents.unableToConnect();
  locations[sdk.game.locations.TcpIpUnableToConnect] = () => Starter.LocationEvents.unableToConnect();
  locations[sdk.game.locations.CdKeyInUse] = () => Starter.LocationEvents.loginError();
  locations[sdk.game.locations.InvalidCdKey] = () => Starter.LocationEvents.loginError();
  locations[sdk.game.locations.RealmDown] = () => Starter.LocationEvents.realmDown();
  locations[sdk.game.locations.Disconnected] = () => {
    ControlAction.timeoutDelay("Disconnected", 3000);
    Controls.OkCentered.click();
  };
  locations[sdk.game.locations.RegisterEmail] = () => Controls.EmailDontRegisterContinue.control ? Controls.EmailDontRegisterContinue.click() : Controls.EmailDontRegister.click();
  locations[sdk.game.locations.MainMenuConnecting] = (loc) => !Starter.locationTimeout(Starter.Config.ConnectingTimeout * 1e3, loc) && Controls.LoginCancelWait.click();
  locations[sdk.game.locations.CharSelectPleaseWait] = (loc) => !Starter.locationTimeout(Starter.Config.PleaseWaitTimeout * 1e3, loc) && Controls.OkCentered.click();
  locations[sdk.game.locations.CharSelect] = (loc) => Starter.LocationEvents.charSelect(loc);
  locations[sdk.game.locations.CharSelectConnecting] = (loc) => Starter.LocationEvents.charSelect(loc);
  locations[sdk.game.locations.CharSelectNoChars] = (loc) => Starter.LocationEvents.charSelect(loc);
  locations[sdk.game.locations.SelectDifficultySP] = () => Starter.LocationEvents.selectDifficultySP();
  locations[sdk.game.locations.CharacterCreate] = (loc) => !Starter.locationTimeout(5e3, loc) && Controls.BottomLeftExit.click();
  locations[sdk.game.locations.ServerDown] = () => {
    ControlAction.timeoutDelay("Server Down", Time.minutes(5));
    Controls.OkCentered.click();
  };
  locations[sdk.game.locations.LobbyPleaseWait] = (loc) => !Starter.locationTimeout(Starter.Config.PleaseWaitTimeout * 1e3, loc) && Controls.OkCentered.click();
  locations[sdk.game.locations.Lobby] = () => {
    D2Bot.updateStatus("Lobby");
    ControlAction.saveInfo(Starter.profileInfo);

    me.blockKeys = false;

    !Starter.firstLogin && (Starter.firstLogin = true);
    Starter.lastGameStatus === "pending" && (Starter.gameCount += 1);

    if (Starter.Config.PingQuitDelay && Starter.pingQuit) {
      ControlAction.timeoutDelay("Ping Delay", Starter.Config.PingQuitDelay * 1e3);
      Starter.pingQuit = false;
    }

    if (Starter.Config.JoinChannel !== "" && Controls.LobbyEnterChat.click()) return;

    if (Starter.inGame || Starter.gameInfo.error) {
      !Starter.gameStart && (Starter.gameStart = DataFile.getStats().ingameTick);

      if (getTickCount() - Starter.gameStart < Starter.Config.MinGameTime * 1e3 && !joinInfo) {
        ControlAction.timeoutDelay("Min game time wait", Starter.Config.MinGameTime * 1e3 + Starter.gameStart - getTickCount());
      }
    }

    if (Starter.inGame) {
      if (oogCheck()) return;

      D2Bot.updateRuns();

      Starter.gameCount += 1;
      Starter.lastGameStatus = "ready";
      Starter.inGame = false;

      if (Starter.Config.ResetCount && Starter.gameCount > Starter.Config.ResetCount) {
        Starter.gameCount = 1;
        DataFile.updateStats("runs", Starter.gameCount);
      }
    }

    Starter.LocationEvents.openCreateGameWindow();
  };
  locations[sdk.game.locations.LobbyChat] = () => Starter.LocationEvents.lobbyChat();
  locations[sdk.game.locations.CreateGame] = (loc) => {
    ControlAction.timeoutDelay("Create Game Delay", Starter.Config.DelayBeforeLogin * 1e3);
    D2Bot.updateStatus("Creating Game");

    if (typeof Starter.Config.CharacterDifference === "number") {
      Controls.CharacterDifference.disabled === sdk.game.controls.Disabled && Controls.CharacterDifferenceButton.click();
      Controls.CharacterDifference.setText(Starter.Config.CharacterDifference.toString());
    } else if (!Starter.Config.CharacterDifference && Controls.CharacterDifference.disabled === 5) {
      Controls.CharacterDifferenceButton.click();
    }

    typeof Starter.Config.MaxPlayerCount === "number" && Controls.MaxPlayerCount.setText(Starter.Config.MaxPlayerCount.toString());

    D2Bot.requestGameInfo();
    delay(500);
    
    // todo - really don't need use profiles set difficulty for online. Only single player so re-write difficulty stuff
    Starter.checkDifficulty();

    Starter.gameInfo.gameName = DataFile.getStats().gameName;
    Starter.gameInfo.gamePass = Starter.randomString(5, true);

    switch (true) {
    case Starter.gameInfo.gameName === "":
    case Starter.gameInfo.gameName === "Name":
      Starter.gameInfo.gameName = Starter.profileInfo.charName.substring(0, 7) + "-" + Starter.randomString(3, false) + "-";

      break;
    }

    // FTJ handler
    if (Starter.lastGameStatus === "pending") {
      Starter.isUp = "no";

      D2Bot.printToConsole("Failed to create game");
      ControlAction.timeoutDelay("FTJ delay", Starter.Config.FTJDelay * 1e3);
      D2Bot.updateRuns();
    }

    ControlAction.createGame((Starter.gameInfo.gameName + Starter.gameCount), Starter.gameInfo.gamePass, Starter.gameInfo.difficulty, Starter.Config.CreateGameDelay * 1000);
    Starter.lastGameStatus = "pending";
    Starter.setNextGame(Starter.gameInfo);
    Starter.locationTimeout(10000, loc);
  };
  locations[sdk.game.locations.GameNameExists] = () => {
    Controls.CreateGameWindow.click();
    Starter.gameCount += 1;
    Starter.lastGameStatus = "ready";
  };
  locations[sdk.game.locations.WaitingInLine] = () => Starter.LocationEvents.waitingInLine();
  locations[sdk.game.locations.JoinGame] = () => Starter.LocationEvents.openCreateGameWindow();
  locations[sdk.game.locations.Ladder] = () => Starter.LocationEvents.openCreateGameWindow();
  locations[sdk.game.locations.ChannelList] = () => Starter.LocationEvents.openCreateGameWindow();
  locations[sdk.game.locations.LobbyLostConnection] = () => {
    ControlAction.timeoutDelay("LostConnection", 3000);
    Controls.OkCentered.click();
  };
  locations[sdk.game.locations.GameDoesNotExist] = () => Starter.LocationEvents.gameDoesNotExist();
  locations[sdk.game.locations.GameIsFull] = () => Starter.LocationEvents.openCreateGameWindow();
})();

