/**
*  @filename    PickitOverrides.js
*  @author      theBGuy
*  @credit      sonic, jaenster
*  @desc        Picking related functions
*
*/

includeIfNotIncluded("common/Pickit.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/NTIPOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");

Pickit.enabled = true;
Pickit.Result.SOLOWANTS = 8;

Pickit.checkItem = function (unit) {
	let rval = NTIP.CheckItem(unit, false, true);

	// quick return on essentials - we know they aren't going to be in the other checks
	if (Pickit.essentials.includes(unit.itemType)) return rval;

	if ((unit.classid === sdk.items.runes.Ral || unit.classid === sdk.items.runes.Ort) && Town.repairIngredientCheck(unit)) {
		return {
			result: Pickit.Result.UTILITY,
			line: null
		};
	}

	if (unit.classid === sdk.items.StaminaPotion && (me.staminaPercent <= 85 || me.walking) && Item.getQuantityOwned(unit) < 2) {
		return {
			result: Pickit.Result.WANTED,
			line: "LowStamina"
		};
	}

	if (unit.classid === sdk.items.AntidotePotion && me.getState(sdk.states.Poison) && Item.getQuantityOwned(unit) < 2) {
		return {
			result: Pickit.Result.WANTED,
			line: "Poisoned"
		};
	}

	if (unit.classid === sdk.items.ThawingPotion && [sdk.states.Frozen, sdk.states.FrozenSolid].some(state => me.getState(state)) && Item.getQuantityOwned(unit) < 2) {
		return {
			result: Pickit.Result.WANTED,
			line: "Frozen"
		};
	}

	if (rval.result === Pickit.Result.WANTED) {
		let durability = unit.getStat(sdk.stats.Durability);
		
		if (typeof durability === "number" && unit.getStat(sdk.stats.MaxDurability) > 0 && durability * 100 / unit.getStat(sdk.stats.MaxDurability) <= 0) {
			return {
				result: Pickit.Result.TRASH,
				line: null
			};
		}
	}

	if (SoloWants.checkItem(unit)) {
		return {
			result: Pickit.Result.SOLOWANTS,
			line: null
		};
	}

	if (CraftingSystem.checkItem(unit)) {
		return {
			result: Pickit.Result.CRAFTING,
			line: null
		};
	}

	if (Cubing.checkItem(unit)) {
		return {
			result: Pickit.Result.CUBING,
			line: null
		};
	}

	if (Runewords.checkItem(unit)) {
		return {
			result: Pickit.Result.RUNEWORD,
			line: null
		};
	}

	if (AutoEquip.hasTier(unit) && !unit.identified) {
		return {
			result: Pickit.Result.UNID,
			line: null
		};
	}

	if (unit.isCharm && NTIP.GetCharmTier(unit) > 0 && unit.identified) {
		if (Item.autoEquipCharmCheck(unit)) {
			return {
				result: Pickit.Result.WANTED,
				line: "Autoequip charm Tier: " + NTIP.GetCharmTier(unit)
			};
		}

		return NTIP.CheckItem(unit, NTIP_CheckListNoTier, true);
	}

	if ((NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetSecondaryTier(unit) > 0) && unit.identified) {
		if (Item.autoEquipCheck(unit)) {
			return {
				result: Pickit.Result.WANTED,
				line: "Autoequip Tier: " + NTIP.GetTier(unit)
			};
		}

		if (Item.autoEquipCheckMerc(unit)) {
			return {
				result: Pickit.Result.WANTED,
				line: "Autoequip MercTier: " + NTIP.GetMercTier(unit)
			};
		}

		if (Item.autoEquipCheckSecondary(unit)) {
			return {
				result: Pickit.Result.WANTED,
				line: "Autoequip Secondary Tier: " + NTIP.GetSecondaryTier(unit)
			};
		}

		return NTIP.CheckItem(unit, NTIP_CheckListNoTier, true);
	}

	// LowGold
	if (rval.result === Pickit.Result.UNWANTED && !getBaseStat("items", unit.classid, "quest") && !Town.ignoredItemTypes.includes(unit.itemType) && !unit.questItem
		&& (unit.isInInventory || (me.gold < Config.LowGold || me.gold < 500000))) {
		// Gold doesn't take up room, just pick it up
		if (unit.classid === sdk.items.Gold) {
			return {
				result: Pickit.Result.TRASH,
				line: null
			};
		}

		const itemValue = unit.getItemCost(sdk.items.cost.ToSell);
		const itemValuePerSquare = itemValue / (unit.sizex * unit.sizey);

		if (itemValuePerSquare >= 2000) {
			// If total gold is less than 500k pick up anything worth 2k gold per square to sell in town.
			return {
				result: Pickit.Result.TRASH,
				line: "Valuable Item: " + itemValue
			};
		} else if (itemValuePerSquare >= 10 && me.gold < Config.LowGold) {
			// If total gold is less than LowGold setting pick up anything worth 10 gold per square to sell in town.
			return {
				result: Pickit.Result.TRASH,
				line: "LowGold Item: " + itemValue
			};
		}
	}

	return rval;
};

