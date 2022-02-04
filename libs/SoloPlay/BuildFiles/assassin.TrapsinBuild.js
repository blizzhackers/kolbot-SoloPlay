/**
 *    @filename   assassin.TrapsinBuild.js
 *	  @author	  theBGuy
 *    @desc       assassin build for after respecOne (11 fpa trap laying, 9 fps tele)
 */

const finalBuild = {
	caster: true,
	skillstab: sdk.skills.tabs.Traps,
	wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
	usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
	precastSkills: [sdk.skills.Fade, sdk.skills.ShadowMaster],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 156], ["dexterity", 79], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.CloakofShadows, 1],
		[sdk.skills.ShadowMaster, 1],
		[sdk.skills.Fade, 1],
		[sdk.skills.LightningSentry, 20, false],
		[sdk.skills.DeathSentry, 10],
		[sdk.skills.ShockWeb, 9],
		[sdk.skills.FireBlast, 8],
		[sdk.skills.DeathSentry, 12],
		[sdk.skills.ShockWeb, 11],
		[sdk.skills.FireBlast, 11],
		[sdk.skills.DeathSentry, 13],
		[sdk.skills.ShockWeb, 13],
		[sdk.skills.FireBlast, 12],
		[sdk.skills.DeathSentry, 14],
		[sdk.skills.ShockWeb, 15],
		[sdk.skills.FireBlast, 14],
		[sdk.skills.DeathSentry, 15],
		[sdk.skills.ShockWeb, 16],
		[sdk.skills.FireBlast, 15],
		[sdk.skills.DeathSentry, 16],
		[sdk.skills.ShockWeb, 18],
		[sdk.skills.FireBlast, 16],
		[sdk.skills.DeathSentry, 17],
		[sdk.skills.ShockWeb, 20],
		[sdk.skills.FireBlast, 18],
		[sdk.skills.DeathSentry, 20],
		[sdk.skills.ShockWeb, 20],
		[sdk.skills.FireBlast, 20],
		[sdk.skills.ChargedBoltSentry, 20],
	],
	autoEquipTiers: [ // autoequip final gear
		// Weapon
		"[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000", // HotO
		"[type] == sword && [flag] == runeword # [itemallskills] == 2 && [ias] == 20 && [fireresist] == 75 # [tier] == 200000", // Silence
		// Helmet
		"[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [tier] == 100000 + tierscore(item)", // Andy's
		// Belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000 + tierscore(item)", //arach's
		// Boots
		"[name] == sharkskinboots && [quality] == unique && [flag] != ethereal # [maxhp] >= 65 # [tier] == 100000 + tierscore(item)", //waterwalks
		// Armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000", //Enigma
		// Shield
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [tier] == 110000 + tierscore(item)", //spirit
		// Gloves
		"[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 # [tier] == 100000 + tierscore(item)", //Lava gout
		// Amulet
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000 + tierscore(item)", //maras
		// Rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		"[type] == ring	&& [quality] == unique # [dexterity] >= 20 # [tier] == 100000", //ravenfrost
		// Charms
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [maxhp] >= 20 # [invoquantity] == 3 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [itemmagicbonus] >= 7 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 20 && [fhr] >= 5 # [invoquantity] == 1 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [maxhp] == 20 && [maxmana] == 17 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		"[name] == grandcharm && [quality] == magic # [trapsskilltab] == 1 # [invoquantity] == 2 && [finalcharm] == true && [charmtier] == 1000 + charmscore(item)",
		// Switch
		"[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
		"[type] == shield # [itemallskills] >= 1 # [secondarytier] == 50000 + tierscore(item)", //Any 1+ all skill shield
		"[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000", //spirit
		// Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",	//Eth Andy's
	],

	respec: function () {
		return Attack.checkInfinity() && Check.haveItem("armor", "runeword", "Enigma");
	},

	active: function () {
		return this.respec && me.getSkill(sdk.skills.LightningSentry, 0) === 20;
	},
};
