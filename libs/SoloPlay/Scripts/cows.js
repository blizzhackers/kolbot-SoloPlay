/**
*	@filename	cows.js
*	@author		kolton, modified by isid0re and theBGuy for SoloPlay, leave if near cow king by theBGuy
*	@desc		clear the Moo Moo Farm without killing the Cow King
*/

function cows () {
	this.getLeg = function () {
		if (me.getItem(sdk.items.quest.WirtsLeg)) {
			return me.getItem(sdk.items.quest.WirtsLeg);
		}

		// Cain is incomplete, complete it then continue @isid0re
		if (!me.tristram) {
			if (!isIncluded("SoloPlay/Scripts/tristram.js")) {
				include("SoloPlay/Scripts/tristram.js");
			}

			for (let i = 0; i < 5; i++) {
				tristram();

				if (me.tristram) {
					break;
				}
			}

			if (!me.inTown) {
				Town.goToTown();
			}
		}

		Pather.useWaypoint(sdk.areas.StonyField);
		Precast.doPrecast(true);
		Pather.moveToPreset(sdk.areas.StonyField, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 8, 8);
		Pather.usePortal(sdk.areas.Tristram);

		if (me.area === sdk.areas.Tristram) {
			Pather.moveTo(25048, 5177);
			Quest.collectItem(sdk.items.quest.WirtsLeg, 268);
			Pickit.pickItems();
			Town.goToTown();
		} else {
			return false;
		}

		return me.getItem(sdk.items.quest.WirtsLeg);
	};

	this.openPortal = function (portalID, ...classIDS) {
		if (me.area !== sdk.areas.RogueEncampment) {
			Town.goToTown(1);
		}

		!Town.openStash() && console.log('ÿc8Kolbot-SoloPlayÿc0: Failed to open stash. (openPortal)');
		!Cubing.emptyCube() && console.log('ÿc8Kolbot-SoloPlayÿc0: Failed to empty cube. (openPortal)');

		if (!me.getItem(sdk.items.quest.WirtsLeg)) {
			return false;
		}

		let cubingItem;

		for (let classID of classIDS) {
			cubingItem = me.getItem(classID);

			if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
				return false;
			}
		}

		while (!Cubing.openCube()) {
			delay(1 + me.ping * 2);
			Packet.flash(me.gid);
		}

		let cowPortal;
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (Cubing.openCube()) {
				transmute();
				delay(750 + me.ping);
				cowPortal = Pather.getPortal(portalID);

				if (cowPortal) {
					break;
				}
			}
		}

		me.cancel();

		return true;
	};

	if (!me.diffCompleted) {
		print('ÿc8Kolbot-SoloPlayÿc0: Final quest incomplete, cannot make cows yet');
		return true;
	}

	// START
	Town.townTasks();
	myPrint('starting cows');

	if (!Pather.getPortal(sdk.areas.MooMooFarm) && !this.getLeg()) {
		return true;
	}
	
	Town.doChores();
	this.openPortal(sdk.areas.MooMooFarm, sdk.items.quest.WirtsLeg, sdk.items.TomeofTownPortal);
	Town.buyBook();

	if (Pather.canTeleport()) {
		Misc.getExpShrine([sdk.areas.StonyField, sdk.areas.DarkWood, sdk.areas.BlackMarsh]);
	} else {
		Misc.getExpShrine([sdk.areas.BloodMoor]);
	}
	
	Town.move("stash");

	if (Pather.usePortal(sdk.areas.MooMooFarm)) {
		const Worker = require('../../modules/Worker');
		let kingTick = getTickCount();
		let king;
		let kingPreset;

		Worker.runInBackground.kingTracker = function () {
			if (me.area === sdk.areas.MooMooFarm) {
				if (getTickCount() - kingTick < 1000) return true;
				kingTick = getTickCount();
				king = getUnit(sdk.unittype.Monster, getLocaleString(sdk.locale.monsters.TheCowKing));
				// only get the preset unit once
				!kingPreset && (kingPreset = getPresetUnit(me.area, sdk.unittype.Monster, sdk.monsters.preset.TheCowKing));

				if (king && kingPreset) {
					if (getDistance(me.x, me.y, getRoom(kingPreset.roomx * 5 + kingPreset.x), getRoom(kingPreset.roomy * 5 + kingPreset.y)) <= 25) {
						myPrint("exit cows. Near the king");
						throw new Error('ÿc8Kolbot-SoloPlayÿc0: exit cows. Near the king');
					}
				}
			}

			return true;
		};

		Precast.doPrecast(true);
		Common.Cows.clearCowLevel();
	}

	return true;
}
