/**
*  @filename    Me.js
*  @author      theBGuy
*  @desc        collection of me functions and prototypes
*
*/

includeIfNotIncluded("common/Prototypes.js");

Object.defineProperties(me, {
	maxNearMonsters: {
		get: function () {
			return Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
		}
	},
	duelWielding: {
		get: function () {
			// only classes that can duel wield
			if (!me.assassin && !me.barbarian) return false;
			let items = me.getItemsEx().filter((item) => item.isEquipped && item.isOnMain);
			return !!items.length && items.length >= 2 && items.every((item) => !item.isShield && !getBaseStat("items", item.classid, "block"));
		}
	},
	realFR: {
		get: function () {
			return me.getStat(sdk.stats.FireResist);
		}
	},
	realCR: {
		get: function () {
			return me.getStat(sdk.stats.ColdResist);
		}
	},
	realLR: {
		get: function () {
			return me.getStat(sdk.stats.LightResist);
		}
	},
	realPR: {
		get: function () {
			return me.getStat(sdk.stats.PoisonResist);
		}
	},
	// for visual purposes really, return res with cap
	FR: {
		get: function () {
			return Math.min(75 + this.getStat(sdk.stats.MaxFireResist), me.realFR - me.resPenalty);
		}
	},
	CR: {
		get: function () {
			return Math.min(75 + this.getStat(sdk.stats.MaxColdResist), me.realCR - me.resPenalty);
		}
	},
	LR: {
		get: function () {
			return Math.min(75 + this.getStat(sdk.stats.MaxLightResist), me.realLR - me.resPenalty);
		}
	},
	PR: {
		get: function () {
			return Math.min(75 + this.getStat(sdk.stats.MaxPoisonResist), me.realPR - me.resPenalty);
		}
	},
	onFinalBuild: {
		get: function () {
			myData === undefined && (myData = CharData.getStats());
			return myData.me.currentBuild === myData.me.finalBuild;
		}
	}
});

me.getMercEx = function () {
	if (!Config.UseMerc || me.classic || me.mercrevivecost) return null;
	if (!myData.merc.type) return null;
	let merc = Misc.poll(() => me.getMerc(), 250, 50);

	return !!merc && !merc.dead ? merc : null;
};

me.getEquippedItem = function (bodyLoc) {
	if (!bodyLoc) return null;
	return me.getItemsEx().filter(i => i.isEquipped && i.bodylocation === bodyLoc).first();
};

me.getSkillTabs = function (classid = me.classid) {
	return [
		[sdk.skills.tabs.BowandCrossbow, sdk.skills.tabs.PassiveandMagic, sdk.skills.tabs.JavelinandSpear],
		[sdk.skills.tabs.Fire, sdk.skills.tabs.Lightning, sdk.skills.tabs.Cold],
		[sdk.skills.tabs.Curses, sdk.skills.tabs.PoisonandBone, sdk.skills.tabs.NecroSummoning],
		[sdk.skills.tabs.PalaCombat, sdk.skills.tabs.Offensive, sdk.skills.tabs.Defensive],
		[sdk.skills.tabs.BarbCombat, sdk.skills.tabs.Masteries, sdk.skills.tabs.Warcries],
		[sdk.skills.tabs.DruidSummon, sdk.skills.tabs.ShapeShifting, sdk.skills.tabs.Elemental],
		[sdk.skills.tabs.Traps, sdk.skills.tabs.ShadowDisciplines, sdk.skills.tabs.MartialArts]
	][classid];
};

// @todo better determination of what actually constitutes being in danger
// need check for ranged mobs so we can stick and move to avoid missiles
me.inDanger = function () {
	let count = 0;
	let nearUnits = getUnits(sdk.unittype.Monster).filter((mon) => mon && mon.attackable && mon.distance < 10);
	nearUnits.forEach(u => u.isSpecial ? (count += 2) : (count += 1));
	if (count > me.maxNearMonsters) return true;
	let dangerClose = nearUnits.find(mon => [sdk.enchant.ManaBurn, sdk.enchant.LightningEnchanted, sdk.enchant.FireEnchanted].some(chant => mon.getEnchant(chant)));
	return dangerClose;
};

/**
 * 
 * @param {number} skillId 
 * @param {number} subId 
 * @returns boolean
 * @description small function to force boolean return value when checking if we have a skill
 */
me.checkSkill = (skillId = 0, subId = 0) => !!me.getSkill(skillId, subId);

