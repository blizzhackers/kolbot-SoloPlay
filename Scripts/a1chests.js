/**
*  @filename    a1chests.js
*  @author      theBGuy
*  @desc        Open super-chests in configured act 1 areas
*
*/

function a1chests () {
  myPrint("starting a1 chests");
  Town.doChores();

  [sdk.areas.CaveLvl2, sdk.areas.UndergroundPassageLvl2, sdk.areas.HoleLvl2, sdk.areas.PitLvl2]
    .forEach(function (area) {
      try {
        // Don't run pits for its chest, when it was cleared during the pits script
        if ((SoloIndex.doneList.includes("pits") || me.barbarian) && area === sdk.areas.PitLvl2) {
          return;
        }

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
