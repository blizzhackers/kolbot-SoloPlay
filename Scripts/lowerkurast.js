/**
*  @filename    lowerkurast.js
*  @author      isid0re, theBGuy
*  @desc        LK runs for MF, rune drops, and gold
*
*/

function lowerkurast () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting lower kurast");

  Pather.checkWP(sdk.areas.LowerKurast, true) ? Pather.useWaypoint(sdk.areas.LowerKurast) : Pather.getWP(sdk.areas.LowerKurast);
  Precast.doPrecast(true);
  Misc.openChestsInArea(sdk.areas.LowerKurast);

  return true;
}
