/*
*	@filename	MiscOverrides.js
*	@author		theBGuy, isid0re
*	@desc		Misc.js fixes to improve functionality
*/

if (!isIncluded("common/Misc.js")) { include("common/Misc.js"); }
if (!isIncluded("SoloPlay/Tools/Developer.js")) { include("SoloPlay/Tools/Developer.js"); }

Misc.checkQuest = function (id, state) {
	sendPacket(1, 0x40);
	delay(500 + me.ping);

	return me.getQuest(id, state);
};

// updates config obj across all threads - from legacy sonic
Misc.updateConfig = function () {
	scriptBroadcast("config--" + JSON.stringify(Misc.copy(Config)));
};

Misc.townEnabled = true;

Misc.townCheck = function () {
	let i, potion, check,
		needhp = true,
		needmp = true;

	if (!Misc.townEnabled || !Town.canTpToTown()) {
		return false;
	}

	if (Config.TownCheck && !me.inTown) {
		try {
			if (me.charlvl > 2 && me.gold > 500) {
				for (i = 0; i < 4; i += 1) {
					if (Config.BeltColumn[i] === "hp" && Config.MinColumn[i] > 0) {
						potion = me.getItem(-1, 2); // belt item

						if (potion) {
							do {
								if (potion.code.indexOf("hp") > -1) {
									needhp = false;

									break;
								}
							} while (potion.getNext());
						}

						if (needhp) {
							print("We need healing potions");

							check = true;
						}
					}

					if (Config.BeltColumn[i] === "mp" && Config.MinColumn[i] > 0) {
						potion = me.getItem(-1, 2); // belt item

						if (potion) {
							do {
								if (potion.code.indexOf("mp") > -1) {
									needmp = false;

									break;
								}
							} while (potion.getNext());
						}

						if (needmp) {
							print("We need mana potions");

							check = true;
						}
					}
				}
			}

			if (Config.OpenChests && Town.needKeys()) {
				check = true;
			}
		} catch (e) {
			check = false;
		}
	}

	if (check) {
		Messaging.sendToScript("libs/SoloPlay/Tools/TownChicken.js", "townCheck");
		print("BroadCasted townCheck");
		delay(500);

		return true;
	}

	return false;
};

Misc.openChest = function (unit) {
	// Skip invalid and Countess chests
	if (!unit || unit.x === 12526 || unit.x === 12565) {
		return false;
	}

	// already open
	if (unit.mode) { return true; }

	// locked chest, no keys
	if (!me.assassin && unit.islocked && !me.findItem(543, 0, 3)) {
		return false;
	}

	for (let i = 0; i < 7; i += 1) {
		if (Skill.useTK(unit) && i < 3) {
			if (getDistance(me, unit) > 13) {
				Attack.getIntoPosition(unit, 13, 0x4);
			}
			
			Skill.cast(sdk.skills.Telekinesis, 0, unit);
		} else {
			if (Pather.moveTo(unit.x + 1, unit.y + 2, 3) && getDistance(me, unit.x + 1, unit.y + 2) < 5) {
				sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
			}
		}

		let tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode) {
				return true;
			}

			delay(10);
		}

		Packet.flash(me.gid);
	}

	if (!me.idle) {
		Misc.click(0, 0, me.x, me.y); // Click to stop walking in case we got stuck
	}

	return false;
};

Misc.openChests = function (range) {
	let unit,
		unitList = [],
		containers = [
			"chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack",
			"holeanim", "roguecorpse", "corpse", "tomb2", "tomb3", "chest3",
			"skeleton", "guardcorpse", "sarcophagus", "object2", "cocoon", "hollow log", "hungskeleton",
			"bonechest", "woodchestl", "woodchestr",
			"burialchestr", "burialchestl", "chestl", "chestr", "groundtomb", "tomb3l", "tomb1l",
			"deadperson", "deadperson2", "groundtombl", "casket"
		],
		pita = ["barrel", "largeurn", "jar3", "jar2", "jar1", "urn", "jug"]; // pain in the ass
							
	!range && (range = 15);

	if (Config.OpenChests === 2) {
		containers = [
			"chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack",
			"barrel", "holeanim", "tomb2", "tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3",
			"jug", "skeleton", "guardcorpse", "sarcophagus", "object2", "cocoon", "basket", "stash", "hollow log", "hungskeleton",
			"pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl", "woodchestr", "barrel wilderness",
			"burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2", "icecavejar3",
			"icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
		];
	}

	unitList = getUnits(2).filter(function (chest) {
		return chest.name && chest.mode === 0 && chest.distance <= range &&
		(containers.includes(chest.name.toLowerCase()) || (chest.distance <= 2 && pita.includes(chest.name.toLowerCase()) && !Pather.useTeleport()) || (chest.name.toLowerCase() === "evilurn" && me.baal));
	});

	while (unitList.length > 0) {
		unitList.sort(Sort.units);
		unit = unitList.shift();

		if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x4)) && this.openChest(unit)) {
			Pickit.pickItems();
		}
	}

	return true;
};

