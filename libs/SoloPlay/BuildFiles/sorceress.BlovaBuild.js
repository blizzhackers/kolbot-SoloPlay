/*
 *    @filename   	Sorceress.BlovaBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc      	Sorceress blizzard nova build
 */

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Cold,
	wantedskills: [sdk.skills.Blizzard, sdk.skills.Nova],
	usefulskills: [sdk.skills.LightningMastery, sdk.skills.ColdMastery, sdk.skills.GlacialSpike],
	precastSkills: [sdk.skills.FrozenArmor],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 156], ["dexterity", 35], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Warmth, 1],
		[sdk.skills.FrozenArmor, 1],
		[sdk.skills.IceBolt, 1],
		[sdk.skills.IceBlast, 1],
		[sdk.skills.StaticField, 1],
		[sdk.skills.Telekinesis, 1],
		[sdk.skills.FrostNova, 1],
		[sdk.skills.Teleport, 1],
		[sdk.skills.GlacialSpike, 1],
		[sdk.skills.Blizzard, 1],
		[sdk.skills.ColdMastery, 1],
		[sdk.skills.Nova, 20],
		[sdk.skills.LightningMastery, 20],
		[sdk.skills.Blizzard, 20],
		[sdk.skills.ColdMastery, 5],
		[sdk.skills.IceBlast, 20],
		[sdk.skills.GlacialSpike, 5],
		[sdk.skills.IceBolt, 14],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO
		// Helmet
		"[name] == diadem && [quality] == unique && [flag] != ethereal # [fcr] == 25 # [tier] == 100000 + tierscore(item)", //griffons
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 5000 + tierscore(item)", //war traveler
		"[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == 100000 + tierscore(item)", //sandstorm treks
		// Armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", //CoH
		// Shield
		"[type] == shield # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 100000 + tierscore(item)", //spirit
		// Gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",		// magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 && (126, 1) == 1 # [tier] == 100000 + tierscore(item)",	// upped magefist
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [fcr] == 30 && (126, 1) == 1 # [tier] == 110000",	// perfect upped magefist
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000", //bk ring
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [maxhp] == 20 && [maxmana] == 17 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [coldskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [lightningskilltab] == 1 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 50000 + tierscore(item)", //Any 1+ all skill shield
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

	respec: function () {
		if (me.classic) {
			return me.charlvl >= 75 && me.diablo;
		} else {
			return Attack.checkInfinity();
		}
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.Nova, 0) === 20 && me.getSkill(sdk.skills.Blizzard, 0) >= 1;
	},
};
