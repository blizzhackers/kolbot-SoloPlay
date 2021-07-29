/**
*	@filename	hephasto.js
*	@author		kolton
*	@desc		kill Hephasto the Armorer
*/

function hephasto() {
	Town.doChores();
	Town.buyPots(10, "Thawing"); // thawing
	Town.drinkPots();
	Town.buyPots(10, "Antidote"); // antidote
	Town.drinkPots();

	print('ÿc9GuysSoloLevelingÿc0: starting hephasto');
	me.overhead("starting hephasto");

	if (!Pather.checkWP(107)) {
		Pather.getWP(107);
	} else {
		Pather.useWaypoint(107);
	}

	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print("ÿc9GuysSoloLevelingÿc0: Failed to move to Hephasto");
	}

	try {
		Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
	} catch (err) {
		print('ÿc9GuysSoloLevelingÿc0: Failed to kill Hephasto');
	}

	Pickit.pickItems();

	return true;
}