Misc.useWell = function (range) {
	let unit = getUnit(2, "well", 0),
		unitList = [];

	!range && (range = 15);

	// I'm in perfect health, don't need this shit
	if (me.hp === me.hpmax && me.mp === me.mpmax && me.stamina === me.staminamax && 
		[sdk.states.Frozen, sdk.states.Poison, sdk.states.AmplifyDamage, sdk.states.Decrepify].some(function (states) { return me.getState(states); })) {
		return true;
	}

	if (unit) {
		do {
			if (unit.mode === 0 && getDistance(me, unit) <= range) {
				unitList.push(copyUnit(unit));
			}
		} while (unit.getNext());
	}

	while (unitList.length > 0) {
		unitList.sort(Sort.units);
		unit = unitList.shift();

		if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x4))) {
			this.getWell(unit);
		}
	}

	return true;
};

Misc.getWell = function (unit) {
	if (unit.mode !== 0) { return true; }

	for (let i = 0; i < 3; i += 1) {
		if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
			Misc.click(0, 0, unit);
		}

		let tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode !== 0) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

Misc.getExpShrine = function (shrineLocs) {
	if (me.getState(137)) {
		return true;
	}

	for (let get = 0; get < shrineLocs.length; get++) {
		if (shrineLocs[get] === 2) {
			Pather.journeyTo(shrineLocs[get]);
		} else {
			if (!Pather.checkWP(shrineLocs[get])) {
				Pather.getWP(shrineLocs[get]);
			} else {
				Pather.useWaypoint(shrineLocs[get]);
			}
		}

		Precast.doPrecast(true);
		Misc.getShrinesInArea(shrineLocs[get], 15, true);

		if (me.getState(137)) {
			break;
		}

		if (!me.inTown) {
			Town.goToTown();
		}
	}

	return true;
};

Misc.getLightResShrine = function (shrineLocs) {
	if (me.getState(5) || Check.Resistance().LR >= 75) {
		return true;
	}

	let oldAttack = [];

	if (me.barbarian && me.normal && me.getSkill(133, 1) >= 6) {
		oldAttack = Config.AttackSkill.slice();
		Config.AttackSkill = [-1, 133, -1, 133, -1];
	}

	for (let get = 0; get < shrineLocs.length; get++) {
		if (shrineLocs[get] === 2) {
			Pather.journeyTo(shrineLocs[get]);
		} else {
			if (!Pather.checkWP(shrineLocs[get])) {
				Pather.getWP(shrineLocs[get]);
			} else {
				Pather.useWaypoint(shrineLocs[get]);
			}
		}

		Precast.doPrecast(true);
		Misc.getShrinesInArea(shrineLocs[get], 10, true);

		if (me.getState(5)) {
			Town.goToTown();
			break;
		}

		if (!me.inTown) {
			Town.goToTown();
		}
	}

	if (oldAttack.length > 0) {
		Config.AttackSkill = oldAttack.slice();
	}

	return true;
};

Misc.getGoodShrine = function (shrineLocs) {
	/* function checkState (shrineType) {
		let result = false;

		switch (shrineType) {
		case 6: // Armor
			if (me.getState(128) && !me.paladin) {
				result = true;
			}

			break;
		case 7: // Combat
			if (me.getState(129)) {
				result = true;
			}

			break;
		case 8: // Resist Fire
			if (me.getState(131) || Check.Resistance().FR >= 75) {
				result = true;
			}

			break;
		case 10: // Resist Light
			if (me.getState(131) || Check.Resistance().LR >= 75) {
				result = true;
			}

			break;
		case 12: // Skill
			if (me.getState(134)) {
				result = true;
			}

			break;
		case 15: // Exp
			if (me.getState(137)) {
				result = true;
			}

			break;
		}

		return result;
	} */

	let oldAttack = [];

	// Build shrine array
	let shrines = [];

	if (Check.Resistance().LR < 75) {
		shrines.push(10);	// Light Resist
	}

	shrines.push(12);	// Skill

	if (me.barbarian || me.amazon) {
		shrines.push(7);	// Combat
	}

	if (!me.paladin) {
		shrines.push(6);	// Armor (paladin has holy shield, this would be unnecessary)
	}

	if (me.barbarian && me.normal && me.getSkill(133, 1) >= 6) {
		oldAttack = Config.AttackSkill.slice();
		Config.AttackSkill = [-1, 133, -1, 133, -1];
	}

	for (let get = 0; get < shrineLocs.length; get++) {
		if (shrineLocs[get] === 2) {
			Pather.journeyTo(shrineLocs[get]);
		} else {
			if (!Pather.checkWP(shrineLocs[get])) {
				Pather.getWP(shrineLocs[get]);
			} else {
				Pather.useWaypoint(shrineLocs[get]);
			}
		}

		Precast.doPrecast(true);

		if (Misc.getGoodShrinesInArea(shrineLocs[get], shrines, true)) {
			Town.goToTown();

			break;
		}
		
		/*if (checkState(shrineToLookFor)) {
			Town.goToTown();
			break;
		}*/

		if (!me.inTown) {
			Town.goToTown();
		}
	}

	if (oldAttack.length > 0) {
		Config.AttackSkill = oldAttack.slice();
	}

	return true;
};

