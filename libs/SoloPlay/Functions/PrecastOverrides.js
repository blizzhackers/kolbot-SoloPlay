/*
*	@filename	PrecastOverrides.js
*	@author		theBGuy
*	@desc		Precast.js fixes to improve functionality
*/

if (!isIncluded("common/Precast.js")) {
	include("common/Precast.js");
}

Precast.enabled = true;

Precast.precastCTA = function (force) {
	if (me.classic || me.barbarian || me.inTown || me.shapeshifted) {
		return false;
	}

	if (!force && (me.getState(sdk.states.BattleOrders) || (getTickCount() - this.BOTick < this.BODuration - 30000))) {
		return true;
	}

	if (this.checkCTA()) {
		var slot = me.weaponswitch;

		me.switchWeapons(this.haveCTA);
		Skill.cast(155, 0); // Battle Command
		Skill.cast(155, 0); // Battle Command
		Skill.cast(149, 0); // Battle Orders

		this.BODuration = (20 + me.getSkill(149, 1) * 10 + (me.getSkill(138, 0) + me.getSkill(155, 0)) * 5) * 1000;
		this.BOTick = getTickCount();

		me.switchWeapons(slot);

		return true;
	}

	return false;
};

Precast.getBetterSlot = function (skillId) {
	if (this.bestSlot[skillId] !== undefined) {
		return this.bestSlot[skillId];
	}

	var item, classid, skillTab,
		sumCurr = 0,
		sumSwap = 0;

	switch (skillId) {
	case 40: // Frozen Armor
	case 50: // Shiver Armor
	case 60: // Chilling Armor
		classid = 1;
		skillTab = 10;

		break;
	case 52: // Enchant
		classid = 1;
		skillTab = 8;

		break;
	case 57: // Thunder Storm
	case 58: // Energy Shield
		classid = 1;
		skillTab = 9;

		break;
	case 68: // Bone Armor
		classid = 2;
		skillTab = 17;

		break;
	case 117: // Holy Shield
		classid = 3;
		skillTab = 24;

		break;
	case 137: // Taunt
	case 138: // Shout
	case 142: // Find Item
	case 146: // Battle Cry
	case 149: // Battle Orders
	case 154: // War Cry
	case 155: // Battle Command
		classid = 4;
		skillTab = 34;

		break;
	case 235: // Cyclone Armor
		classid = 5;
		skillTab = 42;

		break;
	case 258: // Burst of Speed
	case 267: // Fade
		classid = 6;
		skillTab = 49;

		break;
	case 277: // Blade Shield
		classid = 6;
		skillTab = 48;

		break;
	case 223: // Wearwolf
	case 228: // Wearbear
		classid = 5;
		skillTab = 41;

		break;
	default:
		return me.weaponswitch;
	}

	item = me.getItem();

	if (item) {
		do {
			if (item.bodylocation === 4 || item.bodylocation === 5) {
				sumCurr += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
			}

			if (item.bodylocation === 11 || item.bodylocation === 12) {
				sumSwap += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
			}
		} while (item.getNext());
	}

	this.bestSlot[skillId] = (sumSwap > sumCurr) ? me.weaponswitch ^ 1 : me.weaponswitch;
	return this.bestSlot[skillId];
};

Precast.precastSkill = function (skillId) {
	var swap = me.weaponswitch;

	if (!Skill.wereFormCheck(skillId)) {
		return false;
	}

	me.switchWeapons(this.getBetterSlot(skillId));
	Skill.cast(skillId, 0);
	me.switchWeapons(swap);

	return true;
};

