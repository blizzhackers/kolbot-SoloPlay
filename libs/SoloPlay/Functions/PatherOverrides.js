/*
*	@filename	PatherOverrides.js
*	@author		theBGuy, isid0re
*	@desc		Pather.js fixes to improve functionality
*/

if (!isIncluded("common/Pather.js")) {
	include("common/Pather.js");
}

require("../Modules/Coords");

NodeAction.killMonsters = function (arg) {
	// sanityCheck from isid0re - added paladin specific areas - theBGuy
	let monList, sanityCheck = ([62, 63, 64, 74].indexOf(me.area) > -1 || (me.paladin && [8, 9, 10, 11, 12, 13, 14, 15, 16, 94, 95, 96, 97, 98, 99].indexOf(me.area) > -1)) ? true : false;

	if (Attack.stopClear) {
		return;
	}

	if ([8, 3, 4, 38, 5, 6, 27, 28, 33, 37, 56, 57, 60, 45, 58, 66, 67, 68, 69, 70, 71, 72].indexOf(me.area) > -1) {
		monList = Attack.getMob([58, 59, 60, 61, 101, 102, 103, 104], 0, 30);

		if (monList) {
			Attack.clear(7, 0);
			Attack.clearList(monList);
		}
	}

	if (me.area === sdk.areas.MooMooFarm) {
		let king = getUnit(1, getLocaleString(sdk.locale.monsters.TheCowKing));
		let kingPreset = getPresetUnit(me.area, 1, 773);

		if (king) {
			do {
				if (getDistance(me.x, me.y, getRoom(kingPreset.roomx * 5 + kingPreset.x), getRoom(kingPreset.roomy * 5 + kingPreset.y)) <= 25) {
					Town.goToTown();
					print('ÿc8Kolbot-SoloPlayÿc0: exit cows. Near the king');
					me.overhead('Exit cows. Near the king');
					D2Bot.printToConsole('Kolbot-SoloPlay: exit cows. Near the king', 8);
				}
			} while (king.getNext());
		}
	}

	if (me.area === sdk.areas.DenofEvil && me.hell && me.druid) {
		let corpsefire = getUnit(1, getLocaleString(sdk.locale.monsters.Corpsefire));

		if (corpsefire) {
			do {
				if (Attack.getResist(corpsefire, "cold") >= 100 && Attack.getResist(corpsefire, "physical") >= 100) {
					Town.goToTown();
					print('ÿc8Kolbot-SoloPlayÿc0: Exit den. Corpsefire is immune to cold and physical');
					me.overhead('Exit den. Corpsefire is immune to cold and physical');
					D2Bot.printToConsole('ÿc8Kolbot-SoloPlayÿc0: exit den. Corpsefire is immune to cold and physical', 8);
				}
			} while (corpsefire.getNext());
		}
	}

	if ((typeof Config.ClearPath === "number" || typeof Config.ClearPath === "object") && arg.clearPath === false) {
		switch (typeof Config.ClearPath) {
		case "number":
			Attack.clear(7, 0);
			Attack.clear(sanityCheck ? 7 : 30, Config.ClearPath);

			break;
		case "object":
			if (!Config.ClearPath.hasOwnProperty("Areas") || Config.ClearPath.Areas.length === 0 || Config.ClearPath.Areas.indexOf(me.area) > -1) {
				Attack.clear(7, 0);
				Attack.clear(sanityCheck ? 7 : Config.ClearPath.Range, Config.ClearPath.Spectype);
			}

			break;
		}
	}

	if (arg.clearPath !== false) {
		if (!Pather.useTeleport()) {	// If teleporting its not necessary to clear all mobs, just hit champions/uniques for xp/drops
			Attack.clear(7, 0);
		}

		Attack.clear(sanityCheck ? 7 : 15, typeof arg.clearPath === "number" ? arg.clearPath : 0);
	}
};

