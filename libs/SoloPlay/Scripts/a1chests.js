/**
*  @filename    a1chests.js
*  @author      theBGuy
*  @desc        Open super-chests in configured act 1 areas
*
*/

function a1chests() {
  const areas = [sdk.areas.CaveLvl2, sdk.areas.UndergroundPassageLvl2, sdk.areas.HoleLvl2, sdk.areas.PitLvl2];
  
  myPrint("starting a1 chests");
  Town.doChores();

  for (let i = 0; i < areas.length; i++) {
    try {
      // Don't run pits for its chest, when it was cleared during the pits script
      if ((SoloIndex.doneList.includes("pits") || me.barbarian) && areas[i] === sdk.areas.PitLvl2) {
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
