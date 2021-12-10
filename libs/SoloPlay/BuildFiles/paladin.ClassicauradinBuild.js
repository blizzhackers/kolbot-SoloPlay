/**
 *    @filename   paladin.ClassicauradinBuild.js
 *	  @author	  theGuy
 *    @desc       End-game Classic Auradin build (HolyShock/Freeze based)
 */

let finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.Zeal, sdk.skills.HolyShock],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.HolyFreeze, sdk.skills.ResistCold, sdk.skills.ResistLightning],
	precastSkills: [sdk.skills.HolyShield],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	classicStats: [
		["strength", 55], ["vitality", "all"]
	],
	expansionStats: [
		["strength", 103], ["dexterity", 136], ["vitality", 300],
		["dexterity", "block"], ["vitality", "all"]
	],
	stats: undefined,
	skills: [
		[sdk.skills.Zeal, 4],
		[sdk.skills.Redemption, 1],
		[sdk.skills.HolyShield, 1],
		[sdk.skills.HolyShock, 20],
		[sdk.skills.HolyFreeze, 20],
		[sdk.skills.Salvation, 20, false],
		[sdk.skills.ResistLightning, 20, false],
		[sdk.skills.Zeal, 20, false],
	],
	classicTiers: [
		"[name] == warscepter && [quality] >= magic # [paladinskills] == 2 && [ias] == 40 && [skillholyshock] >= 1 # [tier] == 100000 + tierscore(item)",
		"[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == 100000 + tierscore(item)", // Tarnhelm
		"[type] == shield && [quality] >= magic # [paladinskills] == 2 && [allres] >= 16 # [tier] == 100000 + tierscore(item)",
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		"[type] == amulet && [quality] >= magic # [paladinskills] == 2 && [allres] >= 16 # [tier] == 100000 + tierscore(item)",
		"[name] == chainboots && [quality] == set # [frw] == 20 # [tier] == 100000", // Hsaru's Iron Heel
		"[name] == belt && [quality] == set # [coldresist] == 20 && [maxhp] == 20 # [tier] == 100000", // Hsaru's Iron Stay
	],
	expansionTiers: [
		// Weapon
		"[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500", // Voice of Reason
		"[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000", // Crescent Moon
		"[type] == sword && [flag] == runeword # [holyfireaura] >= 16 # [tier] == 120000", // HoJ
		// Helm
		"[type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000", //Dream Helm
		// Belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //TGods
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //Gore Rider
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [holyfireaura] >= 14 # [tier] == 110000", //Dragon
		// Shield
		"[type] == auricshields && [flag] != ethereal && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000", //Dream
		// Gloves
		"[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000", // Laying of Hand's
		// Amulet
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", //highlords
		// Rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 6 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [offensiveaurasskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", //Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)", //Treachery
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)", //Eth Andy's
	],
	autoEquipTiers: undefined,
};

// Has to be set after its loaded
finalBuild.stats = me.classic ? finalBuild.classicStats : finalBuild.expansionStats;
finalBuild.autoEquipTiers = me.classic ? finalBuild.classicTiers : finalBuild.expansionTiers;