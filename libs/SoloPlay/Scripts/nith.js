/**
*	@filename	nith.js
*	@author		theBGuy
* 	@credit		kolton
*	@desc		kill Nihlathak for Destruction key
*/

function nith() {
	Town.doChores();
	console.log("ÿc8Kolbot-SoloPlayÿc0: starting nith");
	me.overhead("nith");

	Pather.checkWP(sdk.areas.HallsofPain, true) ? Pather.useWaypoint(sdk.areas.HallsofPain) : Pather.getWP(sdk.areas.HallsofPain);
	Precast.doPrecast(false);

	if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) {
		console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to go to Nihlathak");
		
		return true;
	}

	Pather.moveToPreset(me.area, sdk.unittype.Object, 462);

	// Stop script in hardcore mode if vipers are found
	if (me.hardcore && Game.getMonster(597)) {
		console.log("Tomb Vipers found.");

		return true;
	}

	Attack.killTarget(526); // Nihlathak
	Pickit.pickItems();

	return true;
}
