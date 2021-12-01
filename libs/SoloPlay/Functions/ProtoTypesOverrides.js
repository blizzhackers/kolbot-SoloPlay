/*
*	@filename	ProtoTypesOverrides.js
*	@author		isid0re, theBGuy
*	@credits 	Jaenster
*	@desc		additions for improved Kolbot-SoloPlay functionality and code readability
*/

// Credit @Jaenster
Unit.prototype.getItems = function (...args) {
	let items = this.getItems.apply(this, args);

	if (!items.length) {
		return [];
	}

	return items;
};

// Credit @Jaenster
Unit.prototype.getItemsEx = function (...args) {
	let item = this.getItem.apply(this, args), items = [];

	if (item) {
		do {
			items.push(copyUnit(item));
		} while (item.getNext());
		return items;
	}

	return [];
};

// Credit @Jaenster
Object.defineProperties(Unit.prototype, {
	isChilled: {
		get: function () {
			return this.getState(11);
		},
	},
	isFrozen: {
		get: function () {
			return this.getState(1);
		},
	},
    isStunned: {
		get: function () {
			return this.getState(21);
		},
	},
	isUnderCoS: {
		get: function () {
			return this.getState(156);
		},
	},
	isUnderLowerRes: {
		get: function () {
			return this.getState(61);
		},
	},
});

// Credit @Jaenster
Object.defineProperties(Unit.prototype, {
	rawStrength: {
		get: function () {
			var lvl = this.getStat(sdk.stats.Level);
			var rawBonus = function (i) { return i.getStat(sdk.stats.Strength); };
			var perLvlBonus = function (i) { return lvl * i.getStat(sdk.stats.PerLevelStrength) / 8; };
			var bonus = ~~(this.getItemsEx()
				.filter(function (i) { return i.isEquipped || i.isEquippedCharm; })
				.map(function (i) { return rawBonus(i) + perLvlBonus(i); })
				.reduce(function (acc, v) { return acc + v; }, 0));
			return this.getStat(sdk.stats.Strength) - bonus;
		},
	},
	rawDexterity: {
		get: function () {
			var lvl = this.getStat(sdk.stats.Level);
			var rawBonus = function (i) { return i.getStat(sdk.stats.Dexterity); };
			var perLvlBonus = function (i) { return lvl * i.getStat(sdk.stats.PerLevelDexterity) / 8; };
			var bonus = ~~(this.getItemsEx()
				.filter(function (i) { return i.isEquipped || i.isEquippedCharm; })
				.map(function (i) { return rawBonus(i) + perLvlBonus(i); })
				.reduce(function (acc, v) { return acc + v; }, 0));
			return this.getStat(sdk.stats.Dexterity) - bonus;
		},
	},
    isEquipped: {
        get: function () {
            if (this.type !== sdk.unittype.Item)
                return false;
            return this.location === sdk.storage.Equipment;
        }
    },
    isInInventory: {
        get: function () {
            return this.location === sdk.storage.Inventory && this.mode === sdk.itemmode.inStorage;
        }
    },
    isInBelt: {
        get: function () {
            return this.location === sdk.storage.Belt && this.mode === sdk.itemmode.inBelt;
        }
    },
    isInStash: {
        get: function () {
            return this.location === sdk.storage.Stash && this.mode === sdk.itemmode.inStorage;
        }
    },
    isRuneword: {
        get: function () {
            if (this.type !== sdk.unittype.Item)
                return false;
            return !!this.getFlag(0x4000000);
        }
    },
	identified: {
		get: function () {
			if (this.type !== sdk.unittype.Item) {
				// Can't tell, as it isn't an item
				return undefined; 
			}
			// Is also true for white items
			return this.getFlag(0x10);
		}
	},
	ethereal: {
		get: function () {
			if (this.type !== sdk.unittype.Item) {
				// Can't tell, as it isn't an item
				return undefined;
			}
			return this.getFlag(0x400000);
		}
	},
	twoHanded: {
		get: function () {
			return getBaseStat("items", this.classid, "2handed") === 1;
		}
	},
    isQuestItem: {
        get: function () {
            return this.itemType === 39 ||
                [173, 174, 92, 91, 521].includes(this.classid);
        }
    },
    isEquippedCharm: {
        get: function () {
            return (this.location === sdk.storage.Inventory && [sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].indexOf(this.itemType) > -1);
        }
    }
});

