/*
 *		@filename 	amazon.JavazonBuild.js
 *		@author		theBGuy
 *		@desc		Javazon final build (pure lightning for expansion) (light/poision for classic)
 */

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.JavelinandSpear,
	wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
	usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
	precastSkills: [sdk.skills.Valkyrie],
	usefulStats: [sdk.stats.PierceLtng, sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	classicStats: [
		["dexterity", 65], ["strength", 75], ["vitality", "all"]
	],
	expansionStats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47],
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", 65], ["strength", 53], ["dexterity", 118],
		["vitality", 100], ["strength", 118], ["dexterity", 151],
		["strength", 156], ["vitality", "all"],
	],
	classicSkills: [
		// Points at respec 71 (goes right to this build from stepping)
		[sdk.skills.Valkyrie, 1], 			// points left 64
		[sdk.skills.LightningFury, 1], 		// points left 57
		[sdk.skills.LightningStrike, 1], 	// points left 56
		[sdk.skills.Pierce, 1], 			// points left 53
		[sdk.skills.PlagueJavelin, 20], 	// points left 34
		[sdk.skills.ChargedStrike, 10], 	// points left 25
		[sdk.skills.LightningStrike, 10], 	// points left 16
		[sdk.skills.Decoy, 5], 				// points left 12
		[sdk.skills.LightningStrike, 17], 	// points left 5
		[sdk.skills.ChargedStrike, 15], 	// points left 0
		[sdk.skills.LightningStrike, 20, false],
		[sdk.skills.ChargedStrike, 20, false],
		[sdk.skills.PoisonJavelin, 20, false], 	// synergy for PlagueJavelin
		[sdk.skills.Valkyrie, 12, false],
		[sdk.skills.LightningFury, 20, false],
	],
	expansionSkills: [
		[sdk.skills.Valkyrie, 1],
		[sdk.skills.Pierce, 1],
		[sdk.skills.LightningStrike, 20],
		[sdk.skills.ChargedStrike, 20],
		[sdk.skills.LightningFury, 20],
		[sdk.skills.Decoy, 5, false],
		[sdk.skills.Valkyrie, 17, false],
		[sdk.skills.PowerStrike, 20, false],
		[sdk.skills.Pierce, 5, false],
	],
	classicTiers: [
		// Helm
		"[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == 100000 + tierscore(item)", // Tarnhelm
		// Armor
		"[name] == studdedleather && [quality] == unique # [ias] == 20 && [fhr] == 20 # [tier] == 100000", // Twitchthroe
		// Belt
		"[name] == sash && [quality] == set # [itemcannotbefrozen] == 1 # [tier] == 100000", // Death's Guard Sash
		// Gloves
		"[name] == leathergloves && [quality] == set # [poisonresist] >= 50 # [tier] == 100000", // Death's Hand Leather Gloves
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
	],
	expansionTiers: [
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
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],
	stats: undefined,
	skills: undefined,
	autoEquipTiers: undefined,

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Attack.checkInfinity();
		}
	},

	active: function () {
		return this.respec && (me.expansion ? me.getSkill(sdk.skills.PlagueJavelin, 0) > 1 && me.getSkill(sdk.skills.PlagueJavelin, 0) < 5 : me.getSkill(sdk.skills.PlagueJavelin, 0) === 20);
	},
};

// Has to be set after its loaded
finalBuild.stats = me.classic ? finalBuild.classicStats : finalBuild.expansionStats;
finalBuild.skills = me.classic ? finalBuild.classicSkills : finalBuild.expansionSkills;
finalBuild.autoEquipTiers = me.classic ? finalBuild.classicTiers : finalBuild.expansionTiers;
me.classic && finalBuild.usefulStats.push(sdk.stats.PassivePoisonMastery, sdk.stats.PassivePoisonPierce, sdk.stats.PiercePois);
