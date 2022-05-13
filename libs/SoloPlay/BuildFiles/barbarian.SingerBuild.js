/*
 *		@filename	barbarian.Singer.js
 *		@author		theBGuy
 *		@desc		Warcry (Singer/Shout) build
 *		@credits	isid0re, ebner20
 */

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.CombatBarb,
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
		// Total 110 skill points done at 99
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO x2 dual weild
		// Helmet
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)", // harlequin's crest
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == meshboots && [quality] == unique && [flag] != ethereal # [frw] >= 30 # [tier] == 100000 + tierscore(item)", //silkweave
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Gloves
		"[name] == gauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 10 # [tier] == 100000", //frostburns
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [warcriesskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == charmscore(item)",
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
			return Check.haveItem("armor", "runeword", "Enigma") && Check.haveItem("mace", "runeword", "Heart of the Oak");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.WarCry, 0) === 20;
	},
};
