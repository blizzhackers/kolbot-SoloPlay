/**
*	@filename	nith.js
*	@author		theBGuy
* 	@credit		kolton
*	@desc		kill Nihlathak for Destruction key
*/

function nith() {
	Town.doChores();
	print('ÿc8Kolbot-SoloPlayÿc0: starting nith');
	me.overhead("nith");

	if (!Pather.checkWP(sdk.areas.HallsofPain)) {
		Pather.getWP(sdk.areas.HallsofPain);
	} else {
		Pather.useWaypoint(sdk.areas.HallsofPain);
	}

	Precast.doPrecast(false);

	if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to go to Nihlathak");
		
		return true;
	}

	Pather.moveToPreset(me.area, 2, 462);

	// Stop script in hardcore mode if vipers are found
	if (me.playertype && getUnit(1, 597)) {
		print("Tomb Vipers found.");

		return true;
	}

	Attack.killTarget(526); // Nihlathak
	Pickit.pickItems();

	return true;
}
