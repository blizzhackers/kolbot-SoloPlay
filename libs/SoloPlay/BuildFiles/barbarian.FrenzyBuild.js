/**
*  @filename    barbarian.FrenzyBuild.js
*  @author      theBGuy
*  @desc        Frenzy based final build
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.CombatBarb,
	wantedskills: [sdk.skills.BattleOrders, sdk.skills.Frenzy, sdk.skills.DoubleSwing],
	usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.WarCry],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 103], ["dexterity", 79], ["vitality", 90],
		["dexterity", 136], ["strength", 150], ["vitality", "all"],
	],
	skills: [
		[sdk.skills.Bash, 1, false],
		[sdk.skills.Howl, 1, false],
		[sdk.skills.SwordMastery, 2, false],
		[sdk.skills.DoubleSwing, 1, false],
		[sdk.skills.Shout, 1, false],
		[sdk.skills.Stun, 1, false],
		[sdk.skills.DoubleSwing, 9, true],
		[sdk.skills.BattleCry, 1, true],
		[sdk.skills.IronSkin, 1, true],
		[sdk.skills.SwordMastery, 6, false],
		[sdk.skills.Frenzy, 1, true],
		[sdk.skills.BattleOrders, 1, true],
		[sdk.skills.Frenzy, 2, false],
		[sdk.skills.BattleOrders, 2, false],
		[sdk.skills.Frenzy, 3, false],
		[sdk.skills.BattleOrders, 3, false],
		[sdk.skills.BattleCommand, 1, true],
		[sdk.skills.WarCry, 1, true],
		[sdk.skills.NaturalResistance, 5, true],
		[sdk.skills.Berserk, 5, true],
		[sdk.skills.Frenzy, 4, false],
		[sdk.skills.BattleOrders, 4, false],
		[sdk.skills.Frenzy, 5, false],
		[sdk.skills.BattleOrders, 5, false],
		[sdk.skills.Frenzy, 6, false],
		[sdk.skills.BattleOrders, 6, false],
		[sdk.skills.Frenzy, 7, false],
		[sdk.skills.BattleOrders, 7, false],
		[sdk.skills.Frenzy, 8, false],
		[sdk.skills.BattleOrders, 8, false],
		[sdk.skills.Frenzy, 9, false],
		[sdk.skills.BattleOrders, 9, false],
		[sdk.skills.Frenzy, 10, false],
		[sdk.skills.BattleOrders, 10, false],
		[sdk.skills.Frenzy, 11, false],
		[sdk.skills.BattleOrders, 11, false],
		[sdk.skills.Frenzy, 12, false],
		[sdk.skills.BattleOrders, 12, false],
		[sdk.skills.Frenzy, 20, false],
		[sdk.skills.BattleOrders, 20, false],
		[sdk.skills.SwordMastery, 20, false],
		[sdk.skills.DoubleSwing, 20, false],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == phaseblade && [flag] == runeword # [ias] >= 30 # [tier] == 100000", // Grief
		"[name] == colossusblade && [flag] == runeword # [ias] >= 60 && [enhanceddamage] >= 350 # [tier] == 100000", // BoTD
		// Helmet
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000 + tierscore(item)", // Arreat's Face
		// Belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == 100000 + tierscore(item)", // Dungo's
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 100000 + tierscore(item)", // Gore Rider
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 30 # [tier] == 100000", // Fortitude
		// Gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000", // Laying of Hands
		// Amulet
		"[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == 100000 + tierscore(item)", // Atma's
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // Raven Frost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // Bul-Kathos' Wedding Band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [masteriesskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [barbcombatskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	// Fortitude
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",	// Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	// Eth Andy's
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [sdk.skills.WarCry, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
				Config.LowManaSkill = me.getSkill(sdk.skills.DoubleSwing, 1) >= 9 ? [sdk.skills.DoubleSwing, 0] : [0, -1];
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
			return Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("sword", "runeword", "Breath of the Dying");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Frenzy, 0) === 20;
	},
};
