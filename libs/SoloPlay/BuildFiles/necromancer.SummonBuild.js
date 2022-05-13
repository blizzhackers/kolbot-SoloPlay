/**
 *		@filename	necromancer.SummonBuild.js
 *		@author		theBGuy, isid0re
 *		@desc		FishyMancer final build (explosion/summon) for expansion, (nova/summon) for classic since there is no merc to make initial bodies needed
 */

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.NecroSummoning,
	wantedskills: [sdk.skills.RaiseSkeleton, sdk.skills.CorpseExplosion],
	usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.SkeletonMastery, sdk.skills.BoneArmor, sdk.skills.Decrepify],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	classicStats: [
		["dexterity", 51], ["strength", 80], ["energy", 100], ["vitality", "all"]
	],
	expansionStats: [
		["strength", 48], ["vitality", 165], ["strength", 61],
		["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	classicSkills: [
		[sdk.skills.SummonResist, 1],
		[sdk.skills.BonePrison, 1],
		[sdk.skills.Decrepify, 1],
		[sdk.skills.LowerResist, 1],
		[sdk.skills.RaiseSkeleton, 20, false],
		[sdk.skills.SkeletonMastery, 20, false],
		[sdk.skills.PoisonNova, 20, false],
		[sdk.skills.LowerResist, 5, false],
		[sdk.skills.SummonResist, 5, false],
		[sdk.skills.RaiseSkeletalMage, 20, false],
		[sdk.skills.BonePrison, 20, false],
	],
	expansionSkills: [
		[sdk.skills.SummonResist, 1],
		[sdk.skills.BonePrison, 1],
		[sdk.skills.Decrepify, 1],
		[sdk.skills.RaiseSkeleton, 20, false],
		[sdk.skills.SkeletonMastery, 20, false],
		[sdk.skills.CorpseExplosion, 20, false],
		[sdk.skills.AmplifyDamage, 20, false],
		[sdk.skills.Revive, 20, false],
	],
	classicTiers: [
		// Weapon
		"[name] == cinquedeas && [quality] == unique # [ias] == 30 && [skillpoisonnova] == 4 # [tier] == 100000", // Blackbog's Sharp
		// Helm
		"[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == 100000 + tierscore(item)", // Tarnhelm
		// Shield
		"[type] == shield && [quality] >= magic # [necromancerskills] == 2 && [allres] >= 16 # [tier] == 100000 + tierscore(item)",
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		// Amulet
		"[type] == amulet && [quality] >= magic # [necromancerskills] == 2 && [fcr] == 10 # [tier] == 100000 + tierscore(item)",
		// Boots
		"[type] == boots && [quality] >= magic # [frw] >= 20 && [fhr] == 10 && [coldresist]+[lightresist] >= 10 # [tier] == 100000 + tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic # [fhr] >= 20 && [maxhp] >= 40 && [fireresist]+[lightresist] >= 20 # [tier] == 100000 + tierscore(item)",
		// Gloves
		"[name] == lightgauntlets && [quality] == unique # [fcr] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)", // Magefist
	],
	expansionTiers: [
		// Weapon
		"([type] == wand || [type] == sword && ([quality] >= magic || [flag] == runeword) || [type] == knife && [quality] >= magic) && [flag] != ethereal # [secondarymindamage] == 0 && [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == 100000 + tierscore(item)", // harlequin's crest
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", //war traveler
		"[name] == boneweaveboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 170 # [tier] == 100000 + tierscore(item)", //Marrowalk
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"([type] == shield && ([quality] >= magic || [flag] == runeword) || [type] == voodooheads) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",		// magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",	// upped magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == 100000 + tierscore(item)",	// double upped magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		// Rings
		"[name] == ring && [quality] == unique # [maxhp] >= 40 && [magicdamagereduction] >= 12 # [tier] == 99000", // dwarfstar
		"[type] == ring && [quality] == unique # [dexterity] >= 20 # [tier] == 100000", //ravenfrost
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 4 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [necromancersummoningskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],
	stats: undefined,
	skills: undefined,
	autoEquipTiers: undefined,

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Check.haveItem("armor", "runeword", "Enigma");
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.RaiseSkeleton, 0) === 20;
	},
};

// Has to be set after its loaded
finalBuild.stats = me.classic ? finalBuild.classicStats : finalBuild.expansionStats;
finalBuild.skills = me.classic ? finalBuild.classicSkills : finalBuild.expansionSkills;
finalBuild.autoEquipTiers = me.classic ? finalBuild.classicTiers : finalBuild.expansionTiers;
