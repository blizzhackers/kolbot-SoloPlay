/**
*  @filename    treehead.js
*  @author      theBGuy
*  @desc        kill Treehead
*
*/

function treehead () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.DarkWood);
  Precast.doPrecast(true);

  try {
    Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.InifussTree, 5, 5);
  } catch (e) {
    Attack.clear(5);
    // Try again
    if (Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.InifussTree, 5, 5)) {
      return false;
    }
  }

  Attack.killTarget(getLocaleString(sdk.locale.monsters.TreeheadWoodFist));

  return true;
}
