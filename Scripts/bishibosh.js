/**
*  @filename    bishibosh.js
*  @author      theBGuy
*  @desc        kill Bishibosh
*
*/

function bishibosh () {
  if (!me.inArea(sdk.areas.ColdPlains)) {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.ColdPlains);
  }
  Precast.doPrecast(true);
  const BISHIBOSH = getLocaleString(sdk.locale.monsters.Bishibosh);
  let bishDead = false;

  Pather.moveToPresetMonster(sdk.areas.ColdPlains, sdk.monsters.preset.Bishibosh, { callback: function () {
    let bishi = Game.getMonster(BISHIBOSH);
    if (bishi && (bishi.distance < 10 || bishi.dead)) {
      bishi.dead && (bishDead = true);
      return true;
    }
    return false;
  } });
  !bishDead && Attack.clear(15, 0, BISHIBOSH);
  Pickit.pickItems();

  return true;
}
