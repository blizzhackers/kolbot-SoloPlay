/**
*  @filename    amazon.WitchyzonBuild.js
*  @author      isid0re, theBGuy
*  @desc        final build based off of https://diabloii.net/forums/threads/chipmcs-witchwild-string-strafeazon-guide-v-0-05-beta-if.240912/
*               uses Upp'd WitchWild String bow
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.BowandCrossbow,
	wantedskills: [sdk.skills.Strafe],
	usefulskills: [sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
	precastSkills: [sdk.skills.Valkyrie],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 90], ["dexterity", 132], ["vitality", 150], ["dexterity", "all"]
	],
	skills: [
		[sdk.skills.Strafe, 1],
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
		"[name] == diamondbow && [quality] == unique # [fireresist] == 40 # [tier] == 100000 + tierscore(item)", // WitchWild String up'd
		// Helmet
		"[name] == grimhelm && [quality] == unique  && [flag] != ethereal # [manaleech] >= 6 && [lifeleech] >= 6 && [damageresist] >= 20 # [tier] == 100000 + tierscore(item)", // Vampz Gaze
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000", // War Traveler
		// Belt
		"[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] >= 5 # [tier] == 100000 + tierscore(item)", // Nosferatu's Coil
		// Armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", // CoH
		// Amulet
		"[type] == amulet && [quality] == unique # [dexterity] == 25 # [tier] == 110000", // Cat's Eye
		// Rings
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000", // Raven Frost
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 110000", // Bul-Kathos' Wedding Band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [bowandcrossbowskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [passiveandmagicskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 100000 + tierscore(item)", // Any 1+ all skill shield
		"[type] == wand && [quality] >= normal # [itemchargedskill] == 82 # [secondarytier] == 75000 + chargeditemscore(item, 82)",	// Life Tap charged wand
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	// Fortitude
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",	// Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	// Eth Andy's
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.Strafe, -1, sdk.skills.Strafe, -1, sdk.skills.MagicArrow, -1];
				Config.LowManaSkill = [0, -1];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return Check.haveItem("diamondbow", "unique", "Witchwild String") && Check.haveItem("vampirefangbelt", "unique", "Nosferatu's Coil");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Strafe, 0);
	},
};
