/**
*  @filename    a5chests.js
*  @author      theBGuy
*  @desc        Open super-chests in configured act 5 areas
*
*/

function a5chests () {
  const areas = [];

  if (me.nightmare && !Pather.canTeleport()) {
    me.charlvl >= 70
      ? areas.push(sdk.areas.DrifterCavern, sdk.areas.IcyCellar)
      : areas.push(sdk.areas.GlacialTrail, sdk.areas.DrifterCavern, sdk.areas.IcyCellar);
  } else {
    areas.push(
      sdk.areas.Abaddon, sdk.areas.PitofAcheron,
      sdk.areas.InfernalPit, sdk.areas.GlacialTrail,
      sdk.areas.DrifterCavern, sdk.areas.IcyCellar
    );
  }

  myPrint("starting a5 chests");
  Town.doChores();

  areas.forEach(function (area) {
    try {
      myPrint("Moving to " + getAreaName(area));
      Pather.journeyTo(area);
      Precast.doPrecast();
      Misc.openChestsInArea(area);
      Town.doChores();
    } catch (e) {
      console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to " + getAreaName(area), e);
    }
  });

  return true;
}
