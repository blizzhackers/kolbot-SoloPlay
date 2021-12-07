/**
 *    @filename		druid.ElementalBuild.js
 *	  @author		thatflykid, isid0re, theBGuy
 *    @desc			Druid fire build
 */

var finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Elemental,
	wantedskills: [sdk.skills.FireStorm, sdk.skills.Fissure],
	usefulskills: [sdk.skills.CycloneArmor],
	precastSkills: [sdk.skills.CycloneArmor],
	mercAuraName: "Blessed Aim",
	mercAuraWanted: sdk.skills.BlessedAim,
	mercDiff: 0,
	stats: [
		["dexterity", 35], ["strength", 48], ["vitality", 165],
		["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.FireStorm, 2, false],
		[sdk.skills.Raven, 1, false],
		[sdk.skills.MoltenBoulder, 1, false],
		[sdk.skills.OakSage, 1, false],
		[sdk.skills.SpiritWolf, 1, false],
		[sdk.skills.FireStorm, 6, false],
		[sdk.skills.Fissure, 1, false],
		[sdk.skills.SummonDireWolf, 1, false],
		[sdk.skills.Fissure, 11, false],
		[sdk.skills.Grizzly, 1, false],
		[sdk.skills.Volcano, 1, false],
		[sdk.skills.Fissure, 20, false],
		[sdk.skills.OakSage, 6, false],
		[sdk.skills.ArcticBlast, 1, false],
		[sdk.skills.CycloneArmor, 1, false],
		[sdk.skills.FireStorm, 20, false],
		[sdk.skills.Volcano, 20, false],
		[sdk.skills.OakSage, 20, false],
		[sdk.skills.CycloneArmor, 20, false],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO
		// Helmet
		"[name] == skyspirit && [quality] == unique # [passivefirepierce] >= 10 # [tier] == 100000 + tierscore(item)", // ravenlore
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", //war traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", //sandstorm treks
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"[name] == monarch && [flag] != ethereal && [flag] == runeword # [fcr] >= 25 # [tier] == 100000 + tierscore(item)", //spirit shield
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",		// magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",	// upped magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",	// double upped magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [fcr] == 30 && (126, 1) == 1 # [tier] == 110000",	// perfect double upped magefist
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [elementalskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	]
};