NodeAction.popChests = function () {
	let range = Pather.useTeleport() ? 25 : 15;

	if (Config.OpenChests) {
		Misc.openChests(range);
	}

	Misc.useWell(range);
};

Pather.haveTeleCharges = false;

Pather.canTeleport = function () {
	return this.teleport && !Config.NoTele && !me.getState(139) && !me.getState(140) && ((me.sorceress && me.getSkill(54, 1)) || me.getStat(97, 54));
};

Pather.useTeleport = function () { //XCon provided. to turn off teleport if below 20% mana
	return this.teleport && !Config.NoTele && !me.getState(139) && !me.getState(140) && !me.inTown && ((me.sorceress && me.getSkill(54, 1) && ((me.getStat(8) / me.getStat(9)) * 100) >= 20) || me.getStat(97, 54));
};

Pather.checkForTeleCharges = function () {
	this.haveTeleCharges = Attack.getItemCharges(sdk.skills.Teleport);
};

Pather.canUseTeleCharges = function () {
	if (me.classic || me.inTown || me.shapeshifted) {
		return false;
	}

	// Charges are costly so make sure we have enough gold to handle repairs unless we are in maggot lair since thats a pita and worth the gold spent
	if (me.gold < 500000 && [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].indexOf(me.area) === -1) {
		return false;
	}

	return this.haveTeleCharges;
};

Pather.teleportTo = function (x, y, maxRange) {
	let i, tick;

	if (maxRange === undefined) {
		maxRange = 5;
	}

	for (i = 0; i < 3; i += 1) {
		/*let mobsAtPos = Attack.getMobCount(x, y, 6);

		if ((typeof Config.ClearPath === "number" || typeof Config.ClearPath === "object") && mobsAtPos > 1) {
			me.overhead("Mobs at my next node: " + mobsAtPos);
			Attack.clearPosition(x, y, 6, true);
		}*/

		if (Config.PacketCasting) {
			Skill.setSkill(54, 0);
			Packet.castSkill(0, x, y);
		} else {
			Skill.cast(54, 0, x, y);
		}

		tick = getTickCount();

		while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
			if (getDistance(me.x, me.y, x, y) < maxRange) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

Pather.teleportToUsingCharges = function (x, y, maxRange) {
	let i, tick, orgSlot = me.weaponswitch;

	if (maxRange === undefined) {
		maxRange = 5;
	}

	print("Got here, haveTeleCharges = " + this.haveTeleCharges);

	for (i = 0; i < 3; i += 1) {
		me.castChargedSkill(sdk.skills.Teleport, x, y);

		tick = getTickCount();

		while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
			if (getDistance(me.x, me.y, x, y) < maxRange) {
				if (me.weaponswitch !== orgSlot) {
					me.switchWeapons(orgSlot);
				}
				return true;
			}

			delay(10);
		}
	}

	if (me.weaponswitch !== orgSlot) {
		me.switchWeapons(orgSlot);
	}

	return false;
};

Pather.checkWP = function (area) {
	if (!getWaypoint(Pather.wpAreas.indexOf(area))) {
		if (me.inTown) {
			Town.move("waypoint");
		}

		let wp;

		for (let i = 0; i < 15; i += 1) {
			wp = getUnit(2, "waypoint");

			if (wp && wp.area === me.area) {
				if (!me.inTown && getDistance(me, wp) > 7) {
					Pather.moveToUnit(wp);
				}

				Misc.click(0, 0, wp);

				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), (1 + me.ping * 2))) {
					if (getUIFlag(0x14)) { // Waypoint screen is open
						delay(500 + me.ping);
						break;
					}

					delay(50 + me.ping);
				}
			}

			if (getUIFlag(0x14)) { // Waypoint screen is open
				me.cancel();
				break;
			}
		}
	}

	return getWaypoint(Pather.wpAreas.indexOf(area));
};

