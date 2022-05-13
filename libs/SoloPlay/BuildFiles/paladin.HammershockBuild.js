/**
 *		@filename	paladin.HammershockBuild.js
 *		@author		theGuy
 *		@desc		End-game Hybrid hammerdin build (BlessedHammer/HolyShock)
 */

const finalBuild = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.BlessedHammer, sdk.skills.HolyShock],
	usefulskills: [sdk.skills.HolyShield, sdk.skills.ResistLightning, sdk.skills.Zeal, sdk.skills.Concentration, sdk.skills.Vigor, sdk.skills.BlessedAim],
	precastSkills: [sdk.skills.HolyShield],
	usefulStats: [sdk.stats.PierceLtng, sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	classicStats: [
		["strength", 80], ["vitality", "all"]
	],
	expansionStats: [
		["strength", 103], ["dexterity", 136], ["vitality", 300],
		["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Zeal, 4],
		[sdk.skills.Vengeance, 1],
		[sdk.skills.Redemption, 1],
		[sdk.skills.Salvation, 1],
		[sdk.skills.HolyShield, 1],
		[sdk.skills.Concentration, 1],
		[sdk.skills.BlessedHammer, 20],
		[sdk.skills.HolyShock, 20],
		[sdk.skills.BlessedAim, 20, false],
		[sdk.skills.ResistLightning, 20, false],
		[sdk.skills.Zeal, 20, false],
	],
	classicTiers: [
		// Weapon
		"[name] == warscepter && [quality] >= magic # [paladinskills] == 2 && [ias] == 40 && [skillholyshock] >= 1 # [tier] == 100000 + tierscore(item)",
		// Helm
		"[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == 100000 + tierscore(item)", // Tarnhelm
		// Shield
		"[type] == shield && [quality] >= magic # [paladinskills] == 2 && [allres] >= 16 # [tier] == 100000 + tierscore(item)",
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		// Amulet
		"[type] == amulet && [quality] >= magic # [paladinskills] == 2 && [allres] >= 16 # [tier] == 100000 + tierscore(item)",
		// Boots
		"[name] == chainboots && [quality] == set # [frw] == 20 # [tier] == 100000", // Hsaru's Iron Heel
		// Belt
		"[name] == belt && [quality] == set # [coldresist] == 20 && [maxhp] == 20 # [tier] == 100000", // Hsaru's Iron Stay
	],
	expansionTiers: [
		// Weapon
		"[type] == scepter && [quality] == unique && [flag] != ethereal # [paladinskills] >= 2 && [enhanceddamage] >= 250 # [tier] == 100000 + tierscore(item)", // Heaven's Light
		// Helm
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)", // harlequin's crest
		// Belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //TGods
		// Boots
		"[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == 110000 + tierscore(item)", //Gore Rider
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == 50000 + tierscore(item)", //hoz
		"[type] == auricshields && [flag] == runeword # [defianceaura] >= 13 # [tier] == 110000", //Exile
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
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", //Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)", //Treachery
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)", //Eth Andy's
	],
	stats: undefined,
	autoEquipTiers: undefined,

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("scepter", "unique", "Heaven's Light") && Check.haveItem("armor", "runeword", "Enigma");
		}
	},

	active: function () {
		return this.respec && (me.getSkill(sdk.skills.HolyShock, 0) === 20 && me.getSkill(sdk.skills.BlessedHammer, 0) === 20);
	},
};

// Has to be set after its loaded
finalBuild.stats = me.classic ? finalBuild.classicStats : finalBuild.expansionStats;
finalBuild.autoEquipTiers = me.classic ? finalBuild.classicTiers : finalBuild.expansionTiers;
