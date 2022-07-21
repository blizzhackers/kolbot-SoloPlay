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

		if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.units.FrozenAnyasPlatform)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Anya");
			return false;
		}

		let frozenanya = Game.getObject(sdk.units.FrozenAnya);

		if (frozenanya) {
			Pather.moveToUnit(frozenanya);
			Packet.entityInteract(frozenanya);
			delay(1200 + me.ping);
			me.cancel();
		}

		Town.npcInteract("malah");
		Town.doChores();
		if (!Misc.poll(() => {
			Pather.usePortal(sdk.areas.FrozenRiver, me.name);
			return me.area === sdk.areas.FrozenRiver;
		}, Time.seconds(30), 1000)) throw new Error("Anya quest failed - Failed to return to frozen river");

		frozenanya = Game.getObject(sdk.units.FrozenAnya);	// Check again in case she's no longer there from first intereaction
		if (!Misc.poll(() => {
			if (frozenanya) {
				Packet.entityInteract(frozenanya);
				delay(300 + me.ping);
				return frozenanya.mode;
			}
			return false;
		}, Time.seconds(30), 1000)) throw new Error("Anya quest failed - Failed to return to frozen river");

		Town.npcInteract("malah");
		Town.unfinishedQuests();
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
