/**
*  @filename    amazon.WfzonBuild.js
*  @author      isid0re, theBGuy
*  @desc        final build based off WitchWild String build
*               uses Upp'd WitchWild String or Windforce bow(Final Windforce)
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
		["strength", 134], ["dexterity", 167], ["vitality", 150], ["dexterity", "all"]
	],
	skills: [
		[sdk.skills.Valkyrie, 1],
		[sdk.skills.Strafe, 20],
		[sdk.skills.Pierce, 13],
		[sdk.skills.Penetrate, 20],
		[sdk.skills.CriticalStrike, 5],
		[sdk.skills.Valkyrie, 16],
		[sdk.skills.Dodge, 9],
		[sdk.skills.Avoid, 4],
		[sdk.skills.Evade, 8],
		[sdk.skills.CriticalStrike, 13],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == diamondbow && [quality] == unique # [fireresist] == 40 # [tier] == 50000 + tierscore(item)", // WitchWild String up'd
		"[name] == hydrabow && [quality] == unique # [manaleech] >= 6 # [tier] == 100000 + tierscore(item)", // Windforce
		// Helmet
		"[name] == grimhelm && [quality] == unique  && [flag] != ethereal # [manaleech] >= 6 && [lifeleech] >= 6 && [damageresist] >= 15 # [tier] == 100000 + tierscore(item)", // Vampz Gaze
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000", // War Traveler
		// Belt
		"[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] >= 5 # [tier] == 100000 + tierscore(item)", // Nosferatu's Coil
		// Armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", // CoH
		// Gloves
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 && [enhanceddefense] >= 150 # [tier] == 3000 + tierscore(item)", // Lava Gout
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", // Highlords
		// Rings
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000", // Raven Frost
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 5 # [tier] == 110000", // Bul-Kathos' Wedding Band
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
			return (Check.haveItem("diamondbow", "unique", "Witchwild String") || Check.haveItem("hydrabow", "unique", "Windforce"));
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Strafe, 0);
	},
};
