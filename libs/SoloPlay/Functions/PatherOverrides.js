/**
*  @filename    PatherOverrides.js
*  @author      theBGuy
*  @credit      autosmurf (handling monster doors based on the rescue barbs script)
*  @desc        Pathing related functions
*
*/

includeIfNotIncluded("core/Pather.js");

Developer.debugging.pathing && (PathDebug.enableHooks = true);

Pather.inAnnoyingArea = function (currArea, includeArcane = false) {
	const areas = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3];
	includeArcane && areas.push(sdk.areas.ArcaneSanctuary);
	return areas.includes(currArea);
};

/**
 * @param {Object} arg
 * @param {boolean} arg.canTele
 * @param {boolean} arg.clearPath
 * @param {number} arg.range
 * @param {number} arg.specType
 * @param {boolean} [arg.allowClearing]
 * @returns {void}
 * @todo
 * - clean this up
 * - use effort level calculations to control clearing
 */
NodeAction.killMonsters = function (arg = {}) {
	if (Attack.stopClear || (arg.hasOwnProperty("allowClearing") && !arg.allowClearing)) return;

	const myArea = me.area;
	// I don't think this is even needed anymore, pretty sure I fixed wall hugging. todo - check it
	const pallyAnnoyingAreas = [
		sdk.areas.DenofEvil, sdk.areas.CaveLvl1, sdk.areas.UndergroundPassageLvl1, sdk.areas.HoleLvl1, sdk.areas.PitLvl1, sdk.areas.CaveLvl2,
		sdk.areas.UndergroundPassageLvl2, sdk.areas.PitLvl2, sdk.areas.HoleLvl2, sdk.areas.DisusedFane, sdk.areas.RuinedTemple,
		sdk.areas.ForgottenReliquary, sdk.areas.ForgottenTemple, sdk.areas.RuinedFane, sdk.areas.DisusedReliquary
	];
	const summonerAreas = [
		sdk.areas.DenofEvil, sdk.areas.ColdPlains, sdk.areas.StonyField, sdk.areas.Tristram, sdk.areas.DarkWood, sdk.areas.BlackMarsh,
		sdk.areas.OuterCloister, sdk.areas.Barracks, sdk.areas.Cathedral, sdk.areas.CatacombsLvl4, sdk.areas.HallsoftheDeadLvl1, sdk.areas.HallsoftheDeadLvl2,
		sdk.areas.HallsoftheDeadLvl3, sdk.areas.ValleyofSnakes, sdk.areas.ClawViperTempleLvl1, sdk.areas.TalRashasTomb1, sdk.areas.TalRashasTomb2,
		sdk.areas.TalRashasTomb3, sdk.areas.TalRashasTomb4, sdk.areas.TalRashasTomb5, sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7
	];
	// sanityCheck from isid0re - added paladin specific areas - theBGuy - a mess.. sigh
	if (Pather.inAnnoyingArea(myArea, true) || (me.paladin && pallyAnnoyingAreas.includes(myArea))) {
		arg.range = 7;
	}

	/**
	 * @todo:
	 * - we don't need this if we have a lightning chain based skill, e.g light sorc, light zon
	 * - better monster sorting. If we are low level priortize killing easy targets like zombies/quill rats while ignoring fallens unless they are in our path
	 * - ignore dolls when walking unless absolutely necessary because we are blocked
	 */
	if (!arg.canTele && arg.clearPath !== false) {
		let monList = [];
		if (me.inArea(sdk.areas.BloodMoor)) {
			monList = getUnits(sdk.unittype.Monster)
				.filter(mon => mon.attackable && mon.distance < 30 && !mon.isFallen
					&& !checkCollision(me, mon, (sdk.collision.BlockWall | sdk.collision.LineOfSight | sdk.collision.Ranged)));
			monList.length > 0 && Attack.clearList(monList);
		}

		if (summonerAreas.includes(myArea)) {
			monList = getUnits(sdk.unittype.Monster)
				.filter(mon => mon.attackable && mon.distance < 30 && (mon.isUnraveler || mon.isShaman)
					&& !checkCollision(me, mon, (sdk.collision.BlockWall | sdk.collision.LineOfSight | sdk.collision.Ranged)));
			monList.length > 0 && Attack.clearList(monList);
		}

		if ([sdk.areas.StonyField, sdk.areas.BlackMarsh, sdk.areas.FarOasis].includes(me.area)) {
			// monster nest's are good exp
			monList = getUnits(sdk.unittype.Monster).filter(mon => mon.attackable && mon.distance < 35 && mon.isMonsterNest);
			monList.length > 0 && Attack.clearList(monList);
		}
	}

	if (arg.clearPath !== false) {
		Attack.clear(arg.range, arg.specType);
	}
};