Misc.getGoodShrinesInArea = function (area, types, use) {
	let i, coords, shrine,
		shrineLocs = [],
		shrineIds = [2, 81, 83],
		unit = getPresetUnits(area);

	if (unit) {
		for (i = 0; i < unit.length; i += 1) {
			if (shrineIds.indexOf(unit[i].id) > -1) {
				shrineLocs.push([unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y]);
			}
		}
	}

	while (shrineLocs.length > 0) {
		shrineLocs.sort(Sort.points);

		coords = shrineLocs.shift();

		Pather.moveTo(coords[0], coords[1], 2);

		shrine = getUnit(2, "shrine");

		if (shrine) {
			do {
				if (types.indexOf(shrine.objtype) > -1 && shrine.mode === 0) {
					Pather.moveTo(shrine.x - 2, shrine.y - 2);

					if (!use || this.getShrine(shrine)) {
						me.overhead("Got shrine type: " + shrine.objtype);
						return true;
					}
				}
			} while (shrine.getNext());
		}
	}

	return false;
};

// Add use of tk for shrine - from autoplay
Misc.getShrine = function (unit) {
	if (unit.mode) { return false; }

	for (let i = 0; i < 3; i++) {
		if (Skill.useTK(unit) && i < 2) {
			if (getDistance(me, unit) > 13) {
				Attack.getIntoPosition(unit, 13, 0x4 );
			}
			
			Skill.cast(sdk.skills.Telekinesis, 0, unit);
		} else {
			if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
				Misc.click(0, 0, unit);
			}
		}

		let tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode) { return true; }

			delay(10);
		}
	}

	return false;
};

Misc.checkItemForSocketing = function () {
	if (me.classic || !me.getQuest(sdk.quests.SiegeOnHarrogath, 1)) {
		return false;
	}

	let item;
	let items = me.getItems().filter(item => item.getStat(sdk.stats.NumSockets) === 0 && getBaseStat("items", item.classid, "gemsockets") > 0);

	if (Check.currentBuild().caster) {
		if (me.normal) {
			for (let i = 0; i < items.length; i++) {
				// Broad Sword
				if (items[i].classid === 30 && items[i].ilvl >= 26 && [2, 3].indexOf(items[i].quality) > -1) {
					item = items[i];
					break;
				}

				// Crystal Sword
				if (items[i].classid === 29 && items[i].ilvl >= 26 && items[i].ilvl <= 40 && [2, 3].indexOf(items[i].quality) > -1) {
					item = items[i];
					break;
				}
			}
		} else if (me.nightmare) {
			// Eth Bill, Eth Colossus Volgue, lidless or monarch
			for (let i = 0; i < items.length; i++) {
				if ([151, 254].indexOf(items[i].classid) > -1 && [2, 3].indexOf(items[i].quality) > -1 && items.ethereal) {
					item = items[i];
					break;
				}

				// Lidless
				if (items[i].classid === 396 && items[i].quality === 7 &&
					([sdk.storage.Inventory, sdk.storage.Stash].indexOf(items[i].location) > -1 || (me.weaponswitch === 0 && [4, 5].indexOf(items[i].bodylocation) > -1))) {
					item = items[i];
					break;
				}

				if (!me.paladin && ["Cold", "Meteorb", "Blizzballer"].indexOf(SetUp.finalBuild) === -1) {
					// Monarch
					if (items[i].classid === 447 && items[i].ilvl >= 41 && [2, 3].indexOf(items[i].quality) > -1 && !items.ethereal) {
						item = items[i];
						break;
					}
				}

				if (me.assassin) {
					// Non-Eth Andys's
					if (items[i].classid === 428 && items[i].quality === 5 && !items.ethereal) {
						item = items[i];
						break;
					}
				}
			}
		} else if (me.sorceress && ["Blova", "Lightning"].indexOf(SetUp.finalBuild) === -1) {	// Non-light sorc uses tal helm
			for (let i = 0; i < items.length; i++) {
				// Tal Helm
				if (items[i].classid === 358 && items[i].quality === 5) {
					item = items[i];
					break;
				}
			}
		} else if (me.druid) {	// Druid uses Jalal's
			for (let i = 0; i < items.length; i++) {
				// Jalal's
				if (items[i].classid === 472 && items[i].quality === 7) {
					item = items[i];
					break;
				}
			}
		} else if (me.assassin) {	// Assassin uses Andys's
			for (let i = 0; i < items.length; i++) {
				// Non-Eth Andys's
				if (items[i].classid === 428 && items[i].quality === 7 && !items.ethereal) {
					item = items[i];
					break;
				}
			}
		} else {						//Otherwise Shako
			for (let i = 0; i < items.length; i++) {
				// Shako
				if (items[i].classid === 422 && items[i].quality === 7) {
					item = items[i];
					break;
				}
			}
		}
	} else {
		if (me.amazon) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Bill
					if (items[i].classid === 151 && items[i].ilvl >= 25 && [2, 3].indexOf(items[i].quality) > -1) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Eth Bill or Colossus Volgue
					if ([151, 254].indexOf(items[i].classid) > -1 && [2, 3].indexOf(items[i].quality) > -1 && items.ethereal) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Shako
					if (items[i].classid === 422 && items[i].quality === 7) {
						item = items[i];
						break;
					}
				}
			}
		}

		if (me.barbarian) {
			if (me.normal) {
				if (Item.getEquippedItem(5).prefixnum !== 20561) {	// Honor
					for (let i = 0; i < items.length; i++) {
						// Flamberge
						if (items[i].classid === 37 && items[i].ilvl >= 41 && [2, 3].indexOf(items[i].quality) > -1) {
							item = items[i];
							break;
						}
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Arreat's
					if (items[i].classid === 477 && items[i].quality === 7) {
						item = items[i];
						break;
					}

					// IK Armor
					if (items[i].classid === 442 && items[i].quality === 5) {
						item = items[i];
						break;
					}

					if (Item.getEquippedItem(5).prefixnum !== 20561) {	// Honor
						// Zweihander
						if (items[i].classid === 130 && items[i].ilvl >= 41 && [2, 3].indexOf(items[i].quality) > -1) {
							item = items[i];
							break;
						}
					}
				}
			}
		}
		
	}

	return item;
};

