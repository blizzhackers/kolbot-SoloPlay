/*
*	@filename	radament.js
*	@author		isid0re
*	@desc		radament quest for skillbook
*/

function radament () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting radament');
	me.overhead("radament");

	if (!Pather.checkWP(sdk.areas.A2SewersLvl2, true)) {
		Town.goToTown(2);
		Pather.moveToExit(sdk.areas.A2SewersLvl1, true);
		Pather.getWP(sdk.areas.A2SewersLvl2);
	} else {
		Pather.useWaypoint(sdk.areas.A2SewersLvl2);
	}

	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.A2SewersLvl2, sdk.areas.A2SewersLvl3, true);
	Pather.moveToPreset(me.area, 2, 355);
	Attack.killTarget("Radament");
	Pickit.pickItems();

	if (Misc.checkQuest(9, 1)) {
		Town.npcInteract("atma");
		me.cancelUIFlags();

		let book = me.getItem(sdk.items.quest.BookofSkill);
		if (book) {
			book.isInStash && Town.openStash() && delay(300 + me.ping);
			book.interact();
			delay(500 + me.ping) && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
		}
	}

	return true;
}
