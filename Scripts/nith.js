/**
*  @filename    nith.js
*  @author      theBGuy
*  @credit      kolton
*  @desc        kill Nihlathak for Destruction key
*
*/

function nith () {
  me.inTown && Town.doChores();
  myPrint("starting nith");

  if (Pather.checkWP(sdk.areas.HallsofPain, true)) {
    Pather.useWaypoint(sdk.areas.HallsofPain);
  } else {
    if (Pather.journeyTo(sdk.areas.NihlathaksTemple)) {
      Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain], true);
    }
  }
  Precast.doPrecast(false);

  if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to go to Nihlathak");
    
    return true;
  }

  // Stop script in hardcore mode if vipers are found
  // faster detection of TombVipers
  Pather.moveToPresetObject(me.area, sdk.objects.NihlathaksPlatform, { callback: () => {
    if (me.hardcore && Game.getMonster(sdk.monsters.TombViper2)) {
      console.log("Tomb Vipers found.");
      throw new ScriptError("Tomb Vipers found.");
    }
  } });

  Attack.killTarget(sdk.monsters.Nihlathak);
  Pickit.pickItems();

  return true;
}
