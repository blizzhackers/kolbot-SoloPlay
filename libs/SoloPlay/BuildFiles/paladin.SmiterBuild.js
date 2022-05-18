/**
*  @filename    paladin.SmiterBuild.js
*  @author      isid0re, theBGuy
*  @desc        Smite + Fanaticism based final build
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.Smite, sdk.skills.Fanaticism],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.Salvation],
	precastSkills: [sdk.skills.HolyShield],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 115], ["dexterity", 136], ["vitality", 300],
		["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Smite, 20],
		[sdk.skills.HolyBolt, 1],
		[sdk.skills.Charge, 1],
		[sdk.skills.BlessedHammer, 1],
		[sdk.skills.HolyShield, 20],
		[sdk.skills.Might, 1],
		[sdk.skills.BlessedAim, 1],
		[sdk.skills.Concentration, 1],
		[sdk.skills.Fanaticism, 20],
		[sdk.skills.Salvation, 5],
		[sdk.skills.ResistLightning, 15],
		[sdk.skills.ResistFire, 14],
		[sdk.skills.ResistCold, 10]
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 100000", //Grief
		// Helm
		"[name] == wingedhelm && [quality] == set && [flag] != ethereal # [fhr] >= 30 # [tier] == 100000 + tierscore(item)", // gface
		// Belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160  # [tier] == 100000 + tierscore(item)", //tgods
		// Boots
		"[name] == lightplatedboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 50 # [tier] == 100000 + tierscore(item)", //goblin toes
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == 100000 + tierscore(item)", //hoz
		// Gloves
		"[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [strength] >= 12 && [lifeleech] >= 9 # [tier] == 100000 + tierscore(item)", // drac's
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", //highlords
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [palicombatskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.Smite, sdk.skills.Fanaticism, sdk.skills.Smite, sdk.skills.Fanaticism, sdk.skills.BlessedHammer, sdk.skills.Concentration];
				Config.LowManaSkill = [0, sdk.skills.Fanaticism];
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("sword", "runeword", "Grief");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Smite, 0) === 20;
	},
};
