/**
*  @filename    izual.js
*  @author      isid0re, theBGuy
*  @desc        izual for quest and xp
*
*/

function izual () {
  myPrint("starting izual");

  Town.doChores(false, { thawing: true, antidote: true, stamina: true, fullChores: true });

  Pather.checkWP(sdk.areas.CityoftheDamned, true) ? Pather.useWaypoint(sdk.areas.CityoftheDamned) : Pather.getWP(sdk.areas.CityoftheDamned);
  Precast.doPrecast(true);
  Pather.moveToPreset(sdk.areas.PlainsofDespair, sdk.unittype.Monster, sdk.monsters.Izual);
  Attack.killTarget("Izual");

  if (!Misc.checkQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.Completed)) {
    Town.goToTown();
    Town.npcInteract("tyrael");
    me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
  }

  return true;
}