// fixed monsterdoors/walls in act 5
Pather.openDoors = function (x, y) {
	if (me.inTown) {
		return false;
	}

	// Regular doors
	let i, tick,
		door = getUnit(2, "door", 0);

	if (door) {
		do {
			if ((getDistance(door, x, y) < 4 && getDistance(me, door) < 9) || getDistance(me, door) < 4) {
				for (i = 0; i < 3; i += 1) {
					Misc.click(0, 0, door);
					tick = getTickCount();

					while (getTickCount() - tick < 1000) {
						if (door.mode === 2) {
							me.overhead("Opened a door!");

							return true;
						}

						delay(10 + me.ping);
					}

					if (i === 2) {
						Packet.flash(me.gid);
					}
				}
			}
		} while (door.getNext());
	}

	// Monsta doors (Barricaded)
	let p,
		monstadoor = getUnit(1, "Barricaded Door"), //barricaded door
		monstawall = getUnit(1, "Barricade"); //barricaded wall

	if (monstadoor) {
		do {
			if ((getDistance(monstadoor, x, y) < 4 && getDistance(me, monstadoor) < 9) || getDistance(me, monstadoor) < 4) {

				for (p = 0; p < 20 && monstadoor.hp; p += 1) {
					Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), monstadoor);
				}

				me.overhead("Broke a barricaded door!");
			}
		} while (monstadoor.getNext());
	}

	if (monstawall) {
		do {
			if ((getDistance(monstawall, x, y) < 4 && getDistance(me, monstawall) < 9) || getDistance(me, monstawall) < 4) {

				for (p = 0; p < 20 && monstawall.hp; p += 1) {
					Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), monstawall);
				}

				me.overhead("Broke a barricaded wall!");
			}
		} while (monstawall.getNext());
	}

	return false;
};

Pather.changeAct = function () {
	let npc, loc, act = me.act + 1;

	switch (act) {
	case 2:
		npc = "warriv";
		loc = 40;
		Town.npcInteract("warriv");

		if (!Misc.checkQuest(6, 0)) {
			me.overhead("Incomplete Quest");
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to act " + act);
			return false;
		}

		Town.move(NPC.Warriv);

		break;
	case 3:
		npc = "meshif";
		loc = 75;
		Town.npcInteract("meshif");

		if (!Misc.checkQuest(14, 0)) {
			me.overhead("Incomplete Quest");
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to act " + act);
			return false;
		}

		Town.move(NPC.Meshif);

		break;
	case 5:
		npc = "tyrael";
		loc = 109;
		Town.npcInteract("tyrael");

		if (!Misc.checkQuest(26, 0)) {
			me.overhead("Incomplete Quest");
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to act " + act);
			return false;
		}

		Town.move(NPC.Tyrael);

		break;
	}

	let npcUnit = getUnit(1, npc);
	let timeout = getTickCount() + 3000;

	while (!npcUnit && timeout < getTickCount()) {
		Town.move(npc);
		Packet.flash(me.gid);
		delay(me.ping * 2 + 100);
		npcUnit = getUnit(1, npc);
	}

	if (npcUnit) {
		for (let i = 0; i < 5; i += 1) {
			sendPacket(1, 56, 4, 0, 4, npcUnit.gid, 4, loc);
			delay(500 + me.ping);

			if (me.act === act) {
				break;
			}
		}
	} else {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to " + npc);
		me.overhead("Failed to move to " + npc);
	}

	return me.act === act;
};

