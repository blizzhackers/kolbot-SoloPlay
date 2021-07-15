/**
 *    @filename   paladin.AuradinBuild.js
 *	  @author	  theGuy
 *    @desc       End-game Auradin build
 */

var finalBuild = {
	caster: false,
	skillstab: 24, //combat
	wantedskills: [106, 123], //Zeal, Conviction
	usefulskills: [117, 100, 110], //holy shield, Resist Fire, Resist Lighting
	precastSkills: [117], // Holy shield
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 103], ["dexterity", 136], ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[123, 20], 	//Conviction
		[106, 4], 	// Zeal
		[110, 20], 	// Resist Lighting
		[125, 20], 	// Salvation
		[100, 20], 	// Resist Fire
		[124, 1], 	// Redemption
		[117, 15], 	// Holy Shield
		[106, 10], 	// Zeal
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500", //Voice of Reason
		"[Type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000", //Crescent Moon
		"[Type] == sword && [flag] == runeword # [holyfireaura] >= 16 # [tier] == 120000", //HoJ
		//helmet
		"[Type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000", //Dream Helm
		//belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //TGods
		//boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //Gore Rider
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [holyfireaura] >= 14 # [tier] == 110000", //Dragon
		//shield
		"[type] == auricshields && [flag] != ethereal && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000", //Dream
		//gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000", // Laying of Hand's
		//ammy
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", //highlords
		//rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		//Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [offensiveaurasskilltab] == 1 # [invoquantity] == 2 && [charmtier] == 1000 + charmscore(item)",
		//Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"([name] == monarch || [type] == auricshields) && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		//Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", //Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000", //Treachery
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000", //Eth Andy's
	]
};