NodeAction.popChests = function () {
	const range = Pather.useTeleport() ? 25 : 15;
	Config.OpenChests.Enabled && Misc.openChests(range);
	Misc.useWell(range);
};

NodeAction.pickItems = function (arg = {}) {
	if (arg.hasOwnProperty("allowPicking") && !arg.allowPicking) return;

	let item = Game.getItem();

	if (item) {
		const maxDist = Skill.haveTK ? 15 : 5;
		const regPickRange = Pather.canTeleport() ? Config.PickRange : 8;
		const maxRange = Math.max(maxDist, regPickRange);
		const totalList = [].concat(Pickit.essentialList, Pickit.pickList);
		const filterJunk = (item) => !!item && item.onGroundOrDropping;

		do {
			if (item.onGroundOrDropping) {
				const itemDist = getDistance(me, item);
				if (itemDist > maxRange) continue;
				if (totalList.some(el => el.gid === item.gid)) continue;
				if (Pickit.essentials.includes(item.itemType)) {
					if (itemDist <= maxDist && (item.itemType !== sdk.items.type.Gold || itemDist < 5)
						&& Pickit.checkItem(item).result && Pickit.canPick(item) && Pickit.canFit(item)) {
						Pickit.essentialList.push(copyUnit(item));
					}
				} else if (itemDist <= regPickRange && item.itemType === sdk.items.type.Key) {
					if (Pickit.canPick(item) && Pickit.checkItem(item).result) {
						Pickit.pickList.push(copyUnit(item));
					}
				} else if (itemDist <= regPickRange && Pickit.checkItem(item).result) {
					Pickit.pickList.push(copyUnit(item));
				}
			}
		} while (item.getNext());
		
		Pickit.essentialList.length > 0 && (Pickit.essentialList = Pickit.essentialList.filter(filterJunk));
		Pickit.pickList.length > 0 && (Pickit.pickList = Pickit.pickList.filter(filterJunk));
		Pickit.essentialList.length > 0 && Pickit.essessntialsPick(false, false);
		Pickit.pickList.length > 0 && Pickit.pickItems(regPickRange);
	}
};

// todo - fast shrineing, if we are right next to a shrine then grab it even with mobs around

Pather.haveTeleCharges = false;
Pather.forceWalk = false;
Pather.forceRun = false;

{
	let coords = function () {
		if (Array.isArray(this) && this.length > 1) return [this[0], this[1]];

		if (typeof this.x !== "undefined" && typeof this.y !== "undefined") {
			return this instanceof PresetUnit && [this.roomx * 5 + this.x, this.roomy * 5 + this.y] || [this.x, this.y];
		}

		return [undefined, undefined];
	};

	Object.defineProperty(Object.prototype, "mobCount", {
		writable: true,
		enumerable: false,
		configurable: true,
		value: function (givenSettings = {}) {
			let [x, y] = coords.apply(this);
			const settings = Object.assign({}, {
				range: 5,
				coll: (sdk.collision.BlockWall | sdk.collision.ClosedDoor | sdk.collision.LineOfSight | sdk.collision.BlockMissile),
				type: 0,
				ignoreClassids: [],
			}, givenSettings);
			return getUnits(sdk.unittype.Monster)
				.filter(function (mon) {
					return mon.attackable && getDistance(x, y, mon.x, mon.y) < settings.range
						&& (!settings.type || (settings.type & mon.spectype))
						&& (settings.ignoreClassids.indexOf(mon.classid) === -1)
						&& !CollMap.checkColl({x: x, y: y}, mon, settings.coll, 1);
				}).length;
		}
	});
}