Pather.walkTo = function (x, y, minDist) {
	while (!me.gameReady) {
		delay(100);
	}

	if (minDist === undefined) {
		minDist = me.inTown ? 2 : 4;
	}

	let i, angle, angles, nTimer, whereToClick, tick, _a,
		nFail = 0,
		attemptCount = 0;

	// credit @Jaenster
	// Stamina handler and Charge
	if (!me.inTown && !me.dead) {
		//let stam = me.getItem(sdk.items.StaminaPotion);

		/*if (!stam && (me.stamina / me.staminamax * 100 <= 85 || me.runwalk === 0)) {
        	// Look on the ground around me to see if there is a stamina potion
        	stam = getUnit(4, sdk.items.StaminaPotion, 3);
			if (!!stam && getDistance(me, stam) <= 15 && !checkCollision(me, stam, 0x1) && !me.getItem(sdk.items.StaminaPotion) && Attack.getMobCountAtPosition(stam.x, stam.y, 8) === 0) {
				Pickit.pickItem(stam);
				stam = false;
			}
		}*/
		// Check if I have a stamina potion and use it if I do
		if (me.stamina / me.staminamax * 100 <= 20) {
			(_a = me.getItemsEx()
				.filter(function (i) { return i.classid === sdk.items.StaminaPotion && i.isInInventory; })
				.first()) === null || _a === void 0 ? void 0 : _a.interact();
		}
		if (me.runwalk === 1 && me.stamina / me.staminamax * 100 <= 15) {
			me.runwalk = 0;
		}
		// the less stamina you have, the more you wait to recover
		let recover = me.staminaMaxDuration < 30 ? 80 : 50;
		if (me.runwalk === 0 && me.stamina / me.staminamax * 100 >= recover) {
			me.runwalk = 1;
		}
		if (Config.Charge && me.paladin && me.mp >= 9 && getDistance(me.x, me.y, x, y) > 8 && Skill.setSkill(sdk.skills.Charge, 1)) {
			if (Config.Vigor) {
				Skill.setSkill(sdk.skills.Vigor, 0);
			}
			Misc.click(0, 1, x, y);
			while (me.mode !== 1 && me.mode !== 5 && !me.dead) {
				delay(40);
			}
		}
	}

	if (me.inTown && me.runwalk === 0) {
		me.runwalk = 1;
	}

	while (getDistance(me.x, me.y, x, y) > minDist && !me.dead) {
		if (me.paladin && Config.Vigor) {
			Skill.setSkill(sdk.skills.Vigor, 0);
		}

		if (this.openDoors(x, y) && getDistance(me.x, me.y, x, y) <= minDist) {
			return true;
		}

		Misc.click(0, 0, x, y);

		attemptCount += 1;
		nTimer = getTickCount();

		ModeLoop:
		while (me.mode !== 2 && me.mode !== 3 && me.mode !== 6) {
			if (me.dead) {
				return false;
			}

			if ((getTickCount() - nTimer) > 500) {
				nFail += 1;

				if (nFail >= 3) {
					return false;
				}

				angle = Math.atan2(me.y - y, me.x - x);
				angles = [Math.PI / 2, -Math.PI / 2];

				for (i = 0; i < angles.length; i += 1) {
					// TODO: might need rework into getnearestwalkable
					whereToClick = {
						x: Math.round(Math.cos(angle + angles[i]) * 5 + me.x),
						y: Math.round(Math.sin(angle + angles[i]) * 5 + me.y)
					};

					if (Attack.validSpot(whereToClick.x, whereToClick.y)) {
						Misc.click(0, 0, whereToClick.x, whereToClick.y);

						tick = getTickCount();

						while (getDistance(me, whereToClick) > 2 && getTickCount() - tick < 1000) {
							delay(40);
						}

						break;
					}
				}

				break ModeLoop;
			}

			delay(10);
		}

		// Wait until we're done walking - idle or dead
		while (getDistance(me.x, me.y, x, y) > minDist && me.mode !== 1 && me.mode !== 5 && !me.dead) {
			delay(10);
		}

		if (attemptCount >= 3) {
			return false;
		}
	}

	return !me.dead && getDistance(me.x, me.y, x, y) <= minDist;
};

