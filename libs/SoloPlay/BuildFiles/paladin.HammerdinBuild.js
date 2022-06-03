/**
*  @filename    paladin.HammerdinBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blessed Hammer + Concentration final build
*               based on https://www.diabloii.net/forums/threads/max-damage-hammerdin-guide-by-captain_bogus-repost.127596/
*
*/

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.BlessedHammer, sdk.skills.Concentration],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.BlessedAim],
	precastSkills: [sdk.skills.HolyShield],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	classicStats: [
		["dexterity", 51], ["strength", 80], ["vitality", "all"]
	],
	expansionStats: [
		["vitality", 60], ["dexterity", 30], ["strength", 27],
		["vitality", 91], ["dexterity", 44], ["strength", 30],
		["vitality", 96], ["dexterity", 59], ["strength", 60],
		["vitality", 109], ["dexterity", 77], ["strength", 89],
		["vitality", 137], ["dexterity", 89], ["strength", 103],
		["vitality", 173], ["dexterity", 103],
		["vitality", 208], ["dexterity", 118],
		["vitality", 243], ["dexterity", 133],
		["vitality", 279], ["dexterity", 147],
		["vitality", "all"]
	],
	skills: [
		[sdk.skills.HolyShield, 1],
		[sdk.skills.Meditation, 1],
		[sdk.skills.Redemption, 1],
		[sdk.skills.BlessedHammer, 20],
		[sdk.skills.Concentration, 20],
		[sdk.skills.Vigor, 20],
		[sdk.skills.BlessedAim, 20],
		[sdk.skills.HolyShield, 20]
	],
	classicTiers: [
		// Weapon
		"[name] == blade && [quality] == unique # [fcr] == 20 && [allres] == 10 # [tier] == 100000", // Spectral Shard
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", // SoJ
		// Gloves
		"[name] == lightgauntlets && [quality] == unique # [fcr] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)", // Magefist
	],
	expansionTiers: [
		// Weapon
		"[type] == mace && [flag] == runeword # [fcr] == 40 # [tier] == 100000", // HotO
		// Helm
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)", // Harlequin's Vrest
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", // Arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", // War Traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", // Sandstorm Treks
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", // Enigma
		// Shield
		"[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == 50000 + tierscore(item)", // HoZ
		"[type] == auricshields && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 100000 + tierscore(item)", // Spirit
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",		// magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",	// Upp'ed magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",	// perfect Upp'ed magefist
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", // Maras
		// Rings
		"[name] == ring && [quality] == unique # [maxhp] >= 40 && [magicdamagereduction] >= 12 # [tier] == 99000", // Dwarf Star
		"[type] == ring && [quality] == unique # [dexterity] >= 20 # [tier] == 100000", // Raven Frost
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", // SoJ
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [palicombatskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",	// Andy's
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	// Eth Andy's
	],
	stats: undefined,
	autoEquipTiers: undefined,

	AutoBuildTemplate: {
		1:	{
			Update: function () {
				Config.AttackSkill = [-1, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.HolyBolt, sdk.skills.Concentration];
				Config.LowManaSkill = [0, sdk.skills.Concentration];

				if (me.hell && !Pather.accessToAct(5)) {
					Config.SkipImmune = ["magic"];
				}
			}
		},
	},

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("armor", "runeword", "Enigma");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.BlessedHammer, 0) === 20;
	},
};

// Has to be set after its loaded
finalBuild.stats = me.classic ? finalBuild.classicStats : finalBuild.expansionStats;
finalBuild.autoEquipTiers = me.classic ? finalBuild.classicTiers : finalBuild.expansionTiers;
