/*
*	@filename	bloodraven.js
*	@author		theBGuy
*	@desc		kill bloodraven for free merc normal and maus/crypt MF hunting for endgame
*/

function bloodraven () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting blood raven');

	if (!Pather.checkWP(sdk.areas.StonyField, true)) {
		Pather.getWP(sdk.areas.StonyField);
		me.charlvl < 6 && Attack.clearLevelUntilLevel(6);

	} else {
		Pather.useWaypoint(sdk.areas.ColdPlains);
	}

	Precast.doPrecast(true);

	me.overhead("blood raven");
	Pather.moveToExit(sdk.areas.BurialGrounds, true);
	me.sorceress && !me.normal ? Pather.moveToPreset(sdk.areas.BurialGrounds, 1, 805, 10) : Pather.moveToPreset(sdk.areas.BurialGrounds, 1, 805);
	Attack.killTarget("Blood Raven");
	Pickit.pickItems();

	if (me.normal && !me.bloodraven && Town.canTpToTown()) {
		Town.npcInteract("kashya");
		return true;
	} else if (me.paladin && Check.currentBuild().caster && !Pather.canTeleport()) {
		return true;
	}

	print('ÿc8Kolbot-SoloPlayÿc0: blood raven :: starting mausoleum');
	me.overhead("mausoleum");

	if (!Pather.moveToExit([sdk.areas.BurialGrounds, sdk.areas.Mausoleum], true)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Mausoleum");
	}

	me.area === sdk.areas.Mausoleum && Attack.clearLevel();

	if (me.hell) {
		switch (me.gametype) {
		case sdk.game.gametype.Classic:
			if (Pather.accessToAct(3)) {
				return true;
			}

			break;
		case sdk.game.gametype.Expansion:
			if ((me.charlvl < 80 || me.charlvl > 85) && !((me.sorceress || me.druid || me.assassin) && Item.getEquippedItem(4).tier < 100000)) {
				return true;
			}

			break;
		}
	} else {
		return true;
	}

	me.overhead("crypt");
	print('ÿc8Kolbot-SoloPlayÿc0: blood raven :: starting crypt');
	Pather.journeyTo(sdk.areas.Crypt) && Attack.clearLevel();
	
	return true;
}
