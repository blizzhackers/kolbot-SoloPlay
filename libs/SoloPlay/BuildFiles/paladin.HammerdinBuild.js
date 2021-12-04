/**
 *    @filename		paladin.HammerdinBuild.js
 *	  @author	  	isid0re
 *    @desc			paladin build for hammerdin.
 * 					skills based on https://www.diabloii.net/forums/threads/max-damage-hammerdin-guide-by-captain_bogus-repost.127596/
 */

var finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.BlessedHammer, sdk.skills.Concentration],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.BlessedAim],
	precastSkills: [sdk.skills.HolyShield],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
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
		[sdk.skills.Might, 1],
		[sdk.skills.Smite, 1],
		[sdk.skills.Prayer, 1],
		[sdk.skills.HolyBolt, 1],
		[sdk.skills.Defiance, 1],
		[sdk.skills.Charge, 1],
		[sdk.skills.BlessedAim, 1],
		[sdk.skills.Cleansing, 1],
		[sdk.skills.BlessedAim, 6],
		[sdk.skills.BlessedHammer, 1],
		[sdk.skills.Concentration, 1],
		[sdk.skills.Vigor, 1],
		[sdk.skills.BlessedAim, 7],
		[sdk.skills.BlessedHammer, 2],
		[sdk.skills.Concentration, 2],
		[sdk.skills.Vigor, 2],
		[sdk.skills.BlessedHammer, 7],
		[sdk.skills.HolyShield, 1],
		[sdk.skills.Meditation, 1],
		[sdk.skills.BlessedHammer, 12],
		[sdk.skills.Redemption, 1],
		[sdk.skills.BlessedHammer, 20],
		[sdk.skills.Concentration, 3],
		[sdk.skills.Vigor, 3],
		[sdk.skills.Concentration, 4],
		[sdk.skills.Vigor, 4],
		[sdk.skills.Concentration, 5],
		[sdk.skills.Vigor, 5],
		[sdk.skills.Concentration, 6],
		[sdk.skills.Vigor, 6],
		[sdk.skills.Concentration, 7],
		[sdk.skills.Vigor, 7],
		[sdk.skills.Concentration, 8],
		[sdk.skills.Vigor, 8],
		[sdk.skills.Concentration, 9],
		[sdk.skills.Vigor, 9],
		[sdk.skills.Concentration, 10],
		[sdk.skills.Vigor, 10],
		[sdk.skills.Concentration, 11],
		[sdk.skills.Vigor, 11],
		[sdk.skills.Concentration, 12],
		[sdk.skills.Vigor, 12],
		[sdk.skills.Concentration, 13],
		[sdk.skills.Vigor, 13],
		[sdk.skills.Concentration, 14],
		[sdk.skills.Vigor, 14],
		[sdk.skills.Concentration, 15],
		[sdk.skills.Vigor, 15],
		[sdk.skills.Concentration, 16],
		[sdk.skills.Vigor, 16],
		[sdk.skills.Concentration, 17],
		[sdk.skills.Vigor, 17],
		[sdk.skills.Concentration, 18],
		[sdk.skills.Vigor, 18],
		[sdk.skills.Concentration, 19],
		[sdk.skills.Vigor, 19],
		[sdk.skills.Concentration, 20],
		[sdk.skills.Vigor, 20],
		[sdk.skills.BlessedAim, 20],
		[sdk.skills.HolyShield, 20]
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [fcr] == 40 # [tier] == 100000", // HotO
		// Helm
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)", // harlequin's crest
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", //war traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", //sandstorm treks
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == 50000 + tierscore(item)", //hoz
		"[type] == auricshields && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 100000 + tierscore(item)", // spirit
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 # [tier] == 100000 + tierscore(item)",	//Magefist
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		// Rings
		"[name] == ring && [quality] == unique # [maxhp] >= 40 && [magicdamagereduction] >= 12 # [tier] == 99000", // dwarfstar
		"[type] == ring && [quality] == unique # [dexterity] >= 20 # [tier] == 100000", //ravenfrost
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [palicombatskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	]
};