// TODO: clean this up, I want to be able to pass in the array from the Config file and process out the valid items and use that instead of this hard-coded version
Misc.checkItemForImbueing = function () {
	if (!me.getQuest(sdk.quests.ToolsoftheTrade, 1)) {
		return false;
	}

	let item;
	let items = me.getItems()
		.filter(item => item.getStat(sdk.stats.NumSockets) === 0 && [sdk.itemquality.Normal, sdk.itemquality.Superior].indexOf(item.quality) > -1);

	switch (me.classid) {
	case sdk.charclass.Amazon:
		// Only use imbue if not using final weapon
		if (Item.getEquippedItem(4).tier < 100000) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Maiden Javelin
					if (items[i].classid === 285) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Ceremonial Javelin
					if (items[i].classid === 295) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Matriarchal Javelin
					if (items[i].classid === 305) {
						item = items[i];
						break;
					}
				}
				
			}
		}
		
		break;
	case sdk.charclass.Sorceress:
		// Less than a spirit sword
		if (Item.getEquippedItem(4).tier < 777) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Jared's Stone
					if (items[i].classid === 280) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Swirling Crystal
					if (items[i].classid === 290) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Dimensional Shard
					if (items[i].classid === 300) {
						item = items[i];
						break;
					}
				}
			}
		}
		
		break;
	case sdk.charclass.Necromancer:
		// Less than spirit shield
		if (Item.getEquippedItem(5).tier < 1000) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Demon Head
					if (items[i].classid === 417) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Hierophant Trophy
					if (items[i].classid === 487) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Bloodlord Skull
					if (items[i].classid === 507) {
						item = items[i];
						break;
					}
				}
			}
		}
		
		break;
	case sdk.charclass.Paladin:
		// Less than a spirit sword
		if (Item.getEquippedItem(4).tier < 777) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// War Scepter
					if (items[i].classid === 17) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Divine Scepter
					if (items[i].classid === 110) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Caduceus
					if (items[i].classid === 213) {
						item = items[i];
						break;
					}
				}
			}
		}
		
		break;
	case sdk.charclass.Barbarian:
		// Less than final helm
		if (Item.getEquippedItem(1).tier < 100000) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Avenger Guard
					if (items[i].classid === 407) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Slayer Guard
					if (items[i].classid === 477) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Carnage Helm
					if (items[i].classid === 493) {
						item = items[i];
						break;
					}
				}
			}
		}
		
		break;
	case sdk.charclass.Druid:
		// Less than final helm
		if (Item.getEquippedItem(1).tier < 100000) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Spirit Mask
					if (items[i].classid === 402) {
						item = items[i];
						break;
					}
				}
			} else if (me.nightmare) {
				for (let i = 0; i < items.length; i++) {
					// Totemic Mask
					if (items[i].classid === 472) {
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					// Dream Spirit
					if (items[i].classid === 492) {
						item = items[i];
						break;
					}
				}
			}
		}

		break;
	case sdk.charclass.Assassin:
		// Less than a spirit sword
		if (Item.getEquippedItem(4).tier < 777) {
			if (me.normal) {
				for (let i = 0; i < items.length; i++) {
					// Claws
					if (items[i].classid === 179) {
						item = items[i];
						break;
					}
				}
			} else if (me.diff > 0) {
				for (let i = 0; i < items.length; i++) {
					// Greater Talons
					if (items[i].classid === 187) {
						item = items[i];
						break;
					}
				}
			}
		}

		break;
	default:
		break;
	}

	if (item === undefined || !item) {
		if (me.normal) {
			for (let i = 0; i < items.length; i++) {
				// Plated Belt
				if (items[i].classid === 348) {
					item = items[i];
					break;
				}
			}
		} else if (me.nightmare) {
			for (let i = 0; i < items.length; i++) {
				// War Belt
				if (items[i].classid === 394) {
					item = items[i];
					break;
				}
			}
		} else {
			for (let i = 0; i < items.length; i++) {
				// Mithril Coil
				if (items[i].classid === 462) {
					item = items[i];
					break;
				}
			}
		}
	}

	return item;
};

