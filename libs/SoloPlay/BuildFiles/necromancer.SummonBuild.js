/**
 *    @filename   necromancer.SummonBuild.js
 *	  @author	  isid0re
 *    @desc       FishyMancer build for after respecOne
 */

var finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.NecroSummoning,
	wantedskills: [sdk.skills.RaiseSkeleton, sdk.skills.CorpseExplosion],
	usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.SkeletonMastery, sdk.skills.BoneArmor, sdk.skills.Decrepify],
	mercAuraName: "Might",
	mercAuraWanted: sdk.skills.Might,
	mercDiff: 1,
	stats: [
		["strength", 48], ["vitality", 165], ["strength", 61],
		["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.AmplifyDamage, 1, false],
		[sdk.skills.RaiseSkeleton, 1, false],
		[sdk.skills.SkeletonMastery, 1, false],
		[sdk.skills.ClayGolem, 1, false],
		[sdk.skills.GolemMastery, 1, false],
		[sdk.skills.SummonResist, 1, false],
		[sdk.skills.Weaken, 1, false],
		[sdk.skills.Terror, 1, false],
		[sdk.skills.Decrepify, 1, false],
		[sdk.skills.Teeth, 1, false],
		[sdk.skills.CorpseExplosion, 1, false],
		[sdk.skills.BoneArmor, 1, false],
		[sdk.skills.RaiseSkeleton, 20, false],
		[sdk.skills.SkeletonMastery, 20, false],
		[sdk.skills.CorpseExplosion, 20, false],
		[sdk.skills.AmplifyDamage, 20, false],
		[sdk.skills.Revive, 20, false],
	],
	autoEquipTiers: [ // autoequip final gear
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
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",		// magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",	// upped magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",	// double upped magefist
		"[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [fcr] == 30 && (126, 1) == 1 # [tier] == 110000",	// perfect double upped magefist
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
		"[name] == crystalsword && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	]
};
