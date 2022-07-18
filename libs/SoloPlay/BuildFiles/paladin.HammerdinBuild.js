/**
*  @filename    paladin.HammerdinBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blessed Hammer + Concentration final build
*               based on https://www.diabloii.net/forums/threads/max-damage-hammerdin-guide-by-captain_bogus-repost.127596/
*
*/

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.BlessedHammer, sdk.skills.Concentration],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.BlessedAim],
	precastSkills: [sdk.skills.HolyShield],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	classicStats: [
		["dexterity", 51], ["strength", 80], ["vitality", "all"]
	],
	expansionStats: [
		["vitality", 60], ["dexterity", 30], ["strength", 27],
		["vitality", 91], ["dexterity", 44], ["strength", 30],
		["vitality", 96], ["dexterity", 59], ["strength", 60],
		["vitality", 109], ["dexterity", 77], ["strength", 89],
		["vitality", 137], ["dexterity", 89], ["strength", 103],
		["vitality", 173], ["dexterity", 103],
		["vitality", 208], ["dexterity", 118],
		["vitality", 243], ["dexterity", 133],
		["vitality", 279], ["dexterity", 147],
		["vitality", "all"]
	],
	skills: [
		[sdk.skills.HolyShield, 1],
		[sdk.skills.Meditation, 1],
		[sdk.skills.Redemption, 1],
		[sdk.skills.BlessedHammer, 20],
		[sdk.skills.Concentration, 20],
		[sdk.skills.Vigor, 20],
		[sdk.skills.BlessedAim, 20],
		[sdk.skills.HolyShield, 20]
	],
	classicTiers: [
		// Weapon - Spectral Shard
		"[name] == blade && [quality] == unique # [fcr] == 20 && [allres] == 10 # [tier] == 100000",
		// Rings - SoJ
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
		// Gloves - Magefist
		"[name] == lightgauntlets && [quality] == unique # [fcr] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",
	],
	expansionTiers: [
		// Weapon - HotO
		"[type] == mace && [flag] == runeword # [fcr] == 40 # [tier] == 100000",
		// Helm - Harlequin's Crest
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)",
		// Belt - Arach's
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)",
		// Final Boots - Sandstorm Treks
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)",
		// Boots - War Traveler
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)",
		// Armor - Enigma
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
		// Final Shield - Spirit
		"[type] == auricshields && [flag] == runeword # [fcr] == 35 && [maxmana] == 112 && [coldresist] == 80 # [tier] == 110000",
		// Shield - Spirit
		"[type] == auricshields && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 && [coldresist] == 80 # [tier] == 100000 + tierscore(item)",
		// Shield - HoZ
		"[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == 50000 + tierscore(item)",
		// Final Gloves - Perfect Upp'ed Magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",
		// Gloves - Upp'ed Magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",
		// Gloves - Magefist
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",
		// Amulet - Maras
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)",
		// Final Rings - SoJ & Perfect Raven Frost
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
		"[type] == ring && [quality] == unique # [dexterity] >= 20 # [tier] == 100000",
		// Rings - Dwarf Star & Raven Frost
		"[name] == ring && [quality] == unique # [maxhp] >= 40 && [magicdamagereduction] >= 12 # [tier] == 99000",
		"[type] == ring && [quality] == unique # [dexterity] >= 20 # [tier] == 99000",
		// Switch - CTA
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc Armor - Fortitude
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
		// Merc Final Helmet - Eth Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
		// Merc Helmet - Andy's
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
	],
	stats: undefined,
	autoEquipTiers: undefined,

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
			max: 3,
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
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.PalaCombat) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},
	},
	
	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.HolyBolt, sdk.skills.Concentration];
				Config.LowManaSkill = [0, sdk.skills.Concentration];

				if (me.hell && !Pather.accessToAct(5)) {
					Config.SkipImmune = ["magic"];
				}
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("armor", "runeword", "Enigma");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.BlessedHammer, sdk.skills.subindex.hardpoints) === 20;
	},
};

// Has to be set after its loaded
finalBuild.stats = me.classic ? finalBuild.classicStats : finalBuild.expansionStats;
finalBuild.autoEquipTiers = me.classic ? finalBuild.classicTiers : finalBuild.expansionTiers;
