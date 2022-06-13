/**
*  @filename    barbarian.WhirlwindBuild.js
*  @author      theBGuy
*  @desc        Whirlwind based final build
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.BarbCombat,
	wantedskills: [sdk.skills.Bash, sdk.skills.Whirlwind],
	usefulskills: [sdk.skills.Howl, sdk.skills.Shout],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.BattleCommand],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 118], ["dexterity", 136], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Whirlwind, 20, true],
		[sdk.skills.SwordMastery, 20, true],
		[sdk.skills.NaturalResistance, 5, true],
		[sdk.skills.BattleCommand, 1, true],
		[sdk.skills.Berserk, 5, true],
		[sdk.skills.IncreasedSpeed, 1, true],
		[sdk.skills.WarCry, 5, true],
		[sdk.skills.BattleOrders, 20, true],
		[sdk.skills.Shout, 20, true], // 3 points remaining(more beserk?)
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon - Grief x2 dual wield
		"[type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 100000",
		// Final Helmet - Upp'ed Arreat's Face
		"[name] == guardiancrown && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 && [fhr] >= 30 # [tier] == 150000 + tierscore(item)",
		// Helmet - Arreat's Face
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 && [fhr] >= 30 # [tier] == 100000 + tierscore(item)",
		// Belt - Dungo's
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == 100000 + tierscore(item)",
		// Boots - Gore Rider
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 100000 + tierscore(item)",
		// Armor - Fortitude
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 30 # [tier] == 100000",
		// Gloves - Laying of Hands
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000",
		// Amulet - Atma's
		"[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == 100000 + tierscore(item)",
		// Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000",
		"[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
		// Rings - Raven Frost && Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == # [tier] == 100000",
		"[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
		// Switch - BO sticks
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
		// Merc Armor - Fortitude
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
		// Merc Final Helmet - Eth Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
		// Merc Helmet - Andy's
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
	],

	charms: {
		ResLife: {
			max: 4,
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
			max: 2,
			have: [],
			classid: sdk.items.SmallCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
			}
		},

		Skiller: {
			max: 2,
			have: [],
			classid: sdk.items.GrandCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Masteries) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},
	},

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [sdk.skills.BattleCry, sdk.skills.Whirlwind, -1, sdk.skills.Whirlwind, -1];
				Config.LowManaSkill = [0, -1];
				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
				Config.MPBuffer = 2;
				Config.HPBuffer = 2;
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			// TODO: figure out how to make sure we have two, or determine if that even matters
			return Check.haveItem("sword", "runeword", "Grief");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Whirlwind, 0) === 20;
	},
};
