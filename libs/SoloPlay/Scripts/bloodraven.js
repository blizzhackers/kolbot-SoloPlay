/*
*	@filename	bloodraven.js
*	@author		isid0re
*	@desc		kill bloodraven for free merc normal a1 and maus MF hunting for endgame
*/

function bloodraven () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting blood raven');

	if (!Pather.checkWP(sdk.areas.StonyField)) {
		Pather.getWP(sdk.areas.StonyField);
		
		if (me.normal) {
			Attack.clearLevelUntilLevel(6);
		}
	} else {
		Pather.useWaypoint(sdk.areas.ColdPlains);
	}

	Precast.doPrecast(true);

	if (me.normal) {
		me.overhead("blood raven");
		Pather.moveToExit([sdk.areas.ColdPlains, sdk.areas.BurialGrounds], true);
		Pather.moveToPreset(sdk.areas.BurialGrounds, 1, 805);
		Attack.killTarget("Blood Raven");
		Pickit.pickItems();
		
		if (!me.bloodraven) {
			Town.npcInteract("kashya");
		}

		return true;
	} else if (!Attack.IsAuradin || !Check.haveItem("armor", "runeword", "Enigma") || !Pather.accessToAct(3)) {
		me.overhead("blood raven");
		Pather.moveToExit([sdk.areas.ColdPlains, sdk.areas.BurialGrounds], true);
		if (me.sorceress) {
			Pather.moveToPreset(sdk.areas.BurialGrounds, 1, 805, 10);
		} else {
			Pather.moveToPreset(sdk.areas.BurialGrounds, 1, 805);
		}

		Attack.killTarget("Blood Raven");
		Pickit.pickItems();

		if (me.paladin && (!Attack.IsAuradin || !Check.haveItem("armor", "runeword", "Enigma"))) {
			return true;
		}
	}

	me.overhead("mausoleum");

	if (!Pather.moveToExit([sdk.areas.BurialGrounds, sdk.areas.Mausoleum], true)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Mausoleum");
	}

	Attack.clearLevel();

	if (me.hell && me.charlvl >= 80 && me.charlvl <= 85 && ((me.sorceress || me.druid || me.assassin) && Item.getEquippedItem(4).tier < 100000)) {
		me.overhead("crypt");
		Pather.journeyTo(sdk.areas.Crypt);
		Attack.clearLevel();
	}

	return true;
}