Pather.checkForTeleCharges = function () {
	this.haveTeleCharges = Attack.getItemCharges(sdk.skills.Teleport);
};

Pather.canUseTeleCharges = function () {
	if (me.classic || me.inTown || me.shapeshifted) return false;
	// Charges are costly so make sure we have enough gold to handle repairs unless we are in maggot lair since thats a pita and worth the gold spent
	if (me.gold < 500000 && !Pather.inAnnoyingArea(me.area)) return false;

	return this.haveTeleCharges;
};

Pather.teleportTo = function (x, y, maxRange = 5) {
	Developer.debugging.pathing && console.log("Mob Count at next node: " + [x, y].mobCount());
	
	for (let i = 0; i < 3; i += 1) {
		Skill.setSkill(sdk.skills.Teleport, sdk.skills.hand.Right) && Packet.castSkill(sdk.skills.hand.Right, x, y);
		let tick = getTickCount();
		let pingDelay = i === 0 ? 250 : me.getPingDelay();

		while (getTickCount() - tick < Math.max(500, pingDelay * 2 + 200)) {
			if (getDistance(me.x, me.y, x, y) < maxRange) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

Pather.teleUsingCharges = function (x, y, maxRange = 5) {
	let orgSlot = me.weaponswitch;

	for (let i = 0; i < 3; i++) {
		me.castChargedSkill(sdk.skills.Teleport, x, y);
		let tick = getTickCount();

		while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
			if (getDistance(me.x, me.y, x, y) < maxRange) {
				me.weaponswitch !== orgSlot && me.switchWeapons(orgSlot);
				return true;
			}

			delay(10);
		}
	}

	if (me.gold > me.getRepairCost() * 3 && me.canTpToTown()) {
		console.debug("Tele-Charge repair");
		Town.visitTown(true);
	} else {
		this.haveTeleCharges = false;
	}

	me.weaponswitch !== orgSlot && me.switchWeapons(orgSlot);

	return false;
};

Pather.checkWP = function (area = 0, keepMenuOpen = false) {
	while (!me.gameReady) {
		delay(40);
	}

	// only do this if we haven't initialzed our wp data
	if (!getWaypoint(Pather.wpAreas.indexOf(area)) && !Pather.initialized) {
		me.inTown && !getUIFlag(sdk.uiflags.Waypoint) && Town.move("waypoint");

		for (let i = 0; i < 15; i++) {
			let wp = Game.getObject("waypoint");
			let useTK = (Skill.useTK(wp) && i < 5);
			let pingDelay = me.getPingDelay();

			if (wp && wp.area === me.area) {
				if (useTK) {
					wp.distance > 21 && Pather.moveNearUnit(wp, 20);
					Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, wp);
				} else {
					wp.distance > 7 && this.moveToUnit(wp);
					Misc.click(0, 0, wp);
				}

				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), (1 + pingDelay * 2))) {
					if (getUIFlag(sdk.uiflags.Waypoint)) {
						delay(500 + pingDelay);
						break;
					}

					delay(50 + pingDelay);
				}
			} else {
				me.inTown && Town.move("waypoint");
			}

			if (getUIFlag(sdk.uiflags.Waypoint)) {
				!keepMenuOpen && me.cancel();
				Pather.initialized = true;
				break;
			}
		}
		// go ahead and close out of wp menu if we don't have the wp
		!getWaypoint(Pather.wpAreas.indexOf(area)) && getUIFlag(sdk.uiflags.Waypoint) && me.cancel();
	}

	return getWaypoint(Pather.wpAreas.indexOf(area));
};

Pather.changeAct = function () {
	let act = me.act + 1;
	let [npc, loc] = (() => {
		switch (act) {
		case 2:
			return ["Warriv", sdk.areas.LutGholein];
		case 3:
			return ["Meshif", sdk.areas.KurastDocktown];
		case 5:
			return ["Tyrael", sdk.areas.Harrogath];
		default:
			return ["", 0];
		}
	})();
	if (!npc) return false;

	!me.inTown && Town.goToTown();
	let npcUnit = Town.npcInteract(npc);
	let timeout = getTickCount() + 3000;
	let pingDelay = me.getPingDelay();

	if (!npcUnit) {
		while (!npcUnit && timeout < getTickCount()) {
			Town.move(NPC[npc]);
			Packet.flash(me.gid, pingDelay);
			delay(pingDelay * 2 + 100);
			npcUnit = Game.getNPC(npc);
		}
	}

	if (npcUnit) {
		for (let i = 0; i < 5; i++) {
			sendPacket(1, 56, 4, 0, 4, npcUnit.gid, 4, loc);
			delay(500 + pingDelay);

			if (me.act === act) {
				break;
			}
		}
	} else {
		myPrint("Failed to move to " + npc);
	}

	while (!me.gameReady) {
		delay(100);
	}

	return me.act === act;
};

