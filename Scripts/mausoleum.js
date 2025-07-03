/**
*  @filename    mausoleum.js
*  @author      theBGuy
*  @desc        early leveling in maus
*
*/

function mausoleum () {
  Town.doChores();
  myPrint("ÿc8Kolbot-SoloPlayÿc0: starting mausoleum");

  me.gold > 1000 && Town.buyPots(12, "stamina", true);

  if (!Pather.checkWP(sdk.areas.ColdPlains)) {
    Pather.moveToExit(sdk.areas.BloodMoor, true);

    try {
      Pather.moveToPreset(sdk.areas.BloodMoor, sdk.unittype.Object, sdk.objects.SuperChest) && Misc.openChests(5);
    } catch (e) {
      console.warn(e.message ? e.message : e);
    }
    Pather.getWP(sdk.areas.ColdPlains);

    // check if we need to do chores
    Storage.Inventory.UsedSpacePercent() > 50 && Pather.useWaypoint(sdk.areas.RogueEncampment) && Town.doChores();
  }

  Pather.useWaypoint(sdk.areas.ColdPlains);
  Precast.doPrecast(true);
  Pather.moveToExit([sdk.areas.BurialGrounds, sdk.areas.Mausoleum], true);
  // need to figure out better clearLevel method, for now just clear to superchest

  me.inArea(sdk.areas.Mausoleum) && Pather.moveToPreset(sdk.areas.Mausoleum, sdk.unittype.Object, sdk.objects.SmallSparklyChest);
  Misc.openChests(5);
  
  return true;
}
