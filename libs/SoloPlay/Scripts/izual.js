/*
*	@filename	izual.js
*	@author		isid0re, theBGuy
*	@desc		izual for quest and xp
*/

function izual () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting izual');
	me.overhead("izual");

	Town.townTasks();
	Town.buyPots(10, "Antidote");
	Town.drinkPots();
	Town.buyPots(10, "Thawing");
	Town.drinkPots();

	Pather.checkWP(sdk.areas.CityoftheDamned, true) ? Pather.useWaypoint(sdk.areas.CityoftheDamned) : Pather.getWP(sdk.areas.CityoftheDamned);
	Precast.doPrecast(true);
	Pather.moveToPreset(sdk.areas.PlainsofDespair, 1, 256);
	Attack.killTarget("Izual");

	if (!Misc.checkQuest(25, 0)) {
		Town.goToTown();
		Town.npcInteract("tyrael");
		me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
	}

	return true;
}