me.cleanUpInvoPotions = function (beltSize) {
	beltSize === undefined && (beltSize = Storage.BeltSize());
	const beltMax = (beltSize * 4);
	// belt 4x4 locations
	/**
	* 12 13 14 15
	* 8  9  10 11
	* 4  5  6  7
	* 0  1  2  3
	*/
	const beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];
	// check if we have empty belt slots
	let needCleanup = Town.checkColumns(beltSize).some(slot => slot > 0);

	if (needCleanup) {
		const potsInInventory = me.getItemsEx()
			.filter((p) => p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion].includes(p.itemType))
			.sort((a, b) => a.itemType - b.itemType);

		potsInInventory.length > 0 && console.debug("We have potions in our invo, put them in belt before we perform townchicken check");
		// Start interating over all the pots we have in our inventory
		beltSize > 1 && potsInInventory.forEach(function (p) {
			let moved = false;
			// get free space in each slot of our belt
			let freeSpace = Town.checkColumns(beltSize);
			for (let i = 0; i < 4 && !moved; i += 1) {
				// checking that current potion matches what we want in our belt
				if (freeSpace[i] > 0 && p.code && p.code.startsWith(Config.BeltColumn[i])) {
					// Pick up the potion and put it in belt if the column is empty, and we don't have any other columns empty
					// prevents shift-clicking potion into wrong column
					if (freeSpace[i] === beltSize || freeSpace.some((spot) => spot === beltSize)) {
						let x = freeSpace[i] === beltSize ? i : (beltCapRef[i] - (freeSpace[i] * 4));
						Packet.placeInBelt(p, x);
					} else {
						clickItemAndWait(sdk.clicktypes.click.ShiftLeft, p.x, p.y, p.location);
					}
					Misc.poll(() => !me.itemoncursor, 300, 30);
					moved = Town.checkColumns(beltSize)[i] === freeSpace[i] - 1;
				}
				Cubing.cursorCheck();
			}
		});
	}

	return true;
};

me.needPotions = function () {
	// we aren't using MinColumn if none of the values are set
	if (!Config.MinColumn.some(el => el > 0)) return false;
	// no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
	if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
	
	// Start
	if (me.charlvl > 2 && me.gold > 1000) {
		let pots = { hp: [], mp: [], };
		const beltSize = Storage.BeltSize();
		
		// only run this bit if we aren't wearing a belt for now
		beltSize === 1 && me.cleanUpInvoPotions(beltSize);
		// now check what's in our belt
		me.getItemsEx(-1, sdk.items.mode.inBelt)
			.filter(p => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType) && p.x < 4)
			.forEach(p => {
				if (p.itemType === sdk.items.type.HealingPotion) {
					pots.hp.push(copyUnit(p));
				} else if (p.itemType === sdk.items.type.ManaPotion) {
					pots.mp.push(copyUnit(p));
				}
			});

		// quick check
		if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
			|| (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
			return true;
		}

		// should we check the actual amount in the column?
		// For now just keeping the way it was and checking if a column is empty
		for (let i = 0; i < 4; i += 1) {
			if (Config.MinColumn[i] <= 0) {
				continue;
			}

			switch (Config.BeltColumn[i]) {
			case "hp":
				if (!pots.hp.some(p => p.x === i)) {
					console.debug("Column: " + (i + 1) + " needs hp pots");
					return true;
				}
				break;
			case "mp":
				if (!pots.mp.some(p => p.x === i)) {
					console.debug("Column: " + (i + 1) + " needs mp pots");
					return true;
				}
				break;
			}
		}
	}

	return false;
};

me.getIdTool = function () {
	let items = me.getItemsEx().filter((i) => i.isInInventory && [sdk.items.ScrollofIdentify, sdk.items.TomeofIdentify].includes(i.classid));
	let scroll = items.find((i) => i.isInInventory && i.classid === sdk.items.ScrollofIdentify);
	if (scroll) return scroll;
	let tome = items.find((i) => i.isInInventory && i.classid === sdk.items.TomeofIdentify);
	if (tome && tome.getStat(sdk.stats.Quantity) > 0) return tome;

	return null;
};

me.getTpTool = function () {
	let items = me.getItemsEx(-1, sdk.items.mode.inStorage).filter((i) => i.isInInventory && [sdk.items.ScrollofTownPortal, sdk.items.TomeofTownPortal].includes(i.classid));
	if (!items.length) return null;
	let tome = items.find((i) => i.classid === sdk.items.TomeofTownPortal && i.getStat(sdk.stats.Quantity) > 0);
	if (tome) return tome;
	let scroll = items.find((i) => i.classid === sdk.items.ScrollofTownPortal);
	if (scroll) return scroll;
	return null;
};

me.getUnids = function () {
	let list = [];
	let item = me.getItem(-1, sdk.items.mode.inStorage);

	if (!item) return [];

	do {
		if (item.isInInventory && !item.identified) {
			list.push(copyUnit(item));
		}
	} while (item.getNext());

	return list;
};

me.fieldID = function () {
	let list = me.getUnids();
	if (!list) return false;

	while (list.length > 0) {
		let idTool = me.getIdTool();
		if (!idTool) return false;

		let item = list.shift();
		let result = Pickit.checkItem(item);
		// Force ID for unid items matching autoEquip/cubing criteria
		Town.needForceID(item) && (result.result = -1);

		// unid item that should be identified
		if (result.result === Pickit.Result.UNID) {
			Town.identifyItem(item, idTool, Config.FieldID.PacketID);
			delay(50);
			result = Pickit.checkItem(item);
		}
		Town.itemResult(item, result, "Field", false);
	}

	delay(200);
	me.cancel();

	return true;
};

