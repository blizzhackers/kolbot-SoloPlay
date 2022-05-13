/*
 *		@filename	barbarian.ImmortalwhirlBuild.js
 *		@author		theBGuy
 *		@desc		Immortal King Whirlwind build
 */

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.CombatBarb,
	wantedskills: [sdk.skills.Bash, sdk.skills.Whirlwind],
	usefulskills: [sdk.skills.Howl, sdk.skills.Shout],
	precastSkills: [sdk.skills.BattleOrders, sdk.skills.WarCry], // Battle orders, War Cry
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 187], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.MaceMastery, 20],
		[sdk.skills.Whirlwind, 20],
		[sdk.skills.Shout, 20],
		[sdk.skills.BattleCry, 1],
		[sdk.skills.BattleCommand, 1],
		[sdk.skills.NaturalResistance, 1],
		[sdk.skills.IncreasedSpeed, 1],
		[sdk.skills.BattleOrders, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[name] == ogremaul && [quality] == set # [enhanceddamage] >= 200 && [ias] >= 40 # [tier] == 110000", // IK Maul
		// Helmet
		"[name] == avengerguard && [quality] == set && [flag] != ethereal # [warcriesskilltab] == 2 # [tier] == 110000", // IK Helm
		// Belt
		"[name] == warbelt && [quality] == set && [flag] != ethereal # [strength] >= 25 && [fireresist] >= 28 # [tier] == 110000", // IK Belt
		// Boots
		"[name] == warboots && [quality] == set && [flag] != ethereal # [frw] >= 40 && [tohit] >= 110 # [tier] == 110000", // IK Boots
		// Armor
		"[name] == sacredarmor && [quality] == set && [flag] != ethereal # [barbcombatskilltab] == 2 # [tier] == 110000", // IK Armor
		// Gloves
		"[name] == wargauntlets && [quality] == set && [flag] != ethereal # [strength] >= 20 && [dexterity] >= 20 # [tier] == 110000", // IK Gauntlets
		// Amulet
		"[type] == amulet && [quality] == unique # [defense] >= 300 # [tier] == 110000 + tierscore(item)", // Metalgrid
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [masteriesskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == charmscore(item)",
		// Switch
		"([type] == club || [type] == sword || [type] == knife || [type] == throwingknife || [type] == mace) && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

	respec: function () {
		if (me.classic) {
			return false;
		} else {
			return Check.haveItem("mace", "set", "Immortal King's Stone Crusher") && Check.haveItem("boots", "set", "Immortal King's Pillar") &&
				Check.haveItem("belt", "set", "Immortal King's Detail") && Check.haveItem("armor", "set", "Immortal King's Soul Cage") &&
				Check.haveItem("primalhelm", "set", "Immortal King's Will") && Check.haveItem("gloves", "set", "Immortal King's Forge");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.MaceMastery, 0) === 20;
	},
};
