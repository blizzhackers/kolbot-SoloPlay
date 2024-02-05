/**
*  @filename    hephasto.js
*  @author      kolton, theBGuy
*  @desc        kill Hephasto the Armorer
*
*/

function hephasto () {
  myPrint("starting hephasto");
  Town.doChores(null, { thawing: me.coldRes < 75, antidote: me.poisonRes < 75 });

  Pather.checkWP(sdk.areas.RiverofFlame, true) ? Pather.useWaypoint(sdk.areas.RiverofFlame) : Pather.getWP(sdk.areas.RiverofFlame);
  Precast.doPrecast(true);

  if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HellForge)) {
    console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
  }

  try {
    Attack.killTarget(getLocaleString(sdk.locale.monsters.HephastoTheArmorer));
  } catch (err) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto");
  }

  Pickit.pickItems();

  return true;
}
