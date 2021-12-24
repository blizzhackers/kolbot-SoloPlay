/**
 *    @filename   barbarian.FrenzyBuild.js
 *	  @author	  theBGuy
 *    @desc       Frenzy final build
 */

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.CombatBarb,
	wantedskills: [sdk.skills.BattleOrders, sdk.skills.Frenzy, sdk.skills.DoubleSwing],
	usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.WarCry],
	mercAuraName: "Might",
	mercAuraWanted: sdk.skills.Might,
	mercDiff: 1,
	stats: [
		["strength", 103], ["dexterity", 79], ["vitality", 90],
		["dexterity", 136], ["strength", 150], ["vitality", "all"],
	],
	skills: [
		[sdk.skills.Bash, 1, false], 			// charlvl 2
		[sdk.skills.Howl, 1, false], 			// charlvl 4
		[sdk.skills.SwordMastery, 2, false],	// charlvl 3 (1 point from den)
		[sdk.skills.DoubleSwing, 1, false], 	// charlvl 6
		[sdk.skills.Shout, 1, false], 			// charlvl 6
		[sdk.skills.Stun, 1, false], 			// charlvl 12
		[sdk.skills.DoubleSwing, 9, true], 		// charlvl 14
		[sdk.skills.BattleCry, 1, true], 		// charlvl 18
		[sdk.skills.IronSkin, 1, true], 		// charlvl 18
		[sdk.skills.SwordMastery, 6, false],	// charlvl 23
		[sdk.skills.Frenzy, 1, true], 			// charlvl 24
		[sdk.skills.BattleOrders, 1, true], 	// charlvl 24
		[sdk.skills.Frenzy, 2, false], 			// charlvl 25
		[sdk.skills.BattleOrders, 2, false],	// charlvl 26
		[sdk.skills.Frenzy, 3, false], 			// charlvl 27
		[sdk.skills.BattleOrders, 3, false],	// charlvl 28
		[sdk.skills.BattleCommand, 1, true],	// charlvl 30
		[sdk.skills.WarCry, 1, true], 			// charlvl 30
		[sdk.skills.NaturalResistance, 5, true], // charLvl 35 (enough res to get out or normal)
		[sdk.skills.Berserk, 5, true], 			// charLvl 40
		[sdk.skills.Frenzy, 4, false], 			// charlvl 41
		[sdk.skills.BattleOrders, 4, false], 	// charlvl 42
		[sdk.skills.Frenzy, 5, false], 			// charlvl 43
		[sdk.skills.BattleOrders, 5, false], 	// charlvl 44
		[sdk.skills.Frenzy, 6, false], 			// charlvl 45
		[sdk.skills.BattleOrders, 6, false], 	// charlvl 46
		[sdk.skills.Frenzy, 7, false], 			// charlvl 47
		[sdk.skills.BattleOrders, 7, false], 	// charlvl 48
		[sdk.skills.Frenzy, 8, false], 			// charlvl 49
		[sdk.skills.BattleOrders, 8, false], 	// charlvl 50
		[sdk.skills.Frenzy, 9, false], 			// charlvl 51
		[sdk.skills.BattleOrders, 9, false], 	// charlvl 52
		[sdk.skills.Frenzy, 10, false], 		// charlvl 53
		[sdk.skills.BattleOrders, 10, false], 	// charlvl 54
		[sdk.skills.Frenzy, 11, false], 		// charlvl 55
		[sdk.skills.BattleOrders, 11, false], 	// charlvl 56
		[sdk.skills.Frenzy, 12, false], 		// charlvl 57
		[sdk.skills.BattleOrders, 12, false], 	// charlvl 58 (BO now lasts 2 minutes, so lets max Frenzy)
		[sdk.skills.Frenzy, 20, false], 		// charlvl 66
		[sdk.skills.BattleOrders, 20, false], 	// charlvl 72
		[sdk.skills.SwordMastery, 20, false], 	// charlvl 86
		[sdk.skills.DoubleSwing, 20, false], 	// charlvl 99
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == phaseblade && [flag] == runeword # [ias] >= 30 # [tier] == 100000", //Grief
		"[name] == colossusblade && [flag] == runeword # [ias] >= 60 && [enhanceddamage] >= 350 # [tier] == 100000", //BoTD
		// Helmet
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000 + tierscore(item)", //Arreat's Face
		// Belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == 100000 + tierscore(item)", //Dungo's
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 100000 + tierscore(item)", //gorerider's
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 30 # [tier] == 100000", //Fortitude
		// Gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000", //laying of hands
		// Amulet
		"[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == 100000 + tierscore(item)", //Atma's
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [masteriesskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [barbcombatskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("sword", "runeword", "Breath of the Dying");
		}
	},
};
