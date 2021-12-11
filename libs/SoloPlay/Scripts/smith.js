/*
*	@filename	smith.js
*	@author		theBGuy, isid0re
*	@desc		Tools of the Trade quest for imbue reward.
*/

function smith () {
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

	if (!Pather.moveToPreset(sdk.areas.Barracks, sdk.unittype.Object, 108)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to the Smith");
		return false;
	}

	try {
		Attack.clear(20, 0, sdk.monsters.TheSmith);
	} catch (err) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to kill Smith');
	}

	Quest.collectItem(sdk.items.quest.HoradricMalus, 108);
	Pickit.pickItems();
	Town.goToTown();
	Town.npcInteract("charsi");
	Pather.usePortal(null, me.name);
	Pather.getWP(sdk.areas.JailLvl1);
	Pather.useWaypoint(sdk.areas.RogueEncampment);

	return true;
}