Pather.clearUIFlags = function () {
	Pather.cancelFlags.forEach(flag => {
		getUIFlag(flag) && me.cancel();
	});
};
Pather.currentWalkingPath = [];

/**
 * @param {PathNode | Unit | PresetUnit} target 
 * @param {pathSettings} givenSettings 
 * @returns {boolean}
 */
Pather.move = function (target, givenSettings = {}) {
	// Abort if dead
	if (me.dead) return false;
	/**
	 * assign settings
	 * @type {pathSettings}
	 */
	const settings = Object.assign({}, {
		clearSettings: {
		},
		allowTeleport: true,
		allowClearing: true,
		allowTown: true,
		allowPicking: true,
		minDist: 3,
		retry: 5,
		pop: false,
		returnSpotOnError: true,
		callback: null,
	}, givenSettings);
	// assign clear settings becasue object.assign was removing the default properties of settings.clearSettings
	const clearSettings = Object.assign({
		canTele: false,
		clearPath: false,
		range: typeof Config.ClearPath.Range === "number" ? Config.ClearPath.Range : 10,
		specType: typeof Config.ClearPath.Spectype === "number" ? Config.ClearPath.Spectype : 0,
		sort: Attack.sortMonsters,
	}, settings.clearSettings);
	// set settings.clearSettings equal to the now properly asssigned clearSettings
	settings.clearSettings = clearSettings;
	!settings.allowClearing && (settings.clearSettings.allowClearing = false);
	!settings.allowPicking && (settings.clearSettings.allowPicking = false);

	(target instanceof PresetUnit) && (target = target.realCoords());

	if (settings.minDist > 3) {
		target = Pather.spotOnDistance(target, settings.minDist, { returnSpotOnError: settings.returnSpotOnError, reductionType: (me.inTown ? 0 : 2) });
	}

	let fail = 0;
	let node = { x: target.x, y: target.y };
	const leaped = {
		at: 0,
		/** @type {PathNode} */
		from: { x: null, y: null }
	};
	const whirled = {
		at: 0,
		/** @type {PathNode} */
		from: { x: null, y: null }
	};
	const cleared = {
		at: 0,
		/** @type {PathNode} */
		where: { x: null, y: null }
	};
	let [invalidCheck] = [false];

	Pather.clearUIFlags();

	if (typeof target.x !== "number" || typeof target.y !== "number") return false;
	if (getDistance(me, target) < 2 && !CollMap.checkColl(me, target, Coords_1.Collision.BLOCK_MISSILE, 5)) return true;

	const useTeleport = settings.allowTeleport && (getDistance(me, target) > 15 || me.diff || me.act > 3) && Pather.useTeleport();
	settings.clearSettings.canTele = useTeleport;
	const useChargedTele = settings.allowTeleport && Pather.canUseTeleCharges();
	const usingTele = (useTeleport || useChargedTele);
	const tpMana = Skill.getManaCost(sdk.skills.Teleport);
	const annoyingArea = Pather.inAnnoyingArea(me.area);
	let path = getPath(me.area, target.x, target.y, me.x, me.y, usingTele ? 1 : 0, usingTele ? (annoyingArea ? 30 : Pather.teleDistance) : Pather.walkDistance);
	if (!path) throw new Error("move: Failed to generate path.");

	// need to work on a better force clearing method but for now just have all walkers clear unless we specifically are forcing them not to (like while repositioning)
	settings.allowClearing && !settings.clearSettings.clearPath && !useTeleport && (settings.clearSettings.clearPath = true);

	if (settings.retry <= 3 && target.distance > useTeleport ? 120 : 60) {
		settings.retry = 10;
	}

	// for now only do this for teleporters
	if (useTeleport && !me.normal) {
		/** @type {Array} */
		let areaImmunities = GameData.areaImmunities(me.area);
		if (areaImmunities.length) {
			let mySkElems = Config.AttackSkill.filter(sk => sk > 0).map(sk => Attack.getSkillElement(sk));
			// this area has monsters that are immune to our elements. This is a basic check for now
			// a better way would probably be per list built to check the ratio of immunes to non?
			if (mySkElems.length && mySkElems.every(elem => areaImmunities.includes(elem))) {
				settings.clearSettings.clearPath = false;
			}
		} else if (AreaData[me.area].hasMonsterType(sdk.monsters.type.UndeadFetish)) {
			settings.clearSettings.clearPath = false;
		}
	}

	path.reverse();
	settings.pop && path.pop();
	PathDebug.drawPath(path);
	useTeleport && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

	while (path.length > 0) {
		// Abort if dead
		if (me.dead) return false;
		// main path
		Pather.recursion && (Pather.currentWalkingPath = path);
		Pather.clearUIFlags();

		node = path.shift();

		if (typeof settings.callback === "function" && settings.callback()) {
			console.debug("Callback function passed. Ending path.");
			useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
			PathDebug.removeHooks();
			return true;
		}

		if (getDistance(me, node) > 2) {
			// Make life in Maggot Lair easier
			fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y) && (invalidCheck = true);
			// Make life in Maggot Lair easier - should this include arcane as well?
			if (annoyingArea || invalidCheck) {
				let adjustedNode = Pather.getNearestWalkable(node.x, node.y, 15, 3, sdk.collision.BlockWalk);

				if (adjustedNode) {
					[node.x, node.y] = [adjustedNode[0], adjustedNode[1]];
					invalidCheck && (invalidCheck = false);
				}

				annoyingArea && ([settings.clearSettings.clearPath, settings.clearSettings.range] = [true, 5]);
				settings.retry <= 3 && !useTeleport && (settings.retry = 15);
			}

			if (useTeleport && tpMana <= me.mp
				? Pather.teleportTo(node.x, node.y)
				: useChargedTele && (getDistance(me, node) >= 15 || me.inArea(sdk.areas.ThroneofDestruction))
					? Pather.teleUsingCharges(node.x, node.y)
					: Pather.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
				if (!me.inTown) {
					if (Pather.recursion) {
						try {
							Pather.recursion = false;
							NodeAction.go(settings.clearSettings);
							// need to determine if its worth going back to our orignal node (items maybe?)
							// vs our current proximity to our next node
							// need to export our main path so other functions that cause us to move can see it
							if (getDistance(me, node.x, node.y) > 5) {
								const lastNode = Pather.currentWalkingPath.last();
								// lets try and find the nearest node that brings us close to our goal
								let nearestNode = Pather.currentWalkingPath.length > 0 && Pather.currentWalkingPath
									.filter(el => !!el && el.x !== node.x && el.y !== node.y)
									.sort((a, b) => {
										if (a.distance < b.distance && getDistance(a, lastNode) < getDistance(b, lastNode)) return -1;
										if (a.distance > b.distance && getDistance(a, lastNode) > getDistance(b, lastNode)) return 1;
										return a.distance - b.distance;
									}).first();
								if (getDistance(me, node.x, node.y) < 40) {
									let goBack = false;
									// lets see if it's worth walking back to old node
									Pickit.checkSpotForItems(node, true) && (goBack = true);
									// @todo check shrines/chests in proximity to old node vs next node
									// let otherObjects = getUnits(sdk.unittype.Object).filter(el => getDistance());
									if (goBack) {
										console.debug("Going back to old node. Distance: " + node.distance);
									} else if (nearestNode && nearestNode.distance > 5 && node.distance > 5 && 100 / node.distance * nearestNode.distance < 95) {
										console.debug("Moving to next node. Distance: " + nearestNode.distance);
										let newIndex = path.findIndex(node => nearestNode.x === node.x && nearestNode.y === node.y);
										if (newIndex > -1) {
											console.debug("Found new path index: " + newIndex + " of currentPathLen: " + path.length);
											path = path.slice(newIndex);
											node = path.shift();
											console.debug("New path length: " + path.length);
										} else {
											console.debug("Couldn't find new path index");
										}
									}
									node.distance > 5 && Pather.move(node, settings);
								} else {
									Pather.move(node, settings);
								}
							}
						} finally {
							Pather.recursion = true;
						}
					}

					settings.allowTown && Misc.townCheck();
				}
			} else {
				if (!me.inTown) {
					if (!useTeleport && settings.allowClearing) {
						let tempRange = (annoyingArea ? 5 : 10);
						// allowed to clear so lets see if any mobs are around us
						if (me.checkForMobs({ range: tempRange, coll: sdk.collision.BlockWalk })) {
							// there are at least some, but lets only continue to next iteration if we actually killed something
							if (Attack.clear(tempRange, null, null, null, settings.allowPicking) === Attack.Result.SUCCESS) {
								console.debug("Cleared Node");
								continue;
							}
						}
					}
					if (!useTeleport && (Pather.openDoors(node.x, node.y) || Pather.kickBarrels(node.x, node.y))) {
						continue;
					}

					if (fail > 0 && (!useTeleport || tpMana > me.mp)) {
						// if we are allowed to clear
						if (settings.allowClearing) {
							// Don't go berserk on longer paths - also check that there are even mobs blocking us
							if (cleared.at === 0 || getTickCount() - cleared.at > Time.seconds(3) && cleared.where.distance > 5 && me.checkForMobs({range: 10})) {
								// only set that we cleared if we actually killed at least 1 mob
								if (Attack.clear(10, null, null, null, settings.allowPicking)) {
									console.debug("Cleared Node");
									cleared.at = getTickCount();
									[cleared.where.x, cleared.where.y] = [node.x, node.y];
								}
							}
						}

						// Leap can be helpful on long paths but make sure we don't spam it
						if (Skill.canUse(sdk.skills.LeapAttack)) {
							// we can use leapAttack, now lets see if we should - either haven't used it yet or it's been long enough since last time
							if (leaped.at === 0 || getTickCount() - leaped.at > Time.seconds(3) || leaped.from.distance > 5 || me.checkForMobs({ range: 6 })) {
								// alright now if we have actually casted it set the values so we know
								if (Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, node.x, node.y)) {
									leaped.at = getTickCount();
									[leaped.from.x, leaped.from.y] = [node.x, node.y];
								}
							}
						}

						/**
							* whirlwind can be useful as well, implement it.
							* Things to consider:
							* 1) Can we cast whirlwind on the node? Is it blocked by something other than monsters.
							* 2) If we can't cast on that node, is there another node between us and it that would work?
							*/
						if (Skill.canUse(sdk.skills.Whirlwind)) {
							// we can use whirlwind, now lets see if we should - either haven't used it yet or it's been long enough since last time
							if (whirled.at === 0 || getTickCount() - whirled.at > Time.seconds(3) || whirled.from.distance > 5 || me.checkForMobs({ range: 6 })) {
								// alright now if we have actually casted it set the values so we know
								if (Skill.cast(sdk.skills.Whirlwind, sdk.skills.hand.Right, node.x, node.y)) {
									whirled.at = getTickCount();
									[whirled.from.x, whirled.from.y] = [node.x, node.y];
								}
							}
						}
					}
				}

				// Reduce node distance in new path
				path = getPath(me.area, target.x, target.y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? rand(25, 35) : rand(10, 15));
				if (!path) throw new Error("moveTo: Failed to generate path.");

				path.reverse();
				PathDebug.drawPath(path);
				settings.pop && path.pop();

				if (fail > 0) {
					console.debug("move retry " + fail);
					Packet.flash(me.gid);

					if (fail >= settings.retry) {
						console.log("Failed move: Retry = " + settings.retry);
						break;
					}
				}
				if (fail > 100) {
					// why?
					console.debug(settings);
					throw new Error("Retry limit excessivly exceeded");
				}
				fail++;
			}
		}

		/**
		 * @todo handle passing in a callback function
		 */

		delay(5);
	}

	useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
	PathDebug.removeHooks();

	return getDistance(me, node.x, node.y) < 5;
};

