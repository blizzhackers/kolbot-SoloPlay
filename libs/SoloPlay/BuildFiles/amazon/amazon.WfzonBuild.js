/**
*  @filename    amazon.WfzonBuild.js
*  @author      isid0re, theBGuy
*  @desc        final build based off WitchWild String build
*               uses Upp'd WitchWild String or Windforce(Final Weapon)
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
		[sdk.skills.CriticalStrike, 13],
		[sdk.skills.Valkyrie, 16],
		[sdk.skills.Dodge, 9],
		[sdk.skills.Avoid, 4],
		[sdk.skills.Evade, 8],
	],
	autoEquipTiers: [ // autoequip final gear
		// Final Weapon - Windforce
		"[name] == hydrabow && [quality] == unique # [manaleech] >= 6 # [tier] == 100000 + tierscore(item)",
		// Weapon - WitchWild String up'd
		"[name] == diamondbow && [quality] == unique # [fireresist] == 40 # [tier] == 50000 + tierscore(item)",
		// Helmet - Vampz Gaze
		"[name] == grimhelm && [quality] == unique && [flag] != ethereal # [manaleech] >= 6 && [lifeleech] >= 6 && [damageresist] >= 15 # [tier] == 100000 + tierscore(item)",
		// Boots - War Traveler
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000",
		// Belt - Nosferatu's Coil
		"[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] >= 5 # [tier] == 100000 + tierscore(item)",
		// Armor - CoH
		"[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
		// Gloves - Lava Gout
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 && [enhanceddefense] >= 150 # [tier] == 3000 + tierscore(item)",
		// Final Amulet - Atma's Scarab
		"[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == 110000",
		// Amulet - Highlords
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
		// Final Rings - Perfect Raven Frost & Perfect Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000",
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
		// Rings - Raven Frost && Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == # [tier] == 100000",
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",// Switch Final Weapon - CTA
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Switch Temporary Weapon - Life Tap charged wand
		"[type] == wand && [quality] >= normal # [itemchargedskill] == 82 # [secondarytier] == 75000 + chargeditemscore(item, 82)",
		// Switch Final Shield - Spirit
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
		// Switch Temporary Shield - Any 1+ all skill
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 100000 + tierscore(item)",
		// Merc Armor - Fortitude
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
		// Merc Helmet - Eth Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
		// Merc Helmet - Andy's
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
	],

	charms: {
		ResLife: {
			max: 3,
			have: [],
			classid: sdk.items.SmallCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MaxHp) === 20);
			}
		},

		ResMf: {
			max: 2,
			have: [],
			classid: sdk.items.SmallCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MagicBonus) === 7);
			}
		},

		ResFHR: {
			max: 1,
			have: [],
			classid: sdk.items.SmallCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
			}
		},

		SkillerCrossbow: {
			max: 1,
			have: [],
			classid: sdk.items.GrandCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.BowandCrossbow) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},

		SkillerPassive: {
			max: 1,
			have: [],
			classid: sdk.items.GrandCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.PassiveandMagic) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},
	},

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
			return (Check.haveItem("hydrabow", "unique", "Windforce") || Check.haveItem("diamondbow", "unique", "Witchwild String"));
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Strafe, sdk.skills.subindex.HardPoints);
	},
};
