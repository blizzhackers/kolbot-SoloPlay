/*
 *		@filename	barbarian.UberconcBuild.js
 *		@author		theBGuy
 *		@desc		Uber concentration build
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
		[sdk.skills.Bash, 20, false],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 100000", //Grief
		// Helmet
		"[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == 100000 + tierscore(item)", //Arreat's Face
		// Belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == 100000 + tierscore(item)", //Dungo's
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 100000 + tierscore(item)", //gorerider's
		// Armor
		"[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", //CoH
		// Gloves
		"[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [strength] >= 12 && [lifeleech] >= 9 # [tier] == 100000 + tierscore(item)", // drac's
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", //highlords
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [barbcombatskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

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
