/**
*  @filename    pits.js
*  @author      kolton, theBGuy
*  @desc        pits A1 for MF and gold
*
*/

function pits () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting pits");

  Pather.checkWP(sdk.areas.BlackMarsh, true) ? Pather.useWaypoint(sdk.areas.BlackMarsh) : Pather.getWP(sdk.areas.BlackMarsh);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([sdk.areas.TamoeHighland, sdk.areas.PitLvl1], true)) throw new Error("Failed to move to Pit level 1");
  Attack.clearLevel();

  if (!Pather.moveToExit(sdk.areas.PitLvl2, true)) throw new Error("Failed to move to Pit level 2");
  Attack.clearLevel();
  Misc.openChestsInArea(sdk.areas.PitLvl2);

  return true;
}