Misc.addSocketables = function () {
	let item, sockets;
	let items = me.getItems().filter(item => item.getStat(sdk.stats.NumSockets) > 0);

	for (let i = 0; i < items.length; i++) {
		sockets = items[i].getStat(sdk.stats.NumSockets);

		// no need to check anything else if already socketed
		if (!!items[i].getItem()) {
			continue;
		}

		switch (items[i].quality) {
		case sdk.itemquality.Magic:
		case sdk.itemquality.Rare:
		case sdk.itemquality.Crafted:
			// Any magic, rare, or crafted item with open sockets
			if (items[i].mode === sdk.itemmode.Equipped && [1, 3, 4, 5].indexOf(items[i].bodylocation) > -1 && sockets >= 1) {
				item = items[i];
				break;
			}

			break;
		case sdk.itemquality.Set:
			// Tal Helm
			if (items[i].classid === 358 && sockets === 1) {
				item = items[i];
				break;
			}

			// Tal Armor
			if (items[i].classid === 440 && sockets === 1) {
				item = items[i];
				break;
			}

			// IK Maul
			if (me.barbarian && items[i].classid === 219 && sockets === 2) {
				item = items[i];
				break;
			}

			// IK Helm
			if (me.barbarian && items[i].classid === 407 && sockets === 2) {
				item = items[i];
				break;
			}

			break;
		case sdk.itemquality.Unique:
			// Shako
			if (items[i].classid === 422 && sockets === 1) {
				item = items[i];
				break;
			}

			// Arreats
			if (items[i].classid === 477 && sockets === 1) {
				item = items[i];
				break;
			}

			// Jalal's
			if (items[i].classid === 472 && sockets === 1) {
				item = items[i];
				break;
			}

			// Andys's
			if (items[i].classid === 428 && sockets === 1) {
				item = items[i];
				break;
			}

			// Crown of Ages
			if (items[i].classid === 427 && sockets >= 1) {
				item = items[i];
				break;
			}

			// Moser's
			if (items[i].classid === 375 && sockets >= 1) {
				item = items[i];
				break;
			}

			// Lidless
			if (items[i].classid === 396 && sockets >= 1) {
				item = items[i];
				break;
			}

			// Dijjin Slayer
			if (items[i].classid === 222 && sockets >= 1) {
				item = items[i];
				break;
			}

			// Spirit Forge
			if (items[i].classid === 363 && sockets >= 1) {
				item = items[i];
				break;
			}

			break;
		default:
			break;
		}


		if (!!item) {
			break;
		}
	}

	// TODO: figure out better way to do this
	function highestGemAvailable (gem, checkList) {
		let highest = false;
		let myItems = me.getItems().filter(item => item.classid >= 557 && item.classid <= 601 && [587, 588, 589, 590, 591, 592, 593, 594, 595, 596].indexOf(item.classid) === -1);

		for (let i = 0; i < myItems.length; i++) {
			switch (gem.classid) {
			case 562: 	// chipped Topaz
			case 563: 	// flawed Topaz
			case 564: 	// regular Topaz
			case 565: 	// flawless Topaz
			case 566: 	// perfect Topaz
				if (myItems[i].classid === 566 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 565 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 564 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 563 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 562 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				}

				break;
			case 577: 	// chipped Ruby
			case 578: 	// flawed Ruby
			case 579: 	// regular Ruby
			case 580: 	// flawless Ruby
			case 581: 	// perfect Ruby
				if (myItems[i].classid === 581 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 580 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 579 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 578 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 577 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				}

				break;
			case 582: 	// chipped Diamond
			case 583: 	// flawed Diamond
			case 584: 	// regular Diamond
			case 585: 	// flawless Diamond
			case 586: 	// perfect Diamond
				if (myItems[i].classid === 586 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 585 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 584 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 583 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 582 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				}

				break;
			case 597: 	// chipped Skull
			case 598: 	// flawed Skull
			case 599: 	// regular Skull
			case 600: 	// flawless Skull
			case 601: 	// perfect Skull
				if (myItems[i].classid === 601 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 600 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 599 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 598 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				} else if (myItems[i].classid === 597 && checkList.indexOf(myItems[i]) === -1) {
					highest = true;
					break;
				}

				break;
			default:
				break;
			}
			

			if (highest) {
				break;
			}
		}

		return highest;
	}

	if (item) {
		let socketable, sockets = item.getStat(sdk.stats.NumSockets);
		let multiple = [];
		let ready = false;

		for (let i = 0; i < items.length; i++) {
			// Um Rune to Shako, Jalal's, or Tal Helm
			if (items[i].classid === sdk.items.runes.Um && [422, 472, 358].indexOf(item.classid) > -1) {
				socketable = items[i];
				break;
			}

			// Ber Rune to Tal Armor
			if (items[i].classid === sdk.items.runes.Ber && item.classid === 440) {
				socketable = items[i];
				break;
			}

			// Cham Rune to Arreat's
			if (items[i].classid === sdk.items.runes.Cham && item.classid === 477) {
				socketable = items[i];
				break;
			}

			// Ral Rune to Andys's
			if (items[i].classid === sdk.items.runes.Ral && item.classid === 428) {
				socketable = items[i];
				break;
			}

			// Um Rune to CoA //TODO: Add 1 Um and 1 Ber
			if (items[i].classid === sdk.items.runes.Um && item.classid === 427 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);
						
						if (multiple.length === sockets) {
							ready = true;
							break;
						}
						
						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			// Um to Moser's
			if (items[i].classid === sdk.items.runes.Um && item.classid === 375 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);
						
						if (multiple.length === sockets) {
							ready = true;
							break;
						}
						
						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			// P-diamond to Moser's
			if (items[i].classid === sdk.items.gems.Perfect.Diamond && item.classid === 375 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);
						
						if (multiple.length === sockets) {
							ready = true;
							break;
						}
						
						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			// Um Rune to Lidless
			if (items[i].classid === sdk.items.runes.Um && item.classid === 396) {
				socketable = items[i];
				break;
			}

			// P-diamond to Lidless
			if (items[i].classid === sdk.items.gems.Perfect.Diamond && item.classid === 396) {
				socketable = items[i];
				break;
			}

			// Shael Rune and IK Mauls
			if (items[i].classid === sdk.items.runes.Shael && item.classid === 219 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);
						
						if (multiple.length === sockets) {
							ready = true;
							break;
						}
						
						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			// Ber Rune and IK Helm
			if (items[i].classid === sdk.items.runes.Ber && item.classid === 407 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);
						
						if (multiple.length === sockets) {
							ready = true;
							break;
						}
						
						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			// Amn Rune and Dijjin Slayer
			if (items[i].classid === sdk.items.runes.Amn && item.classid === 222 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);

						if (multiple.length === sockets) {
							ready = true;
							break;
						}

						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			// Shael Rune and Spirit Forge
			if (items[i].classid === sdk.items.runes.Shael && item.classid === 363 && multiple.indexOf(items[i]) === -1) {
				if (sockets === 2) {
					if (multiple.length < sockets) {
						multiple.push(items[i]);
						
						if (multiple.length === sockets) {
							ready = true;
							break;
						}
						
						continue;
					} else {
						ready = true;
						break;
					}
				} else {
					socketable = items[i];
					break;
				}
			}

			if ([sdk.itemquality.Magic, sdk.itemquality.Rare, sdk.itemquality.Crafted].indexOf(item.quality) > -1 && multiple.indexOf(items[i]) === -1) {
				switch (item.itemType) {
				case 2: // Shield
				case 69: // Voodoo Heads
				case 70: // Auric Shields
					// Diamonds
					if ([582, 583, 584, 585, 586].indexOf(items[i].classid) > -1) {
						if (highestGemAvailable(items[i], multiple)) {
							if (sockets > 1) {
								if (multiple.length < sockets) {
									multiple.push(items[i]);
									
									if (multiple.length === sockets) {
										ready = true;
										break;
									}
									
									continue;
								} else {
									ready = true;
									break;
								}
							} else {
								socketable = items[i];
								break;
							}
						}
					}

					break;
				case 3: // Armor
				case 37: // Helm
				case 71: // Barb Helm
				case 75: // Circlet
				case 72: // Druid Pelts
					// Rubys
					if ([577, 578, 579, 580, 581].indexOf(items[i].classid) > -1) {
						if (highestGemAvailable(items[i], multiple)) {
							if (sockets > 1) {
								if (multiple.length < sockets) {
									multiple.push(items[i]);
									
									if (multiple.length === sockets) {
										ready = true;
										break;
									}
									
									continue;
								} else {
									ready = true;
									break;
								}
							} else {
								socketable = items[i];
								break;
							}
						}
					}

					break;
				default:
					if (!Check.currentBuild().caster) {
						// Skulls
						if ([597, 598, 599, 600, 601].indexOf(items[i].classid) > -1) {
							if (highestGemAvailable(items[i], multiple)) {
								if (sockets > 1) {
									if (multiple.length < sockets) {
										multiple.push(items[i]);
										
										if (multiple.length === sockets) {
											ready = true;
											break;
										}
										
										continue;
									} else {
										ready = true;
										break;
									}
								} else {
									socketable = items[i];
									break;
								}
							}
						}
					} else {
						// Tir rune in normal, Io rune otherwise and Shael's if assassin
						if ((items[i].classid === sdk.items.runes.Tir && me.normal) ||
							(items[i].classid === sdk.items.runes.Io && !me.normal && !me.assassin) ||
							(me.assassin && items[i].classid === sdk.items.runes.Shael)) {
							if (sockets > 1) {
								if (multiple.length < sockets) {
									multiple.push(items[i]);
									
									if (multiple.length === sockets) {
										ready = true;
										break;
									}
									
									continue;
								} else {
									ready = true;
									break;
								}
							} else {
								socketable = items[i];
								break;
							}
						}
					}

					break;
				}
			}
		}

		if (socketable && me.charlvl >= socketable.lvlreq) {
			if (Misc.addSocketableToItem(item, socketable)) {
				D2Bot.printToConsole("Added socketable: " + socketable.fname + " to " + item.fname, 6);
			} else {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to add socketable to " + item.fname);
			}
			
		}

		if (multiple.length > 0 && ready && me.charlvl >= socketable.lvlreq) {
			// check to ensure I am a high enough level to use wanted socketables
			for (let i = 0; i < multiple.length; i++) {
				if (me.charlvl < multiple[i].lvlreq) {
					print("ÿc8Kolbot-SoloPlayÿc0: Not high enough level for " + multiple[i].fname);
					return;
				}
			}

			for (let i = 0; i < multiple.length; i++) {
				if (Misc.addSocketableToItem(item, multiple[i])) {
					D2Bot.printToConsole("Added socketable: " + multiple[i].fname + " to " + item.fname, 6);
					delay(250 + me.ping);
				} else {
					print("ÿc8Kolbot-SoloPlayÿc0: Failed to add socketable to " + item.fname);
				}
			}
		}
	}
};

