/**
*  @filename    paladin.TorchadinBuild.js
*  @author      theBGuy
*  @desc        Zeal + Holy Fire based final build - uses HoJ + Dragon for level 30 Holy Fire
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.Zeal, sdk.skills.Conviction],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.ResistFire, sdk.skills.Salvation],
	precastSkills: [sdk.skills.HolyShield],
	usefulStats: [sdk.stats.PassiveFireMastery, sdk.stats.PassiveFirePierce, sdk.stats.PierceFire],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 103], ["dexterity", 136],
		["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Conviction, 20],
		[sdk.skills.Zeal, 4],
		[sdk.skills.Salvation, 20],
		[sdk.skills.ResistFire, 20],
		[sdk.skills.Redemption, 1],
		[sdk.skills.HolyShield, 15],
		[sdk.skills.Zeal, 10],
		[sdk.skills.Sacrifice, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500", // Voice of Reason
		"[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000", // Crescent Moon
		"[type] == sword && [flag] == runeword # [holyfireaura] >= 16 # [tier] == 120000", // HoJ
		// Helm
		"[name] == grimhelm && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 # [tier] == 100000 + tierscore(item)", // Vamp Gaze
		"[name] == bonevisage && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [lifeleech] >= 6 # [tier] == 100000 + tierscore(item)", // Upped Vamp Gaze
		// Belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", // TGods
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", // Gore Rider
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [holyfireaura] >= 14 # [tier] == 110000", // Dragon
		// Shield
		"[type] == auricshields && [flag] == runeword # [defianceaura] >= 13 # [tier] == 110000", // Exile
		// Gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000", // Laying of Hand's
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", // highlords
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [offensiveaurasskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", // Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)", // Treachery
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)", // Eth Andy's
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.Vigor = false;
				Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Conviction, sdk.skills.Zeal, sdk.skills.Conviction, -1, -1];
				Config.LowManaSkill = [-1, -1];
				Config.SkipImmune = ["fire and physical"];
				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return Check.haveItem("sword", "runeword", "Hand of Justice") && Check.haveItem("armor", "runeword", "Dragon");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Conviction, 0) === 20;
	},
};
