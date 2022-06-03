/**
*  @filename    paladin.SancdreamerBuild.js
*  @author      theBGuy
*  @desc        Zeal + Sanctuary based final build - uses Duel Dream Runewords/CoH/Last Wish/Verdungos/RavenFrost + Wisp/Gore Riders/Highlords/Laying of Hands
*               Auras: Level 30 Holy Shock, Level 17 Might
*               Ctc: Level 18 life tap, Level 11 Fade, Level 15 Confuse, Level 16 Lightning
*               Stats: 75 Fire Res/75 Cold Res/85 Light Res/75 Poison Res, Max Block, 34% Damage Reduction, 20% Cold Absorb, 10-20% Light Absorb, 85% Crushing Blow
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.Zeal, sdk.skills.Sanctuary],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.Sacrifice, sdk.skills.ResistLightning],
	precastSkills: [sdk.skills.HolyShield],
	usefulStats: [sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce, sdk.stats.PierceLtng, sdk.stats.PassiveMagMastery, sdk.stats.PassiveMagPierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 103], ["dexterity", 136], ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Sanctuary, 20],
		[sdk.skills.Zeal, 4],
		[sdk.skills.ResistLightning, 20],
		[sdk.skills.Cleansing, 20],
		[sdk.skills.Redemption, 1],
		[sdk.skills.HolyShield, 15],
		[sdk.skills.Sacrifice, 19],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500", // Voice of Reason
		"[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000", // Crescent Moon
		"[type] == sword && [flag] == runeword # [mightaura] >= 17 # [tier] == 120000", // Last Wish
		// Helm
		"[type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000", // Dream Helm
		// Belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] == 15 # [tier] == 110000 + tierscore(item)", // Verdungos
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", // Gore Rider
		// Armor
		"[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", // CoH
		// Shield
		"[type] == auricshields && [flag] != ethereal && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000", // Dream
		// Gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000", // Laying of Hands
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", // Highlords
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // Raven Frost
		"[name] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 100000 + tierscore(item)", // Wisp
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [offensiveaurasskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", // Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)", // Treachery
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)", // Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)", // Eth Andy's
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.Vigor = false;
				Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Sanctuary, sdk.skills.Zeal, sdk.skills.Sanctuary, -1, -1];
				Config.LowManaSkill = [-1, -1];

				Config.SkipImmune = ["lightning and magic and physical"];	// Don't think this ever happens but should skip if it does

				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream") && Check.haveItem("sword", "runeword", "Last Wish");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Sanctuary, 0) === 20;
	},
};
