/**
*  @filename    druid.ElementalBuild.js
*  @author      thatflykid, isid0re, theBGuy
*  @desc        Fire elemental based final build
*
*/

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Elemental,
	wantedskills: [sdk.skills.Firestorm, sdk.skills.Fissure],
	usefulskills: [sdk.skills.CycloneArmor],
	precastSkills: [sdk.skills.CycloneArmor],
	usefulStats: [sdk.stats.PassiveFireMastery, sdk.stats.PassiveFirePierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["dexterity", 35], ["strength", 48], ["vitality", 165],
		["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
        [sdk.skills.OakSage, 6, false],
        [sdk.skills.Fissure, 11, false],
        [sdk.skills.Grizzly, 1, false],
        [sdk.skills.Volcano, 1, false],
        [sdk.skills.Fissure, 20, false],
        [sdk.skills.CycloneArmor, 1, false],
        [sdk.skills.Firestorm, 20, false],
        [sdk.skills.Volcano, 20, false],
        [sdk.skills.OakSage, 20, false],
        [sdk.skills.CycloneArmor, 20, false],
        [sdk.skills.Grizzly, 5, false],
    ],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO
		// Helmet
		"[name] == skyspirit && [quality] == unique # [passivefirepierce] >= 10 # [tier] == 100000 + tierscore(item)", // Ravenlore
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", // Arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", // War Traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", // Sandstorm Treks
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", // Enigma
		// Shield
		"[name] == monarch && [flag] != ethereal && [flag] == runeword # [fcr] >= 25 # [tier] == 100000 + tierscore(item)", // Spirit
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",		// Magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",	// Upp'ed Magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",	// double Upp'ed Magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", // Maras
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", // SoJ
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [elementalskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	// Fortitude
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",	// Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	// Eth Andy's
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.ArticBlast, -1];
				Config.SummonAnimal = "Grizzly";
				Config.SummonSpirit = "Oak Sage";
			}
		},
	},

	respec: function () {
		return Check.haveItem("armor", "runeword", "Enigma");
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Volcano, 0);
	},
};
