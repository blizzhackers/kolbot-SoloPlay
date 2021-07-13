/*
 *    @filename   amazon.JavazonBuild.js
 *	  @author	  theBGuy
 *    @desc       Javazon build
 */

var build = {
	caster: false,
	skillstab: 2, // Jav N Spear Skills
	wantedskills: [24, 34], // Charged Strike, Lightning Strike
	usefulskills: [9, 23, 32, 33], // Critical Strike, Penetrate, Valkyrie, Pierce
	precastSkills: [32], // Valkyrie
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47], 
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", 65], ["strength", 53], ["dexterity", 118], 
		["vitality", 100],
		["strength", 156], ["vitality", "all"],
	],
	skills: [
		[10, 1, false], // Jab 1 // -> charlvl 2
		[8, 1, false], // Inner Sight 1 // -> charlvl 3
		[9, 2, false], // Critical Strike 2 // -> charlvl 5
		[14, 1, false], // Power Strike 1 // -> charlvl 6
		[13, 1, false], // Dodge 1 // -> charlvl 7
		[14, 4, false], // Power Strike 4 // -> charlvl 11
		[17, 1, false], // Slow Missles 1 // -> charlvl 12
		[18, 1, false], // Avoid 1 // -> charlvl 13
		[14, 8, false], // Power Strike 8 // -> charlvl 17
		[24, 1, false], // Charged Strike 1 // -> charlvl 18
		[23, 1, false], // Penetrate 1 // -> charlvl 18
		[24, 5, false], // Charged Strike 5 // -> charlvl 23
		[29, 1, false], // Evade 1 // charLvl 24
		[28, 1, false], // Decoy 1 // -> charlvl 25
		[24, 9, false], // Charged Strike 9 // -> charlvl 29
		[32, 1, false], // Valkyrie 1 // -> charlvl 30
		[34, 1, false], // Lightning Strike 1 // -> charlvl 31
		[24, 20, true], // Charged Strike 20 // -> charlvl 42
		[34, 20, true], // Lightning Strike 20 // -> charlvl 63
		[35, 20, true], // Lightning Fury 20 // -> charlvl ?
		[28, 5, false], // Decoy 5 // -> charlvl 47
		[32, 17, true], // Valkyrie 20 // -> charlvl ? 
		[14, 20, false], // Power Strike 20 // -> charlvl ?
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[name] == ceremonialjavelin && [quality] == unique && [flag] == ethereal # [javelinandspearskilltab] == 2 # [tier] == 110000", //deaths fathom
		//Helmet
		"[name] == diadem && [quality] == unique && [flag] != ethereal # [fcr] == 25 # [tier] == 110000", //griffons
		//boots
		"[name] == scarabshellboots && [quality] == unique && [flag] != ethereal # [strength]+[vitality] >= 20 # [tier] == 100000", //sandstorm treks
		//belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000", //thundergod's vigor
		//armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000", //CoH
		//shield
		"[type] == shield # [fcr] >= 35 && [maxmana] >= 89 # [tier] == 110000", //spirit
		//ammy
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 110000", // highlords
		//rings
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000", // raven frost
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 5 # [tier] == 110000", //bk ring
		//Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [javelinandspearskilltab] == 1 # [invoquantity] == 2 && [charmtier] == 1000 + charmscore(item)",
		//Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"([name] == monarch || [type] == auricshields) && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
