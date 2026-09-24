/**
*  @filename    eyeback.js
*  @author      kolton
*  @desc        kill Eyeback the Unleashed
*
*/

function eyeback () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.ArreatPlateau);
  Precast.doPrecast(true);

  if (!Pather.moveToPresetMonster(sdk.areas.FrigidHighlands, sdk.monsters.preset.EyebacktheUnleashed)) {
    throw new Error("Failed to move to Eyeback the Unleashed");
  }

  Attack.killTarget(getLocaleString(sdk.locale.monsters.EyebacktheUnleashed));

  return true;
}
