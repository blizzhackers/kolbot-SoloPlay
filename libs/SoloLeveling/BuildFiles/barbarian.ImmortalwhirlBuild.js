/*
 *    @filename   	barbarian.ImmortalwhirlBuild.js
 *	  @author	  	theBGuy
 *    @desc       	Immortal King Whirlwind build
 */

var finalBuild = {
	caster: false,
	skillstab: 32, // Barbarian Combat
	wantedskills: [126, 151], // Bash, Whirlwind
	usefulskills: [130, 138], // Howl, Shout
	precastSkills: [149], // Battle orders
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 187], ["vitality", "all"] 
	],
	skills: [
		[129, 20], 	// Mace Mastery
		[151, 20], 	// Whirlwind
		[138, 20], 	// Shout
		[146, 1], 	// Battle Cry
		[155, 1], 	// Battle Command
		[153, 1], 	// Natural resistance
		[148, 1], 	// Increased Speed
		[149, 20], 	// Battle orders
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[name] == ogremaul && [quality] == set # [enhanceddamage] >= 200 && [ias] >= 40 # [tier] == 110000", // IK Maul
		//Helmet
		"[name] == avengerguard && [quality] == set && [flag] != ethereal # [warcriesskilltab] == 2 # [tier] == 110000", // IK Helm
		//belt
		"[name] == warbelt && [quality] == set && [flag] != ethereal # [strength] >= 25 && [fireresist] >= 28 # [tier] == 110000", // IK Belt
		//boots
		"[name] == warboots && [quality] == set && [flag] != ethereal # [frw] >= 40 && [tohit] >= 110 # [tier] == 110000", // IK Boots
		//armor
		"[name] == sacredarmor && [quality] == set && [flag] != ethereal # [barbcombatskilltab] == 2 # [tier] == 110000", // IK Armor
		//gloves
		"[name] == wargauntlets && [quality] == set && [flag] != ethereal # [strength] >= 20 && [dexterity] >= 20 # [tier] == 110000", // IK Gauntlets
		//ammy
		"[type] == amulet && [quality] == unique # [defense] >= 300 # [tier] == 110000 + tierscore(item)", // Metalgrid
		//rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		//Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [masteriesskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == charmscore(item)",
		//Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && [quality] == magic # [warcriesskilltab] >= 1 && [secondarymindamage] == 0 # [secondarytier] == 100000 + tierscore(item)",
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
