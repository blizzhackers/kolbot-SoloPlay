/**
*  @filename    Sorceress.LightningBuild.js
*  @author      theBGuy
*  @desc        Lightning based final build
*
*/

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Lightning,
	wantedskills: [sdk.skills.ChainLightning, sdk.skills.Lightning],
	usefulskills: [sdk.skills.LightningMastery, sdk.skills.ChargedBolt, sdk.skills.Nova],
	precastSkills: [sdk.skills.FrozenArmor],
	usefulStats: [sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 156], ["dexterity", 35], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Warmth, 1],
		[sdk.skills.StaticField, 1],
		[sdk.skills.Telekinesis, 1],
		[sdk.skills.Teleport, 1],
		[sdk.skills.FrozenArmor, 1],
		[sdk.skills.ThunderStorm, 1],
		[sdk.skills.LightningMastery, 1],
		[sdk.skills.Lightning, 20, false],
		[sdk.skills.ChainLightning, 20, false],
		[sdk.skills.LightningMastery, 20],
		[sdk.skills.Nova, 20],
		[sdk.skills.ChargedBolt, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon -  HotO
		"[type] == mace && [flag] == runeword # [fcr] == 40 # [tier] == 100000",
		// Helmet - Harlequin's Crest
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 # [tier] == 100000 + tierscore(item)",
		// Belt - Arach's
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)",
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", // War Traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", // Sandstorm Treks
		// Armor - CoH
		"[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
		// Shield - Spirit
		"[type] == shield # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 100000 + tierscore(item)",
		// Final Gloves - Perfect 2x Upp'ed Magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",
		// Gloves - 2x Upp'ed Magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",
		// Gloves - Upp'ed Magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",
		// Gloves - Magefist
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",
		// Amulet - Maras
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)",
		// Final Rings - SoJ & Perfect Wisp
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
		"[name] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == 100000 + tierscore(item)",
		// Rings - Wisp
		"[name] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 90000 + tierscore(item)",
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [maxhp] == 20 && [maxmana] == 17 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [lightningskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == charmscore(item)",
		// Switch - CTA
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Switch Final Shield - Spirit
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
		// Switch Temporary Shield - 1+ all skill
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 50000 + tierscore(item)",
		// Merc Armor - Fortitude
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
		// Merc Final Helmet - Eth Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
		// Merc Helmet - Andy's
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.Lightning, sdk.skills.ChainLightning, sdk.skills.ChainLightning, sdk.skills.Lightning, -1, -1];
				Config.LowManaSkill = [-1, -1];
				Config.SkipImmune = ["lightning"];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Attack.checkInfinity();
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Lightning, 0) === 20 && !me.getSkill(sdk.skills.Blizzard, 0);
	},
};
