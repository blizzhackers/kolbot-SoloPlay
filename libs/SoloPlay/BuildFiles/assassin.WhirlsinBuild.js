/**
*  @filename    assassin.WhirlsinBuild.js
*  @author      theBGuy
*  @desc        Whirlwind based final build - uses Chaos runeword
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.ShadowDisciplines,
	wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
	usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
	precastSkills: [sdk.skills.Fade, sdk.skills.ShadowMaster],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 130], ["dexterity", 99], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.CloakofShadows, 1],
		[sdk.skills.ShadowMaster, 1],
		[sdk.skills.Fade, 1],
		[sdk.skills.Venom, 1],
		[sdk.skills.MindBlast, 1],
		[sdk.skills.BladeShield, 1],
		[sdk.skills.ClawMastery, 20],
		[sdk.skills.DeathSentry, 1],
		[sdk.skills.ShadowMaster, 20, false],
		[sdk.skills.Venom, 20, false],
		[sdk.skills.Fade, 20, false],
		[sdk.skills.BladeShield, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Final Weapon - Chaos Claw & Fury
		"[type] == assassinclaw && [flag] == runeword # [plusskillwhirlwind] == 1 # [tier] == 100000",
		"[type] == assassinclaw && [flag] == runeword # [itemallskills] == 2 && [ias] == 40 && [itemdeadlystrike] == 33 # [tier] == 200000",
		// Helmet - GFace
		"[name] == wingedhelm && [quality] == set && [flag] != ethereal # [fhr] >= 30 # [tier] == 100000 + tierscore(item)",
		// Belt - Verdungos
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] == 15 # [tier] == 110000 + tierscore(item)",
		// Boots - Gore Rider
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)",
		// Armor - Fortitude
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [tier] == 100000",
		// Gloves - Trang-Ouls
		"[name] == heavybracers && [quality] == set && [flag] != ethereal # [fcr] == 20 # [tier] == 100000", // 
		// Amulet - Highlords
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
		// Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000",
		"[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
		// Rings - Raven Frost && Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == # [tier] == 100000",
		"[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [maxhp] == 20 && [maxmana] == 17 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [trapsskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch Final Weapon - CTA
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Switch Final Shield - Spirit
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
		// Switch Temporary Shield - Any 1+ all skill
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
				Config.Dodge = false;
				Config.UseVenom = true;
				Config.UseTraps = true;
				Config.AttackSkill = [-1, sdk.skills.Whirlwind, -1, sdk.skills.Whirlwind, -1, -1, -1];
				Config.Traps = [sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
				Config.BossTraps = [-1, -1, -1, -1, -1];
			}
		},
	},

	respec: function () {
		return me.haveAll([{name: sdk.locale.items.Chaos}, {name: sdk.locale.items.Fury}]);
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.ClawMastery, 0) === 20;
	},
};