Pather.moveTo = function (x, y, retry, clearPath, pop) {
	if (me.dead) { // Abort if dead
		return false;
	}

	let i, path, adjustedNode, cleared, useTeleport, useChargedTele,
		node = {x: x, y: y},
		fail = 0;

	for (i = 0; i < this.cancelFlags.length; i += 1) {
		if (getUIFlag(this.cancelFlags[i])) {
			me.cancel();
		}
	}

	if (getDistance(me, x, y) < 2) {
		return true;
	}

	if (x === undefined || y === undefined) {
		throw new Error("moveTo: Function must be called with at least 2 arguments.");
	}

	if (typeof x !== "number" || typeof y !== "number") {
		throw new Error("moveTo: Coords must be numbers");
	}

	if (retry === undefined || retry === 3) {
		retry = 15;
	}

	if (clearPath === undefined) {
		clearPath = true;
	}

	if (pop === undefined) {
		pop = false;
	}

	useTeleport = this.useTeleport();
	useChargedTele = this.canUseTeleCharges();
	path = getPath(me.area, x, y, me.x, me.y, useTeleport || useChargedTele ? 1 : 0, useTeleport || useChargedTele ? ([62, 63, 64].indexOf(me.area) > -1 ? 30 : this.teleDistance) : this.walkDistance);

	if (!path) {
		throw new Error("moveTo: Failed to generate path.");
	}

	if (!useTeleport) {
		let inMyWayShit = getUnits().filter(chest => chest.type === 2 && getDistance(me, chest) < 3);
		if (inMyWayShit.length > 0) {me.overhead("Shit in my way " + inMyWayShit.length);}
		inMyWayShit.length && inMyWayShit.forEach(function (chest) { return Misc.openChest(chest); });
	}

	path.reverse();

	if (pop) {
		path.pop();
	}

	PathDebug.drawPath(path);

	if (useTeleport && Config.TeleSwitch && path.length > 5) {
		me.switchWeapons(Attack.getPrimarySlot() ^ 1);
	}

	let tpMana = Skill.getManaCost(54);	// Credit @Jaenster

	while (path.length > 0) {
		if (me.dead) { // Abort if dead
			return false;
		}

		for (i = 0; i < this.cancelFlags.length; i += 1) {
			if (getUIFlag(this.cancelFlags[i])) {
				me.cancel();
			}
		}

		node = path.shift();

		if (getDistance(me, node) > 2) {
			if ([62, 63, 64].indexOf(me.area) > -1) {
				adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

				if (adjustedNode) {
					node.x = adjustedNode[0];
					node.y = adjustedNode[1];
				}
			}

			if (useTeleport && tpMana <= me.mp ? this.teleportTo(node.x, node.y) : useChargedTele && getDistance(me, node) >= 15 ? this.teleportToUsingCharges(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
				if (!me.inTown) {
					if (this.recursion) {
						this.recursion = false;

						NodeAction.go({clearPath: clearPath});

						if (getDistance(me, node.x, node.y) > 5) {
							this.moveTo(node.x, node.y);
						}

						this.recursion = true;
					}

					Misc.townCheck();
				}
			} else {
				if (fail > 0 && !useTeleport && !me.inTown) {
					if (!cleared) {
						Attack.clear(5);
						Misc.openChests(2);

						cleared = true;
					}

					if (fail > 1 && me.getSkill(143, 1)) {
						Skill.cast(143, 0, node.x, node.y);
					}
				}

				path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? rand(25, 35) : rand(10, 15));
				fail += 1;

				if (!path) {
					throw new Error("moveTo: Failed to generate path.");
				}

				path.reverse();
				PathDebug.drawPath(path);

				if (pop) {
					path.pop();
				}

				print("move retry " + fail);

				if (fail > 0) {
					Packet.flash(me.gid);
					Attack.clear(5);
					Misc.openChests(2);

					if (fail >= retry) {
						break;
					}
				}
			}
		}

		delay(5);
	}

	if (useTeleport && Config.TeleSwitch) {
		me.switchWeapons(Attack.getPrimarySlot());
	}

	PathDebug.removeHooks();

	return getDistance(me, node.x, node.y) < 5;
};

