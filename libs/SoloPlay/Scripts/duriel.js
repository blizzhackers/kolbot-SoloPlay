/**
*  @filename    duriel.js
*  @author      isid0re, theBGuy
*  @desc        duriel quest
*
*/

function duriel () {
	// pre-tasks
	Quest.preReqs();
	Quest.cubeItems(91, 92, 521);

	// Start
	Town.townTasks();
	myPrint("starting duriel");
	Pather.checkWP(sdk.areas.CanyonofMagic, true) ? Pather.useWaypoint(sdk.areas.CanyonofMagic) : Pather.getWP(sdk.areas.CanyonofMagic);
	Precast.doPrecast(true);
	Pather.moveToExit(getRoom().correcttomb, true);
	Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.units.HoradricStaffHolder);
	Attack.securePosition(me.x, me.y, 30, 3000, true, me.hell);
	Quest.placeStaff();

	// quest-prep
	let preArea = me.area;
	Town.doChores(null, {thawing: me.coldRes < 75});

	let oldMercWatch = Config.MercWatch;
	Config.MercWatch = false;

	if (!Pather.usePortal(preArea, me.name)) {
		if (!Pather.journeyTo(preArea)) throw new Error("Failed to move back to duriels tomb");
	}

	// move to and kill dury
	let unit = Misc.poll(() => Game.getObject(sdk.units.PortaltoDurielsLair));

	if (me.sorceress && unit && Skill.useTK(unit)) {
		for (let i = 0; i < 3; i++) {
			me.area !== sdk.areas.DurielsLair && Packet.telekinesis(unit);
			if (me.area === sdk.areas.DurielsLair) {
				break;
			}
		}

		if (me.area !== sdk.areas.DurielsLair && !Pather.useUnit(sdk.unittype.Object, sdk.units.PortaltoDurielsLair, sdk.areas.DurielsLair)) {
			Attack.clear(10);
			Pather.useUnit(sdk.unittype.Object, sdk.units.PortaltoDurielsLair, sdk.areas.DurielsLair);
		}
	} else {
		Pather.useUnit(sdk.unittype.Object, sdk.units.PortaltoDurielsLair, sdk.areas.DurielsLair);
	}

	me.sorceress && !me.normal ? Attack.pwnDury() : Attack.killTarget("Duriel");
	Pickit.pickItems();

	!me.duriel && !Misc.checkQuest(sdk.quest.id.TheSevenTombs, 3) && Quest.tyraelTomb();

	if (Misc.checkQuest(sdk.quest.id.TheSevenTombs, 3)) {
		for (let i = 0; i < 3; i++) {
			if (!me.duriel && !Misc.checkQuest(sdk.quest.id.TheSevenTombs, 4)) {
				Town.move("palace");
				Town.npcInteract("jerhyn");
			}

			if (Misc.checkQuest(sdk.quest.id.TheSevenTombs, 4)) {
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