// Credit @Jaenster
Object.defineProperties(me, {
    highestAct: {
        get: function () {
            var acts = [true,
                me.getQuest(sdk.quests.AbleToGotoActII, 0),
                me.getQuest(sdk.quests.AbleToGotoActIII, 0),
                me.getQuest(sdk.quests.AbleToGotoActIV, 0),
                me.getQuest(sdk.quests.AbleToGotoActV, 0)];
            var index = acts.findIndex(function (i) { return !i; }); // find first false, returns between 1 and 5
            return index == -1 ? 5 : index;
        }
    },
    staminaDrainPerSec: {
        get: function () {
            var bonusReduction = me.getStat(sdk.stats.StaminaRecoveryBonus);
            var armorMalusReduction = 0; // TODO
            return 25 * Math.max(40 * (1 + armorMalusReduction / 10) * (100 - bonusReduction) / 100, 1) / 256;
        }
    },
    staminaTimeLeft: {
        get: function () {
            return me.stamina / me.staminaDrainPerSec;
        }
    },
    staminaMaxDuration: {
        get: function () {
            return me.staminamax / me.staminaDrainPerSec;
        }
    },
});

var str = 0, levelCheckS = 0, dex = 0, levelCheckD = 0;
Object.defineProperty(me, 'trueStr', {
	get: function() {
		if (str === 0 || levelCheckS < me.charlvl) {
			str = me.rawStrength;
			levelCheckS = me.charlvl;
		} 
		return str; 
	},
	set: function(newValue) { str = newValue }
});

Object.defineProperty(me, 'trueDex', {
	get: function() {
		if (dex === 0 || levelCheckD < me.charlvl) {
			dex = me.rawDexterity;
			levelCheckD = me.charlvl;
		} 
		return dex; 
	},
	set: function(newValue) { dex = newValue }
});

// Credit @Jaenster
Unit.prototype.switchWeapons = function (slot) {
	if (this.gametype === 0 || this.weaponswitch === slot && slot !== undefined) {
		return true;
	}

	while (typeof me !== 'object') delay(10);

	let originalSlot = this.weaponswitch;

	let i, tick, switched = false,
		packetHandler = (bytes) => bytes.length > 0 && bytes[0] === 0x97 && (switched = true) && false; // false to not block
	addEventListener('gamepacket', packetHandler);
	try {
		for (i = 0; i < 10; i += 1) {
			//print('Switch weapons -- attempt #' + (i + 1));

			for (let j = 10; --j && me.idle;) {
				delay(3);
			}

			i > 0 && delay(Math.min(1 + (me.ping * 1.5), 10));
			!switched && sendPacket(1, 0x60); // Swap weapons

			tick = getTickCount();
			while (getTickCount() - tick < 250 + (me.ping * 5)) {
				if (switched || originalSlot !== me.weaponswitch) {
					return true;
				}

				delay(3);
			}
			// Retry
		}
	} finally {
		removeEventListener('gamepacket', packetHandler);
	}


	return false;
};

Unit.prototype.castingFrames = function (skillId, fcr, charClass) {
	if (this !== me) {
		print("invalid arguments, expected 'me' object");
		return false;
	}

	if (fcr === void 0) { fcr = this.getStat(sdk.stats.FCR); }
	if (charClass === void 0) { charClass = this.classid; }
	// https://diablo.fandom.com/wiki/Faster_Cast_Rate
	var effectiveFCR = Math.min(75, (fcr * 120 / (fcr + 120)) | 0);
	var isLightning = skillId === sdk.skills.Lightning || skillId === sdk.skills.ChainLightning;
	var baseCastRate = [20, isLightning ? 19 : 14, 16, 16, 14, 15, 17][charClass];
	if (isLightning) {
		return Math.round(256 * baseCastRate / (256 * (100 + effectiveFCR) / 100));
	}
	var animationSpeed = {
		normal: 256,
		human: 208,
		wolf: 229,
		bear: 228
	}[charClass === sdk.charclass.Druid ? (this.getState(sdk.states.Wolf) || this.getState(sdk.states.Bear)) : "normal"];
	return Math.ceil(256 * baseCastRate / Math.floor(animationSpeed * (100 + effectiveFCR) / 100)) - 1;
};