Pather.makePortal = function (use) {
	if (me.inTown) {
		return true;
	}

	let i, portal, oldPortal, oldGid, tick, tpTome, tpScroll;

	for (i = 0; i < 5; i += 1) {
		if (me.dead) {
			break;
		}

		tpScroll = me.findItem("tsc", 0, 3);
		tpTome = me.findItem("tbk", 0, 3);

		if (!tpTome && !tpScroll) {
			return false;
		}

		if ((tpTome && !tpTome.getStat(70)) && !tpScroll) {
			return false;
		}

		oldPortal = getUnit(2, "portal");

		if (oldPortal) {
			do {
				if (oldPortal.getParent() === me.name) {
					oldGid = oldPortal.gid;

					break;
				}
			} while (oldPortal.getNext());
		}

		if (!tpTome) {
			tpScroll.interact();
		} else {
			tpTome.interact();
		}

		tick = getTickCount();

		MainLoop:
		while (getTickCount() - tick < Math.max(500 + i * 100, me.ping * 2 + 100)) {
			portal = getUnit(2, "portal");

			if (portal) {
				do {
					if (portal.getParent() === me.name && portal.gid !== oldGid) {
						if (use) {
							if (Pather.usePortal(null, null, copyUnit(portal))) {
								return true;
							}

							break MainLoop; // don't spam usePortal
						} else {
							return copyUnit(portal);
						}
					}
				} while (portal.getNext());
			}

			delay(10);
		}

		Packet.flash(me.gid);
		delay(200 + me.ping);
	}

	return false;
};

Pather.moveToUnit = function (unit, offX, offY, clearPath, pop) {
	let useTeleport = this.useTeleport();

	if (offX === undefined) {
		offX = 0;
	}

	if (offY === undefined) {
		offY = 0;
	}

	if (clearPath === undefined) {
		clearPath = true;
	}

	if (pop === undefined) {
		pop = false;
	}

	if (!unit || !unit.hasOwnProperty("x") || !unit.hasOwnProperty("y")) {
		throw new Error("moveToUnit: Invalid unit.");
	}

	if (unit instanceof PresetUnit) {
		return this.moveTo(unit.roomx * 5 + unit.x + offX, unit.roomy * 5 + unit.y + offY, 3, clearPath);
	}

	if (!useTeleport) {
		this.moveTo(unit.x + offX, unit.y + offY, 15, clearPath, true);	// The unit will most likely be moving so call the first walk with 'pop' parameter
	}

	return this.moveTo(unit.x + offX, unit.y + offY, useTeleport && unit.type && unit.type === 1 ? 3 : 0, clearPath, pop);
};

Pather.useUnit = function (type, id, targetArea) {
	let i, coord, tick, unit, preArea = me.area;

	for (i = 0; i < 5; i += 1) {
		unit = getUnit(type, id);

		if (unit) {
			break;
		}

		delay(200);
	}

	if (!unit) {
		throw new Error("useUnit: Unit not found. TYPE: " + type + " ID: " + id + " AREA: " + me.area);
	}

	for (i = 0; i < 3; i += 1) {
		if (getDistance(me, unit) > 5) {
			Pather.moveToUnit(unit);
		}

		if (type === 2 && unit.mode === 0) {
			if ((me.area === 83 && targetArea === 100 && me.getQuest(21, 0) !== 1) || (me.area === 120 && targetArea === 128 && me.getQuest(39, 0) !== 1)) {
				throw new Error("useUnit: Incomplete quest.");
			}

			if (me.area === 92) {
				this.openUnit(2, 367);
			} else {
				this.openUnit(2, id);
			}
		}

		delay(300);

		if (type === 5) {
			Misc.click(0, 0, unit);
		} else {
			sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 3000) {
			if ((!targetArea && me.area !== preArea) || me.area === targetArea) {
				delay(100);

				return true;
			}

			delay(10);
		}

		Packet.flash(me.gid);
		coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
		Pather.moveTo(coord.x, coord.y);
	}

	return targetArea ? me.area === targetArea : me.area !== preArea;
};

