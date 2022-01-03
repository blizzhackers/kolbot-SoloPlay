/*
*	@filename	hellforge.js
*	@author		isid0re, theBGuy
*	@desc		get the forge quest for rune drops for gear.
*/

function hellforge () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting hellforge');
	me.overhead("hellforge");
	Town.townTasks();
	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();
	
	Pather.checkWP(sdk.areas.RiverofFlame, true) ? Pather.useWaypoint(sdk.areas.RiverofFlame) : Pather.getWP(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
	}

	try {
		Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
	} catch (err) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto');
	}

	Pickit.pickItems();

	Town.doChores();
	Town.npcInteract("cain");

	// From SoloLeveling Commit eb818af
	if (me.getItem(sdk.items.quest.HellForgeHammer)) {
		// Dual weild fix for assassin/barbarian
		if ([2, 69, 70].indexOf(Item.getEquippedItem(5).itemType) === -1) {
			Item.removeItem(5);
		}

		Quest.equipItem(sdk.items.quest.HellForgeHammer, 4);
	}

	Pather.usePortal(sdk.areas.RiverofFlame, me.name);

	if (!me.getItem(sdk.items.quest.HellForgeHammer)) {
		Pickit.pickItems();
		Quest.equipItem(sdk.items.quest.HellForgeHammer, 4);
	}

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to move to forge');
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