Unit.prototype.castChargedSkill = function (...args) {
	let skillId, x, y, unit, chargedItem, charge,
		chargedItems = [],
		validCharge = function (itemCharge) {
			return itemCharge.skill === skillId && itemCharge.charges;
		};

	switch (args.length) {
	case 0: // item.castChargedSkill()
		break;
	case 1:
		if (args[0] instanceof Unit) { // hellfire.castChargedSkill(monster);
			unit = args[0];
		} else {
			skillId = args[0];
		}

		break;
	case 2:
		if (typeof args[0] === 'number') {
			if (args[1] instanceof Unit) { // me.castChargedSkill(skillId,unit)
				[skillId, unit] = [...args];
			} else if (typeof args[1] === 'number') { // item.castChargedSkill(x,y)
				[x, y] = [...args];
			}
		} else {
			throw new Error(' invalid arguments, expected (skillId, unit) or (x, y)');
		}

		break;
	case 3:
		// If all arguments are numbers
		if (typeof args[0] === 'number' && typeof args[1] === 'number' && typeof args[2] === 'number') {
			[skillId, x, y] = [...args];
		}

		break;
	default:
		throw new Error("invalid arguments, expected 'me' object or 'item' unit");
	}

	// Charged skills can only be casted on x, y coordinates
	unit && ([x, y] = [unit.x, unit.y]);

	if (this !== me && this.type !== 4) {
		print("ÿc9CastChargedSkillÿc0 :: Wierd Error, invalid arguments, expected 'me' object or 'item' unit" + " unit type : " + this.type);
		return false;
	}

	// Called the function the unit, me.
	if (this === me) {
		if (!skillId) {
			throw Error('Must supply skillId on me.castChargedSkill');
		}

		chargedItems = [];

		// Item must be equipped, or a charm in inventory
		this.getItems(-1)
			.filter(item => item && (item.location === 1 || (item.location === 3 && [sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].indexOf(item.itemType) > -1)))
			.forEach(function (item) {
				let stats = item.getStat(-2);

				if (stats.hasOwnProperty(204)) {
					if (stats[204] instanceof Array) {
						stats = stats[204].filter(validCharge);
						stats.length && chargedItems.push({
							charge: stats.first(),
							item: item
						});
					} else {
						if (stats[204].skill === skillId && stats[204].charges > 1) {
							chargedItems.push({
								charge: stats[204].charges,
								item: item
							});
						}
					}
				}
			});

		if (chargedItems.length === 0) {
			print("ÿc9CastChargedSkillÿc0 :: Don't have the charged skill (" + skillId + "), or not enough charges");
			return false;
		}

		chargedItem = chargedItems.sort((a, b) => a.charge.level - b.charge.level).first().item;

		// Check if item with charges is equipped on the switch spot
		if (me.weaponswitch === 0 && [11, 12].indexOf(chargedItem.bodylocation) > -1) {
			me.switchWeapons(1);
		}

		return chargedItem.castChargedSkill.apply(chargedItem, args);
	} else if (this.type === 4) {
		charge = this.getStat(-2)[204]; // WARNING. Somehow this gives duplicates

		if (!charge) {
			print("ÿc9CastChargedSkillÿc0 :: No charged skill on this item");
			return false;
		}

		if (skillId) {
			if (charge instanceof Array) {
				charge = charge.filter(item => (skillId && item.skill === skillId) && !!item.charges); // Filter out all other charged skills
				charge = charge.first();
			} else {
				if (charge.skill !== skillId || !charge.charges) {
					print("No charges matching skillId");
					charge = false;
				}
			}
		} else if (charge.length > 1) {
			throw new Error('multiple charges on this item without a given skillId');
		}

		if (charge) {
			// Setting skill on hand
			if (!Config.PacketCasting || Config.PacketCasting === 1 && skillId !== 54) {
				return Skill.cast(skillId, 0, x || me.x, y || me.y, this); // Non packet casting
			}

			// Packet casting
			sendPacket(1, 0x3c, 2, charge.skill, 1, 0x0, 1, 0x00, 4, this.gid);
			// No need for a delay, since its TCP, the server recv's the next statement always after the send cast skill packet

			// The result of "successfully" casted is different, so we cant wait for it here. We have to assume it worked
			sendPacket(1, 0x0C, 2, x || me.x, 2, y || me.y); // Cast the skill

			return true;
		}
	}

	return false;
};

