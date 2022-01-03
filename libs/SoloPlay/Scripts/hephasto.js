/**
*	@filename	hephasto.js
*	@author		kolton, theBGuy
*	@desc		kill Hephasto the Armorer
*/

function hephasto() {
	print('ÿc8Kolbot-SoloPlayÿc0: starting hephasto');
	me.overhead("starting hephasto");
	Town.doChores();
	Town.buyPots(10, "Thawing");
	Town.drinkPots();
	Town.buyPots(10, "Antidote");
	Town.drinkPots();

	Pather.checkWP(sdk.areas.RiverofFlame, true) ? Pather.useWaypoint(sdk.areas.RiverofFlame) : Pather.getWP(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
	}

	try {
		Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
	} catch (err) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto');
	}

	Pickit.pickItems();

	return true;
}
