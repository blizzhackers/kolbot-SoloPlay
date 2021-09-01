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
	/*print("Current State for BO: " + me.getState(32));
	print("Current State for BC: " + me.getState(51));
	print("Bo Tick: " + this.BOTick);
	print("BODuration: " + this.BODuration);
	print("Tick counter: " + (getTickCount() - this.BOTick < this.BODuration - 30000));*/

	if (me.classic || me.barbarian || me.inTown) {
		return false;
	}

	if (!force && (me.getState(32) || (getTickCount() - this.BOTick < this.BODuration - 30000))) {
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

Precast.doPrecast = function (force) {
	var buffSummons = false;

	if (!Precast.enabled) {
		return;
	}

	// Force BO 30 seconds before it expires
	if (this.haveCTA) {
		this.precastCTA(!me.getState(51) || force || (getTickCount() - this.BOTick >= this.BODuration - 30000));
	}

	switch (me.classid) {
	case 0: // Amazon
		if (Config.SummonValkyrie) {
			buffSummons = this.summon(32); // Valkyrie
		}

		if (buffSummons) {
			this.precastCTA(force);
		}

		break;
	case 1: // Sorceress
		if (me.getSkill(57, 1) && (!me.getState(38) || force)) {
			this.precastSkill(57); // Thunder Storm
		}

		if (me.getSkill(58, 0) && (!me.getState(30) || force)) {
			this.precastSkill(58); // Energy Shield
		}

		if (me.getSkill(50, 0)) {
			if (!me.getState(88) || force) {
				this.precastSkill(50); // Shiver Armor
			}
		} else if (me.getSkill(60, 0)) {
			if (!me.getState(20) || force) {
				this.precastSkill(60); // Chilling Armor
			}
		} else if (me.getSkill(40, 0)) {
			if (!me.getState(10) || force) {
				this.precastSkill(40); // Frozen Armor
			}
		}

		if (me.getSkill(52, 0) && (!me.getState(16) || force)) {
			this.enchant();
		}

		break;
	case 2: // Necromancer
		if (me.getSkill(68, 0) && (!me.getState(14) || force)) {
			this.precastSkill(68); // Bone Armor
		}

		switch (Config.Golem) {
		case 0:
		case "None":
			break;
		case 1:
		case "Clay":
			// TODO: Write a check to see if with an act boss, if so cast golem revive golem right on top of them
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
	case 3: // Paladin
		if (me.getSkill(117, 0) && (!me.getState(101) || force)) {
			this.precastSkill(117); // Holy Shield
		}

		break;
	case 4: // Barbarian - TODO: BO duration
		if ((!me.getState(26) && me.getSkill(138, 0)) || (!me.getState(32) && me.getSkill(149, 0)) || (!me.getState(51) && me.getSkill(155, 0)) || force) {
			var swap = 0;

			if (me.charlvl >= 24 && me.getSkill(149, 0)) {
				swap = me.weaponswitch;
				me.switchWeapons(this.getBetterSlot(149));

			}

			if (me.charlvl >= 30) {
				if (me.getSkill(155, 0) && (!me.getState(51) || force) && Skill.getManaCost(155) < me.mp) {
					Skill.cast(155, 0); // Battle Command

					if (Skill.getManaCost(155) < me.mp) {
						delay(me.ping + 30);
						Skill.cast(155, 0); // Cast twice. It works on itself
					}
					
				}
			}

			if (me.charlvl >= 24) {
				if (me.getSkill(149, 0) && (!me.getState(32) || force) && Skill.getManaCost(149) < me.mp) {
					Skill.cast(149, 0); // Battle Orders

					delay(me.ping + 30);
				}
			}

			if (me.charlvl >= 6) {
				if (me.getSkill(138, 0) && (!me.getState(26) || force) && Skill.getManaCost(138) < me.mp) {
					Skill.cast(138, 0); // Shout

					delay(me.ping + 30);
				}
			}

			me.switchWeapons(swap);
		}

		break;
	case 5: // Druid
		if (me.getSkill(235, 0) && (!me.getState(151) || force)) {
			this.precastSkill(235); // Cyclone Armor
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

		if (me.getSkill(250, 0) && (!me.getState(144) || force)) {
			Skill.cast(250, 0); // Hurricane
		}

		if (Config.SummonSpirit === 1 && me.getSkill(226, 1) && (!me.getState(149) || force)) {
			Skill.cast(226, 0); // Oak Sage
		}

		if (Config.SummonSpirit === 2 && me.getSkill(236, 1) && (!me.getState(148) || force)) {
			Skill.cast(236, 0); // Heart of Wolverine
		}

		if (Config.SummonSpirit === 3 && me.getSkill(246, 1) && (!me.getState(147) || force)) {
			Skill.cast(246, 0); // Spirit of Barbs
		}

		if (buffSummons) {
			this.precastCTA(force);
		}

		if (!!Config.Wereform) {
			Misc.shapeShift(Config.Wereform);
		}

		break;
	case 6: // Assassin
		if (me.getSkill(267, 0) && Config.UseFade && (!me.getState(159) || force)) {
			this.precastSkill(267); // Fade
		}

		if (me.getSkill(278, 0) && Config.UseVenom && (!me.getState(31) || force)) {
			Skill.cast(278, 0); // Venom
		}

		if (me.getSkill(277, 0) && (!me.getState(158) || force)) {
			this.precastSkill(277); // Blade Shield
		}

		if (me.getSkill(258, 0) && !Config.UseFade && Config.UseBoS && (!me.getState(157) || force)) {
			this.precastSkill(258); // Burst of Speed
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

		if (unit && [3, 15, 16].indexOf(minion) > -1) {
			try {
				Skill.cast(skillId, 0, unit);

				continue;
			} catch (e) {
				print(e);
			}
		}

		if (coord) {
			Skill.cast(skillId, 0, coord.x, coord.y);
		} else {
			Skill.cast(skillId, 0, me.x, me.y);
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
				Pather.moveTo(coord.x, coord.y);
			}

			retry = 0;
		}
	}

	return !!rv;
};
