/**
 *    @filename   paladin.ZealerBuild.js
 *	  @author	  theGuy
 *    @desc       End-game Zealer build
 */

var finalBuild = {
	caster: false,
	skillstab: 24, //combat
	wantedskills: [106, 122], //Zeal, Fanaticism
	usefulskills: [117, 100, 110], //holy shield, Resist Fire, Resist Lighting
	precastSkills: [117], // Holy shield
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 103], ["dexterity", 136], ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[122, 20], 	// Fanaticism
		[106, 4], 	// Zeal
		[96, 20],	// Sacrifice
		[125, 1], 	// Salvation
		[124, 1], 	// Redemption
		[106, 10], 	// Zeal
		[117, 15], 	// Holy Shield
		[110, 10, false], 	// Resist Lighting
		[100, 10, false], 	// Resist Fire
		[105, 10, false], 	// Resist Cold
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 100000", //Grief
		//helmet
		"[name] == grimhelm && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 # [tier] == 100000 + tierscore(item)", //Vamp Gaze
		"[name] == bonevisage && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [lifeleech] >= 6 # [tier] == 100000 + tierscore(item)", //Upped Vamp Gaze
		//belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //TGods
		//boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //Gore Rider
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [tier] == 110000", //Fortitude
		//shield
		"[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == 100000 + tierscore(item)", //HoZ
		"[type] == auricshields && [flag] == runeword # [defianceaura] >= 13 # [tier] == 110000", //Exile
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
		"[name] == grandcharm && [quality] == magic # [palicombatskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		//Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		//Merc
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000", //Treachery
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", //Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000", //Eth Andy's
	]
};
