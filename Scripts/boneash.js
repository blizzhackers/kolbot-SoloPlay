/**
*  @filename    boneash.js
*  @author      theBGuy
*  @desc        kill boneash for exp
*
*/

function boneash () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting boneash");

  Pather.checkWP(sdk.areas.InnerCloister, true)
    ? Pather.useWaypoint(sdk.areas.InnerCloister)
    : Pather.getWP(sdk.areas.InnerCloister);
  Precast.doPrecast(true);
  Pather.clearToExit(sdk.areas.InnerCloister, sdk.areas.Cathedral, true);
  Pather.moveTo(20047, 4898);
  Attack.killTarget(getLocaleString(sdk.locale.monsters.BoneAsh));

  if (!me.haveWaypoint(sdk.areas.CatacombsLvl2)) {
    myPrint("Getting cata 2 wp");
    Pather.moveToExit([sdk.areas.CatacombsLvl1, sdk.areas.CatacombsLvl2], true);
    Pather.getWP(sdk.areas.CatacombsLvl2);
    Pather.useWaypoint(sdk.areas.RogueEncampment);
  }

  return true;
}
