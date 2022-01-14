/*
*	@filename	duriel.js
*	@author		isid0re, theBGuy
*	@desc		duriel quest
*/

function duriel () {
	Quest.preReqs();
	Quest.cubeItems(91, 92, 521);
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting duriel');
	me.overhead("duriel");

	Pather.checkWP(sdk.areas.CanyonofMagic, true) ? Pather.useWaypoint(sdk.areas.CanyonofMagic) : Pather.getWP(sdk.areas.CanyonofMagic);
	Precast.doPrecast(true);
	Pather.moveToExit(getRoom().correcttomb, true);
	Pather.moveToPreset(me.area, 2, 152);
	Attack.securePosition(me.x, me.y, 30, 3000, true, me.hell);
	Quest.placeStaff();
	Town.doChores();
	Town.buyPots(10, "Thawing"); // thawing
	Town.drinkPots();

	let oldMercWatch = Config.MercWatch;
	Config.MercWatch = false;

	Pather.usePortal(null, me.name);
	delay(1000 + me.ping);

	let unit = Misc.poll(function () { return getUnit(2, 100); });

	if (me.sorceress && unit && Skill.useTK(unit)) {
		for (let i = 0; i < 3; i++) {
			if (me.area !== sdk.areas.DurielsLair) Skill.cast(43, 0, unit);
			if (me.area === sdk.areas.DurielsLair) {
				break;
			}
		}

		if (me.area !== sdk.areas.DurielsLair && !Pather.useUnit(2, 100, sdk.areas.DurielsLair)) {
			Attack.clear(10);
			Pather.useUnit(2, 100, sdk.areas.DurielsLair);
		}
	} else {
		Pather.useUnit(2, 100, sdk.areas.DurielsLair);
	}

	me.sorceress && !me.normal ? Attack.pwnDury() : Attack.killTarget("Duriel");

	Pickit.pickItems();

	if (!me.duriel && !Misc.checkQuest(14, 3)) {
		Quest.tyraelTomb();
	}

	if (Misc.checkQuest(14, 3)) {
		for (let i = 0; i < 3; i++) {
			if (!me.duriel && !Misc.checkQuest(14, 4)) {
				Town.move("palace");
				Town.npcInteract("jerhyn");
			}

			if (Misc.checkQuest(14, 4)) {
				Pather.moveToExit(50, true);
				break;
			} else {
				delay(250 + me.ping);
			}
		}
	}

	Pather.changeAct();
	Config.MercWatch = oldMercWatch;

	return true;
}
