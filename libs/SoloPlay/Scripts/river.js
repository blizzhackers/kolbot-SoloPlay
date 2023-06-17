/**
*  @filename    river.js
*  @author      theBGuy
*  @desc        clear river of flame from city of the damned to hephasto then to the waypoint
*
*/

function river () {
  myPrint("starting river");

  Town.doChores(null, { thawing: me.coldRes < 75, antidote: me.poisonRes < 75 });

  Pather.checkWP(sdk.areas.CityoftheDamned, true) ? Pather.useWaypoint(sdk.areas.CityoftheDamned) : Pather.getWP(sdk.areas.CityoftheDamned);
  Precast.doPrecast(true);
  Pather.clearToExit(sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame, true);

  if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HellForge)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
  }

  try {
    Attack.clear(20, 0, sdk.monsters.Hephasto);
  } catch (err) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto");
  }

  Pather.getWP(sdk.areas.RiverofFlame, true);

  return true;
}