Precast.doPrecast = function (force) {
	var buffSummons = false;

	if (!Precast.enabled) {
		return;
	}

	// Force BO 30 seconds before it expires
	if (this.haveCTA) {
		this.precastCTA(!me.getState(sdk.states.BattleCommand) || force || (getTickCount() - this.BOTick >= this.BODuration - 30000));
	}

	switch (me.classid) {
	case sdk.charclass.Amazon:
		if (Config.SummonValkyrie) {
			buffSummons = this.summon(32); // Valkyrie
		}

		if (buffSummons) {
			this.precastCTA(force);
		}

		break;
	case sdk.charclass.Sorceress:
		if (me.getSkill(sdk.skills.ThunderStorm, 1) && (!me.getState(sdk.states.ThunderStorm) || force)) {
			this.precastSkill(sdk.skills.ThunderStorm);
		}

		if (me.getSkill(sdk.skills.EnergyShield, 0) && (!me.getState(sdk.states.EnergyShield) || force)) {
			this.precastSkill(sdk.skills.EnergyShield);
		}

		// use which ever skill is the highest
		var bestArmorSkill = function () {
			let coldArmor = [
					{skillId: sdk.skills.ShiverArmor, level: me.getSkill(sdk.skills.ShiverArmor, 1)},
					{skillId: sdk.skills.ChillingArmor, level: me.getSkill(sdk.skills.ChillingArmor, 1)},
					{skillId: sdk.skills.FrozenArmor, level: me.getSkill(sdk.skills.FrozenArmor, 1)},
				].filter(skill => skill.level > 0).sort((a, b) => b.level - a.level).first();
			return coldArmor !== undefined ? coldArmor.skillId : false;
		};

		switch (bestArmorSkill()) {
		case sdk.skills.FrozenArmor:
			if (!me.getState(sdk.states.FrozenArmor) || force) {
				Precast.precastSkill(sdk.skills.FrozenArmor);
			}

			break;
		case sdk.skills.ChillingArmor:
			if (!me.getState(sdk.states.ChillingArmor) || force) {
				Precast.precastSkill(sdk.skills.ChillingArmor);
			}

			break;
		case sdk.skills.ShiverArmor:
			if (!me.getState(sdk.states.ShiverArmor) || force) {
				Precast.precastSkill(sdk.skills.ShiverArmor);
			}

			break;
		default:
			break;
		}

		if (me.getSkill(sdk.skills.Enchant, 1) && (!me.getState(sdk.states.Enchant) || force)) {
			this.enchant();
		}

		break;
	case sdk.charclass.Necromancer:
		if (me.getSkill(sdk.skills.BoneArmor, 1) && (!me.getState(sdk.states.BoneArmor) || force)) {
			this.precastSkill(sdk.skills.BoneArmor);
		}

		switch (Config.Golem) {
		case 0:
		case "None":
			break;
		case 1:
		case "Clay":
			this.summon(75);
			break;
		case 2:
		case "Blood":
			this.summon(85);
			break;
		case 3:
		case "Fire":
			this.summon(94);
			break;
		}

		break;
	case sdk.charclass.Paladin:
		if (me.getSkill(sdk.skills.HolyShield, 0) && (!me.getState(sdk.states.HolyShield) || force)) {
			this.precastSkill(sdk.skills.HolyShield);
		}

		break;
	case sdk.charclass.Barbarian:
		if ((!me.getState(sdk.states.Shout) && me.getSkill(sdk.skills.Shout, 0)) ||
			(!me.getState(sdk.states.BattleOrders) && me.getSkill(sdk.skills.BattleOrders, 0)) ||
			(!me.getState(sdk.states.BattleCommand) && me.getSkill(sdk.skills.BattleCommand, 0)) || force) {
			var swap = 0;

			if (me.charlvl >= 24 && me.getSkill(sdk.skills.BattleOrders, 0)) {
				swap = me.weaponswitch;
				me.switchWeapons(this.getBetterSlot(sdk.skills.BattleOrders));
			}

			if (me.charlvl >= 30) {
				if (me.getSkill(sdk.skills.BattleCommand, 0) && (!me.getState(sdk.states.BattleCommand) || force) && Skill.getManaCost(sdk.skills.BattleCommand) < me.mp) {
					Skill.cast(sdk.skills.BattleCommand, 0);

					if (Skill.getManaCost(sdk.skills.BattleCommand) < me.mp) {
						delay(me.ping + 30);
						Skill.cast(sdk.skills.BattleCommand, 0); // Cast twice. It works on itself
					}	
				}
			}

			if (me.charlvl >= 24) {
				if (me.getSkill(sdk.skills.BattleOrders, 0) && (!me.getState(sdk.states.BattleOrders) || force) && Skill.getManaCost(sdk.skills.BattleOrders) < me.mp) {
					Skill.cast(sdk.skills.BattleOrders, 0);

					delay(me.ping + 30);
				}
			}

			if (me.charlvl >= 6) {
				if (me.getSkill(sdk.skills.Shout, 0) && (!me.getState(sdk.states.Shout) || force) && Skill.getManaCost(sdk.skills.Shout) < me.mp) {
					Skill.cast(sdk.skills.Shout, 0);

					delay(me.ping + 30);
				}
			}

			me.switchWeapons(swap);
		}

		break;
	case sdk.charclass.Druid:
		if (me.getSkill(sdk.skills.CycloneArmor, 1) && (!me.getState(sdk.states.CycloneArmor) || force)) {
			this.precastSkill(sdk.skills.CycloneArmor);
		}

		if (Config.SummonRaven) {
			this.summon(221); // Raven
		}

		switch (Config.SummonAnimal) {
		case 1:
		case "Spirit Wolf":
			buffSummons = this.summon(227) || buffSummons; // Summon Spirit Wolf

			break;
		case 2:
		case "Dire Wolf":
			buffSummons = this.summon(237) || buffSummons; // Summon Dire Wolf

			break;
		case 3:
		case "Grizzly":
			buffSummons = this.summon(247) || buffSummons; // Summon Grizzly

			break;
		}

		switch (Config.SummonVine) {
		case 1:
		case "Poison Creeper":
			buffSummons = this.summon(222) || buffSummons; // Poison Creeper

			break;
		case 2:
		case "Carrion Vine":
			buffSummons = this.summon(231) || buffSummons; // Carrion Vine

			break;
		case 3:
		case "Solar Creeper":
			buffSummons = this.summon(241) || buffSummons; // Solar Creeper

			break;
		}

		switch (Config.SummonSpirit) {
		case 1:
		case "Oak Sage":
			buffSummons = this.summon(226) || buffSummons; // Oak Sage

			break;
		case 2:
		case "Heart of Wolverine":
			buffSummons = this.summon(236) || buffSummons; // Heart of Wolverine

			break;
		case 3:
		case "Spirit of Barbs":
			buffSummons = this.summon(246) || buffSummons; // Spirit of Barbs

			break;
		}

		let useHurricane = me.getSkill(sdk.skills.Hurricane, 1);
		let useArmageddon = me.getSkill(sdk.skills.Armageddon, 1);

		// If both skills have points, check which has more
		// Maybe also add synergy check? In the off chance we are windy but somehow have more into Armageddon
		if (!!useHurricane && !!useArmageddon) {
			if (useHurricane > useArmageddon && !me.shapeshifted) {
				if (!me.getState(sdk.states.Hurricane) || force) {
					Skill.cast(sdk.skills.Hurricane, 0);
				}
			} else {
				if (!me.getState(sdk.states.Armageddon) || force) {
					Skill.cast(sdk.skills.Armageddon, 0);
				}
			}
		} else {
			if (!!useHurricane && (!me.getState(sdk.states.Hurricane) || force)) {
				Skill.cast(sdk.skills.Hurricane, 0);
			}

			if (!!useArmageddon && (!me.getState(sdk.states.Armageddon) || force)) {
				Skill.cast(sdk.skills.Armageddon, 0);
			}
		}

		if (Config.SummonSpirit === 1 && me.getSkill(sdk.skills.OakSage, 1) && (!me.getState(sdk.states.OakSage) || force)) {
			Skill.cast(sdk.skills.OakSage, 0);
		}

		if (Config.SummonSpirit === 2 && me.getSkill(sdk.skills.HeartofWolverine, 1) && (!me.getState(sdk.states.HeartofWolverine) || force)) {
			Skill.cast(sdk.skills.HeartofWolverine, 0);
		}

		if (Config.SummonSpirit === 3 && me.getSkill(sdk.skills.SpiritofBarbs, 1) && (!me.getState(sdk.states.Barbs) || force)) {
			Skill.cast(sdk.skills.SpiritofBarbs, 0);
		}

		if (buffSummons) {
			this.precastCTA(force);
		}

		if (!!Config.Wereform) {
			Misc.shapeShift(Config.Wereform);
		}

		break;
	case sdk.charclass.Assassin:
		if (me.getSkill(sdk.skills.Fade, 0) && Config.UseFade && (!me.getState(sdk.states.Fade) || force)) {
			this.precastSkill(sdk.skills.Fade);
		}

		if (me.getSkill(sdk.skills.Venom, 0) && Config.UseVenom && (!me.getState(sdk.states.Venom) || force)) {
			Skill.cast(sdk.skills.Venom, 0);
		}

		if (me.getSkill(sdk.skills.BladeShield, 0) && (!me.getState(sdk.states.BladeShield) || force)) {
			this.precastSkill(sdk.skills.BladeShield);
		}

		if (me.getSkill(sdk.skills.BurstofSpeed, 0) && !Config.UseFade && Config.UseBoS && (!me.getState(sdk.states.BurstofSpeed) || force)) {
			this.precastSkill(sdk.skills.BurstofSpeed);
		}

		switch (Config.SummonShadow) {
		case 1:
		case "Warrior":
			this.summon(268); // Shadow Warrior
			break;
		case 2:
		case "Master":
			this.summon(279); // Shadow Master
			break;
		}

		break;
	}

	me.switchWeapons(Attack.getPrimarySlot());
};

