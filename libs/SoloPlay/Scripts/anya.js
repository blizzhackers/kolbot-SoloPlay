/**
*  @filename    anya.js
*  @author      theBGuy
*  @desc        Anya rescue from frozen river
*
*/

function anya () {
	Town.doChores(false, { fullChores: true });
	Town.goToTown(5);
	myPrint("starting anya");

	Pather.checkWP(sdk.areas.CrystalizedPassage, true) ? Pather.useWaypoint(sdk.areas.CrystalizedPassage) : Pather.getWP(sdk.areas.CrystalizedPassage);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.CrystalizedPassage, sdk.areas.FrozenRiver, Pather.useTeleport());

	if (!Pather.moveToPresetObject(me.area, sdk.objects.FrozenAnyasPlatform, { callback: () => {
		let fStein = Game.getMonster(getLocaleString(sdk.locale.monsters.Frozenstein));
		// let frozenanya = Game.getObject(sdk.objects.FrozenAnya);
		return (fStein && fStein.distance < 30) /*&& /* (frozenanya && frozenanya.distance < 35) */;
	}})) {
		console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Anya");
		return false;
	}

	let presetLoc = Game.getPresetObject(me.area, sdk.objects.FrozenAnyasPlatform).realCoords();
	let fStein = Game.getMonster(getLocaleString(sdk.locale.monsters.Frozenstein));

	if (presetLoc && fStein && getDistance(presetLoc, fStein) < 15) {
		// need to write a clearWhile function
		Attack.clear(15, sdk.monsters.spectype.All, fStein);
	}

	let frozenanya = Game.getObject(sdk.objects.FrozenAnya);

	if (!frozenanya) {
		Pather.moveToEx(presetLoc.x, presetLoc.y, { callback: () => Game.getObject(sdk.objects.FrozenAnya)});
		frozenanya = Game.getObject(sdk.objects.FrozenAnya);
	}

	// todo - tele char can lure frozenstein away from anya as he can be hard to kill
	// aggro the pack then move back until there isn't any monster around anya (note) we can only detect mobs around 40 yards of us
	// then should use a static location behind anya as our destination to tele to
	if (frozenanya) {
		if (me.sorceress && Skill.haveTK) {
			Attack.getIntoPosition(frozenanya, 15, sdk.collision.LineOfSight, Pather.canTeleport(), true);
			Packet.telekinesis(frozenanya);
		} else {
			Pather.moveToUnit(frozenanya);
			Packet.entityInteract(frozenanya);
		}
		Misc.poll(() => getIsTalkingNPC(), 2000, 50);
		me.cancel() && me.cancel();
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
			if (getIsTalkingNPC()) {
				// in case we failed to interact the first time this prevent us from crashing if her dialog is going
				me.cancel() && me.cancel();
			}
			Attack.clearPos(frozenanya.x, frozenanya.y, 15);
		}
	}

	Town.goToTown(5);
	Town.npcInteract("malah");
	Quest.unfinishedQuests();
	Town.doChores();
	Town.npcInteract("anya");

	return true;
}