//Add check in case "random" to return false if bot doesn't have cold plains wp yet
Pather.useWaypoint = function useWaypoint(targetArea, check) {
	switch (targetArea) {
	case undefined:
		throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
	case null:
	case "random":
		check = true;

		break;
	default:
		if (typeof targetArea !== "number") {
			throw new Error("useWaypoint: Invalid targetArea parameter");
		}

		if (this.wpAreas.indexOf(targetArea) < 0) {
			throw new Error("useWaypoint: Invalid area");
		}

		break;
	}

	let i, tick, wp, coord, retry, npc;

	for (i = 0; i < 12; i += 1) {
		if (me.area === targetArea || me.dead) {
			break;
		}

		if (me.inTown) {
			npc = getUnit(1, NPC.Warriv);

			if (me.area === 40 && npc && getDistance(me, npc) < 50) {
				if (npc && npc.openMenu()) {
					Misc.useMenu(0x0D37);

					if (!Misc.poll(function () {
						return me.area === 1;
					}, 2000, 100)) {
						throw new Error("Failed to go to act 1 using Warriv");
					}
				}
			}

			Town.move("waypoint");
		}

		wp = getUnit(2, "waypoint");

		if (wp && wp.area === me.area) {
			if (!me.inTown && getDistance(me, wp) > 7) {
				this.moveToUnit(wp);
			}

			if (check || Config.WaypointMenu) {
				if (getDistance(me, wp) > 5) {
					this.moveToUnit(wp);
				}

				Misc.click(0, 0, wp);

				tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
					if (getUIFlag(0x14)) { // Waypoint screen is open
						delay(500);

						switch (targetArea) {
						case "random":
							let retry = 0;

							while (true) {
								targetArea = this.wpAreas[rand(0, this.wpAreas.length - 1)];

								// get a valid wp, avoid towns
								if ([1, 40, 75, 103, 109].indexOf(targetArea) === -1 && getWaypoint(this.wpAreas.indexOf(targetArea))) {
									break;
								}

								if (retry >= 10) {
									if (!getWaypoint(this.wpAreas.indexOf(3))) {
										me.cancel();
										me.overhead("Trying to get the waypoint");

										if (this.getWP(3)) {
											return true;
										}

										throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
									}
								}

								retry++;
								delay(5);
							}

							break;
						case null:
							me.cancel();

							return true;
						}

						if (!getWaypoint(this.wpAreas.indexOf(targetArea))) {
							me.cancel();
							me.overhead("Trying to get the waypoint");

							if (this.getWP(targetArea)) {
								return true;
							}

							throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
						}

						break;
					}

					delay(10);
				}

				if (!getUIFlag(0x14)) {
					print("waypoint retry " + (i + 1));
					retry = Math.min(i + 1, 5);
					coord = CollMap.getRandCoordinate(me.x, -5 * retry, 5 * retry, me.y, -5 * retry, 5 * retry);
					this.moveTo(coord.x, coord.y);
					delay(200 + me.ping);

					Packet.flash(me.gid);

					continue;
				}
			}

			if (!check || getUIFlag(0x14)) {
				delay(200 + me.ping);
				wp.interact(targetArea);

				tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 4)) {
					if (me.area === targetArea) {
						delay(1000 + me.ping);

						return true;
					}

					delay(10 + me.ping);
				}

				while (!me.gameReady) {
					delay(500 + me.ping);
				}

				if (getUIFlag(0x14)) {
					me.cancel(); // In case lag causes the wp menu to stay open
				}
			}

			Packet.flash(me.gid);

			if (i > 1) { // Activate check if we fail direct interact twice
				check = true;
			}
		} else {
			Packet.flash(me.gid);
		}

		delay(200 + me.ping);
	}

	if (me.area === targetArea) {
		delay(200 + me.ping);
		return true;
	}

	throw new Error("useWaypoint: Failed to use waypoint to " + targetArea);
};

