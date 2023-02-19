/**
*  @filename    Druid.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Druid
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Wind
*        Elemental
*        Wolf
*        Plaguewolf
*      4. Save the profile and start
*/

(function LoadConfig () {
	includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");
	includeIfNotIncluded("SoloPlay/Functions/Globals.js");

	SetUp.include();

	/* Script */
	SetUp.config();

	/* Chicken configuration. */
	Config.LifeChicken = me.hardcore ? 45 : 10;
	Config.ManaChicken = 0;
	Config.MercChicken = 0;
	Config.TownHP = me.hardcore ? 0 : 35;
	Config.TownMP = 0;

	/* Potions configuration. */
	Config.UseHP = me.hardcore ? 90 : 75;
	Config.UseRejuvHP = me.hardcore ? 65 : 40;
	Config.UseMP = me.hardcore ? 75 : 55;
	Config.UseMercHP = 75;

	/* Belt configuration. */
	Config.BeltColumn = ["hp", "mp", "mp", "rv"];
	SetUp.belt();

	/* Pickit configuration. */
	Config.PickRange = 40;
	//	Config.PickitFiles.push("kolton.nip");
	//	Config.PickitFiles.push("LLD.nip");
	NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

	/* Gambling configuration. */
	Config.Gamble = true;
	Config.GambleGoldStart = 2000000;
	Config.GambleGoldStop = 750000;
	Config.GambleItems.push("amulet");
	Config.GambleItems.push("ring");
	Config.GambleItems.push("circlet");
	Config.GambleItems.push("coronet");

	/* AutoMule configuration. */
	Config.AutoMule.Trigger = [];
	Config.AutoMule.Force = [];
	Config.AutoMule.Exclude = [
		"[name] >= Elrune && [name] <= Lemrune",
	];

	/* AutoEquip configuration. */
	Config.AutoEquip = true;

	// AutoEquip setup
	const levelingTiers = [
		// Weapon
		"([type] == wand || [type] == sword || [type] == mace || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == circlet || [type] == pelt) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[type] == pelt && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && [sockets] == 1 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"me.normal && [type] == belt && [quality] >= lowquality && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Boots
		"[type] == boots && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Armor
		"[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Shield
		"[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Gloves
		"[type] == gloves && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Amulet
		"[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Rings
		"[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Switch
		// Charms
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
	];

	NTIP.buildList(levelingTiers);

	let switchTiers = (["Wolf", "Plaguewolf"].includes(SetUp.currentBuild)
		? [
			"[name] == elderstaff && [quality] == unique # [itemallskills] >= 2 # [secondarytier] == tierscore(item)", // Ondal's
			"[name] == archonstaff && [quality] == unique # [itemallskills] == 5 # [secondarytier] == tierscore(item)" // Mang Song's
		]
		: [
			"[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == 25000", // Weaken charged wand
			"[name] == beardedaxe && [quality] == unique # [itemchargedskill] == 87 # [secondarytier] == 50000", // Spellsteel Decrepify charged axe
		]);

	NTIP.buildList(switchTiers);

	/* Attack configuration. */
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [0, 0];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal;
	Config.ClearType = 0;
	Config.ClearPath = {Range: (Pather.canTeleport() ? 30 : 10), Spectype: 0};

	/* Class specific configuration. */
	/* Wereform */
	Config.Wereform = false; 	// 0 / false - don't shapeshift, 1 / "Werewolf" - change to werewolf, 2 / "Werebear" - change to werebear

	/* Summons */
	Config.SummonRaven = false;
	Config.SummonVine = 0; 		// 0 = disabled, 1 / "Poison Creeper", 2 / "Carrion Vine", 3 / "Solar Creeper"
	Config.SummonSpirit = 0; 	// 0 = disabled, 1 / "Oak Sage", 2 / "Heart of Wolverine", 3 / "Spirit of Barbs"
	Config.SummonAnimal = 0; 	// 0 = disabled, 1 or "Spirit Wolf" = summon spirit wolf, 2 or "Dire Wolf" = summon dire wolf, 3 or "Grizzly" = summon grizzly

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.buildList(finalGear);
	NTIP.buildFinalGear(finalGear);

	Config.imbueables = [
		{name: sdk.items.SpiritMask, condition: () => (me.normal)},
		{name: sdk.items.TotemicMask, condition: () => (!me.normal && Item.getEquipped(sdk.body.Head).tier < 100000 && (me.charlvl < 66 || me.trueStr < 118))},
		{name: sdk.items.DreamSpirit, condition: () => (Item.getEquipped(sdk.body.Head).tier < 100000 && me.trueStr >= 118)},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquipped(sdk.body.Head).tier > 100000))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquipped(sdk.body.Head).tier > 100000))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquipped(sdk.body.Head).tier > 100000))},
	].filter((item) => item.condition());

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.buildList(imbueArr);

	const { basicSocketables, addSocketableObj } = require("../Utils/General");
	
	Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);
	Config.socketables.push(addSocketableObj(sdk.items.Monarch, [], [],
		!me.hell, (item) => !Check.haveBase("monarch", 4) && item.ilvl >= 41 && item.isBaseType && !item.ethereal
	));
	Config.socketables.push(addSocketableObj(sdk.items.TotemicMask, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
		true, (item) => item.unique && !item.ethereal
	));
	Config.socketables.push(addSocketableObj(sdk.items.Shako, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
		true, (item) => item.unique && !item.ethereal
	));

	if (me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
		// Spirit on swap
		NTIP.addLine("[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000");
	}

	/* Crafting */
	if (Item.getEquipped(sdk.body.Neck).tier < 100000) {
		Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Amulet]) : Config.Recipes.push([Recipe.Blood.Amulet]);
	}

	if (Item.getEquipped(sdk.body.RingLeft).tier < 100000) {
		Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Ring]) : Config.Recipes.push([Recipe.Blood.Ring]);
	}

	// FinalBuild specific setup
	switch (SetUp.finalBuild) {
	case "Wind":
	case "Elemental":
		// Call to Arms
		if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
		}

		if (SetUp.finalBuild === "Elemental") {
			Config.socketables.push(addSocketableObj(sdk.items.SkySpirit, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
				true, (item) => item.unique && item.getStat(sdk.stats.PassiveFirePierce) === 20 && !item.ethereal
			));

			// Phoenix Shield
			if ((me.ladder || Developer.addLadderRW) && SetUp.finalBuild === "Elemental" && me.checkItem({name: sdk.locale.items.Enigma}).have && !me.checkItem({name: sdk.locale.items.Phoenix, itemtype: sdk.items.type.Shield}).have) {
				includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/PhoneixShield.js");
			}
		}

		// Heart of the Oak
		if (!me.checkItem({name: sdk.locale.items.HeartoftheOak}).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
		}

		// Enigma
		if (!me.checkItem({name: sdk.locale.items.Enigma}).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js");
		}

		// upgrade magefist
		if (Item.getEquipped(sdk.body.Gloves).tier < 110000) {
			Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
			Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
		}

		break;
	case "Wolf":
	case "Plaguewolf":
		// Chains of Honor
		if (!me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
		}

		if (SetUp.finalBuild === "Plaguewolf") {
			// Grief
			if (!me.checkItem({name: sdk.locale.items.Grief}).have) {
				includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Grief.js");
			}
		} else {
			// Make sure to have CoH first
			if (me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
				// Upgrade Ribcracker to Elite
				Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "quarterstaff", Roll.NonEth]);
			}

			// Don't have upgraded Ribcracker
			if (!Check.haveItem("stalagmite", "unique", "Ribcracker")) {
				// Perfect ribcracker
				NTIP.addLine("[name] == quarterstaff && [quality] == unique # [enhanceddamage] == 300 && [ias] >= 50 # [maxquantity] == 1");
				// Perfect upped ribcracker
				NTIP.addLine("[name] == stalagmite && [quality] == unique # [enhanceddamage] == 300 && [ias] >= 50 # [maxquantity] == 1");
			}
		}

		break;
	default:
		break;
	}

	Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
	Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");
	Check.itemSockables(sdk.items.TotemicMask, "unique", "Jalal's Mane");

	// Spirit Sword
	if ((me.ladder || Developer.addLadderRW) && Item.getEquipped(sdk.body.RightArm).tier < 777) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
	}

	// Spirit Shield
	if ((me.ladder || Developer.addLadderRW) && (Item.getEquipped(sdk.body.LeftArm).tier < 1000 || Item.getEquipped(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
	}

	// Merc Insight
	if ((me.ladder || Developer.addLadderRW) && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
	}

	// Lore
	if (Item.getEquipped(sdk.body.Head).tier < 100000) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Lore.js");
	}

	// Ancients' Pledge
	if (Item.getEquipped(sdk.body.LeftArm).tier < 500) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/AncientsPledge.js");
	}

	// Merc Fortitude
	if (Item.getMercEquipped(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
	}

	// Merc Treachery
	if (Item.getMercEquipped(sdk.body.Armor).tier < 15000) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
	}

	// Smoke
	if (Item.getEquipped(sdk.body.Armor).tier < 634) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js");
	}

	// Stealth
	if (Item.getEquipped(sdk.body.Armor).tier < 233) {
		includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js");
	}

	SoloWants.buildList();

	return true;
})();
