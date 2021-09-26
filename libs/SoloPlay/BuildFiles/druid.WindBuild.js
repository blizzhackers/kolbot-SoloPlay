/**
 *    @filename   druid.WindBuild.js
 *	  @author	  isid0re, theBGuy
 *    @desc       Druid wind final build
 */

var finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Elemental,
	wantedskills: [sdk.skills.Tornado, sdk.skills.Hurricane, sdk.skills.Twister],
	usefulskills: [sdk.skills.CycloneArmor],
	precastSkills: [sdk.skills.CycloneArmor],
	mercAuraName: "Might",
	mercAuraWanted: sdk.skills.Might,
	mercDiff: 1,
	stats: [
		["dexterity", 35], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Grizzly, 1],
		[sdk.skills.Tornado, 20, false],
		[sdk.skills.Hurricane, 20, false],
		[sdk.skills.CycloneArmor, 20, false],
		[sdk.skills.OakSage, 20, false],
		[sdk.skills.Twister, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO
		// Helmet
		"[name] == totemicmask && [quality] == unique # [druidskills] == 2 && [shapeshiftingskilltab] == 2 # [tier] == 110000 + tierscore(item)", //Jalal's mane
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", //war traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", //sandstorm treks
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"[name] == monarch && [flag] != ethereal && [flag] == runeword # [fcr] >= 35 # [tier] == 100000", //spirit shield
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 # [tier] == 100000 + tierscore(item)", //magefist
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
		"[name] == thresher && [quality] == unique # [enhanceddamage] >= 190 && [lifeleech] >= 11 # [merctier] == 100000 + mercscore(item)",	// Reaper's Toll
	]
};
