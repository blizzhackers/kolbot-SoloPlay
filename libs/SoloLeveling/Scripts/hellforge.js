/*
*	@filename	hellforge.js
*	@author		isid0re
*	@desc		get the forge quest for rune drops for gear.
*/

function hellforge () {
	NTIP.addLine("[name] == hellforgehammer");
	NTIP.addLine("[name] == mephisto'ssoulstone");

	Town.townTasks();
	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();
	
	print('ÿc9SoloLevelingÿc0: starting hellforge');
	me.overhead("hellforge");

	if (!Pather.checkWP(107)) {
		Pather.getWP(107);
	} else {
		Pather.useWaypoint(107);
	}

	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print("ÿc9SoloLevelingÿc0: Failed to move to Hephasto");
	}

	try {
		Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
	} catch (err) {
		print('ÿc9SoloLevelingÿc0: Failed to kill Hephasto');
	}

	Pickit.pickItems();

	Town.doChores();
	Town.npcInteract("cain");

	// From SoloLeveling Commit eb818af
	if (me.getItem(90)) {
		if ([2, 69, 70].indexOf(Item.getEquippedItem(5).itemType) === -1) { //dual weild fix for assassin/barbarian
			Item.removeItem(5);
		}

		Quest.equipItem(90, 4);
	}

	Pather.usePortal(107, me.name);

	if (!me.getItem(90)) {
		Pickit.pickItems();
		Quest.equipItem(90, 4);
	}

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print('ÿc9SoloLevelingÿc0: Failed to move to forge');
	}

	Attack.clear(15);
	let forge = getUnit(2, 376);
	Misc.openChest(forge);
	delay(250 + me.ping * 2);
	Quest.smashSomething(376);
	delay(4500 + me.ping);
	Pickit.pickItems();
	Item.autoEquip();
	Town.npcInteract("cain");

	return true;
}