Unit.prototype.castSwitchChargedSkill = function (...args) {
	let skillId, x, y, unit, chargedItem, charge,
		chargedItems = [],
		validCharge = function (itemCharge) {
			return itemCharge.skill === skillId && itemCharge.charges;
		};

	switch (args.length) {
	case 0: // item.castChargedSkill()
		break;
	case 1: // hellfire.castChargedSkill(monster);
		break;
	case 2:
		if (typeof args[0] === 'number') {
			if (args[1] instanceof Unit) {
				// me.castChargedSkill(skillId, unit)
				[skillId, unit] = [...args];
			} else if (typeof args[1] === 'number') {
				// item.castChargedSkill(x, y)
				[x, y] = [...args];
			}
		} else {
			throw new Error(' invalid arguments, expected (skillId, unit) or (x, y)');
		}

		break;
	case 3: // If all arguments are numbers
		if (typeof args[0] === 'number' && typeof args[1] === 'number' && typeof args[2] === 'number') {
			[skillId, x, y] = [...args];
		}

		break;
	default:
		throw new Error("invalid arguments, expected 'me' object");
	}

	// Charged skills can only be casted on x, y coordinates
	unit && ([x, y] = [unit.x, unit.y]);

	if (this !== me) {
		throw Error("invalid arguments, expected 'me' object");
	}

	// Called the function the unit, me.
	if (this === me) { 
		if (!skillId) {
			throw Error('Must supply skillId on me.castChargedSkill');
		}

		chargedItems = [];

		// Item must be equipped in the switch position
		this.getItems(-1)
			.filter(item => item && ((me.weaponswitch === 0 && [11, 12].indexOf(item.bodylocation) > -1) || (me.weaponswitch === 1 && [4, 5].indexOf(item.bodylocation) > -1)))
			.forEach(function (item) {
				let stats = item.getStat(-2);

				if (stats.hasOwnProperty(204)) {
					if (stats[204] instanceof Array) {
						stats = stats[204].filter(validCharge);
						stats.length && chargedItems.push({
							charge: stats.first(),
							item: item
						});
					} else {
						if (stats[204].skill === skillId && stats[204].charges > 1) {
							chargedItems.push({
								charge: stats[204].charges,
								item: item
							});
						}
					}
				}
			});

		if (chargedItems.length === 0) {
			print("ÿc9SwitchCastChargedSkillÿc0 :: Don't have the charged skill (" + skillId + "), or not enough charges");
			return false;
		}

		if (me.weaponswitch === 0) {
			me.switchWeapons(1);
		}

		chargedItem = chargedItems.sort((a, b) => a.charge.level - b.charge.level).first().item;

		return chargedItem.castChargedSkill.apply(chargedItem, args);
	}

	return false;
};

