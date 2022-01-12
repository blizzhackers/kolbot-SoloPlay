/*
*	@filename	PickitOverrides.js
*	@author		theBGuy
*	@desc		Pickit.js fixes to improve functionality
*	@credits	based on existing pickit.js from PBP autoplays (Sonic, AutoSorc, etc), isid0re for formatting
*/

if (!isIncluded("common/Pickit.js")) { include("common/Pickit.js"); }
if (!isIncluded("SoloPlay/Functions/NTIPOverrides.js")) { include("SoloPlay/Functions/NTIPOverrides.js"); }
if (!isIncluded("SoloPlay/Functions/MiscOverrides.js")) { include("SoloPlay/Functions/MiscOverrides.js"); }
if (!isIncluded("SoloPlay/Functions/ProtoTypesOverrides.js")) {	include("SoloPlay/Functions/ProtoTypesOverrides.js"); }

Pickit.enabled = true;

Pickit.checkItem = function (unit) {
	let rval = NTIP.CheckItem(unit, false, true);

	let durability = unit.getStat(72);

	if (unit.getStat(73) > 0 && typeof durability === "number" && durability * 100 / unit.getStat(73) <= 0) {
		return {
			result: 4,
			line: null
		};
	}

	if ((unit.classid === sdk.items.runes.Ral || unit.classid === sdk.items.runes.Ort) && Town.repairIngredientCheck(unit)) {
		return {
			result: 6,
			line: null
		};
	}

	if (unit.classid === sdk.items.StaminaPotion && (me.staminaPercent <= 85 || me.runwalk === 0) && Item.getQuantityOwned(unit) < 2) {
		return {
			result: 1,
			line: "LowStamina"
		};
	}

	if (CraftingSystem.checkItem(unit)) {
		return {
			result: 5,
			line: null
		};
	}

	if (Cubing.checkItem(unit)) {
		return {
			result: 2,
			line: null
		};
	}

	if (Runewords.checkItem(unit)) {
		return {
			result: 3,
			line: null
		};
	}

	if ((NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetCharmTier(unit) > 0 || NTIP.GetSecondaryTier(unit) > 0) && !unit.identified) {
		return {
			result: -1,
			line: null
		};
	}

	if ([sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(unit.classid) && NTIP.GetCharmTier(unit) > 0 && unit.identified) {
		if (Item.autoEquipCharmCheck(unit)) {
			return {
				result: 1,
				line: "Autoequip charm Tier: " + NTIP.GetCharmTier(unit)
			};
		}

		return NTIP.CheckItem(unit, NTIP_CheckListNoTier, true);
	}

	if ((NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetSecondaryTier(unit) > 0) && unit.identified) {
		if (Item.autoEquipCheck(unit)) {
			return {
				result: 1,
				line: "Autoequip Tier: " + NTIP.GetTier(unit)
			};
		}

		if (Item.autoEquipCheckMerc(unit)) {
			return {
				result: 1,
				line: "Autoequip MercTier: " + NTIP.GetMercTier(unit)
			};
		}

		if (Item.autoEquipCheckSecondary(unit)) {
			return {
				result: 1,
				line: "Autoequip Secondary Tier: " + NTIP.GetSecondaryTier(unit)
			};
		}

		return NTIP.CheckItem(unit, NTIP_CheckListNoTier, true);
	}

	// LowGold
	if (rval.result === 0 && !getBaseStat("items", unit.classid, "quest") && !Town.ignoredItemTypes.includes(unit.itemType) && !unit.isQuestItem &&
		(unit.isInInventory || (me.gold < Config.LowGold || me.gold < 500000))) {
		// Gold doesn't take up room, just pick it up
		if (unit.classid === sdk.items.Gold) {
			return {
				result: 4,
				line: null
			};
		}

		if (unit.getItemCost(1) / (unit.sizex * unit.sizey) >= 2000) {
			// If total gold is less than 500k pick up anything worth 2k gold per square to sell in town.
			return {
				result: 4,
				line: "Valuable Item: " + unit.getItemCost(1)
			};
		} else if (unit.getItemCost(1) / (unit.sizex * unit.sizey) >= 10) {
			// If total gold is less than LowGold setting pick up anything worth 10 gold per square to sell in town.
			return {
				result: 4,
				line: "LowGold Item: " + unit.getItemCost(1)
			};
		}
	}

	return rval;
};

Pickit.pickItems = function () {
	let status, canFit,
		needMule = false,
		pickList = [];

	Town.clearBelt();

	if (me.dead || Config.PickRange < 0 || !Pickit.enabled) return false;

	while (!me.idle) {
		delay(40);
	}

	let item = getUnit(4);

	if (item) {
		do {
			if ((item.mode === 3 || item.mode === 5) && getDistance(me, item) <= Config.PickRange) {
				pickList.push(copyUnit(item));
			}
		} while (item.getNext());
	}

	while (pickList.length > 0) {
		if (me.dead || !Pickit.enabled) return false;

		pickList.sort(this.sortItems);

		// Check if the item unit is still valid and if it's on ground or being dropped
		// Don't pick items behind walls/obstacles when walking
		if (copyUnit(pickList[0]).x !== undefined && (pickList[0].mode === 3 || pickList[0].mode === 5) && (Pather.useTeleport() || me.inTown || !checkCollision(me, pickList[0], 0x1))) {
			// Check if the item should be picked
			status = this.checkItem(pickList[0]);

			if (status.result && Pickit.canPick(pickList[0])) {
				// Override canFit for scrolls, potions and gold
				canFit = Storage.Inventory.CanFit(pickList[0]) || [4, 22, 76, 77, 78].includes(pickList[0].itemType);

				// Try to make room with FieldID
				if (!canFit && Config.FieldID && Town.fieldID()) {
					canFit = Storage.Inventory.CanFit(pickList[0]) || [4, 22, 76, 77, 78].includes(pickList[0].itemType);
				}

				// Try to make room by selling items in town
				if (!canFit) {
					// Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
					if (this.canMakeRoom()) {
						print("ÿc7Trying to make room for " + this.itemColor(pickList[0]) + pickList[0].name);

						// Go to town and do town chores
						if (Town.visitTown()) {
							// Recursive check after going to town. We need to remake item list because gids can change.
							// Called only if room can be made so it shouldn't error out or block anything.

							return this.pickItems();
						}

						// Town visit failed - abort
						print("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

						return false;
					}

					// Can't make room - trigger automule
					Misc.itemLogger("No room for", pickList[0]);
					print("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

					needMule = true;
				}

				// Item can fit - pick it up
				if (canFit) {
					this.pickItem(pickList[0], status.result, status.line);
				}
			}
		}

		pickList.shift();
	}

	// Quit current game and transfer the items to mule
	if (needMule && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo") && AutoMule.getMuleItems().length > 0) {
		scriptBroadcast("mule");
		scriptBroadcast("quit");
	}

	return true;
};

Pickit.pickItem = function (unit, status, keptLine) {
	function ItemStats (unit) {
		let self = this;
		self.ilvl = unit.ilvl;
		self.sockets = unit.getStat(194);
		self.type = unit.itemType;
		self.classid = unit.classid;
		self.name = unit.name;
		self.color = Pickit.itemColor(unit);
		self.gold = unit.getStat(14);
		let canTk = me.sorceress && me.getSkill(sdk.skills.Telekinesis, 1) && (this.type === 4 || this.type === 22 || (this.type > 75 && this.type < 82)) &&
					getDistance(me, unit) > 5 && getDistance(me, unit) < 20 && !checkCollision(me, unit, 0x4);
		self.useTk = canTk && (me.mpPercent > 50);
		self.picked = false;
	}

	let item, tick, gid, stats, retry = false,
		cancelFlags = [0x01, 0x08, 0x14, 0x0c, 0x19, 0x1a],
		itemCount = me.itemcount;

	if (!unit || unit === undefined) return false;

	if (unit.gid) {
		gid = unit.gid;
		item = getUnit(4, -1, -1, gid);
	}

	if (!item) return false;

	for (let i = 0; i < cancelFlags.length; i += 1) {
		if (getUIFlag(cancelFlags[i])) {
			delay(500);
			me.cancel(0);

			break;
		}
	}

	stats = new ItemStats(item);

	MainLoop:
	for (let i = 0; i < 3; i += 1) {
		if (!getUnit(4, -1, -1, gid)) {
			break MainLoop;
		}

		if (me.dead) return false;

		while (!me.idle) {
			delay(40);
		}

		if (item.mode !== 3 && item.mode !== 5) {
			break MainLoop;
		}

		if (stats.useTk) {
			Skill.cast(sdk.skills.Telekinesis, 0, item);
		} else {
			if (getDistance(me, item) > (i < 1 ? 6 : 4) || checkCollision(me, item, 0x1)) {
				if (item.getMobCount(8, 0x1 | 0x400 | 0x800) !== 0) {
					print("ÿc8PickItemÿc0 :: Clearing area around item I want to pick");
					Pickit.enabled = false;		// Don't pick while trying to clear
					Attack.clearPos(item.x, item.y, 10, false);
					Pickit.enabled = true;		// Reset value
				}

				if (Pather.useTeleport()) {
					Pather.moveToUnit(item);
				} else if (!Pather.moveTo(item.x, item.y, 0)) {
					continue MainLoop;
				}
			}

			sendPacket(1, 0x16, 4, 0x4, 4, item.gid, 4, 0);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			item = copyUnit(item);

			if (stats.classid === 523) {
				if (!item.getStat(14) || item.getStat(14) < stats.gold) {
					print("ÿc7Picked up " + stats.color + (item.getStat(14) ? (item.getStat(14) - stats.gold) : stats.gold) + " " + stats.name);

					return true;
				}
			}

			if (item.mode !== 3 && item.mode !== 5) {
				switch (stats.classid) {
				case 543: // Key
					print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

					return true;
				case 529: // Scroll of Town Portal
				case 530: // Scroll of Identify
					print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkScrolls(stats.classid === 529 ? "tbk" : "ibk") + "/20)");

					return true;
				}

				break MainLoop;
			}

			delay(20);
		}

		// TK failed, disable it
		stats.useTk = false;

		//print("pick retry");
	}

	if (retry) {
		return this.pickItem(unit, status, keptLine);
	}

	stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

	if (stats.picked) {
		DataFile.updateStats("lastArea");

		switch (status) {
		case 1:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (stats.sockets > 0 ? ") (sockets " + stats.sockets : "") + (keptLine ? ") (" + keptLine + ")" : ")"));

			if (this.ignoreLog.indexOf(stats.type) === -1) {
				Misc.itemLogger("Kept", item);
				Misc.logItem("Kept", item, keptLine);
			}

			break;
		case 2:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
			Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
			Cubing.update();

			break;
		case 3:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
			Misc.itemLogger("Kept", item, "Runewords");
			Runewords.update(stats.classid, gid);

			break;
		case 5: // Crafting System
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Crafting System)");
			CraftingSystem.update(item);

			break;
		default:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

			break;
		}
	}

	return true;
};
