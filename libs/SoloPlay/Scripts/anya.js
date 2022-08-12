/**
*  @filename    anya.js
*  @author      isid0re, theBGuy
*  @desc        Anya rescue from frozen river
*
*/

function anya () {
	Town.townTasks();
	Town.goToTown(5);
	myPrint("starting anya");

	if (!me.anya) {
		Pather.checkWP(sdk.areas.CrystalizedPassage, true) ? Pather.useWaypoint(sdk.areas.CrystalizedPassage) : Pather.getWP(sdk.areas.CrystalizedPassage);
		Precast.doPrecast(true);
		Pather.clearToExit(sdk.areas.CrystalizedPassage, sdk.areas.FrozenRiver, Pather.useTeleport());

		if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform)) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Anya");
			return false;
		}

		let frozenanya = Game.getObject(sdk.objects.FrozenAnya);
		// todo - tele char can lure frozenstein away from anya as he can be hard to kill
		// aggro the pack then move back until there isn't any monster around anya (note) we can only detect mobs around 40 yards of us
		// then should use a static location behind anya as our destination to tele to
		if (frozenanya) {
			Pather.moveToUnit(frozenanya);
			Packet.entityInteract(frozenanya);
			delay(1200);
			me.cancel();
		}

		Town.npcInteract("malah");
		Town.doChores();
		if (!Misc.poll(() => {
			Pather.usePortal(sdk.areas.FrozenRiver, me.name);
			return me.inArea(sdk.areas.FrozenRiver);
		}, Time.seconds(30), 1000)) throw new Error("Anya quest failed - Failed to return to frozen river");

		frozenanya = Game.getObject(sdk.objects.FrozenAnya);	// Check again in case she's no longer there from first intereaction
		
		if (frozenanya) {
			for (let i = 0; i < 3; i++) {
				frozenanya.distance > 5 && Pather.moveToUnit(frozenanya, 1, 2);
				Packet.entityInteract(frozenanya);
				if (Misc.poll(() => frozenanya.mode, Time.seconds(2), 50)) {
					me.cancel() && me.cancel();
					break;
				}
				Attack.clearPos(frozenanya.x, frozenanya.y, 15);
			}
		}

		Town.goToTown(5);
		Town.npcInteract("malah");
		Quest.unfinishedQuests();
		Town.doChores();
		Town.npcInteract("anya");
	}

	if (me.anya) {
		!Pather.getPortal(sdk.areas.NihlathaksTemple) && Town.npcInteract("anya");
		if (!Pather.usePortal(sdk.areas.NihlathaksTemple)) return true;

		Precast.doPrecast(true);
		Pather.moveTo(10058, 13234);
		Attack.killTarget(getLocaleString(sdk.locale.monsters.Pindleskin));
		Pickit.pickItems();
	}

	return true;
}
