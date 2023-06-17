/**
*  @filename    nith.js
*  @author      theBGuy
*  @credit      kolton
*  @desc        kill Nihlathak for Destruction key
*
*/

function nith () {
  Town.doChores();
  myPrint("starting nith");

  Pather.checkWP(sdk.areas.HallsofPain, true) ? Pather.useWaypoint(sdk.areas.HallsofPain) : Pather.getWP(sdk.areas.HallsofPain);
  Precast.doPrecast(false);

  if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to go to Nihlathak");
    
    return true;
  }

  Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.NihlathaksPlatform);

  // Stop script in hardcore mode if vipers are found
  if (me.hardcore && Game.getMonster(sdk.monsters.TombViper2)) {
    console.log("Tomb Vipers found.");

    return true;
  }

  Attack.killTarget(sdk.monsters.Nihlathak);
  Pickit.pickItems();

  return true;
}
