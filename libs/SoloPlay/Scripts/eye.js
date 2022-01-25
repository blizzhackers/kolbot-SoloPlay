/*
*	@filename	eye.js
*	@author		isid0re, theBGuy
*	@desc		get the eye for khalims will
*/

function eye () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting eye');
	me.overhead("eye");

	Pather.checkWP(sdk.areas.SpiderForest, true) ? Pather.useWaypoint(sdk.areas.SpiderForest) : Pather.getWP(sdk.areas.SpiderForest);
	Precast.doPrecast(true);

	if (!Pather.moveToExit([sdk.areas.SpiderForest, sdk.areas.SpiderCavern], true)) {
		if (me.area !== sdk.areas.SpiderCavern) {
			if (!Pather.journeyTo(sdk.areas.SpiderCavern)) {
				print('ÿc8Kolbot-SoloPlayÿc0: Failed to get the eye');
				return false;
			}
		}
	}

	Town.doChores();
	Town.buyPots(10, "Antidote", true);
	Pather.usePortal(sdk.areas.SpiderCavern, me.name);
	Pather.moveToPreset(me.area, 2, 407);
	Attack.clear(0x7);
	Quest.collectItem(sdk.items.quest.KhalimsEye, 407);
	Quest.stashItem(sdk.items.quest.KhalimsEye);

	return me.getItem(sdk.items.quest.KhalimsEye);
}
