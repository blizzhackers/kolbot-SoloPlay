/**
*  @filename    barbarian.UberconcBuild.js
*  @author      theBGuy
*  @desc        Concentrate based final build meant for doing ubers
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.BarbCombat,
	wantedskills: [sdk.skills.BattleOrders, sdk.skills.Concentrate],
	usefulskills: [sdk.skills.SwordMastery, sdk.skills.Bash],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.BattleCommand],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 196], ["dexterity", "block"], ["vitality", "all"],
	],
	skills: [
		[sdk.skills.BattleCommand, 1],
		[sdk.skills.NaturalResistance, 1],
		[sdk.skills.Berserk, 1],
		[sdk.skills.BattleOrders, 20, false],
		[sdk.skills.SwordMastery, 10, false],
		[sdk.skills.Concentrate, 20, false],
		[sdk.skills.Shout, 20, false],
		[sdk.skills.LeapAttack, 1, false],
		[sdk.skills.Bash, 20, false], // 12 points remaining(max sword?)
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon - Grief
		"[type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 100000",
		// Helmet - Arreat's Face
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000 + tierscore(item)",
		// Belt - Dungo's
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == 100000 + tierscore(item)",
		// Boots - Gore Rider's
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 100000 + tierscore(item)",
		// Armor - CoH
		"[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
		// Gloves - Drac's
		"[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [strength] >= 12 && [lifeleech] >= 9 # [tier] == 100000 + tierscore(item)",
		// Amulet - Highlords
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
		// Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000",
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
		// Rings - Raven Frost && Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == # [tier] == 100000",
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
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

		ResFHR: {
			max: 4,
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
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.BarbCombat) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},
	},

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.Concentrate, sdk.skills.Berserk, sdk.skills.Concentrate, sdk.skills.Berserk];
				Config.LowManaSkill = [0, 0];
				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("monarch", "unique", "Stormshield");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Concentrate, 0) >= 5;
	},
};
