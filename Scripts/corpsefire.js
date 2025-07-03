/**
*  @filename    corpsefire.js
*  @author      theBGuy
*  @desc        clear den, kill corpsefire not for quest
*
*/

function corpsefire () {
  myPrint("starting corpsefire");
  Town.doChores(null, { thawing: me.coldRes < 75, antidote: me.poisonRes < 75 });

  Pather.checkWP(sdk.areas.ColdPlains, true) ? Pather.useWaypoint(sdk.areas.ColdPlains) : Pather.getWP(sdk.areas.ColdPlains);
  Precast.doPrecast(true);
  Pather.clearToExit(sdk.areas.ColdPlains, sdk.areas.BloodMoor, true);
  Pather.clearToExit(sdk.areas.BloodMoor, sdk.areas.DenofEvil, true);
  Attack.clearLevel();

  return true;
}
