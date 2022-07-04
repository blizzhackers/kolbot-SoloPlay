/**
*	@filename	nith.js
*	@author		theBGuy
* 	@credit		kolton
*	@desc		kill Nihlathak for Destruction key
*/

function nith() {
	Town.doChores();
	myPrint('starting nith');

	Pather.checkWP(sdk.areas.HallsofPain, true) ? Pather.useWaypoint(sdk.areas.HallsofPain) : Pather.getWP(sdk.areas.HallsofPain);
	Precast.doPrecast(false);

	if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) {
		myPrint("Failed to go to Nihlathak");
		
		return true;
	}

	Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.units.objects.NihlathaksPlatform);

	// Stop script in hardcore mode if vipers are found
	if (me.hardcore && getUnit(sdk.unittype.Monster, sdk.monsters.TombViper2)) {
		myPrint("Tomb Vipers found.");

		return true;
	}

	Attack.killTarget(sdk.units.monsters.Nihlathak);
	Pickit.pickItems();

	return true;
}
