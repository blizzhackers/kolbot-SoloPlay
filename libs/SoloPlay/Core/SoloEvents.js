/**
*  @filename    SoloEvents.js
*  @author      theBGuy
*  @desc        Handle events for Kolbot-SoloPlay
*
*/

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    let v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.SoloEvents = factory();
  }
}(this, function () {
  const SoloEvents = {
    filePath: "libs/SoloPlay/Threads/EventThread.js",
    check: false,
    inGame: false,
    cloneWalked: false,
    townChicken: {
      disabled: false,
      running: false,
    },
    profileResponded: false,
    gameInfo: {
      gameName: "",
      gamePass: "",
    },

    outOfGameCheck: function () {
      if (!this.check) return false;

      if (this.gameInfo.gameName.length > 0) {
        D2Bot.printToConsole("Kolbot-SoloPlay :: SoloEvents.outOfGameCheck(): Attempting to join other bots game", sdk.colors.D2Bot.Gold);
        SoloEvents.inGame = true;
        me.blockMouse = true;

        delay(2000);
        joinGame(this.gameInfo.gameName, this.gameInfo.gamePass);

        me.blockMouse = false;

        delay(5000);

        while (me.ingame) {
          delay(1000);
        }

        console.log("ÿc8Kolbot-SoloPlayÿc0: End of SoloEvents.outOfGameCheck()");
        SoloEvents.inGame = false;
        SoloEvents.check = false;
        this.gameInfo.gameName = "";
        this.gameInfo.gamePass = "";

        return true;
      }

      return false;
    },

    inGameCheck: function () {
      if (me.ingame && me.hell && !me.classic && Misc.getPlayerCount() > 1) {
        let possibleChars = this.getCharacterNames();

        for (let i = 0; i < possibleChars.length; i++) {
          if (Misc.findPlayer(possibleChars[i].toLowerCase())) {
            if (!me.inArea(sdk.areas.RogueEncampment)) {
              Town.goToTown(1);
            }

            Town.move("stash");

            let torch, anni, tick = getTickCount();

            me.overhead("Waiting for charm to drop");
            while (getTickCount() - tick < 120 * 1000) {
              anni = me.findItem(sdk.items.SmallCharm, sdk.items.mode.onGround, -1, sdk.items.quality.Unique);
              torch = me.findItem(sdk.items.LargeCharm, sdk.items.mode.onGround, -1, sdk.items.quality.Unique);

              if (torch || anni) {
                break;
              }
            }

            if (torch || anni) {
              for (let j = 0; j < 12 || me.findItem((anni ? sdk.items.SmallCharm : sdk.items.LargeCharm), sdk.items.mode.inStorage, -1, sdk.items.quality.Unique); j++) {
                Town.move("stash");
                me.overhead("Looking for " + (anni ? "Annihilus" : "Torch"));
                Pickit.pickItems();
                delay(10000);	// 10 seconds
              }
            } else {
              me.overhead("No charm on ground");
            }

            quit();
            return true;
          }
        }

        console.log("Couldnt find player");
      }

      return false;
    },

    getProfiles: function () {
      let profileInfo, realm = me.realm.toLowerCase(), profileList = [];
      //realm = "useast";	// testing purposes

      if (!FileTools.exists("logs/Kolbot-SoloPlay/" + realm)) {
        return profileList;
      }

      let files = dopen("logs/Kolbot-SoloPlay/" + realm + "/").getFiles();

      for (let i = 0; i < files.length; i++) {
        try {
          profileInfo = Tracker.readObj("logs/Kolbot-SoloPlay/" + realm + "/" + files[i]);
          if (profileList.indexOf(profileInfo.profile) === -1) {
            profileList.push(profileInfo.profile);
          }
        } catch (e) {
          console.log(e);
        }
      }

      return profileList;
    },

    getCharacterNames: function () {
      let characterInfo, realm = me.realm.toLowerCase(), charList = [];
      //realm = "useast";	// testing purposes

      if (!FileTools.exists("logs/Kolbot-SoloPlay/" + realm)) {
        return charList;
      }

      let files = dopen("logs/Kolbot-SoloPlay/" + realm + "/").getFiles();

      for (let i = 0; i < files.length; i++) {
        try {
          characterInfo = Tracker.readObj("logs/Kolbot-SoloPlay/" + realm + "/" + files[i]);
          if (charList.indexOf(characterInfo.charName) === -1) {
            charList.push(characterInfo.charName);
          }
        } catch (e) {
          console.log(e);
        }
      }

      return charList;
    },

    sendToProfile: function (profile, message, mode = 65) {
      if (profile.toLowerCase() !== me.profile.toLowerCase()) {
        sendCopyData(null, profile, mode, JSON.stringify(message));
      }
    },

    sendToList: function (message, mode = 55) {
      let profiles = this.getProfiles();

      if (!profiles || profiles === undefined) {
        return false;
      }

      return profiles.forEach((profileName) => {
        if (profileName.toLowerCase() !== me.profile.toLowerCase()) {
          sendCopyData(null, profileName, mode, JSON.stringify(message));
        }
      });
    },

    dropCharm: function (charm) {
      if (!charm || charm === undefined) return false;

      D2Bot.printToConsole("Kolbot-SoloPlay :: Dropping " + charm.name, sdk.colors.D2Bot.Orange);
      let orginalLocation = { act: me.act, area: me.area, x: me.x, y: me.y };

      if (!me.inTown) {
        Town.goToTown(1);
        Town.move("stash");
        charm.drop();
      }

      if (me.act !== orginalLocation.act) {
        Town.goToTown(orginalLocation.act);
      }

      Town.move("portalspot");

      if (!Pather.usePortal(orginalLocation.area)) {
        Pather.journeyTo(orginalLocation.area);
      }

      return Pather.moveTo(orginalLocation.x, orginalLocation.y);
    },

    // @todo redo this, I think better option would be to make this it's own script
    // end the current script but insert it to be continued after dclone is dead
    killdclone: function () {
      D2Bot.printToConsole("Kolbot-SoloPlay :: Trying to kill DClone.", sdk.colors.D2Bot.Orange);
      let orginalLocation = { area: me.area, x: me.x, y: me.y };

      !me.inTown && Town.goToTown();

      if (me.accessToAct(2) && Pather.checkWP(sdk.areas.ArcaneSanctuary)) {
        Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
        Precast.doPrecast(true);

        if (!Pather.usePortal(null)) {
          console.log("ÿc8Kolbot-SoloPlayÿc1: Failed to move to Palace Cellar");
        }
      } else if (Pather.checkWP(sdk.areas.InnerCloister)) {
        Pather.useWaypoint(sdk.areas.InnerCloister);
        Pather.moveTo(20047, 4898);
      } else {
        Pather.useWaypoint(sdk.areas.ColdPlains);
        Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.DenofEvil], true);
        Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Corpsefire, 0, 0, false, true);
      }

      try {
        console.log("Added dia lightning listener");
        addEventListener("gamepacket", SoloEvents.diaEvent);

        Attack.killTarget(sdk.monsters.DiabloClone);
        Pickit.pickItems();

        let newAnni = Game.getItem(sdk.items.SmallCharm, sdk.items.mode.onGround);
        let oldAnni = me.findItem(sdk.items.SmallCharm, sdk.items.mode.inStorage, -1, sdk.items.quality.Unique);

        if (newAnni && oldAnni) {
          this.sendToList({ profile: me.profile, ladder: me.ladder }, 60);

          let tick = getTickCount();

          while (getTickCount() - tick < 10000) {
            me.overhead("Waiting to see if I get a response from other profiles");

            if (this.profileResponded) {
              me.overhead("Recieved response, dropping old Annihilus in Rogue Encampment");
              break;
            }

            delay(50);
          }

          if (newAnni && oldAnni && this.profileResponded) {
            this.dropCharm(oldAnni);
          } else {
            me.overhead("No response from other profiles");
          }

          SoloEvents.profileResponded = false;
          Pickit.pickItems();
        }

        if ((newAnni && oldAnni && !this.profileResponded) && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
          scriptBroadcast("muleAnni");
        }
      } finally {
        removeEventListener("gamepacket", SoloEvents.diaEvent);
        // Move back to where we orignally where
        Pather.journeyTo(orginalLocation.area);
        Pather.moveTo(orginalLocation.x, orginalLocation.y);
        SoloEvents.cloneWalked = false;
      }
    },

    moveSettings: {
      allowTeleport: false,
      allowClearing: false,
      allowPicking: false,
      allowTown: false,
      allowNodeActions: false,
      retry: 10,
    },

    moveTo: function (x, y, givenSettings) {
      // Abort if dead
      if (me.dead) return false;
      /**
      * assign settings
      * @type {pathSettings}
      */
      const settings = Object.assign({}, {
        allowTeleport: false,
        minDist: 3,
        retry: 10,
        pop: false,
        returnSpotOnError: true,
        callback: null,
      }, givenSettings);

      /** @type {PathNode} */
      let node = { x: x, y: y };

      if (settings.minDist > 3) {
        node = Pather.spotOnDistance(
          node,
          settings.minDist,
          { returnSpotOnError: settings.returnSpotOnError, reductionType: (me.inTown ? 0 : 2) }
        );
      }
      
      let fail = 0;
      let invalidCheck = false;
      let cbCheck = false;

      Pather.clearUIFlags();

      if (typeof node.x !== "number" || typeof node.y !== "number") return false;
      if (node.distance < 2 && !CollMap.checkColl(me, node, sdk.collision.BlockMissile, 5)) {
        return true;
      }

      const useTeleport = (
        settings.allowTeleport
        && (node.distance > 15 || me.diff || me.act > 3)
        && Pather.useTeleport()
      );
      const useChargedTele = settings.allowTeleport && Pather.canUseTeleCharges();
      const usingTele = (useTeleport || useChargedTele);
      const tpMana = Skill.getManaCost(sdk.skills.Teleport);
      const annoyingArea = Pather.inAnnoyingArea(me.area);
      let path = getPath(
        me.area,
        node.x, node.y,
        me.x, me.y,
        usingTele ? 1 : 0,
        usingTele ? (annoyingArea ? 30 : Pather.teleDistance) : Pather.walkDistance
      );
      if (!path) throw new Error("move: Failed to generate path.");

      path.reverse();
      settings.pop && path.pop();
      PathDebug.drawPath(path);
      if (useTeleport && Config.TeleSwitch && path.length > 5) {
        me.switchWeapons(Attack.getPrimarySlot() ^ 1);
      }

      while (path.length > 0) {
        // Abort if dead
        if (me.dead) return false;
        // main path
        if (Pather.recursion) {
          Pather.currentWalkingPath = path;
          PathDebug.drawPath(Pather.currentWalkingPath);
        }
        Pather.clearUIFlags();

        /** @type {PathNode} */
        node = path.shift();

        if (typeof settings.callback === "function" && settings.callback()) {
          cbCheck = true;
          break;
        }

        if (getDistance(me, node) > 2) {
          // Make life in Maggot Lair easier
          if (fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y)) {
            invalidCheck = true;
          }
          // Make life in Maggot Lair easier - should this include arcane as well?
          if (annoyingArea || invalidCheck) {
            let adjustedNode = Pather.getNearestWalkable(node.x, node.y, 15, 3, sdk.collision.BlockWalk);

            if (adjustedNode) {
              [node.x, node.y] = adjustedNode;
              invalidCheck && (invalidCheck = false);
            }
          }

          if (useTeleport && tpMana <= me.mp
            ? Pather.teleportTo(node.x, node.y)
            : useChargedTele && (getDistance(me, node) >= 15 || me.inArea(sdk.areas.ThroneofDestruction))
              ? Pather.teleUsingCharges(node.x, node.y)
              : Pather.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
            // we successfully moved to the node
          } else {
            if (!me.inTown) {
              if (!useTeleport && (Pather.openDoors(node.x, node.y) || Pather.kickBarrels(node.x, node.y))) {
                console.debug("Failed to walk to node, but opened door/barrel");
                continue;
              }
            }

            // Reduce node distance in new path
            path = getPath(
              me.area,
              node.x, node.y,
              me.x, me.y,
              useTeleport ? 1 : 0,
              useTeleport ? rand(25, 35) : rand(10, 15)
            );
            if (!path) throw new Error("moveTo: Failed to generate path.");

            path.reverse();
            PathDebug.drawPath(path);
            settings.pop && path.pop();

            if (fail > 0) {
              console.debug("move retry " + fail);
              Packet.flash(me.gid);

              if (fail >= settings.retry) {
                console.log("Failed move: Retry = " + settings.retry);
                break;
              }
            }
            fail++;
          }
        }

        delay(5);
      }

      me.switchToPrimary();
      PathDebug.removeHooks();

      return cbCheck || getDistance(me, node.x, node.y) < 5;
    },

    skip: function () {
      let tick = getTickCount();
      myPrint("Attempting baal wave skip");

      try {
        // Disable anything that will cause us to stop
        [Precast.enabled, Pickit.enabled] = [false, false];
        SoloEvents.townChicken.disabled = true;
        me.barbarian && (Config.FindItem = false);

        // Prep, move to throne entrance
        while (getTickCount() - tick < 6500) {
          this.moveTo(15091, 5073, { allowTeleport: true });
        }

        tick = getTickCount();

        // 5 second delay (5000ms), then leave throne
        while (getTickCount() - tick < 5000) {
          this.moveTo(15098, 5082, { allowTeleport: true });
        }

        tick = getTickCount();
        // this.moveTo(15099, 5078); // Re-enter throne
        Pather.walkTo(15099, 5078, 2);

        // 2 second delay (2000ms)
        while (getTickCount() - tick < 2000) {
          this.moveTo(15098, 5082);
        }

        this.moveTo(15099, 5078);

        let skipFailed = getUnits(sdk.unittype.Monster)
          .some(mon => mon.attackable
            && mon.x >= 15072 && mon.x <= 15118
            && mon.y >= 5002 && mon.y <= 5073
          );
        myPrint("skip " + (!skipFailed ? "worked" : "failed"));
      } finally {
        // Re-enable
        [Precast.enabled, Pickit.enabled] = [true, true];
        SoloEvents.townChicken.disabled = false;
      }
    },

    dodge: function () {
      let diablo = me.inArea(sdk.areas.ChaosSanctuary)
        ? Game.getMonster(sdk.monsters.Diablo)
        : Game.getMonster(sdk.monsters.DiabloClone);
      // Credit @Jaenster
      const shouldDodge = function (coord) {
        return !!diablo && getUnits(sdk.unittype.Missile)
          // For every missle that isnt from our merc
          .filter((missile) => missile && diablo && diablo.gid === missile.owner)
          // if any
          .some(function (missile) {
            let xoff = Math.abs(coord.x - missile.targetx);
            let yoff = Math.abs(coord.y - missile.targety);
            let xdist = Math.abs(coord.x - missile.x);
            let ydist = Math.abs(coord.y - missile.y);
            // If missile wants to hit is and is close to us
            return xoff < 10 && yoff < 10 && xdist < 15 && ydist < 15;
          });
      };
      
      if (diablo && shouldDodge(me)) {
        let tick = getTickCount();
        let overrides = { allowTeleport: false, allowClearing: false, allowTown: false };

        try {
          // Disable anything that will cause us to stop
          [Precast.enabled, Pickit.enabled] = [false, false];
          SoloEvents.townChicken.disabled = true;
          console.log("DODGE");
          // Disable things that will cause us to stop
          let dist = me.assassin ? 15 : 3;

          while (getTickCount() - tick < 2000) {
            // Above D
            if (me.y <= diablo.y) {
              // Move east
              me.x <= diablo.x && this.moveTo(diablo.x + dist, diablo.y, overrides);
              // Move south
              me.x > diablo.x && this.moveTo(diablo.x, diablo.y + dist, overrides);
            }

            // Below D
            if (me.y > diablo.y) {
              // Move west
              me.x >= diablo.x && this.moveTo(diablo.x - dist, diablo.y, overrides);
              // Move north
              me.x < diablo.x && this.moveTo(diablo.x, diablo.y - dist, overrides);
            }
          }
        } finally {
          // Re-enable
          [Precast.enabled, Pickit.enabled] = [true, true];
          SoloEvents.townChicken.disabled = false;
        }
      }
    },

    finishDen: function () {
      Pickit.pickItems();

      // No Tome, or tome has no tps, or no scrolls
      if (!me.canTpToTown() && !me.inTown) {
        // should really check how close the town exit is
        Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.ColdPlains], true);
        Pather.getWP(sdk.areas.ColdPlains);
        Pather.useWaypoint(sdk.areas.RogueEncampment);
      } else {
        Town.goToTown(1);
      }

      Town.npcInteract("akara");
    },

    bugAndy: function () {
      Town.goToTown();
      Pather.changeAct();
      delay(2000 + me.ping);

      // Now check my area
      if (me.act === 2) {
        // Act change sucessful, Andy has been bugged
        myPrint("Andy bug " + (!me.getQuest(sdk.quest.id.SistersToTheSlaughter, 15) ? "sucessful" : "failed"));
        scriptBroadcast("quit");
      }
    },

    diaEvent: function (bytes = []) {
      if (!bytes.length) return;
      // dia lightning
      if (bytes[0] === 0x4C && bytes[6] === 193) {
        me.emit("soloEvent", "dodge");
      }
    },

    skippedWaves: [],

    baalEvent: function (bytes = []) {
      if (!bytes.length) return;
      // baal wave
      if (bytes[0] === 0xA4) {
        if ((me.hell && me.paladin && !Attack.auradin)
          || me.barbarian
          || me.gold < 5000
          || (!me.baal && SetUp.finalBuild !== "Bumper")) {
          let waveMonster = ((bytes[1]) | (bytes[2] << 8));
          let wave = [
            sdk.monsters.WarpedShaman,
            sdk.monsters.BaalSubjectMummy,
            sdk.monsters.Council4,
            sdk.monsters.VenomLord2,
            sdk.monsters.ListerTheTormenter
          ].indexOf(waveMonster);
          console.debug("Wave # " + wave);
          if (SoloEvents.skippedWaves.includes(wave)) return;
          const waveBoss = {
            COLENZO: 0,
            ACHMEL: 1,
            BARTUC: 2,
            VENTAR: 3,
            LISTER: 4
          };

          switch (wave) {
          case waveBoss.COLENZO:
            break;
          case waveBoss.ACHMEL:
            if ((me.paladin && !Attack.auradin && me.hell)
              || (me.barbarian && ((me.charlvl < CharInfo.levelCap && !me.baal)
              || me.hardcore))) {
              Messaging.sendToScript(SoloEvents.filePath, "skip");
              SoloEvents.skippedWaves.push(wave);
            }

            break;
          case waveBoss.BARTUC:
          case waveBoss.VENTAR:
            break;
          case waveBoss.LISTER:
            if ((me.barbarian && (me.charlvl < CharInfo.levelCap || !me.baal || me.hardcore))
              || (me.charlvl < CharInfo.levelCap && (me.gold < 5000 || (!me.baal && SetUp.finalBuild !== "Bumper")))) {
              // Messaging.sendToScript(SoloEvents.filePath, "skip");
              me.emit("soloEvent", "skip");
              SoloEvents.skippedWaves.push(wave);
            }

            break;
          }
        }
      }
    },
  };
  
  return SoloEvents;
}));