me.getWeaponQuantity = function (weaponLoc = sdk.body.RightArm) {
	let currItem = me.getItemsEx(-1, sdk.items.mode.Equipped).filter(i => i.bodylocation === weaponLoc).first();
	return !!currItem ? currItem.getStat(sdk.stats.Quantity) : 0;
};

me.getItemsForRepair = function (repairPercent, chargedItems) {
	const lowLevelCheck = me.charlvl < 5;
	// lower the required percent as we are a low level
	(lowLevelCheck && repairPercent > 30) && (repairPercent = 15);
	let itemList = [];
	let item = me.getItem(-1, sdk.items.mode.Equipped);

	if (item) {
		do {
			if (lowLevelCheck && !item.isOnMain && !item.isOnSwap) continue;
			// Skip ethereal items
			if (!item.ethereal) {
				// Skip indestructible items
				if (!item.getStat(sdk.stats.Indestructible)) {
					switch (item.itemType) {
					// Quantity check
					case sdk.items.type.ThrowingKnife:
					case sdk.items.type.ThrowingAxe:
					case sdk.items.type.Javelin:
					case sdk.items.type.AmazonJavelin:
						let quantity = item.getStat(sdk.stats.Quantity);

						// Stat 254 = increased stack size
						if (typeof quantity === "number" && quantity * 100 / (getBaseStat("items", item.classid, "maxstack") + item.getStat(sdk.stats.ExtraStack)) <= repairPercent) {
							itemList.push(copyUnit(item));
						}

						break;
					default:
						// Durability check
						if (item.durabilityPercent <= repairPercent) {
							itemList.push(copyUnit(item));
						}

						break;
					}
				}

				if (chargedItems) {
					// Charged item check
					let charge = item.getStat(-2)[sdk.stats.ChargedSkill];

					if (typeof (charge) === "object") {
						if (charge instanceof Array) {
							for (let i = 0; i < charge.length; i += 1) {
								if (charge[i] !== undefined && charge[i].hasOwnProperty("charges") && charge[i].charges * 100 / charge[i].maxcharges <= repairPercent) {
									itemList.push(copyUnit(item));
								}
							}
						} else if (charge.charges * 100 / charge.maxcharges <= repairPercent) {
							itemList.push(copyUnit(item));
						}
					}
				}
			}
		} while (item.getNext());
	}

	return itemList;
};

me.needRepair = function () {
	let repairAction = [];
	let bowCheck = Attack.usingBow();
	let switchBowCheck = CharData.skillData.bowData.bowOnSwitch;
	let canAfford = me.gold >= me.getRepairCost();
	!bowCheck && switchBowCheck && (bowCheck = (() => {
		switch (CharData.skillData.bowData.bowType) {
		case sdk.items.type.Bow:
		case sdk.items.type.AmazonBow:
			return "bow";
		case sdk.items.type.Crossbow:
			return "crossbow";
		default:
			return "";
		}
	})());

	if (bowCheck) {
		let [quiver, inventoryQuiver] = (() => {
			switch (bowCheck) {
			case "crossbow":
				return [me.getItem("cqv", sdk.items.mode.Equipped), me.getItem("cqv", sdk.items.mode.inStorage)];
			case "bow":
			default:
				return [me.getItem("aqv", sdk.items.mode.Equipped), me.getItem("aqv", sdk.items.mode.inStorage)];
			}
		})();

		// Out of arrows/bolts
		if (!quiver) {
			inventoryQuiver ? switchBowCheck ? Item.secondaryEquip(inventoryQuiver, sdk.body.LeftArmSecondary) : Item.equip(inventoryQuiver, 5) : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
		} else {
			let quantity = quiver.getStat(sdk.stats.Quantity);

			if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
				inventoryQuiver ? switchBowCheck ? Item.secondaryEquip(inventoryQuiver, sdk.body.LeftArmSecondary) : Item.equip(inventoryQuiver, 5) : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
			}
		}
	}

	// Repair durability/quantity/charges
	if (canAfford && this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
		repairAction.push("repair");
	}

	return repairAction;
};

me.needMerc = function () {
	if (me.classic || !Config.UseMerc || me.gold < me.mercrevivecost || me.mercrevivecost === 0) return false;

	Misc.poll(() => me.gameReady, 1000, 100);
	// me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
	for (let i = 0; i < 3; i += 1) {
		let merc = me.getMercEx();
		if (!!merc && !merc.dead) return false;

		delay(100);
	}

	// In case we never had a merc and Config.UseMerc is still set to true for some odd reason
	return true;
};
