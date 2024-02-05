/**
*  @filename    orgtorch.js
*  @author      kolton, theBGuy
*  @desc        Convert keys to organs and organs to torches.
*
*/

function orgtorch () {
  this.doneAreas = [];

  // Identify & mule
  this.checkTorch = function () {
    if (me.inArea(sdk.areas.UberTristram)) {
      Pather.moveTo(25105, 5140);
      Pather.usePortal(sdk.areas.Harrogath);
    }

    Town.doChores();

    let torch = me.findItem(604, 0, null, 7);

    if (!torch || torch === undefined) {
      return false;
    }

    if (!torch.identified) {
      Town.identify();
    }

    for (let i = 0; i < 7; i++) {
      if (torch.getStat(sdk.stats.AddClassSkills, i)) {
        SoloEvents.sendToList({ profile: me.profile, ladder: me.ladder, torchType: i });

        return true;
      }
    }

    return false;
  };

  // Check whether the killer is alone in the game
  this.aloneInGame = function () {
    let party = getParty();

    if (party) {
      do {
        if (party.name !== me.name) {
          return false;
        }
      } while (party.getNext());
    }

    return true;
  };

  // Try to lure a monster - wait until it's close enough
  this.lure = function (bossId) {
    let tick,
      unit = Game.getMonster(bossId);

    if (unit) {
      tick = getTickCount();

      while (getTickCount() - tick < 2000) {
        if (unit.distance <= 10) {
          return true;
        }

        delay(50);
      }
    }

    return false;
  };

  // Check if we have complete sets of organs
  this.completeSetCheck = function () {
    let horns = me.findItems(sdk.items.quest.DiablosHorn),
      brains = me.findItems(sdk.items.quest.MephistosBrain),
      eyes = me.findItems(sdk.items.quest.BaalsEye);

    if (!horns || !brains || !eyes) {
      return false;
    }

    // We just need one set to make a torch
    return horns.length && brains.length && eyes.length;
  };

  // Get fade in River of Flames
  this.getFade = function () {
    if (!me.getState(sdk.states.Fade)
      && (me.checkItem({ name: sdk.locale.items.Treachery, equipped: true }).have
      || me.checkItem({ name: sdk.locale.items.LastWish, equipped: true }).have
      || me.checkItem({ name: sdk.locale.items.SpiritWard, equipped: true }).have)) {
      if (!me.getState(sdk.states.Fade)) {
        myPrint(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.White + "Getting Fade");
        Pather.useWaypoint(sdk.states.RiverofFlame);
        Precast.doPrecast(true);
        Pather.moveTo(7811, 5872);

        me.paladin && me.checkSkill(sdk.skills.Salvation, sdk.skills.subindex.SoftPoints) && Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);

        while (!me.getState(sdk.states.Fade)) {
          delay(100);
        }

        myPrint(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.Green + "Fade Achieved");
      }
    }

    return true;
  };

  // Open a red portal. Mode 0 = mini ubers, mode 1 = Tristram
  this.openPortal = function (mode) {
    let portal,
      item1 = mode === 0
        ? me.findItem(sdk.items.quest.KeyofTerror, sdk.items.mode.inStorage)
        : me.findItem(sdk.items.quest.DiablosHorn, sdk.items.mode.inStorage),
      item2 = mode === 0
        ? me.findItem(sdk.items.quest.KeyofHate, sdk.items.mode.inStorage)
        : me.findItem(sdk.items.quest.BaalsEye, sdk.items.mode.inStorage),
      item3 = mode === 0
        ? me.findItem(sdk.items.quest.KeyofDestruction, sdk.items.mode.inStorage)
        : me.findItem(sdk.items.quest.MephistosBrain, sdk.items.mode.inStorage);

    Town.goToTown(5);
    Town.doChores();

    if (Town.openStash() && Cubing.emptyCube()) {
      if (!Storage.Cube.MoveTo(item1)
        || !Storage.Cube.MoveTo(item2)
        || !Storage.Cube.MoveTo(item3)
        || !Cubing.openCube()) {
        return false;
      }

      transmute();
      delay(1000);

      portal = Game.getObject("portal");

      if (portal) {
        do {
          switch (mode) {
          case 0:
            if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain].indexOf(portal.objtype) > -1 && this.doneAreas.indexOf(portal.objtype) === -1) {
              this.doneAreas.push(portal.objtype);

              return copyUnit(portal);
            }

            break;
          case 1:
            if (portal.objtype === sdk.areas.UberTristram) {
              return copyUnit(portal);
            }

            break;
          }
        } while (portal.getNext());
      }
    }

    return false;
  };

  // Do mini ubers or Tristram based on area we're already in
  this.pandemoniumRun = function () {
    let i, findLoc;

    switch (me.area) {
    case sdk.areas.MatronsDen:
      Precast.doPrecast(true);
      Pather.moveToPreset(sdk.areas.MatronsDen, sdk.unittype.Object, 397, 2, 2);
      Attack.killTarget(707);
      Pickit.pickItems();
      Town.goToTown();

      break;
    case sdk.areas.ForgottenSands:
      Precast.doPrecast(true);

      findLoc = [20196, 8694, 20308, 8588, 20187, 8639, 20100, 8550, 20103, 8688, 20144, 8709, 20263, 8811, 20247, 8665];

      for (i = 0; i < findLoc.length; i += 2) {
        Pather.moveTo(findLoc[i], findLoc[i + 1]);
        delay(500);

        if (Game.getMonster(708)) {
          break;
        }
      }

      Attack.killTarget(708);
      Pickit.pickItems();
      Town.goToTown();

      break;
    case sdk.areas.FurnaceofPain:
      Precast.doPrecast(true);
      Pather.moveToPreset(sdk.areas.FurnaceofPain, sdk.unittype.Object, 397, 2, 2);
      Attack.killTarget(706);
      Pickit.pickItems();
      Town.goToTown();

      break;
    case sdk.areas.UberTristram:
      Pather.moveTo(25068, 5078);
      Precast.doPrecast(true);

      findLoc = [25040, 5101, 25040, 5166, 25122, 5170];

      for (i = 0; i < findLoc.length; i += 2) {
        Pather.moveTo(findLoc[i], findLoc[i + 1]);
      }

      if (me.paladin && me.checkSkill(sdk.skills.Salvation, sdk.skills.subindex.SoftPoints)) {
        Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);
      }

      this.lure(704);
      Pather.moveTo(25129, 5198);
      
      if (me.paladin && me.checkSkill(sdk.skills.Salvation, sdk.skills.subindex.SoftPoints)) {
        Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);
      }

      this.lure(704);

      if (!Game.getMonster(704)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.killTarget(704);

      Pather.moveTo(25162, 5141);
      delay(3250);

      if (!Game.getMonster(709)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.killTarget(709);

      if (!Game.getMonster(705)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.killTarget(705);
      Pickit.pickItems();
      this.checkTorch();

      break;
    }
  };

  this.juvCheck = function () {
    let i,
      needJuvs = 0,
      col = Storage.Belt.checkColumns(Storage.BeltSize());

    for (i = 0; i < 4; i += 1) {
      if (Config.BeltColumn[i] === "rv") {
        needJuvs += col[i];
      }
    }

    console.log("Need " + needJuvs + " juvs.");

    return needJuvs;
  };

  // Start
  let i, portal, tkeys, hkeys, dkeys, brains, eyes, horns;

  // Do town chores and quit if MakeTorch is true and we have a torch.
  this.checkTorch();

  // Count keys and organs
  tkeys = me.findItems(sdk.items.quest.KeyofTerror, sdk.items.mode.inStorage).length || 0;
  hkeys = me.findItems(sdk.items.quest.KeyofHate, sdk.items.mode.inStorage).length || 0;
  dkeys = me.findItems(sdk.items.quest.KeyofDestruction, sdk.items.mode.inStorage).length || 0;
  brains = me.findItems(sdk.items.quest.MephistosBrain, sdk.items.mode.inStorage).length || 0;
  eyes = me.findItems(sdk.items.quest.BaalsEye, sdk.items.mode.inStorage).length || 0;
  horns = me.findItems(sdk.items.quest.DiablosHorn, sdk.items.mode.inStorage).length || 0;

  // End the script if we don't have enough keys nor organs
  if ((tkeys < 3 || hkeys < 3 || dkeys < 3) && (brains < 1 || eyes < 1 || horns < 1)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Not enough keys or organs.");

    return true;
  }

  Config.UseMerc = false;

  // We have enough keys, do mini ubers
  if (tkeys >= 3 && hkeys >= 3 && dkeys >= 3) {
    this.getFade();
    console.log("ÿc8Kolbot-SoloPlayÿc0: Making organs.");
    D2Bot.printToConsole("ÿc8Kolbot-SoloPlayÿc0 :: OrgTorch: Making organs.", sdk.colors.D2Bot.Orange);

    for (i = 0; i < 3; i += 1) {
      // Abort if we have a complete set of organs
      // check after at least one portal is made
      if (i > 0 && this.completeSetCheck()) {
        break;
      }

      portal = this.openPortal(0);

      if (portal) {
        switch (portal.objtype) {
        case sdk.areas.MatronsDen:
          Town.buyPots(10, "Thawing", true, true);
          Town.buyPots(10, "Antidote", true, true);
          Town.buyPots(10, "Antidote", true, true); // Double stack to ensure it lasts

          break;
        case sdk.areas.ForgottenSands:
          Town.buyPots(10, "Thawing", true, true);

          break;
        case sdk.areas.FurnaceofPain:
          Town.buyPots(10, "Thawing", true, true);
          Town.buyPots(10, "Antidote", true, true);

          break;
        }

        Town.move("stash");
        Pather.usePortal(null, null, portal);
      }

      this.pandemoniumRun();
    }
  }

  // Don't make torches if not configured to OR if the char already has one
  if (this.checkTorch()) {
    return true;
  }

  // Count organs
  brains = me.findItems(sdk.items.quest.MephistosBrain, sdk.items.mode.inStorage).length || 0;
  eyes = me.findItems(sdk.items.quest.BaalsEye, sdk.items.mode.inStorage).length || 0;
  horns = me.findItems(sdk.items.quest.DiablosHorn, sdk.items.mode.inStorage).length || 0;

  // We have enough organs, do Tristram
  if (brains && eyes && horns) {
    this.getFade();
    console.log("ÿc8Kolbot-SoloPlayÿc0: Making torch");
    D2Bot.printToConsole("ÿc8Kolbot-SoloPlayÿc0 :: OrgTorch: Making torch.", sdk.colors.D2Bot.Orange);

    portal = this.openPortal(1);

    if (portal) {
      Pather.usePortal(null, null, portal);
    }

    this.pandemoniumRun();
  }

  return true;
}
