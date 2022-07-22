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

function LoadConfig () {
	includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");
	includeIfNotIncluded("SoloPlay/Functions/Globals.js");

	SetUp.include();

	/* Script */
	Scripts.SoloPlay = true;
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
	Config.FastPick = false;
	Config.CainID.Enable = false;
	Config.FieldID.Enabled = false; // Identify items while in the field
	Config.FieldID.PacketID = true; // use packets to speed up id process (recommended to use this)
	Config.FieldID.UsedSpace = 80; // how much space has been used before trying to field id, set to 0 to id after every item picked
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
	let levelingTiers = [
		// Weapon
		"([type] == wand || [type] == sword || [type] == mace || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == circlet || [type] == pelt) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
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
		// Special Charms
		"[name] == smallcharm && [quality] == unique # [itemallskills] == 1 # [charmtier] == 100000",
		"[name] == largecharm && [quality] == unique # [itemaddclassskills] == 3 # [charmtier] == 100000",
		"[name] == grandcharm && [quality] == unique # [itemmagicbonus] >= 30 || [itemgoldbonus] >= 150 # [charmtier] == 100000",
		// Merc
		"([type] == circlet || [type] == helm) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"[type] == armor && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		// Rogue
		"me.mercid === 271 && [type] == bow && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		// A2 Guard
		"me.mercid === 338 && ([type] == polearm || [type] == spear) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
	];

	NTIP.arrayLooping(levelingTiers);

	let switchTiers = (["Wolf", "Plaguewolf"].includes(SetUp.currentBuild)
		? [
			"[name] == elderstaff && [quality] == unique # [itemallskills] >= 2 # [secondarytier] == tierscore(item)", // Ondal's
			"[name] == archonstaff && [quality] == unique # [itemallskills] == 5 # [secondarytier] == tierscore(item)" // Mang Song's
		]
		: [
			"[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == 25000", // Weaken charged wand
			"[name] == beardedaxe && [quality] == unique # [itemchargedskill] == 87 # [secondarytier] == 50000", // Spellsteel Decrepify charged axe
		]);

	NTIP.arrayLooping(switchTiers);

	/* Attack configuration. */
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [0, 0];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal;
	Config.ClearType = 0;
	Config.ClearPath = {Range: (Pather.canTeleport() ? 30 : 10), Spectype: 0};

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipEnchant = [];
	Config.SkipAura = [];

	/* Shrine scan configuration. */
	Config.ScanShrines = [15, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];

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
	!!finalGear && NTIP.arrayLooping(finalGear);

	Config.imbueables = [
		{name: sdk.items.SpiritMask, condition: () => (me.normal)},
		{name: sdk.items.TotemicMask, condition: () => (!me.normal && Item.getEquippedItem(sdk.body.Head).tier < 100000 && (me.charlvl < 66 || me.trueStr < 118))},
		{name: sdk.items.DreamSpirit, condition: () => (Item.getEquippedItem(sdk.body.Head).tier < 100000 && me.trueStr >= 118)},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquippedItem(sdk.body.Head).tier > 100000))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquippedItem(sdk.body.Head).tier > 100000))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquippedItem(sdk.body.Head).tier > 100000))},
	].filter((item) => item.condition());

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.arrayLooping(imbueArr);

	Config.socketables = [];
	// basicSocketables located in Globals
	Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);
	Config.socketables
		.push(
			{
				classid: sdk.items.Monarch,
				socketWith: [],
				useSocketQuest: true,
				condition: (item) => !me.hell && !Check.haveBase("monarch", 4) && item.ilvl >= 41 && item.isBaseType && !item.ethereal
			},
			{
				classid: sdk.items.TotemicMask,
				socketWith: [sdk.items.runes.Um],
				temp: [sdk.items.gems.Perfect.Ruby],
				useSocketQuest: true,
				condition: (item) => item.unique && !item.ethereal
			},
			{
				classid: sdk.items.Shako,
				socketWith: [sdk.items.runes.Um],
				temp: [sdk.items.gems.Perfect.Ruby],
				useSocketQuest: false,
				condition: (item) => item.unique && !item.ethereal
			}
		);

	if (me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
		// Spirit on swap
		NTIP.addLine("[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000");
	}

	/* Crafting */
	if (Item.getEquippedItem(sdk.body.Neck).tier < 100000) {
		Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Amulet]) : Config.Recipes.push([Recipe.Blood.Amulet]);
	}

	if (Item.getEquippedItem(sdk.body.RingLeft).tier < 100000) {
		Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Ring]) : Config.Recipes.push([Recipe.Blood.Ring]);
	}

	// FinalBuild specific setup
	switch (SetUp.finalBuild) {
	case "Wind":
	case "Elemental":
		// Call to Arms
		if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js")) {
				include("SoloPlay/BuildFiles/Runewords/CallToArms.js");
			}
		}

		if (SetUp.finalBuild === "Elemental") {
			Config.socketables
				.push(
					{
						classid: sdk.items.SkySpirit,
						socketWith: [sdk.items.runes.Um],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.unique && item.getStat(sdk.stats.PassiveFirePierce) === 20 && !item.ethereal
					}
				);

			// Heart of the Oak
			if (!Check.haveItem("mace", "runeword", "Heart of the Oak")) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js")) {
					include("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
				}
			}

			// Phoenix Shield
			if ((me.ladder || Developer.addLadderRW) && SetUp.finalBuild === "Elemental" && me.checkItem({name: sdk.locale.items.Enigma}).have && !me.checkItem({name: sdk.locale.items.Phoenix, itemtype: sdk.itemtype.Shield}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/PhoneixShield.js")) {
					include("SoloPlay/BuildFiles/Runewords/PhoneixShield.js");
				}
			}

			// Enigma
			if (!me.checkItem({name: sdk.locale.items.Enigma}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js")) {
					include("SoloPlay/BuildFiles/Runewords/Enigma.js");
				}
			}

			// upgrade magefist
			if (Item.getEquippedItem(sdk.body.Gloves).tier < 110000) {
				Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
				Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
			}
		}

		break;
	case "Wolf":
	case "Plaguewolf":
		// Chains of Honor
		if (!me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js")) {
				include("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
			}
		}

		if (SetUp.finalBuild === "Plaguewolf") {
			// Grief
			if (!me.checkItem({name: sdk.locale.items.Grief}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Grief.js")) {
					include("SoloPlay/BuildFiles/Runewords/Grief.js");
				}
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
	if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(sdk.body.RightArm).tier < 777) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js")) {
			include("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
		}
	}

	// Spirit Shield
	if ((me.ladder || Developer.addLadderRW) && (Item.getEquippedItem(sdk.body.LeftArm).tier < 1000 || Item.getEquippedItem(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js")) {
			include("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
		}
	}

	// Merc Insight
	if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).tier < 3600) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js")) {
			include("SoloPlay/BuildFiles/Runewords/MercInsight.js");
		}
	}

	// Lore
	if (Item.getEquippedItem(sdk.body.Head).tier < 100000) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/Lore.js")) {
			include("SoloPlay/BuildFiles/Runewords/Lore.js");
		}
	}

	// Ancients' Pledge
	if (Item.getEquippedItem(sdk.body.LeftArm).tier < 500) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/AncientsPledge.js")) {
			include("SoloPlay/BuildFiles/Runewords/AncientsPledge.js");
		}
	}

	// Merc Fortitude
	if (Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
			include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
		}
	}

	// Merc Treachery
	if (Item.getEquippedItemMerc(3).tier < 15000) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js")) {
			include("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
		}
	}

	// Smoke
	if (Item.getEquippedItem(sdk.body.Armor).tier < 634) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js")) {
			include("SoloPlay/BuildFiles/Runewords/Smoke.js");
		}
	}

	// Stealth
	if (Item.getEquippedItem(sdk.body.Armor).tier < 233) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js")) {
			include("SoloPlay/BuildFiles/Runewords/Stealth.js");
		}
	}

	SoloWants.buildList();
}
