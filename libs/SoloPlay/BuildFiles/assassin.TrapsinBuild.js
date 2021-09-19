/**
 *    @filename   assassin.TrapsinBuild.js
 *	  @author	  theBGuy
 *    @desc       assassin build for after respecOne
 */

var finalBuild = {
	caster: true,
	skillstab: 48, // traps
	wantedskills: [251, 271, 276, 279], // fireblast, lightning sentry, death sentry, shadow master
	usefulskills: [261, 277, 267], // charged bolt sentry, blade shield, fade
	precastSkills: [267, 279], // Fade, Shadow Master
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 156], ["dexterity", 79], ["vitality", "all"]
	],
	skills: [
		[264, 1], // cloak of shadows
		[279, 1], // shadow master
		[267, 1], // fade
		[271, 20, false], // lightning sentry
		[276, 10], // death sentry
		[256, 9], // shock web
		[251, 8], // fireblast
		[276, 12], // death sentry
		[256, 11], // shock web
		[251, 11], // fireblast
		[276, 13], // death sentry
		[256, 13], // shock web
		[251, 12], // fireblast
		[276, 14], // death sentry
		[256, 15], // shock web
		[251, 14], // fireblast
		[276, 15], // death sentry
		[256, 16], // shock web
		[251, 15], // fireblast
		[276, 16], // death sentry
		[256, 18], // shock web
		[251, 16], // fireblast
		[276, 17], // death sentry
		[256, 20], // shock web
		[251, 18], // fireblast
		[276, 20], // death sentry
		[256, 20], // shock web
		[251, 20], // fireblast
		[261, 20], // charged bolt sentry
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO
		"[Type] == sword && [flag] == runeword # [itemallskills] == 2 && [ias] == 20 && [fireresist] == 75 # [tier] == 200000", // Silence
		//Helmet
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [tier] == 100000 + tierscore(item)", // Andy's
		//belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160  # [tier] == 100000 + tierscore(item)", //tgods
		//boots
		"[Name] == SharkskinBoots && [Quality] == Unique && [Flag] != Ethereal # [MaxHP] >= 65 # [tier] == 100000 + tierscore(item)", //waterwalks
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		//shield
		"[type] == shield && ([Quality] >= Magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//gloves
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 # [tier] == 100000 + tierscore(item)", //Lava gout
		//ammy
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		//rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		"[Type] == Ring	&& [Quality] == Unique # [Dexterity] >= 20 # [tier] == 100000", //ravenfrost
		//Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [maxhp] == 20 && [maxmana] == 17 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [trapsskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		//Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 50000 + tierscore(item)", //Any 1+ all skill shield
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
