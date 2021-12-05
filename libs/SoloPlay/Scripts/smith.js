/*
*	@filename	smith.js
*	@author		theBGuy, isid0re
*	@desc		Tools of the Trade quest for imbue reward.
*/

function smith () {
	NTIP.addLine("[name] == horadricmalus");
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting smith');
	me.overhead("smith");

	if (!Pather.checkWP(sdk.areas.OuterCloister)) {
		Pather.getWP(sdk.areas.OuterCloister);
	} else {
		Pather.useWaypoint(sdk.areas.OuterCloister);
	}

	Precast.doPrecast(true);
	Pather.moveToExit(sdk.areas.Barracks);

	if (!Pather.moveToPreset(sdk.areas.Barracks, 2, 108)) {
		throw new Error("ÿc8Kolbot-SoloPlayÿc0: Failed to move to the Smith");
	}

	try {
		Attack.clear(20, 0, getLocaleString(2889)); // The Smith
	} catch (err) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to kill Smith');
	}

	Quest.collectItem(sdk.items.quest.HoradricMalus, 108);
	Pickit.pickItems();
	Town.goToTown();
	Town.npcInteract("charsi");
	Pather.usePortal(null, me.name);
	Pather.getWP(sdk.areas.JailLvl1);
	Pather.useWaypoint(1);

	return true;
}
