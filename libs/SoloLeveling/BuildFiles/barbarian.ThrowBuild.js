/**
 *    @filename   barbarian.ThrowBuild.js
 *	  @author	  theBGuy
 *    @desc       Throw Barb final build
 */

var build = {
	caster: false,
	skillstab: 32, // Combat skills
	wantedskills: [149, 140, 133], // Battle Orders, Double Throw, Double Swing
	usefulskills: [153, 145, 148], // Natural Resistance, Iron Skin, Incresed Speed
	precastSkills: [149], // Battle orders
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
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
		[140, 20], //Double Throw
		[130, 9], //Howl
		[149, 20], //Battle orders
		[155, 1], //Battle Command
		[135, 20], //Throw Mastery
		[153, 1], //Natural resistance
		[153, 1], //Increased Speed
		[133, 20], //Double Swing
		[147, 1], //Frenzy
		[152, 1], //Beserk
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[name] == wingedaxe && [quality] == unique && [flag] == ethereal # [ias] == 30 && [enhanceddamage] >= 150 # [tier] == 100000", //Eth Lacerator
		"[name] == wingedknife && [quality] == unique && [flag] == ethereal # [ias] == 30 && [enhanceddamage] >= 200 # [tier] == 100000", //Eth Warshrike
		//Helmet
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000", //Arreat's Face
		//belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000", //arach's
		//boots
		"[name] == warboots && [quality] == set && [flag] != ethereal # [frw] >= 40 && [tohit] >= 110 # [tier] == 110000", // IK Boots
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [frw] >= 45 # [tier] == 100000", //Enigma
		//gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000", //laying of hands
		//ammy
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", //highlords
		//rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		//Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [masteriesskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [barbcombatskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		//Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && [quality] == magic # [warcriesskilltab]+[barbarianskills] >= 1 && [secondarymindamage] == 0 # [secondarytier] == 100000 + tierscore(item)",
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
