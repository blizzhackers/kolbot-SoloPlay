/**
*	@filename	corpsefire.js
*	@author		theBGuy
*	@desc		clear den, kill corpsefire not for quest
*/

function corpsefire() {
	Town.doChores();
	Town.buyPots(10, "Thawing");
	Town.drinkPots();
	Town.buyPots(10, "Antidote");
	Town.drinkPots();

	print('ÿc8Kolbot-SoloPlayÿc0: starting corpsefire');
	me.overhead("starting corpsefire");

	Pather.checkWP(sdk.areas.ColdPlains, true) ? Pather.useWaypoint(sdk.areas.ColdPlains) : Pather.getWP(sdk.areas.ColdPlains);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.ColdPlains, sdk.areas.BloodMoor, true);
	Pather.clearToExit(sdk.areas.BloodMoor, sdk.areas.DenofEvil, true);
	Attack.clearLevel();

	return true;
}
