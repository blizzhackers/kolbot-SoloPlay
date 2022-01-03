/*
*	@filename	izual.js
*	@author		isid0re, theBGuy
*	@desc		izual quest for skillpoints
*/

function izual () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting izual');
	me.overhead("izual");

	Town.townTasks();
	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();

	Pather.checkWP(sdk.areas.CityoftheDamned, true) ? Pather.useWaypoint(sdk.areas.CityoftheDamned) : Pather.getWP(sdk.areas.CityoftheDamned);
	Precast.doPrecast(true);

	if (!Misc.checkQuest(25, 1)) {
		Pather.moveToPreset(sdk.areas.PlainsofDespair, 1, 256);
		Attack.killTarget("Izual");
	}

	Town.npcInteract("tyrael");

	return true;
}
