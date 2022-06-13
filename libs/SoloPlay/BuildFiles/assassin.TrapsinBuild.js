/**
*  @filename    assassin.TrapsinBuild.js
*  @author      theBGuy
*  @desc        Lightning trap based final build (11 fpa trap laying, 9 fps tele)
*
*/

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Traps,
	wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
	usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
	precastSkills: [sdk.skills.Fade, sdk.skills.ShadowMaster],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 156], ["dexterity", 79], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.CloakofShadows, 1], // Did meant to put mind blast?? otherwise chnage or delete
		[sdk.skills.ShadowMaster, 1],
		[sdk.skills.Fade, 1],
		[sdk.skills.LightningSentry, 20],
		[sdk.skills.ShockWeb, 15],
		[sdk.skills.FireBlast, 14],
		[sdk.skills.DeathSentry, 15], // lvl 74 w/o quet skills pts
		[sdk.skills.ShockWeb, 16],
		[sdk.skills.FireBlast, 15],
		[sdk.skills.DeathSentry, 16],
		[sdk.skills.ShockWeb, 18],
		[sdk.skills.FireBlast, 16],
		[sdk.skills.DeathSentry, 17],
		[sdk.skills.ShockWeb, 20],
		[sdk.skills.FireBlast, 18],
		[sdk.skills.DeathSentry, 20],
		[sdk.skills.ShockWeb, 20],
		[sdk.skills.FireBlast, 20],
		[sdk.skills.ChargedBoltSentry, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Final Weapon - Silence
		"[type] == sword && [flag] == runeword # [itemallskills] == 2 && [ias] == 20 && [fireresist] == 75 # [tier] == 200000",
		// Temporary Weapon - HotO
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000",
		// Helmet - Andy's
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [tier] == 100000 + tierscore(item)",
		// Belt - Arach's
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)",
		// Boots - Waterwalks
		"[name] == sharkskinboots && [quality] == unique && [flag] != ethereal # [maxhp] >= 65 # [tier] == 100000 + tierscore(item)",
		// Armor - Enigma
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
		// Shield - Spirit
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 110000 + tierscore(item)",
		// Gloves - Lava Gout
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 # [tier] == 100000 + tierscore(item)",
		// Amulet - Maras
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)",
		// Final Rings - SoJ & Perfect Raven Frost
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
		"[type] == ring	&& [quality] == unique # [dexterity] == 20 # [tier] == 110000",
		// Rings - Raven Frost
		"[type] == ring	&& [quality] == unique # [dexterity] >= 15 # [tier] == 100000",
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

		LifeMana: {
			max: 2,
			have: [],
			classid: sdk.items.SmallCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.MaxHp) === 20 && check.getStat(sdk.stats.MaxMana) === 17);
			}
		},

		Skiller: {
			max: 2,
			have: [],
			classid: sdk.items.GrandCharm,
			stats: function (check) {
				return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Traps) === 1
					&& check.getStat(sdk.stats.MaxHp) >= 40);
			}
		},
	},

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.UseTraps = true;
				Config.AttackSkill = [-1, sdk.skills.ShockWeb, sdk.skills.FireBlast, sdk.skills.ShockWeb, sdk.skills.FireBlast, -1, -1];
				Config.Traps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
				Config.BossTraps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry];
			}
		},
	},

	respec: function () {
		return Attack.checkInfinity() && Check.haveItem("armor", "runeword", "Enigma");
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.LightningSentry, 0) === 20;
	},
};
