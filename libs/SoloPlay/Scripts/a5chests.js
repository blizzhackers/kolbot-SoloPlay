/**
*  @filename    a5chests.js
*  @author      theBGuy
*  @desc        Open super-chests in configured act 5 areas
*
*/

function a5chests() {
  const areas = [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit, sdk.areas.GlacialTrail, sdk.areas.DrifterCavern, sdk.areas.IcyCellar];
  
  myPrint("starting a5 chests");
  Town.doChores();

  for (let i = 0; i < areas.length; i++) {
    try {
      if (!Pather.canTeleport() && me.nightmare && [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit].includes(areas[i])) {
        continue;
      } else if (!Pather.canTeleport() && me.nightmare && me.charlvl >= 70 && [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit, sdk.areas.GlacialTrail, sdk.areas.DrifterCavern].includes(areas[i])) {
        continue;
      }

      myPrint("Moving to " + getAreaName(areas[i]));
      Pather.journeyTo(areas[i]);
      Precast.doPrecast();
      Misc.openChestsInArea(areas[i]);
      Town.doChores();
    } catch (e) {
      console.debug("ÿc8Kolbot-SoloPlayÿc0: Failed to move to " + getAreaName(areas[i]), e);
      continue;
    }
  }

  return true;
}
