/*
 *    @filename   amazon.JavazonBuild.js
 *	  @author	  theBGuy
 *    @desc       Javazon build
 */

var finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.JavelinSpear,
	wantedskills: [sdk.skills.ChargedStrike, 34],
	usefulskills: [sdk.skills.CriticalStrike, 23, 32, 33],
	precastSkills: [sdk.skills.Valkyrie],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47], 
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", 65], ["strength", 53], ["dexterity", 118], 
		["vitality", 100],
		["strength", 156], ["vitality", "all"],
	],
	skills: [
		[sdk.skills.Jab, 1, false], 			// charlvl 2
		[sdk.skills.InnerSight, 1, false], 		// charlvl 3
		[sdk.skills.CriticalStrike, 2, false], 	// charlvl 5
		[sdk.skills.PowerStrike, 1, false], 	// charlvl 6
		[sdk.skills.Dodge, 1, false], 			// charlvl 7
		[sdk.skills.PowerStrike, 4, false], 	// charlvl 11
		[sdk.skills.SlowMissiles, 1, false], 	// charlvl 12
		[sdk.skills.Avoid, 1, false], 			// charlvl 13
		[sdk.skills.PowerStrike, 8, false], 	// charlvl 17
		[sdk.skills.ChargedStrike, 1, false], 	// charlvl 18
		[sdk.skills.Penetrate, 1, false], 		// charlvl 18
		[sdk.skills.ChargedStrike, 5, false], 	// charlvl 23
		[sdk.skills.Evade, 1, false], 			// charLvl 24
		[sdk.skills.Decoy, 1, false], 			// charlvl 25
		[sdk.skills.ChargedStrike, 9, false], 	// charlvl 29
		[sdk.skills.Valkyrie, 1, false], 		// charlvl 30
		[sdk.skills.LightningStrike, 1, false], // charlvl 31
		[sdk.skills.ChargedStrike, 20, true], 	// charlvl 42
		[sdk.skills.LightningStrike, 20, true], // charlvl 63
		[sdk.skills.LightningFury, 20, true], 	// charlvl ?
		[sdk.skills.Decoy, 5, false], 			// charlvl 47
		[sdk.skills.Valkyrie, 17, true], 		// charlvl ? 
		[sdk.skills.PowerStrike, 20, false], 	// charlvl ?
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == ceremonialjavelin && [quality] == unique # [itemchargedskill] >= 0 # [tier] == 100000 + tierscore(item)", //Titan's Revenge
		// Helmet
		"[name] == shako && [quality] == unique && [flag] != ethereal # [itemallskills] == 2 # [tier] == 100000 + tierscore(item)", //harlequin's crest
		// Boots
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", //sandstorm treks
		// Belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //thundergod's vigor
		// Armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000", //CoH
		// Shield
		"[type] == shield # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 110000 + tierscore(item)", //spirit
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 110000", // highlords
		// Rings
		"[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == # [tier] == 100000", // raven frost
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000", // Perfect raven frost
		"[name] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 100000", //Wisp
		"[name] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == 110000", //Perfect Wisp
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 5 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [javelinandspearskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	]
};
