/**
*  @filename    hellforge.js
*  @author      theBGuy
*  @desc        get the forge quest for rune drops for gear.
*
*/

function hellforge () {
	myPrint("starting hellforge");
	Town.townTasks({thawing: me.coldRes < 75, antidote: me.poisonRes < 75});
	
	Pather.checkWP(sdk.areas.RiverofFlame, true) ? Pather.useWaypoint(sdk.areas.RiverofFlame) : Pather.getWP(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, sdk.unittype.Object, 376)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
	}

	try {
		Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
	} catch (err) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto");
	}

	Pickit.pickItems();
	let forge = Game.getObject(376);
	!!forge && Attack.clearPos(forge.x, forge.y, 25) && Attack.securePosition(forge.x, forge.y, 25, 3000);

	if (!me.getItem(sdk.items.quest.HellForgeHammer)) {
		// we don't have the hammer, is Hephasto dead?
		let heph = getUnits(1).filter((unit) => unit.classid === sdk.monsters.Hephasto).first();
		!!heph && heph.attackable && Attack.kill(heph);
		// hammer on ground?
		let ham = getUnits(4).filter((unit) => unit.classid === sdk.items.quest.HellForgeHammer).first();
		!!ham && [3, 5].includes(ham.mode) && Pather.moveToUnit(ham) && Pickit.pickItem(ham);
		// do we have the hammer now?
		if (!me.getItem(sdk.items.quest.HellForgeHammer)) {
			console.warn("Failed to collect Hellforge hammer");
			
			return true;
		}
	}

	Town.doChores();
	Town.npcInteract("cain");

	let oldItem = me.getItemsEx().filter(function (item) {
		return item.isEquipped && item.bodylocation === 4 && !item.isOnSwap;
	}).first();

	if (!Quest.equipItem(sdk.items.quest.HellForgeHammer, 4)) {
		console.warn("Failed to equip HellForge Hammer");

		return true;
	}
	
	Pather.usePortal(sdk.areas.RiverofFlame, me.name);

	if (!Pather.moveToPreset(me.area, sdk.unittype.Object, 376)) {
		console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to move to forge");

		return true;
	}

	Misc.openChest(376);
	Quest.smashSomething(376) && delay(4500 + me.ping);
	!!oldItem && oldItem.isInInventory && oldItem.equip(4);
	Pickit.pickItems();
	Item.autoEquip();
	Town.npcInteract("cain");

	return true;
}