Pather.moveNear = function (x, y, minDist, givenSettings = {}) {
	return Pather.move({ x: x, y: y }, Object.assign({ minDist: minDist }, givenSettings));
};

Pather.moveTo = function (x, y, retry, clearPath = true, pop = false) {
	return Pather.move({ x: x, y: y }, { retry: retry, pop: pop, clearSettings: { clearPath: clearPath } });
};

Pather.moveToLoc = function (target, givenSettings = {}) {
	return Pather.move(target, givenSettings);
};

Pather.moveToEx = function (x, y, givenSettings = {}) {
	return Pather.move({ x: x, y: y }, givenSettings);
};

// Add check in case "random" to return false if bot doesn't have cold plains wp yet
Pather.useWaypoint = function useWaypoint(targetArea, check = false) {
	switch (targetArea) {
	case undefined:
		throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
	case null:
	case "random":
		check = true;

		break;
	default:
		if (typeof targetArea !== "number") throw new Error("useWaypoint: Invalid targetArea parameter");
		if (!this.wpAreas.includes(targetArea)) throw new Error("useWaypoint: Invalid area");

		break;
	}

	console.log("ÿc7Start ÿc8(useWaypoint) ÿc0:: ÿc7targetArea: ÿc0" + getAreaName(targetArea) + " ÿc7myArea: ÿc0" + getAreaName(me.area));
	let wpTick = getTickCount();

	for (let i = 0; i < 12; i += 1) {
		if (me.area === targetArea || me.dead) {
			break;
		}

		if (me.inTown) {
			if (me.inArea(sdk.areas.LutGholein)) {
				let npc = Game.getNPC(NPC.Warriv);

				if (!!npc && npc.distance < 50) {
					if (npc && npc.openMenu()) {
						Misc.useMenu(sdk.menu.GoWest);

						if (!Misc.poll(() => me.gameReady && me.inArea(sdk.areas.RogueEncampment), 2000, 100)) {
							throw new Error("Failed to go to act 1 using Warriv");
						}
					}
				}
			}

			!getUIFlag(sdk.uiflags.Waypoint) && Town.getDistance("waypoint") > (Skill.haveTK ? 20 : 5) && Town.move("waypoint");
		}

		let wp = Game.getObject("waypoint");

		if (!!wp && wp.area === me.area) {
			let useTK = (Skill.useTK(wp) && i < 3);
			let pingDelay = me.getPingDelay();

			if (useTK && !getUIFlag(sdk.uiflags.Waypoint)) {
				wp.distance > 21 && Pather.moveNearUnit(wp, 20);
				i > 1 && checkCollision(me, wp, sdk.collision.Ranged) && Attack.getIntoPosition(wp, 20, sdk.collision.Ranged);
				Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, wp);
			} else if (!me.inTown && wp.distance > 7) {
				this.moveToUnit(wp);
			}

			if (check || Config.WaypointMenu || !this.initialized) {
				if (!useTK && (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint))) {
					this.moveToUnit(wp) && Misc.click(0, 0, wp);
				}

				// handle getUnit bug
				if (me.inTown && !getUIFlag(sdk.uiflags.Waypoint) && wp.name.toLowerCase() === "dummy") {
					Town.getDistance("waypoint") > 5 && Town.move("waypoint");
					Misc.click(0, 0, wp);
				}

				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), pingDelay * 2)) {
					if (getUIFlag(sdk.uiflags.Waypoint)) {
						delay(500);

						switch (targetArea) {
						case "random":
							let retry = 0;

							while (true) {
								targetArea = this.nonTownWpAreas[rand(0, this.nonTownWpAreas.length - 1)];

								// get a valid wp, avoid towns
								if (getWaypoint(this.wpAreas.indexOf(targetArea))) {
									break;
								}

								// no valid areas, get the cold plains wp
								// maybe just walk out of town instead?
								if (retry >= 10) {
									if (!getWaypoint(this.wpAreas.indexOf(sdk.areas.ColdPlains)) && me.cancel()) {
										me.overhead("Trying to get the waypoint");
										if (this.getWP(sdk.areas.ColdPlains)) return true;

										throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
									}
								}

								retry++;
								delay(25);
							}

							break;
						case null:
							me.cancel();

							return true;
						}

						if (!getWaypoint(this.wpAreas.indexOf(targetArea)) && me.cancel()) {
							me.overhead("Trying to get the waypoint");
							if (this.getWP(targetArea)) return true;

							throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
						}

						break;
					}

					delay(10);
				}

				if (!getUIFlag(sdk.uiflags.Waypoint)) {
					console.warn("waypoint retry " + (i + 1));
					let retry = Math.min(i + 1, 5);
					let coord = CollMap.getRandCoordinate(me.x, -5 * retry, 5 * retry, me.y, -5 * retry, 5 * retry);
					!!coord && this.moveTo(coord.x, coord.y);
					delay(200);
					i > 1 && (i % 3) === 0 && Packet.flash(me.gid, pingDelay);

					continue;
				}
			}

			if (!check || getUIFlag(sdk.uiflags.Waypoint)) {
				delay(250);
				wp.interact(targetArea);
				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), pingDelay * 4)) {
					if (me.area === targetArea) {
						delay(1500);
						console.log("ÿc7End ÿc8(useWaypoint) ÿc0:: ÿc7targetArea: ÿc0" + getAreaName(targetArea) + " ÿc7myArea: ÿc0" + getAreaName(me.area) + "ÿc0 - ÿc7Duration: ÿc0" + (Time.format(getTickCount() - wpTick)));

						return true;
					}

					delay(30);
				}

				while (!me.gameReady) {
					delay(1000);
				}

				// In case lag causes the wp menu to stay open
				getUIFlag(sdk.uiflags.Waypoint) && me.cancel();
			}

			i > 1 && (i % 3) === 0 && Packet.flash(me.gid, pingDelay);
			// Activate check if we fail direct interact twice
			i > 1 && (check = true);
		} else {
			Packet.flash(me.gid);
		}

		// We can't seem to get the wp maybe attempt portal to town instead and try to use that wp
		i >= 10 && !me.inTown && Town.goToTown();

		delay(250);
	}

	if (me.area === targetArea) {
		delay(500);
		console.log("ÿc7End ÿc8(useWaypoint) ÿc0:: ÿc7targetArea: ÿc0" + getAreaName(targetArea) + " ÿc7myArea: ÿc0" + getAreaName(me.area) + "ÿc0 - ÿc7Duration: ÿc0" + (Time.format(getTickCount() - wpTick)));

		return true;
	}

	throw new Error("useWaypoint: Failed to use waypoint to " + targetArea);
};