Misc.addSocketableToItem = function (item, rune) {
	if (item.getStat(sdk.stats.NumSockets) === 0) {
		return false;
	}

	if (item.mode === sdk.itemmode.Equipped) {
		let bodyLoc = item.bodylocation;

		// No space to get the item back
		if (!Storage.Inventory.CanFit(item)) {
			print("ÿc8AddSocketableToItemÿc0 :: No space to get item back");
			return false;
		} else {
			if (item.isInStash) {
				Town.openStash();
			}

			if (!Storage.Inventory.MoveTo(item)) {
				return false;
			}
		}

		if (!rune.toCursor()) {
			return false;
		}

		for (let i = 0; i < 3; i += 1) {
			sendPacket(1, 0x28, 4, rune.gid, 4, item.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!me.itemoncursor) {
					delay(300);

					break;
				}

				delay(10);
			}

			if (item.getItem()) {
				Misc.logItem("Added " + rune.name + " to: ", item);
				bodyLoc && (Item.equip(item, bodyLoc));

				return true;
			}
		}

		return false;
	} else {
		if (Runewords.socketItem(item, rune)) {
			Misc.logItem("Added " + rune.name + " to: ", item);
			return true;
		}	
	}

	return false;
};

// Log kept item stats in the manager.
Misc.logItem = function (action, unit, keptLine) {
	if (!this.useItemLog || unit === undefined || !unit) {
		return false;
	}

	// Don't check for config settings if there's no config loaded	
	if (Config.loaded) {
		if (!Config.LogKeys && ["pk1", "pk2", "pk3"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogOrgans && ["dhn", "bey", "mbr"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogLowRunes && ["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "r10", "r11", "r12", "r13", "r14"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogMiddleRunes && ["r15", "r16", "r17", "r18", "r19", "r20", "r21", "r22", "r23"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogHighRunes && ["r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32", "r33"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogLowGems && ["gcv", "gcy", "gcb", "gcg", "gcr", "gcw", "skc", "gfv", "gfy", "gfb", "gfg", "gfr", "gfw", "skf", "gsv", "gsy", "gsb", "gsg", "gsr", "gsw", "sku"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogHighGems && ["gzv", "gly", "glb", "glg", "glr", "glw", "skl", "gpv", "gpy", "gpb", "gpg", "gpr", "gpw", "skz"].indexOf(unit.code) > -1) {
			return false;
		}

		for (let i = 0; i < Config.SkipLogging.length; i++) {
			if (Config.SkipLogging[i] === unit.classid || Config.SkipLogging[i] === unit.code) {
				return false;
			}
		}
	}

	if (!unit.fname) {
		return false;
	}

	let lastArea, code, desc, sock, itemObj,
		color = -1,
		name = unit.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<:;.*]|\/|\\/g, "").trim();

	desc = this.getItemDesc(unit);
	color = unit.getColor();

	if (action.match("kept", "i")) {
		lastArea = DataFile.getStats().lastArea;

		if (lastArea) {
			desc += ("\n\\xffc0Area: " + lastArea);
		}
	}

	let mercCheck = false;

	if (action.match("Merc")) {
		mercCheck = true;
	}

	if (!action.match("kept", "i") && !action.match("Shopped") && (NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetCharmTier(unit) > 0)) {
		if (!mercCheck) {
			if (NTIP.GetCharmTier(unit) > 0) {
				desc += ("\n\\xffc0Autoequip charm tier: " + NTIP.GetCharmTier(unit));
			}

			if (NTIP.GetTier(unit) > 0) {
				desc += ("\n\\xffc0Autoequip char tier: " + NTIP.GetTier(unit));
			}
		} else {
			desc += ("\n\\xffc0Autoequip merc tier: " + NTIP.GetMercTier(unit));

		}
		
	}

	if (unit.getFlag(0x10)) {
		switch (unit.quality) {
		case 5: // Set
			switch (unit.classid) {
			case 27: // Angelic sabre
				code = "inv9sbu";

				break;
			case 74: // Arctic short war bow
				code = "invswbu";

				break;
			case 308: // Berserker's helm
				code = "invhlmu";

				break;
			case 330: // Civerb's large shield
				code = "invlrgu";

				break;
			case 31: // Cleglaw's long sword
			case 227: // Szabi's cryptic sword
				code = "invlsdu";

				break;
			case 329: // Cleglaw's small shield
				code = "invsmlu";

				break;
			case 328: // Hsaru's buckler
				code = "invbucu";

				break;
			case 306: // Infernal cap / Sander's cap
				code = "invcapu";

				break;
			case 30: // Isenhart's broad sword
				code = "invbsdu";

				break;
			case 309: // Isenhart's full helm
				code = "invfhlu";

				break;
			case 333: // Isenhart's gothic shield
				code = "invgtsu";

				break;
			case 326: // Milabrega's ancient armor
			case 442: // Immortal King's sacred armor
				code = "invaaru";

				break;
			case 331: // Milabrega's kite shield
				code = "invkitu";

				break;
			case 332: // Sigon's tower shield
				code = "invtowu";

				break;
			case 325: // Tancred's full plate mail
				code = "invfulu";

				break;
			case 3: // Tancred's military pick
				code = "invmpiu";

				break;
			case 113: // Aldur's jagged star
				code = "invmstu";

				break;
			case 234: // Bul-Kathos' colossus blade
				code = "invgsdu";

				break;
			case 372: // Grizwold's ornate plate
				code = "invxaru";

				break;
			case 366: // Heaven's cuirass
			case 215: // Heaven's reinforced mace
			case 449: // Heaven's ward
			case 426: // Heaven's spired helm
				code = "inv" + unit.code + "s";

				break;
			case 357: // Hwanin's grand crown
				code = "invxrnu";

				break;
			case 195: // Nalya's scissors suwayyah
				code = "invskru";

				break;
			case 395: // Nalya's grim helm
			case 465: // Trang-Oul's bone visage
				code = "invbhmu";

				break;
			case 261: // Naj's elder staff
				code = "invcstu";

				break;
			case 375: // Orphan's round shield
				code = "invxmlu";

				break;
			case 12: // Sander's bone wand
				code = "invbwnu";

				break;
			}

			break;
		case 7: // Unique
			for (let i = 0; i < 401; i += 1) {
				if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
					code = getBaseStat(17, i, "invfile");

					break;
				}
			}

			break;
		}
	}

	if (!code) {
		if (["ci2", "ci3"].indexOf(unit.code) > -1) { // Tiara/Diadem
			code = unit.code;
		} else {
			code = getBaseStat(0, unit.classid, 'normcode') || unit.code;
		}

		code = code.replace(" ", "");

		if ([10, 12, 58, 82, 83, 84].indexOf(unit.itemType) > -1) {
			code += (unit.gfx + 1);
		}
	}

	sock = unit.getItem();

	if (sock) {
		do {
			if (sock.itemType === 58) {
				desc += "\n\n";
				desc += this.getItemDesc(sock);
			}
		} while (sock.getNext());
	}

	if (keptLine) {
		desc += ("\n\\xffc0Line: " + keptLine);
	}

	desc += "$" + (unit.getFlag(0x400000) ? ":eth" : "");

	itemObj = {
		title: action + " " + name,
		description: desc,
		image: code,
		textColor: unit.quality,
		itemColor: color,
		header: "",
		sockets: this.getItemSockets(unit)
	};

	D2Bot.printToItemLog(itemObj);

	return true;
};