Precast.summon = function (skillId) {
	if (!me.getSkill(skillId, 1)) {
		return false;
	}

	var minion, rv, retry = 0,
		count = 1;

	switch (skillId) {
	case 32: // Valkyrie
		minion = 2;

		break;
	case 75: // Clay Golem
	case 85: // Blood Golem
	case 94: // Fire Golem
		minion = 3;

		break;
	case 221: // Raven
		minion = 10;
		count = Math.min(me.getSkill(221, 1), 5);

		break;
	case 226: // Oak Sage
	case 236: // Heart of Wolverine
	case 246: // Spirit of Barbs
		minion = 13;

		break;
	case 222: // Poison Creeper
	case 231: // Carrion Vine
	case 241: // Solar Creeper
		minion = 14;

		break;
	case 227: // Spirit Wolf
		minion = 11;
		count = Math.min(me.getSkill(227, 1), 5);

		break;
	case 237: // Dire Wolf
		minion = 12;
		count = Math.min(me.getSkill(237, 1), 3);

		break;
	case 247: // Grizzly
		minion = 15;

		break;
	case 268: // Shadow Warrior
	case 279: // Shadow Master
		minion = 16;

		break;
	}

	while (me.getMinionCount(minion) < count) {
		rv = true;
		let coord = CollMap.getRandCoordinate(me.x, -3, 3, me.y, -3, 3);	// Get a random coordinate to summon using
		let unit = Attack.getNearestMonster(true);

		if (unit && [3, 15, 16].indexOf(minion) > -1 && getDistance(me, unit) < 20) {
			try {
				if (Skill.cast(skillId, 0, unit)) {
					if (me.getMinionCount(minion) === count) {
						continue;
					} else {
						retry++;
					}
				} else if (Skill.cast(skillId, 0, me.x, me.y)) {
					if (me.getMinionCount(minion) === count) {
						continue;
					} else {
						retry++;
					}
				}
			} catch (e) {
				print(e);
			}
		}

		if (coord && Attack.castableSpot(coord.x, coord.y)) {
			Skill.cast(skillId, 0, coord.x, coord.y);

			if (me.getMinionCount(minion) === count) {
				continue;
			} else {
				retry++;
			}
		} else if (Attack.castableSpot(me.x, me.y)) {
			Skill.cast(skillId, 0, me.x, me.y);

			if (me.getMinionCount(minion) === count) {
				continue;
			} else {
				retry++;
			}
		}

		if (Skill.getManaCost(skillId) > me.mp) {		// May remove this
			delay(1000);
			retry++;
		}

		if (retry > count * 2) {
			if (me.inTown) {
				if (Town.heal()) {
					delay(100 + me.ping);
					me.cancel();
				}
				
				Town.move("portalspot");
				Skill.cast(skillId, 0, me.x, me.y);
			} else {
				coord = CollMap.getRandCoordinate(me.x, -6, 6, me.y, -6, 6);	//Keeps bots from getting stuck trying to summon

				if (coord && Attack.validSpot(coord.x, coord.y)) {
					Pather.moveTo(coord.x, coord.y);
					Skill.cast(skillId, 0, me.x, me.y);
				}
			}

			retry = 0;
		}
	}

	return !!rv;
};