Pather.usePortal = function (targetArea, owner, unit) {
	if (targetArea && me.area === targetArea) {
		return true;
	}

	me.cancel();

	let i, tick, portal, useTK,
		preArea = me.area;

	for (i = 0; i < 10; i += 1) {
		if (me.dead) {
			break;
		}

		if (i > 0 && owner && me.inTown) {
			Town.move("portalspot");
		}

		portal = unit ? copyUnit(unit) : this.getPortal(targetArea, owner);

		if (portal) {
			if (i === 0) {
				useTK = me.sorceress && me.getSkill(sdk.skills.Telekinesis, 1) && me.inTown && portal.getParent();
			}

			if (portal.area === me.area) {
				if (useTK) {
					if (getDistance(me, portal) > 13) {
						Attack.getIntoPosition(portal, 13, 0x4);
					}

					Skill.cast(43, 0, portal);
				} else {
					if (getDistance(me, portal) > 5) {
						this.moveToUnit(portal);
					}

					if (getTickCount() - this.lastPortalTick > 2500) {
						if (i < 2) {
							sendPacket(1, 0x13, 4, 0x2, 4, portal.gid);
						} else {
							Misc.click(0, 0, portal);
						}
					} else {
						delay(300 + me.ping);
						continue;
					}
				}
			}

			if (portal.classid === 298 && portal.mode !== 2) { // Portal to/from Arcane
				Misc.click(0, 0, portal);

				tick = getTickCount();

				while (getTickCount() - tick < 2000) {
					if (portal.mode === 2 || me.area === sdk.areas.ArcaneSanctuary) {
						break;
					}

					delay(10 + me.ping);
				}
			}

			tick = getTickCount();

			while (getTickCount() - tick < 500 + me.ping) {
				if (me.area !== preArea) {
					this.lastPortalTick = getTickCount();
					delay(100 + me.ping);

					return true;
				}

				delay(10 + me.ping);
			}

			if (i > 1) {
				Packet.flash(me.gid);
				useTK = false;
			}
		} else {
			Packet.flash(me.gid);
		}

		delay(200 + me.ping);
	}

	return targetArea ? me.area === targetArea : me.area !== preArea;
};

//No more failing to get some place credit - Legacy Autosmurf
Pather.clearToExit = function (currentarea, targetarea, cleartype) {
	print("ÿc8Kolbot-SoloPlayÿc0: Start clearToExit");

	print("Currently in: " + Pather.getAreaName(me.area));
	print("Currentarea arg: " + Pather.getAreaName(me.area));

	delay(250 + me.ping);
	print("Clearing to: " + Pather.getAreaName(targetarea));

	while (me.area === currentarea) {
		try {
			Pather.moveToExit(targetarea, true, cleartype);
		} catch (e) {
			print("Caught Error.");

			print(e);
		}

		Packet.flash(me.gid);

		delay(me.ping * 2 + 500);
	}

	print("ÿc8Kolbot-SoloPlayÿc0: End clearToExit");
};

Pather.moveToPreset = function (area, unitType, unitId, offX, offY, clearPath, pop) {
	if (area === undefined || unitType === undefined || unitId === undefined) {
		throw new Error("moveToPreset: Invalid parameters.");
	}

	if (offX === undefined) {
		offX = 0;
	}

	if (offY === undefined) {
		offY = 0;
	}

	if (clearPath === undefined) {
		clearPath = false;
	}

	if (pop === undefined) {
		pop = false;
	}

	let presetUnit = getPresetUnit(area, unitType, unitId);

	if (!presetUnit) {
		throw new Error("moveToPreset: Couldn't find preset unit - id: " + unitId + " unitType: " + unitType + " in area: " + area);
	}

	return this.moveTo(presetUnit.roomx * 5 + presetUnit.x + offX, presetUnit.roomy * 5 + presetUnit.y + offY, 3, clearPath, pop);
};