// @jaenster
Pickit.amountOfPotsNeeded = function () {
	let _a, _b, _c, _d;
	let potTypes = [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion];
	let hpMax = (Array.isArray(Config.HPBuffer) ? Config.HPBuffer[1] : Config.HPBuffer);
	let mpMax = (Array.isArray(Config.MPBuffer) ? Config.MPBuffer[1] : Config.MPBuffer);
	let rvMax = (Array.isArray(Config.RejuvBuffer) ? Config.RejuvBuffer[1] : Config.RejuvBuffer);
	let needed = (_a = {},
	_a[sdk.items.type.HealingPotion] = (_b = {},
	_b[sdk.storage.Belt] = 0,
	_b[sdk.storage.Inventory] = hpMax,
	_b),
	_a[sdk.items.type.ManaPotion] = (_c = {},
	_c[sdk.storage.Belt] = 0,
	_c[sdk.storage.Inventory] = mpMax,
	_c),
	_a[sdk.items.type.RejuvPotion] = (_d = {},
	_d[sdk.storage.Belt] = 0,
	_d[sdk.storage.Inventory] = rvMax,
	_d),
	_a);
	if (hpMax > 0 || mpMax > 0 || rvMax > 0) {
		me.getItemsEx()
			.filter((pot) => potTypes.includes(pot.itemType) && (pot.isInBelt || pot.isInInventory))
			.forEach(function (pot) {
				needed[pot.itemType][pot.location] -= 1;
			});
	}
	let missing = Town.checkColumns(Pickit.beltSize);
	Config.BeltColumn.forEach(function (column, index) {
		if (column === "hp") {needed[sdk.items.type.HealingPotion][sdk.storage.Belt] = missing[index];}
		if (column === "mp") {needed[sdk.items.type.ManaPotion][sdk.storage.Belt] = missing[index];}
		if (column === "rv") {needed[sdk.items.type.RejuvPotion][sdk.storage.Belt] = missing[index];}
	});
	return needed;
};

Pickit.canFit = function (item) {
	switch (item.itemType) {
	case sdk.items.type.Gold:
		return true;
	case sdk.items.type.Scroll:
	{
		let tome = me.findItem(item.classid - 11, 0, sdk.storage.Inventory);
		return (tome && tome.getStat(sdk.stats.Quantity) < 20) || Storage.Inventory.CanFit(item);
	}
	case sdk.items.type.HealingPotion:
	case sdk.items.type.ManaPotion:
	case sdk.items.type.RejuvPotion:
		{
			let pots = this.amountOfPotsNeeded();
			if (pots[item.itemType][sdk.storage.Belt] > 0) {
				// this potion can go in belt
				return true;
			}
		}
		return Storage.Inventory.CanFit(item);
	default:
		return Storage.Inventory.CanFit(item);
	}
};

