/**
*  @filename    paladin.AuradinBuild.js
*  @author      theBGuy
*  @desc        Zeal + Holy Shock/Fire based final build - uses Duel Dream Runewords + Dragon and HoJ Runewords to give level 30 Holy Shock and level 30 Holy Fire
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.Zeal, sdk.skills.Conviction],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.ResistFire, sdk.skills.ResistLightning],
	precastSkills: [sdk.skills.HolyShield],
	usefulStats: [sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce, sdk.stats.PierceLtng, sdk.stats.PassiveFireMastery, sdk.stats.PassiveFirePierce, sdk.stats.PierceFire],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 103], ["dexterity", 136], ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Conviction, 20],
		[sdk.skills.Zeal, 4],
		[sdk.skills.ResistLightning, 20],
		[sdk.skills.Salvation, 20],
		[sdk.skills.ResistFire, 20],
		[sdk.skills.Redemption, 1],
		[sdk.skills.HolyShield, 15],
		[sdk.skills.Zeal, 10],
	],
	autoEquipTiers: [ // autoequip final gear
		// Final Weapon - HoJ
		"[type] == sword && [flag] == runeword # [holyfireaura] >= 16 # [tier] == 120000",
		// Weapon - Crescent Moon & Voice of Reason
		"[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000",
		"[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500",
		// Helm - Dream
		"[type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
		// Belt - TGods
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)",
		// Boots - Gore Rider
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)",
		// Armor - Dragon
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [holyfireaura] >= 14 # [tier] == 110000",
		// Shield - Dream
		"[type] == auricshields && [flag] != ethereal && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
		// Gloves - Laying of Hand's
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000",
		// Amulet - Highlords
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
		// Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000",
		"[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
		// Rings - Raven Frost && Bul-Kathos' Wedding Band
		"[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == # [tier] == 100000",
		"[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [offensiveaurasskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch - CTA
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc Final Armor - Fortitude
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
		// Merc Armor - Treachery
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)",
		// Merc Final Helmet - Eth Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
		// Merc Helmet - Andy's
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.Vigor = false;
				Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Conviction, sdk.skills.Zeal, sdk.skills.Conviction, -1, -1];
				Config.LowManaSkill = [-1, -1];

				if (!Check.haveItem("sword", "runeword", "Hand of Justice") || !Check.haveItem("armor", "runeword", "Dragon")) {
					Config.SkipImmune = ["lightning and physical"];
				} else {
					Config.SkipImmune = ["lightning and fire and physical"];	// Don't think this ever happens but should skip if it does
				}

				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return me.haveAll([{name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}, {name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}]);
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Conviction, 0) === 20;
	},
};
