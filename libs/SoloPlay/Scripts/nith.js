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

	if (!Pather.checkWP(123)) {
		Pather.getWP(123);
	} else {
		Pather.useWaypoint(123);
	}

	Precast.doPrecast(false);

	if (!Pather.moveToExit(124, true)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to go to Nihlathak");
		
		return true;
	}

	Pather.moveToPreset(me.area, 2, 462);

	if (me.playertype && getUnit(1, 597)) {
		print("Tomb Vipers found.");

		return true;
	}

	Attack.killTarget(526); // Nihlathak
	Pickit.pickItems();

	return true;
}