Unit.prototype.getStatEx = function (id, subid) {
	var i, temp, rval, regex;

	switch (id) {
	case 555: //calculates all res, doesnt exists trough
	{ // Block scope due to the variable declaration
		// Get all res
		let allres = [this.getStatEx(39), this.getStatEx(41), this.getStatEx(43), this.getStatEx(45)];

		// What is the minimum of the 4?
		let min = Math.min.apply(null, allres);

		// Cap all res to the minimum amount of res
		allres = allres.map(res => res > min ? min : res);

		// Get it in local variables, its more easy to read
		let [fire, cold, light, psn] = allres;

		return fire === cold && cold === light && light === psn ? min : 0;
	}

	case 9: // Max mana
		rval = this.getStat(9);

		if (rval > 446) {
			return rval - 16777216; // Fix for negative values (Gull knife)
		}

		return rval;
	case 20: // toblock
		switch (this.classid) {
		case 328: // buckler
			return this.getStat(20);
		case 413: // preserved
		case 483: // mummified
		case 503: // minion
			return this.getStat(20) - 3;
		case 329: // small
		case 414: // zombie
		case 484: // fetish
		case 504: // hellspawn
			return this.getStat(20) - 5;
		case 331: // kite
		case 415: // unraveller
		case 485: // sexton
		case 505: // overseer
			return this.getStat(20) - 8;
		case 351: // spiked
		case 374: // deefender
		case 416: // gargoyle
		case 486: // cantor
		case 506: // succubus
		case 408: // targe
		case 478: // akaran t
			return this.getStat(20) - 10;
		case 330: // large
		case 375: // round
		case 417: // demon
		case 487: // hierophant
		case 507: // bloodlord
			return this.getStat(20) - 12;
		case 376: // scutum
			return this.getStat(20) - 14;
		case 409: // rondache
		case 479: // akaran r
			return this.getStat(20) - 15;
		case 333: // goth
		case 379: // ancient
			return this.getStat(20) - 16;
		case 397: // barbed
			return this.getStat(20) - 17;
		case 377: // dragon
			return this.getStat(20) - 18;
		case 502: // vortex
			return this.getStat(20) - 19;
		case 350: // bone
		case 396: // grim
		case 445: // luna
		case 467: // blade barr
		case 466: // troll
		case 410: // heraldic
		case 480: // protector
			return this.getStat(20) - 20;
		case 444: // heater
		case 447: // monarch
		case 411: // aerin
		case 481: // gilded
		case 501: // zakarum
			return this.getStat(20) - 22;
		case 332: // tower
		case 378: // pavise
		case 446: // hyperion
		case 448: // aegis
		case 449: // ward
			return this.getStat(20) - 24;
		case 412: // crown
		case 482: // royal
		case 500: // kurast
			return this.getStat(20) - 25;
		case 499: // sacred r
			return this.getStat(20) - 28;
		case 498: // sacred t
			return this.getStat(20) - 30;
		}

		break;
	case 21: // plusmindamage
	case 22: // plusmaxdamage
		if (subid === 1) {
			temp = this.getStat(-1);
			rval = 0;

			for (i = 0; i < temp.length; i += 1) {
				switch (temp[i][0]) {
				case id: // plus one handed dmg
				case id + 2: // plus two handed dmg
					// There are 2 occurrences of min/max if the item has +damage. Total damage is the sum of both.
					// First occurrence is +damage, second is base item damage.

					if (rval) { // First occurence stored, return if the second one exists
						return rval;
					}

					if (this.getStat(temp[i][0]) > 0 && this.getStat(temp[i][0]) > temp[i][2]) {
						rval = temp[i][2]; // Store the potential +dmg value
					}

					break;
				}
			}

			return 0;
		}

		break;
	case 31: // plusdefense
		if (subid === 0) {
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			switch (this.itemType) {
			case 58: // jewel
			case 82: // charms
			case 83:
			case 84:
				// defense is the same as plusdefense for these items
				return this.getStat(31);
			}

			if (!this.desc) {
				this.desc = this.description;
			}

			temp = this.desc.split("\n");
			regex = new RegExp("\\+\\d+ " + getLocaleString(3481).replace(/^\s+|\s+$/g, ""));

			for (i = 0; i < temp.length; i += 1) {
				if (temp[i].match(regex, "i")) {
					return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
				}
			}

			return 0;
		}

		break;
	case 57:
		if (subid === 1) {
			return Math.round(this.getStat(57) * this.getStat(59) / 256);
		}

		break;
	case 83: // itemaddclassskills
		if (subid === undefined) {
			for (i = 0; i < 7; i += 1) {
				if (this.getStat(83, i)) {
					return this.getStat(83, i);
				}
			}

			return 0;
		}

		break;
	case 188: // itemaddskilltab
		if (subid === undefined) {
			temp = [0, 1, 2, 8, 9, 10, 16, 17, 18, 24, 25, 26, 32, 33, 34, 40, 41, 42, 48, 49, 50];

			for (i = 0; i < temp.length; i += 1) {
				if (this.getStat(188, temp[i])) {
					return this.getStat(188, temp[i]);
				}
			}

			return 0;
		}

		break;
	case 195: // itemskillonattack
	case 196: // itemskillonkill
	case 197: // itemskillondeath
	case 198: // itemskillonhit
	case 199: // itemskillonlevelup
	case 201: // itemskillongethit
	case 204: // itemchargedskill
		if (subid === 1) {
			temp = this.getStat(-2);

			if (temp.hasOwnProperty(id)) {
				if (temp[id] instanceof Array) {
					for (i = 0; i < temp[id].length; i += 1) {
						if (temp[id][i] !== undefined && temp[id][i].skill !== undefined) { // fix reference to undefined property temp[id][i].skill.
							return temp[id][i].skill;
						}
					}
				} else {
					return temp[id].skill;
				}
			}

			return 0;
		}

		if (subid === 2) {
			temp = this.getStat(-2);

			if (temp.hasOwnProperty(id)) {
				if (temp[id] instanceof Array) {
					for (i = 0; i < temp[id].length; i += 1) {
						if (temp[id][i] !== undefined) {
							return temp[id][i].level;
						}
					}
				} else {
					return temp[id].level;
				}
			}

			return 0;
		}

		break;
	case 216: // itemhpperlevel (for example Fortitude with hp per lvl can be defined now with 1.5)
		return this.getStat(216) / 2048;
	}

	if (this.getFlag(0x04000000)) { // Runeword
		switch (id) {
		case 16: // enhanceddefense
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			if (!this.desc) {
				this.desc = this.description;
			}

			temp = this.desc.split("\n");

			for (i = 0; i < temp.length; i += 1) {
				if (temp[i].match(getLocaleString(3520).replace(/^\s+|\s+$/g, ""), "i")) {
					return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
				}
			}

			return 0;
		case 18: // enhanceddamage
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			if (!this.desc) {
				this.desc = this.description;
			}

			temp = this.desc.split("\n");

			for (i = 0; i < temp.length; i += 1) {
				if (temp[i].match(getLocaleString(10038).replace(/^\s+|\s+$/g, ""), "i")) {
					return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
				}
			}

			return 0;
		}
	}

	if (subid === undefined) {
		return this.getStat(id);
	}

	return this.getStat(id, subid);
};

