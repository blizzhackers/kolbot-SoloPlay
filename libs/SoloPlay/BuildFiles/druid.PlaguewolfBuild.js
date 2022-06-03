/**
*  @filename    druid.PlaguewolfBuild.js
*  @author      theBGuy
*  @desc        Rabies/Fury wolf final build
*
*/

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.ShapeShifting,
	wantedskills: [sdk.skills.Werewolf, sdk.skills.Lycanthropy, sdk.skills.Fury],
	usefulskills: [sdk.skills.HeartofWolverine, sdk.skills.Grizzly],
	precastSkills: [sdk.skills.Werewolf, sdk.skills.HeartofWolverine, sdk.skills.Grizzly],
	usefulStats: [sdk.stats.PassivePoisonMastery, sdk.stats.PassivePoisonPierce, sdk.stats.PiercePois],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 156], ["dexterity", 136], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Werewolf, 20, false],
		[sdk.skills.Lycanthropy, 20, false],
		[sdk.skills.PoisonCreeper, 1, false],
		[sdk.skills.Grizzly, 1, false],
		[sdk.skills.Rabies, 20, false],
		[sdk.skills.Fury, 20, false],
		[sdk.skills.HeartofWolverine, 10, false],
		[sdk.skills.HeartofWolverine, 20, false],
		[sdk.skills.PoisonCreeper, 20, false],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 110000", // Grief
		//Shield
		"[name] == monarch && [quality] == unique # [damageresist] >= 35 # [tier] == 110000",	// Stormshield
		// Helmet
		"[name] == totemicmask && [quality] == unique # [druidskills] == 2 && [shapeshiftingskilltab] == 2 # [tier] == 110000 + tierscore(item)", // Jalal's Mane
		// Belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 110000 + tierscore(item)", // Verdungo's
		// Armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000", // CoH
		// Gloves
		"[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 110000 + tierscore(item)", // Dracul's
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 110000 + tierscore(item)", // Maras
		// Rings
		"[type] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 110000 + tierscore(item)", // Wisp
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 110000 + tierscore(item)", // Bul-Kathos' Wedding Band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [poisonlength]*[poisonmaxdam]/256 >= 141 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [shapeshiftingskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == charmscore(item)",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", // Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)", // Treachery
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)", // Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)", // Eth Andy's
		"[name] == thresher && [quality] == unique # [enhanceddamage] >= 190 && [lifeleech] >= 11 # [merctier] == 100000 + mercscore(item)",	// Reaper's Toll
	],

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.BeltColumn = ["hp", "hp", "mp", "rv"];
				Config.AttackSkill = [sdk.skills.FeralRage, sdk.skills.Fury, sdk.skills.Rabies, sdk.skills.Fury, sdk.skills.Rabies, sdk.skills.Rabies, -1];
				Config.LowManaSkill = [0, 0];
				Config.Wereform = "Werewolf";
				Config.SummonAnimal = "Grizzly";
				Config.SummonSpirit = "Heart of Wolverine";
			}
		},
	},

	respec: function () {
		return Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("armor", "runeword", "Chains of Honor");
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Rabies, 0) === 20;
	},
};
