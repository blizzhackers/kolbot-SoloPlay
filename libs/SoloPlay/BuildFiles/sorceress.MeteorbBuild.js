/*
 *    @filename   	Sorceress.MeteorbBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc      	Sorceress meteorb build
 */

var finalBuild = {
	caster: true,
	skillstab: 8, //fire
	wantedskills: [sdk.skills.FrozenOrb, sdk.skills.Meteor, sdk.skills.ColdMastery],
	usefulskills: [sdk.skills.FireBall, sdk.skills.FireMastery, sdk.skills.StaticField],
	precastSkills: [sdk.skills.FrozenArmor],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["strength", 48], ["vitality", 165], ["strength", 61],
		["vitality", 252], ["strength", 127], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.FireBolt, 1],
		[sdk.skills.Warmth, 1],
		[sdk.skills.FrozenArmor, 1],
		[sdk.skills.IceBolt, 1],
		[sdk.skills.IceBlast, 1],
		[sdk.skills.StaticField, 1],
		[sdk.skills.Telekinesis, 1],
		[sdk.skills.Inferno, 1],
		[sdk.skills.Blaze, 1],
		[sdk.skills.FrostNova, 1],
		[sdk.skills.FireBall, 7],
		[sdk.skills.Teleport, 1],
		[sdk.skills.GlacialSpike, 1],
		[sdk.skills.FireWall, 1],
		[sdk.skills.FireBall, 14],
		[sdk.skills.Blizzard, 1],
		[sdk.skills.Meteor, 1],
		[sdk.skills.FrozenOrb, 1],
		[sdk.skills.FireMastery, 1],
		[sdk.skills.ColdMastery, 1],
		[sdk.skills.Meteor, 20],
		[sdk.skills.FrozenOrb, 20],
		[sdk.skills.ColdMastery, 12],
		[sdk.skills.FireBall, 20],
		[sdk.skills.FireMastery, 20],
		[sdk.skills.FireBolt, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == swirlingcrystal && [quality] == set && [flag] != ethereal # [skilllightningmastery]+[skillfiremastery]+[skillcoldmastery] >= 3 # [tier] == 100000 + tierscore(item)", //tals orb
		// Helmet
		"[name] == deathmask && [quality] == set && [flag] != ethereal # [coldresist] == 15 && [lightresist] == 15 # [tier] == 100000", //tals mask
		// Belt
		"[name] == meshbelt && [quality] == set && [flag] != ethereal # [itemmagicbonus] >= 10 # [tier] == 100000 + tierscore(item)", //tals belt
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", //war traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", //sandstorm treks
		// Armor
		"[name] == lacqueredplate && [quality] == set # [coldresist] >= 1 # [tier] == 100000", //tals armor
		// Shield
		"[name] == roundshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 180 # [tier] == 50000 + tierscore(item)", //mosers
		"[name] == hyperion && [flag] == runeword # [fhr] >= 20 && [enhanceddefense] >= 130 && [fireresist] >= 50 # [tier] == 100000", //Sanctuary
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 # [tier] == 100000 + tierscore(item)", //magefist
		// Amulet
		"[name] == amulet && [quality] == set # [lightresist] == 33 # [tier] == 100000", //tals ammy
		// Rings
		"[type] == ring && [quality] == unique # [dexterity] >= 20 # [tier] == 100000", //ravenfrost
		"[type] == ring && [quality] == unique # [itemmagicbonus] >= 30 # [tier] == 100000", //nagelring
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [coldskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [fireskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 100000 + tierscore(item)", //Any 1+ all skill shield
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	]
};