// credit - Legacy Autosmurf
Pather.clearToExit = function (currentarea, targetarea, cleartype = true) {
	let tick = getTickCount();
	let retry = 0;
	console.log("ÿc8Kolbot-SoloPlayÿc0: Start clearToExit. ÿc8Currently in: ÿc0" + getAreaName(me.area) + "ÿc8Clearing to: ÿc0" + getAreaName(targetarea));

	me.area !== currentarea && Pather.journeyTo(currentarea);

	if (me.area !== targetarea) {
		do {
			try {
				Pather.moveToExit(targetarea, true, cleartype);
			} catch (e) {
				console.debug("Caught Error: ", e.message ? e.message : e);
			}

			delay(500);
			Misc.poll(() => me.gameReady, 1000, 100);
			
			if (retry > 5) {
				console.log("ÿc8Kolbot-SoloPlayÿc0: clearToExit. ÿc2Failed to move to: ÿc0" + getAreaName(targetarea));

				break;
			}

			retry++;
		} while (me.area !== targetarea);
	}

	console.log("ÿc8Kolbot-SoloPlayÿc0: End clearToExit. Time elapsed: " + Tracker.formatTime(getTickCount() - tick));
	return (me.area === targetarea);
};

Pather.getWalkDistance = function (x, y, area = me.area, xx = me.x, yy = me.y, reductionType = 2, radius = 5) {
	// distance between node x and x-1
	return (getPath(area, x, y, xx, yy, reductionType, radius) || [])
		.map((e, i, s) => i && getDistance(s[i - 1], e) || 0)
		.reduce((acc, cur) => acc + cur, 0) || Infinity;
};
