/**
*  @filename    cows.js
*  @author      kolton, theBGuy
*  @desc        clear the Moo Moo Farm without killing the Cow King
*
*/

function cows () {
	this.getLeg = function () {
		if (me.getItem(sdk.items.quest.WirtsLeg)) {
			return me.getItem(sdk.items.quest.WirtsLeg);
		}

		// Cain is incomplete, complete it then continue @isid0re
		if (!me.tristram) {
			!isIncluded("SoloPlay/Scripts/tristram.js") && include("SoloPlay/Scripts/tristram.js");

			for (let i = 0; i < 5; i++) {
				tristram();

				if (me.tristram) {
					break;
				}
			}

			!me.inTown && Town.goToTown();
		}

		Pather.useWaypoint(sdk.areas.StonyField);
		Precast.doPrecast(true);
		Pather.moveToPreset(sdk.areas.StonyField, unit.isMonster, sdk.monsters.preset.Rakanishu, 8, 8);
		Pather.usePortal(sdk.areas.Tristram);

		if (me.area === sdk.areas.Tristram) {
			Pather.moveTo(25048, 5177);
			Quest.collectItem(sdk.items.quest.WirtsLeg, sdk.quest.chest.Wirt);
			Pickit.pickItems();
			Town.goToTown();
		} else {
			return false;
		}

		return me.getItem(sdk.items.quest.WirtsLeg);
	};

	this.openPortal = function (portalID, ...classIDS) {
		me.area !== sdk.areas.RogueEncampment && Town.goToTown(1);

		let npc, tome, scroll;
		let tpTome = me.findItems(sdk.items.TomeofTownPortal, 0, 3);

		try {
			if (tpTome.length < 2) {
				npc = Town.initNPC("Shop", "buyTpTome");

				if (!getInteractedNPC()) {
					throw new Error("Failed to find npc");
				}

				tome = npc.getItem(sdk.items.TomeofTownPortal);

				if (!!tome && tome.getItemCost(0) < me.gold && tome.buy()) {
					delay(500);
					tpTome = me.findItems(sdk.items.TomeofTownPortal, 0, 3);
					scroll = npc.getItem(sdk.items.ScrollofTownPortal);
					let scrollCost = scroll.getItemCost(0);
					tpTome.forEach(function (book) {
						while (book.getStat(sdk.stats.Quantity) < 20) {
							scroll = npc.getItem(sdk.items.ScrollofTownPortal);
							
							if (!!scroll && scrollCost < me.gold) {
								scroll.buy(true);
							} else {
								break;
							}

							delay(20);
						}
					});
				}
			}
		} finally {
			me.cancelUIFlags();
		}

		!Town.openStash() && console.log('ÿc8Kolbot-SoloPlayÿc0: Failed to open stash. (openPortal)');
		!Cubing.emptyCube() && console.log('ÿc8Kolbot-SoloPlayÿc0: Failed to empty cube. (openPortal)');

		if (!me.getItem(sdk.items.quest.WirtsLeg)) {
			return false;
		}

		for (let classID of classIDS) {
			let cubingItem = Game.getItem(classID)

			if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
				return false;
			}
		}

		Misc.poll(() => Cubing.openCube(), Time.seconds(10), 1000);

		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (Cubing.openCube()) {
				transmute();
				delay(750);
				let cowPortal = Pather.getPortal(portalID);

				if (cowPortal) {
					break;
				}
			}
		}

		me.cancel();
		Town.sortInventory();

		return true;
	};

	if (!me.diffCompleted) {
		console.log('ÿc8Kolbot-SoloPlayÿc0: Final quest incomplete, cannot make cows yet');
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

	// when does this become not worth it
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
				king = Game.getMonster(getLocaleString(sdk.locale.monsters.TheCowKing));
				// only get the preset unit once
				!kingPreset && (kingPreset = getPresetUnit(me.area, unit.isMonster, sdk.monsters.preset.TheCowKing));

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
