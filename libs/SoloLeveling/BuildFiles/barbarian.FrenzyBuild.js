/**
 *    @filename   barbarian.FrenzyBuild.js
 *	  @author	  theBGuy
 *    @desc       Frenzy final build
 */

var build = {
	caster: false,
	skillstab: 32, // Combat skills
	wantedskills: [149, 147, 133], // Battle Orders, Frenzy, Double Swing
	usefulskills: [153, 145, 148], // Natural Resistance, Iron Skin, Incresed Speed
	precastSkills: [149], // Battle orders
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 25], ["dexterity", 25], ["vitality", 30],
		["strength", 48], ["dexterity", 39], ["vitality", 50],
		["strength", 55], ["dexterity", 45], ["vitality", 60],
		["strength", 58], ["dexterity", 58], ["vitality", 70],
		["strength", 85], ["dexterity", 60], ["vitality", 80],
		["strength", 103], ["dexterity", 79], ["vitality", 90],
		["dexterity", 136], ["strength", 150], ["vitality", "all"],
	],
	skills: [
		[126, 1, false], // Bash -> charlvl 2
		[130, 1, false], // Howl -> charlvl 4
		[127, 2, false], // Sword Mastery -> charlvl 3 (1 point from den)
		[133, 1, false], // Double Swing -> charlvl 6
		[138, 1, false], // Shout -> charlvl 6
		[139, 1, false], // Stun -> charlvl 12
		[133, 9, true], // Double Swing -> charlvl 14
		[146, 1, true], // Battle Cry -> charlvl 18
		[145, 1, true], // Iron Skin -> charlvl 18
		[127, 6, false], // Sword Mastery -> charlvl 23
		[147, 1, true], // Frenzy -> charlvl 24
		[149, 1, true], // Battle Orders -> charlvl 24
		[147, 2, false], // Frenzy -> charlvl 25
		[149, 2, false], // Battle Orders -> charlvl 26
		[147, 3, false], // Frenzy -> charlvl 27
		[149, 3, false], // Battle Orders -> charlvl 28
		[155, 1, true], // Battle Command -> charlvl 30
		[154, 1, true], // War Cry -> charlvl 30
		[153, 5, true], // Natural Resistance 5 // charLvl 35 (enough res to get out or normal)
		[152, 5, true], // Beserk -> charLvl 40
		[147, 4, false], // Frenzy -> charlvl 41
		[149, 4, false], // Battle Orders -> charlvl 42
		[147, 5, false], // Frenzy -> charlvl 43
		[149, 5, false], // Battle Orders -> charlvl 44
		[147, 6, false], // Frenzy -> charlvl 45
		[149, 6, false], // Battle Orders -> charlvl 46
		[147, 7, false], // Frenzy -> charlvl 47
		[149, 7, false], // Battle Orders -> charlvl 48
		[147, 8, false], // Frenzy -> charlvl 49
		[149, 8, false], // Battle Orders -> charlvl 50
		[147, 9, false], // Frenzy -> charlvl 51
		[149, 9, false], // Battle Orders -> charlvl 52
		[147, 10, false], // Frenzy -> charlvl 53
		[149, 10, false], // Battle Orders -> charlvl 54
		[147, 11, false], // Frenzy -> charlvl 55
		[149, 11, false], // Battle Orders -> charlvl 56
		[147, 12, false], // Frenzy -> charlvl 57
		[149, 12, false], // Battle Orders -> charlvl 58 (BO now lasts 2 minutes, so lets max Frenzy)
		[147, 20, false], // Frenzy -> charlvl 66
		[149, 20, false], // Battle Orders -> charlvl 72
		[127, 20, false], // Sword Mastery -> charlvl 86
		[133, 20, false], // Double Swing -> charlvl 99
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[name] == phaseblade && [flag] == runeword # [ias] >= 30 # [tier] == 100000", //Grief
		"[name] == colossusblade && [flag] == runeword # [ias] >= 60 && [enhanceddamage] >= 350 # [tier] == 100000", //BoTD
		//Helmet
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000", //Arreat's Face
		//belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == 100000", //Dungo's
		//boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 100000", //gorerider's
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [frw] >= 45 # [tier] == 100000", //Enigma
		//gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000", //laying of hands
		//ammy
		"[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == 100000", //Atma's
		//rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		//Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [masteriesskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [barbcombatskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		//Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && [quality] == magic # [warcriesskilltab] >= 1 && [secondarymindamage] == 0 # [secondarytier] == 100000 + tierscore(item)",
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
