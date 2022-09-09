/**
*  @filename    den.js
*  @author      theBGuy
*  @desc        den quest
*
*/

function den () {
	const customGoToTown = function () {
		if (me.inTown) return;
		if (!Town.canTpToTown()) {
			Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.ColdPlains], true);
			Pather.getWP(sdk.areas.ColdPlains);
			Pather.useWaypoint(sdk.areas.RogueEncampment);
		} else {
			Town.goToTown();
		}
	};

	myPrint("starting den");

	me.gold > 500 && Town.initNPC("repair", "shopItems") && Town.shopItems(500, [sdk.items.type.Bow, sdk.items.type.Crossbow, sdk.items.type.Belt]);
	me.gold > 1000 && Town.buyPots(12, "stamina", true);

	if (!Pather.checkWP(sdk.areas.ColdPlains) || me.charlvl < 4) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);

		try {
			if (me.charlvl < 2) {
				let cPlains = Pather.getExitCoords(me.area, sdk.areas.ColdPlains);
				// sort by the ones closest to us but also by distance to cold plains exit so we end up there
				Game.getPresetObjects(me.area)
					.filter(el => Misc.presetShrineIds.includes(el.id) || Misc.presetChestIds.includes(el.id))
					.sort((a, b) => {
						let [aX, aY] = [a.roomx * 5 + a.x, a.roomy * 5 + a.y];
						let [bX, bY] = [b.roomx * 5 + b.x, b.roomy * 5 + b.y];
						if ([aX, aY].distance < [bX, bY].distance && getDistance(aX, aY, cPlains.x, cPlains.y) > getDistance(bX, bY, cPlains.x, cPlains.y)) {
							return -1;
						}
						if ([aX, aY].distance > [bX, bY].distance && getDistance(aX, aY, cPlains.x, cPlains.y) < getDistance(bX, bY, cPlains.x, cPlains.y)) {
							return 1;
						}
						return [aX, aY].distance - [bX, bY].distance;
					})
					.forEach(el => Pather.moveNearUnit(el, 7));
			} else {
				Pather.moveNearPreset(sdk.areas.BloodMoor, sdk.unittype.Object, sdk.objects.SuperChest, 8) && Misc.openChests(8);
			}
		} catch (e) {
			console.warn(e.message ? e.message : e);
		}
		Pather.getWP(sdk.areas.ColdPlains);

		// check if we need to do chores - if so use waypoint to town (preserves portal if we made one at den) - return to cold plains using waypoint
		Storage.Inventory.UsedSpacePercent() > 50 && Pather.useWaypoint(sdk.areas.RogueEncampment) && Town.doChores() && Pather.useWaypoint(sdk.areas.ColdPlains);
	}

	if (me.charlvl < 8) {
		me.sorceress && me.charlvl >= 2 && me.charlvl <= 5 && Loader.skipTown.push("bishibosh") && Loader.runScript("bishibosh");
		Loader.skipTown.push("cave") && Loader.runScript("cave");
	}

	if (me.charlvl < 8 || me.gold < 1000) {
		SoloIndex.retryList.push("den");
		return true;
	}

	Town.doChores(false, (me.charlvl < 18 ? { stamina: true } : {}));
	Town.move("portalspot");

	// Check if there are any portals before trying to use one
	let p = Game.getObject(sdk.objects.BluePortal);
	
	if (!!p && [sdk.areas.BloodMoor, sdk.areas.DenofEvil].includes(p.objtype)) {
		Pather.usePortal(null, me.name);
	} else {
		Pather.moveToExit(sdk.areas.BloodMoor, true);
	}

	// START
	let attempt = 1;
	let killTracker = false;
	let denLights = false;
	Precast.doPrecast(true);
	Attack.clear(20);
	Pather.moveToExit(sdk.areas.DenofEvil, true);

	this.denLightsListener = function (bytes = []) {
		if (!bytes.length) return;
		// d2gs unique event - den lights
		if (bytes[0] === 0x89) {
			denLights = true;
		}
	};

	if (me.inArea(sdk.areas.DenofEvil)) {
		addEventListener("gamepacket", this.denLightsListener);
		const Worker = require("../../modules/Worker");
		let corpsefire;
		let corpseTick = getTickCount();

		try {
			if (!me.normal) {
				Worker.runInBackground.corpseTracker = function () {
					if (killTracker) return false;
					if (me.inArea(sdk.areas.DenofEvil)) {
						if (getTickCount() - corpseTick < 1000) return true;
						corpseTick = getTickCount();
						corpsefire = Game.getMonster(getLocaleString(sdk.locale.monsters.Corpsefire));

						if (corpsefire) {
							if (!Attack.canAttack(corpsefire)) {
								killTracker = true;
								throw new Error("Exit den. Corpsefire is immune");
							} else {
								// we can attack, no need to run this in the background any longer
								return false;
							}
						}
					}

					return true;
				};
			}

			Worker.runInBackground.denLightsTracker = function () {
				if (killTracker) return false;
				if (me.inArea(sdk.areas.DenofEvil)) {
					if (denLights) {
						killTracker = true;
						throw new Error("EVENT :: DEN COMPLETE");
					}
				}

				return true;
			};

			while (!Misc.checkQuest(sdk.quest.id.DenofEvil, sdk.quest.states.Completed)) {
				console.log("ÿc8Kolbot-SoloPlayÿc0: Clearing den attempt: " + attempt);
				Attack.clearLevel();

				if (!me.inArea(sdk.areas.DenofEvil)) {
					break;
				}

				if (Misc.checkQuest(sdk.quest.id.DenofEvil, sdk.quest.states.PartyMemberComplete)) {
					customGoToTown();
					Town.npcInteract("akara");
					
					break;
				}

				if (attempt >= 5) {
					console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to complete den");
					customGoToTown();

					break;
				}

				attempt++;
			}

		} catch (e) {
			//
		} finally {
			removeEventListener("gamepacket", this.denLightsListener);
			SoloEvents.finishDen();
			killTracker = true;
			me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
		}
	}

	return true;
}