Object.defineProperty(Unit.prototype, 'classic', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.classic: Must be used with player units.");
		}

		return this.gametype === 0;
	}
});

Object.defineProperty(Unit.prototype, 'normal', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.normal: Must be used with player units.");
		}

		return this.diff === 0;
	}
});

Object.defineProperty(Unit.prototype, 'nightmare', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.nightmare: Must be used with player units.");
		}

		return this.diff === 1;
	}
});

Object.defineProperty(Unit.prototype, 'hell', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.hell: Must be used with player units.");
		}

		return this.diff === 2;
	}
});

Object.defineProperty(Unit.prototype, 'amazon', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.amazon: Must be used with player units.");
		}

		return this.classid === 0;
	}
});

Object.defineProperty(Unit.prototype, 'sorceress', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.sorceress: Must be used with player units.");
		}

		return this.classid === 1;
	}
});

Object.defineProperty(Unit.prototype, 'necromancer', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.necromancer: Must be used with player units.");
		}

		return this.classid === 2;
	}
});

Object.defineProperty(Unit.prototype, 'paladin', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.paladin: Must be used with player units.");
		}

		return this.classid === 3;
	}
});

Object.defineProperty(Unit.prototype, 'barbarian', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.barbarian: Must be used with player units.");
		}

		return this.classid === 4;
	}
});

Object.defineProperty(Unit.prototype, 'druid', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.druid: Must be used with player units.");
		}

		return this.classid === 5;
	}
});

Object.defineProperty(Unit.prototype, 'assassin', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.assassin: Must be used with player units.");
		}

		return this.classid === 6;
	}
});

Object.defineProperty(Unit.prototype, 'den', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.den: Must be used with player units.");
		}

		return this.getQuest(1, 0);
	}
});

Object.defineProperty(Unit.prototype, 'bloodraven', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.bloodraven: Must be used with player units.");
		}

		return this.getQuest(2, 0);
	}
});

Object.defineProperty(Unit.prototype, 'smith', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.smith: Must be used with player units.");
		}

		return this.getQuest(3, 0);
	}
});

Object.defineProperty(Unit.prototype, 'tristram', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.tristram: Must be used with player units.");
		}

		return this.getQuest(4, 0);
	}
});

Object.defineProperty(Unit.prototype, 'countess', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.countess: Must be used with player units.");
		}

		return this.getQuest(5, 0);
	}
});

Object.defineProperty(Unit.prototype, 'andariel', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.andariel: Must be used with player units.");
		}

		return this.getQuest(7, 0);
	}
});