Pickit.canPick = function (unit) {
	if (!unit) return false;
	
	if (sdk.quest.items.includes(unit.classid) && me.getItem(unit.classid)) {
		return false;
	}
	
	// TODO: clean this up

	let tome, charm, i, potion, needPots, buffers, pottype, myKey, key;

	switch (unit.itemType) {
	case sdk.items.type.Gold:
		// Check current gold vs max capacity (cLvl*10000)
		if (me.getStat(sdk.stats.Gold) === me.getStat(sdk.stats.Level) * 10000) {
			return false; // Skip gold if full
		}

		break;
	case sdk.items.type.Scroll:
		// 518 - Tome of Town Portal or 519 - Tome of Identify, mode 0 - inventory/stash
		tome = me.getItem(unit.classid - 11, sdk.items.mode.inStorage);

		if (tome) {
			do {
				if (tome.isInInventory && tome.getStat(sdk.stats.Quantity) === 20) {
					return false; // Skip a scroll if its tome is full
				}
			} while (tome.getNext());
		} else {
			// If we don't have a tome, go ahead and keep 2 scrolls
			return unit.classid === sdk.items.ScrollofIdentify && me.charlvl > 5 ? false : me.getItemsEx(unit.classid).filter(el => el.isInInventory).length < 2;
		}

		break;
	case sdk.items.type.Key:
		// Assassins don't ever need keys
		if (me.assassin) return false;

		myKey = me.getItem(sdk.items.Key, sdk.items.mode.inStorage);
		key = Game.getItem(-1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

		if (myKey && key) {
			do {
				if (myKey.isInInventory && myKey.getStat(sdk.stats.Quantity) + key.getStat(sdk.stats.Quantity) > 12) {
					return false;
				}
			} while (myKey.getNext());
		}

		break;
	case sdk.items.type.SmallCharm:
	case sdk.items.type.LargeCharm:
	case sdk.items.type.GrandCharm:
		if (unit.unique) {
			charm = me.getItem(unit.classid, sdk.items.mode.inStorage);

			if (charm) {
				do {
					// Skip Gheed's Fortune, Hellfire Torch or Annihilus if we already have one
					if (unit.unique) {
						return false;
					}
				} while (charm.getNext());
			}
		}

		break;
	case sdk.items.type.HealingPotion:
	case sdk.items.type.ManaPotion:
	case sdk.items.type.RejuvPotion:
		needPots = 0;

		for (i = 0; i < 4; i += 1) {
			if (typeof unit.code === "string" && unit.code.indexOf(Config.BeltColumn[i]) > -1) {
				needPots += this.beltSize;
			}
		}

		potion = me.getItem(-1, sdk.items.mode.inBelt);

		if (potion) {
			do {
				if (potion.itemType === unit.itemType) {
					needPots -= 1;
				}
			} while (potion.getNext());
		}

		if (needPots < 1 && this.checkBelt()) {
			buffers = ["HPBuffer", "MPBuffer", "RejuvBuffer"];

			for (i = 0; i < buffers.length; i += 1) {
				if (Config[buffers[i]]) {
					switch (buffers[i]) {
					case "HPBuffer":
						pottype = sdk.items.type.HealingPotion;

						break;
					case "MPBuffer":
						pottype = sdk.items.type.ManaPotion;

						break;
					case "RejuvBuffer":
						pottype = sdk.items.type.RejuvPotion;

						break;
					}

					if (unit.itemType === pottype) {
						if (!Storage.Inventory.CanFit(unit)) {
							return false;
						}

						needPots = Config[buffers[i]];
						potion = me.getItem(-1, sdk.items.mode.inStorage);

						if (potion) {
							do {
								if (potion.itemType === pottype && potion.isInInventory) {
									needPots -= 1;
								}
							} while (potion.getNext());
						}
					}
				}
			}
		}

		if (needPots < 1) {
			potion = me.getItem();

			if (potion) {
				do {
					if (potion.itemType === unit.itemType && (potion.isInInventory || potion.isInBelt)) {
						if (potion.classid < unit.classid) {
							potion.use();
							needPots += 1;

							break;
						}
					}
				} while (potion.getNext());
			}
		}

		if (needPots < 1) {
			return false;
		}

		break;
	case undefined: // Yes, it does happen
		console.warn("undefined item (!?)");

		return false;
	}

	return true;
};

Pickit.pickItem = function (unit, status, keptLine) {
	function ItemStats (unit) {
		let self = this;
		self.ilvl = unit.ilvl;
		self.sockets = unit.sockets;
		self.type = unit.itemType;
		self.classid = unit.classid;
		self.name = unit.name;
		self.color = Pickit.itemColor(unit);
		self.gold = unit.getStat(sdk.stats.Gold);
		self.dist = (unit.distance || Infinity);
		let canTk = (Skill.haveTK && Pickit.tkable.includes(self.type)
			&& self.dist > 5 && self.dist < 20 && !checkCollision(me, unit, sdk.collision.WallOrRanged));
		self.useTk = canTk && (me.mpPercent > 50);
		self.picked = false;
	}

	let item, tick, gid, retry = false;
	let cancelFlags = [sdk.uiflags.Inventory, sdk.uiflags.NPCMenu, sdk.uiflags.Waypoint, sdk.uiflags.Shop, sdk.uiflags.Stash, sdk.uiflags.Cube];
	let itemCount = me.itemcount;

	if (!unit || unit === undefined) return false;

	if (unit.gid) {
		gid = unit.gid;
		item = Game.getItem(-1, -1, gid);
	}

	if (!item) return false;

	for (let i = 0; i < cancelFlags.length; i += 1) {
		if (getUIFlag(cancelFlags[i])) {
			delay(500);
			me.cancel(0);

			break;
		}
	}

	let stats = new ItemStats(item);
	let tkMana = stats.useTk ? Skill.getManaCost(sdk.skills.Telekinesis) * 2 : Infinity;

	MainLoop:
	for (let i = 0; i < 3; i += 1) {
		if (!Game.getItem(-1, -1, gid)) {
			break;
		}

		if (me.dead) return false;

		while (!me.idle) {
			delay(40);
		}

		if (!item.onGroundOrDropping) {
			break;
		}

		// todo - allow picking near potions/scrolls while attacking distance < 5
		if (stats.useTk && me.mp > tkMana) {
			Packet.telekinesis(item);
		} else {
			if (item.distance > (Config.FastPick || i < 1 ? 6 : 4) || checkCollision(me, item, sdk.collision.BlockWall)) {
				if (item.checkForMobs({range: 8, coll: (sdk.collision.BlockWall | sdk.collision.Objects | sdk.collision.ClosedDoor)})) {
					console.log("ÿc8PickItemÿc0 :: Clearing area around item I want to pick");
					Pickit.enabled = false;		// Don't pick while trying to clear
					Attack.clearPos(item.x, item.y, 10, false);
					Pickit.enabled = true;		// Reset value
				}

				if (!Pather.moveToUnit(item)) {
					continue;
				}
			}

			// use packet first, if we fail and not using fast pick use click
			(Config.FastPick || i < 1) ? Packet.click(item) : Misc.click(0, 0, item);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			item = copyUnit(item);

			if (stats.classid === sdk.items.Gold) {
				if (!item.getStat(sdk.stats.Gold) || item.getStat(sdk.stats.Gold) < stats.gold) {
					console.log("ÿc7Picked up " + stats.color + (item.getStat(sdk.stats.Gold) ? (item.getStat(sdk.stats.Gold) - stats.gold) : stats.gold) + " " + stats.name);

					return true;
				}
			}

			if (!item.onGroundOrDropping) {
				switch (stats.classid) {
				case sdk.items.Key:
					console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

					return true;
				case sdk.items.ScrollofTownPortal:
				case sdk.items.ScrollofIdentify:
					console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkScrolls(stats.classid === sdk.items.ScrollofTownPortal ? "tbk" : "ibk") + "/20)");

					return true;
				}

				break MainLoop;
			}

			delay(20);
		}

		// TK failed, disable it
		stats.useTk = false;

		//console.log("pick retry");
	}

	if (retry) {
		return this.pickItem(unit, status, keptLine);
	}

	stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

	if (stats.picked) {
		DataFile.updateStats("lastArea");

		switch (status) {
		case Pickit.Result.WANTED:
			console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (stats.sockets > 0 ? ") (sockets " + stats.sockets : "") + (keptLine ? ") (" + keptLine + ")" : ")"));

			if (this.ignoreLog.indexOf(stats.type) === -1) {
				Misc.itemLogger("Kept", item);
				Misc.logItem("Kept", item, keptLine);
			}

			break;
		case Pickit.Result.CUBING:
			console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
			Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
			Cubing.update();

			break;
		case Pickit.Result.RUNEWORD:
			console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
			Misc.itemLogger("Kept", item, "Runewords");
			Runewords.update(stats.classid, gid);

			break;
		case Pickit.Result.CRAFTING:
			console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Crafting System)");
			CraftingSystem.update(item);

			break;
		case Pickit.Result.SOLOWANTS:
			console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (SoloWants System)");
			SoloWants.update(item);

			break;
		default:
			console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

			break;
		}
	}

	return true;
};

