/**
*  @filename    barbarian.ThrowBuild.js
*  @author      theBGuy
*  @desc        Double throw based final build
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.BarbCombat,
	wantedskills: [sdk.skills.BattleOrders, sdk.skills.DoubleThrow, sdk.skills.DoubleSwing],
	usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.BattleCommand],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 103], ["dexterity", 79], ["vitality", 90],
		["dexterity", 136], ["strength", 150], ["vitality", "all"],
	],
	skills: [
		[sdk.skills.DoubleThrow, 20],
		[sdk.skills.Howl, 9],
		[sdk.skills.BattleOrders, 20],
		[sdk.skills.BattleCommand, 1],
		[sdk.skills.ThrowMastery, 20],
		[sdk.skills.NaturalResistance, 5],
		[sdk.skills.DoubleSwing, 20],
		[sdk.skills.Frenzy, 1],
		[sdk.skills.Berserk, 1],
		[sdk.skills.Howl, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Final Weapon - Perfect Eth Lacerator & Warshrike
		"[name] == wingedknife && [quality] == unique && [flag] == ethereal # [ias] == 30 && [enhanceddamage] == 250 # [tier] == 110000",
		"[name] == wingedaxe && [quality] == unique && [flag] == ethereal # [ias] == 30 && [enhanceddamage] == 210 # [tier] == 110000",
		// Weapon - Eth Lacerator & Warshrike
		"[name] == wingedknife && [quality] == unique && [flag] == ethereal # [ias] == 30 && [enhanceddamage] >= 200 # [tier] == 100000",
		"[name] == wingedaxe && [quality] == unique && [flag] == ethereal # [ias] == 30 && [enhanceddamage] >= 150 # [tier] == 100000",
		// Helmet - Arreat's Face
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000",
		// Belt- Arach's
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000",
		// Boots - IK Boots
		"[name] == warboots && [quality] == set && [flag] != ethereal # [frw] >= 40 && [tohit] >= 110 # [tier] == 110000",
		// Armor - Enigma
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
		// Gloves - Laying of Hands
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000",
		// Amulet - Highlords
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
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

		ResFHR: {
			max: 4,
			have: [],
			classid: sdk.items.SmallCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
			}
		},

		SkillerCombat: {
			max: 1,
			have: [],
			classid: sdk.items.GrandCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.BarbCombat) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},

		SkillerMasteries: {
			max: 1,
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
				Config.AttackSkill = [-1, sdk.skills.DoubleThrow, sdk.skills.Frenzy, sdk.skills.DoubleThrow, sdk.skills.Berserk];
				Config.LowManaSkill = [sdk.skills.DoubleSwing, sdk.skills.DoubleSwing];
				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return Check.haveItem("throwingknife", "unique", "Warshrike") && Check.haveItem("throwingaxe", "unique", "Lacerator");
		}
	},

	active: function () {
		return this.respec() && me.getSkill(sdk.skills.DoubleThrow, sdk.skills.subindex.HardPoints) === 20;
	},
};