Object.defineProperty(Unit.prototype, 'cube', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.cube: Must be used with player units.");
		}

		return !!this.getItem(549);
	}
});

Object.defineProperty(Unit.prototype, 'radament', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.radament: Must be used with player units.");
		}

		return this.getQuest(9, 0);
	}
});

Object.defineProperty(Unit.prototype, 'shaft', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.shaft: Must be used with player units.");
		}

		return this.getItem(92);
	}
});

Object.defineProperty(Unit.prototype, 'amulet', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.amulet: Must be used with player units.");
		}

		return this.getItem(521);
	}
});

Object.defineProperty(Unit.prototype, 'staff', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.staff: Must be used with player units.");
		}

		return this.getItem(91);
	}
});

Object.defineProperty(Unit.prototype, 'horadricstaff', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.horadricstaff: Must be used with player units.");
		}

		return this.getQuest(10, 0);
	}
});


Object.defineProperty(Unit.prototype, 'summoner', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.summoner: Must be used with player units.");
		}

		return this.getQuest(13, 0);
	}
});

Object.defineProperty(Unit.prototype, 'duriel', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.duriel: Must be used with player units.");
		}

		return this.getQuest(15, 0);
	}
});

Object.defineProperty(Unit.prototype, 'goldenbird', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.goldenbird: Must be used with player units.");
		}

		return this.getQuest(20, 0);
	}
});

Object.defineProperty(Unit.prototype, 'eye', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.eye: Must be used with player units.");
		}

		return this.getItem(553);
	}
});

Object.defineProperty(Unit.prototype, 'brain', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.brain: Must be used with player units.");
		}

		return this.getItem(555);
	}
});

Object.defineProperty(Unit.prototype, 'heart', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.heart: Must be used with player units.");
		}

		return this.getItem(554);
	}
});

Object.defineProperty(Unit.prototype, 'khalimswill', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.khalimswill: Must be used with player units.");
		}

		return this.getItem(174);
	}
});

Object.defineProperty(Unit.prototype, 'lamessen', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.lamessen: Must be used with player units.");
		}

		return this.getQuest(17, 0);
	}
});

Object.defineProperty(Unit.prototype, 'gidbinn', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.gidbinn: Must be used with player units.");
		}

		return this.getQuest(19, 0);
	}
});

Object.defineProperty(Unit.prototype, 'travincal', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.travincal: Must be used with player units.");
		}

		return this.getQuest(18, 0);
	}
});

Object.defineProperty(Unit.prototype, 'mephisto', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.mephisto: Must be used with player units.");
		}

		return this.getQuest(23, 0);
	}
});

Object.defineProperty(Unit.prototype, 'izual', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.izual: Must be used with player units.");
		}

		return this.getQuest(25, 0);
	}
});

Object.defineProperty(Unit.prototype, 'diablo', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.diablo: Must be used with player units.");
		}

		return this.getQuest(26, 0);
	}
});

Object.defineProperty(Unit.prototype, 'hellforge', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.hellforge: Must be used with player units.");
		}

		return this.getQuest(27, 0);
	}
});

Object.defineProperty(Unit.prototype, 'shenk', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.shenk: Must be used with player units.");
		}

		return this.getQuest(35, 0);
	}
});

Object.defineProperty(Unit.prototype, 'larzuk', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.larzuk: Must be used with player units.");
		}

		return this.getQuest(35, 1);
	}
});

Object.defineProperty(Unit.prototype, 'savebarby', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.savebarby: Must be used with player units.");
		}

		return this.getQuest(36, 0);
	}
});

Object.defineProperty(Unit.prototype, 'anya', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.anya: Must be used with player units.");
		}

		return this.getQuest(37, 0);
	}
});

Object.defineProperty(Unit.prototype, 'ancients', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.ancients: Must be used with player units.");
		}

		return this.getQuest(39, 0);
	}
});

Object.defineProperty(Unit.prototype, 'baal', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.baal: Must be used with player units.");
		}

		return this.getQuest(40, 0);
	}
});

Object.defineProperty(Unit.prototype, 'cows', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.cows: Must be used with player units.");
		}

		return this.getQuest(4, 10);
	}
});

Object.defineProperty(Unit.prototype, 'respec', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.respec: Must be used with player units.");
		}

		return this.getQuest(41, 0);
	}
});