Misc.shapeShift = function (mode) {
	let skill, state;

	switch (mode.toString().toLowerCase()) {
	case "0":
		return false;
	case "1":
	case "werewolf":
		state = 139;
		skill = 223;

		break;
	case "2":
	case "werebear":
		state = 140;
		skill = 228;

		break;
	default:
		throw new Error("shapeShift: Invalid parameter");
	}

	if (me.getState(state)) {
		return true;
	}

	me.switchWeapons(Precast.getBetterSlot(skill));

	for (let i = 0; i < 3; i += 1) {
		Skill.cast(skill, 0);

		let tick = getTickCount();

		while (getTickCount() - tick < 2000) {
			if (me.getState(state)) {
				delay(250);

				return true;
			}

			delay(10);
		}
	}

	return false;
};

Misc.buyItem = function (unit, shiftBuy, gamble) {
	let oldGold = me.gold,
		itemCount = me.itemcount,
		npc = getInteractedNPC();

	if (!npc) {
		print("buyItem: No NPC menu open.");
		return false;
	}

	// Can we afford the item?
	if (me.gold < unit.getItemCost(0)) {
		return false;
	}

	for (let i = 0; i < 3; i += 1) {
		sendPacket(1, 0x32, 4, npc.gid, 4, unit.gid, 4, shiftBuy ? 0x80000000 : gamble ? 0x2 : 0x0, 4, 0);

		let tick = getTickCount();

		while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
			if (shiftBuy && me.gold < oldGold) {
				return true;
			}

			if (itemCount !== me.itemcount) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

// singleplayer delay(0) fix
Packet.openMenu = function (unit) {
	if (unit.type !== 1) {
		throw new Error("openMenu: Must be used on NPCs.");
	}

	if (getUIFlag(0x08)) {
		return true;
	}

	for (let i = 0; i < 5; i += 1) {
		if (getDistance(me, unit) > 4) {
			Pather.moveToUnit(unit);
		}

		sendPacket(1, 0x13, 4, 1, 4, unit.gid);
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (getUIFlag(0x08)) {
				delay(Math.max(500, me.ping * 2));

				return true;
			}

			if (getInteractedNPC() && getTickCount() - tick > 1000) {
				me.cancel();
			}

			delay(100);
		}

		sendPacket(1, 0x2f, 4, 1, 4, unit.gid);
		delay(me.ping * 2 + 1);
		sendPacket(1, 0x30, 4, 1, 4, unit.gid);
		delay(me.ping * 2 + 1);
		this.flash(me.gid);
	}

	return false;
};
