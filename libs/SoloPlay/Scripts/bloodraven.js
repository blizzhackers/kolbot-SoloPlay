/**
*  @filename    bloodraven.js
*  @author      theBGuy
*  @desc        kill bloodraven for free merc normal and maus/crypt MF hunting for endgame
*
*/

function bloodraven () {
  Town.doChores(false, { fullChores: true });
  myPrint("ÿc8Kolbot-SoloPlayÿc0: starting blood raven");

  if (!Pather.checkWP(sdk.areas.StonyField, true)) {
    Pather.getWP(sdk.areas.StonyField);
    if (me.charlvl < 6) {
      Pather.moveToPreset(sdk.areas.StonyField, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 10, 10, false, true);
      Attack.killTarget(getLocaleString(sdk.locale.monsters.Rakanishu));
    }
  } else {
    if (me.hell && Pather.canTeleport() && me.charlvl < 74/*xp penalty makes this not worth it after 74*/) {
      Misc.getExpShrine([sdk.areas.StonyField, sdk.areas.ColdPlains, sdk.areas.DarkWood, sdk.areas.BloodMoor]);
      if (!me.inArea(sdk.areas.ColdPlains)) {
        Town.goToTown() && Pather.useWaypoint(sdk.areas.ColdPlains);
      }
    } else {
      Pather.useWaypoint(sdk.areas.ColdPlains);
      if (me.charlvl < 5) {
        SoloIndex.doneList.includes("cave")
          ? Attack.clearLevelUntilLevel(5)
          : Loader.skipTown.push("cave") && Loader.runScript("cave");
      }
    }
  }

  Precast.doPrecast(true);

  me.overhead("blood raven");
  Pather.journeyTo(sdk.areas.BurialGrounds);
  me.sorceress && !me.normal
    ? Pather.moveNearPreset(sdk.areas.BurialGrounds, sdk.unittype.Monster, sdk.monsters.preset.BloodRaven, 20)
    : Pather.moveToPreset(sdk.areas.BurialGrounds, sdk.unittype.Monster, sdk.monsters.preset.BloodRaven);
  Attack.killTarget("Blood Raven");
  Pickit.pickItems();

  if (me.normal && !me.bloodraven && me.canTpToTown()) {
    Town.npcInteract("kashya");
    return true;
  } else if (me.paladin && Check.currentBuild().caster && !Pather.canTeleport()) {
    return true;
  }

  myPrint("blood raven :: starting mausoleum");

  if (!Pather.moveToExit([sdk.areas.BurialGrounds, sdk.areas.Mausoleum], true)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Mausoleum");
  }

  me.inArea(sdk.areas.Mausoleum) && Attack.clearLevel();

  if (me.hell) {
    switch (me.gametype) {
    case sdk.game.gametype.Classic:
      if (me.accessToAct(3)) {
        return true;
      }

      break;
    case sdk.game.gametype.Expansion:
      if ((me.charlvl < 80 || me.charlvl > 85)
        && !((me.sorceress || me.druid || me.assassin) && me.equipped.get(sdk.body.RightArm).tier < 100000)) {
        return true;
      }

      break;
    }
  } else {
    return true;
  }

  myPrint("blood raven :: starting crypt");
  Pather.journeyTo(sdk.areas.Crypt) && Attack.clearLevel();
  
  return true;
}
