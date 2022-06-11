/**
*  @filename    barbarian.Singer.js
*  @author      theBGuy
*  @credits     isid0re, ebner20
*  @desc        Warcry (Singer/Shout) based final build
*
*/

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Warcries,
	wantedskills: [sdk.skills.WarCry, sdk.skills.Shout],
	usefulskills: [sdk.skills.IncreasedSpeed, sdk.skills.NaturalResistance],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.BattleCommand],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["dexterity", 35], ["strength", 103], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.WarCry, 20, true],
		[sdk.skills.NaturalResistance, 4, true],
		[sdk.skills.BattleCry, 20, true],
		[sdk.skills.BattleCommand, 1, true],
		[sdk.skills.BattleOrders, 20, true],
		[sdk.skills.Taunt, 20, true],
		[sdk.skills.Shout, 11, false],
		[sdk.skills.Howl, 15, false],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon - HotO x2 dual wield
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000",
		// Helmet - Harlequin's Crest
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)",
		// Belt - Arach's
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)",
		// Boots - Silkweave
		"[name] == meshboots && [quality] == unique && [flag] != ethereal # [frw] >= 30 # [tier] == 100000 + tierscore(item)",
		// Armor - Enigma
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
		// Gloves - Frostburns
		"[name] == gauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 10 # [tier] == 100000",
		// Amulet - Maras
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)",
		// Rings - SoJ
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
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

		Skiller: {
			max: 2,
			have: [],
			classid: sdk.items.GrandCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Warcries) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},
	},

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [sdk.skills.BattleCry, sdk.skills.WarCry, -1, sdk.skills.WarCry, -1];
				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
				Config.MPBuffer = 4;
				Config.HPBuffer = 2;
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return me.haveAll([{name: sdk.locale.items.Enigma}, {name: sdk.locale.items.HeartoftheOak}]);
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.WarCry, 0) === 20;
	},
};