Pickit.pickItems = function (range = Config.PickRange, once = false) {
	if (me.dead || range < 0 || !Pickit.enabled) return false;
	
	let status, canFit;
	let needMule = false;
	let pickList = [];

	while (!me.idle) {
		delay(40);
	}

	let item = Game.getItem();

	if (item) {
		do {
			if (item.onGroundOrDropping && getDistance(me, item) <= range) {
				pickList.push(copyUnit(item));
			}
		} while (item.getNext());
	}

	if (pickList.some(i => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion].includes(i.itemType))) {
		Town.clearBelt();
		Pickit.beltSize = Storage.BeltSize();
	}

	while (pickList.length > 0) {
		if (me.dead || !Pickit.enabled) return false;

		pickList.sort(this.sortItems);

		// Check if the item unit is still valid and if it's on ground or being dropped
		// Don't pick items behind walls/obstacles when walking
		if (copyUnit(pickList[0]).x !== undefined && pickList[0].onGroundOrDropping
			&& (Pather.useTeleport() || me.inTown || !checkCollision(me, pickList[0], sdk.collision.BlockWall))) {
			// Check if the item should be picked
			status = this.checkItem(pickList[0]);

			if (status.result && Pickit.canPick(pickList[0])) {
				canFit = (Storage.Inventory.CanFit(pickList[0]) || Pickit.canFit(pickList[0]));

				// Field id when our used space is above a certain percent or if we are full try to make room with FieldID
				if (Config.FieldID.Enabled && (!canFit || Storage.Inventory.UsedSpacePercent() > Config.FieldID.UsedSpace)) {
					Town.fieldID() && (canFit = (pickList[0].gid !== undefined && Storage.Inventory.CanFit(pickList[0])));
				}

				// Try to make room by selling items in town
				if (!canFit) {
					// Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
					if (this.canMakeRoom()) {
						console.log("ÿc7Trying to make room for " + this.itemColor(pickList[0]) + pickList[0].name);

						// Go to town and do town chores
						if (Town.visitTown()) {
							// Recursive check after going to town. We need to remake item list because gids can change.
							// Called only if room can be made so it shouldn't error out or block anything.

							return this.pickItems(range, once);
						}

						// Town visit failed - abort
						console.log("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

						return false;
					}

					// Can't make room - trigger automule
					Misc.itemLogger("No room for", pickList[0]);
					console.log("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

					needMule = true;
				}

				// Item can fit - pick it up
				if (canFit) {
					let picked = this.pickItem(pickList[0], status.result, status.line);

					if (picked && once) return true;
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
