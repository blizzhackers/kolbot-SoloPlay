/*
*	@filename	bloodraven.js
*	@author		isid0re
*	@desc		kill bloodraven for free merc normal a1 and maus MF hunting for endgame
*/

function bloodraven () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting blood raven');

	if (!Pather.checkWP(4)) {
		Pather.getWP(4);
		Attack.clear(50);
	} else {
		Pather.useWaypoint(3);
	}

	Precast.doPrecast(true);

	if (me.normal) {
		me.overhead("blood raven");
		Pather.moveToExit([3, 17], true);
		Pather.moveToPreset(17, 1, 805);
		Attack.killTarget("Blood Raven");
		Pickit.pickItems();
		
		if (!me.bloodraven) {
			Town.npcInteract("kashya");
		}

		return true;
	} else if (me.paladin && !Attack.IsAuradin || (!Check.haveItem("armor", "runeword", "Enigma") || !Pather.accessToAct(3))) {
		me.overhead("blood raven");
		Pather.moveToExit([3, 17], true);
		Pather.moveToPreset(17, 1, 805);
		Attack.killTarget("Blood Raven");
		Pickit.pickItems();

		return true;
	}

	me.overhead("mausoleum");

	if (!Pather.moveToExit([17, 19], true)) {
		print("ÿc9SoloLevelingÿc0: Failed to move to Mausoleum");
	}

	Attack.clearLevel();

	if (me.hell && me.charlvl >= 80 && me.charlvl <= 85 && ((me.sorceress || me.druid || me.assassin) && Item.getEquippedItem(4).tier < 100000)) {
		me.overhead("crypt");
		Pather.journeyTo(18);
		Attack.clearLevel();
	}

	return true;
}
