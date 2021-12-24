/*
 *    @filename   amazon.WitchyzonBuild.js
 *	  @author	  isid0re, theBGuy
 *    @desc       based off of https://diabloii.net/forums/threads/chipmcs-witchwild-string-strafeazon-guide-v-0-05-beta-if.240912/
 */

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.BowCrossbow,
	wantedskills: [sdk.skills.Strafe],
	usefulskills: [sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
	precastSkills: [sdk.skills.Valkyrie],
	mercAuraName: "Might",
	mercAuraWanted: sdk.skills.Might,
	mercDiff: 1,
	stats: [
		["strength", 89], ["vitality", 100], ["dexterity", "all"]
	],
	skills: [
		[sdk.skills.MagicArrow, 1],
		[sdk.skills.ColdArrow, 1],
		[sdk.skills.MultipleShot, 1],
		[sdk.skills.GuidedArrow, 1],
		[sdk.skills.Strafe, 1],
		[sdk.skills.InnerSight, 1],
		[sdk.skills.CriticalStrike, 1],
		[sdk.skills.Dodge, 1],
		[sdk.skills.SlowMissiles, 1],
		[sdk.skills.Avoid, 1],
		[sdk.skills.Penetrate, 1],
		[sdk.skills.Decoy, 1],
		[sdk.skills.Evade, 1],
		[sdk.skills.Valkyrie, 1],
		[sdk.skills.Pierce, 1],
		[sdk.skills.Strafe, 20],
		[sdk.skills.Pierce, 10],
		[sdk.skills.Penetrate, 20],
		[sdk.skills.Valkyrie, 20],
		[sdk.skills.Dodge, 12],
		[sdk.skills.Avoid, 7],
		[sdk.skills.Evade, 12],
		[sdk.skills.Decoy, 2],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == diamondbow && [quality] == unique # [fireresist] == 40 # [tier] == 100000", // WitchWild String up'd
		// Helmet
		"[name] == grimhelm && [quality] == unique  && [flag] != ethereal # [manaleech] >= 6 && [lifeleech] >= 6 && [damageresist] >= 20 # [tier] == 100000", //vampz gaze
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000", //war traveler
		// Belt
		"[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] >= 5 # [tier] == 100000", //nosferatu's coil
		// Armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", //CoH
		// Amulet
		"[type] == amulet && [quality] == unique # [dexterity] == 25 # [tier] == 110000", // cat's eye
		// Rings
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000", // raven frost
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 110000", //bk ring
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [bowandcrossbowskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [passiveandmagicskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return Check.haveItem("diamondbow", "unique", "Witchwild String");
		}
	},
};
