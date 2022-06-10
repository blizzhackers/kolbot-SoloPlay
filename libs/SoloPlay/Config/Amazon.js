/**
*  @filename    Amazon.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Amazon
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Witchyzon
*        Wfzon
*        Faithbowzon
*        Javazon
*      4. Save the profile and start
*/

function LoadConfig () {
	!isIncluded("SoloPlay/Functions/MiscOverrides.js") && include("SoloPlay/Functions/MiscOverrides.js");
	!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");

	SetUp.include();

	/* Script */
	Scripts.SoloPlay = true;

	/* Level Specifc Settings */
	Config.respecOne = 30;
	Config.respecOneB = 64;
	Config.levelCap = (function() {
		let tmpCap;
		if (me.softcore) {
			tmpCap = me.expansion ? [33, 70, 100] : [33, 70, 100];
		} else {
			tmpCap = me.expansion ? [33, 65, 100] : [33, 65, 100];
		}
		return tmpCap[me.diff];
	})();

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

	/* Gambling configuration. */
	Config.Gamble = true;
	Config.GambleGoldStart = 1250000;
	Config.GambleGoldStop = 750000;
	Config.GambleItems.push("Amulet");
	Config.GambleItems.push("Ring");
	Config.GambleItems.push("Circlet");
	Config.GambleItems.push("Coronet");

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
		"([type] == javelin || [type] == amazonjavelin) && [quality] >= normal && [flag] != ethereal && [wsm] <= 10 && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[name] == ceremonialjavelin && [quality] == unique && [flag] == ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"([type] == circlet || [type] == helm) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Boots
		"[type] == boots && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Armor
		"[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Gloves
		"[type] == gloves && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Amulet
		"[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Rings
		"[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
	];

	let expansionTiers = [
		// Switch
		"[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == 25000",								// Weaken charged wand
		"[type] == wand && [quality] >= normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
		// Charms
		"[name] == smallcharm && [quality] == magic # # [invoquantity] == 8 && [charmtier] == charmscore(item)",
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
	me.expansion && NTIP.arrayLooping(expansionTiers);

	if (["Witchyzon", "Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1) {
		NTIP.addLine("[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)");
		NTIP.addLine("me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)");
	}

	/* Attack configuration. */
	Config.AttackSkill = [0, 0, 0, 0, 0];
	Config.LowManaSkill = [-1, -1];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = false;
	Config.ClearType = 0;
	Config.ClearPath = {Range: (Pather.canTeleport() ? 30 : 20), Spectype: 0};

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipEnchant = [];
	Config.SkipAura = [];

	/* Shrine scan configuration. */
	Config.ScanShrines = [15, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];

	// Class specific config
	Config.LightningFuryDelay = 10; // Lightning fury interval in seconds. LF is treated as timed skill.
	Config.SummonValkyrie = true; 	// Summon Valkyrie

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.arrayLooping(finalGear);

	Config.imbueables = [
		{name: sdk.items.MaidenJavelin, condition: () => me.normal && me.expansion},
		{name: sdk.items.CeremonialJavelin, condition: () => !me.normal && (me.charlvl < 48 || me.trueStr < 107 || me.trueDex < 151) && me.expansion},
		{name: sdk.items.MatriarchalJavelin, condition: () => (Item.getEquippedItem(4).tier < 100000 && me.trueStr >= 107 && me.trueDex >= 151 && me.expansion)},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquippedItem(4).tier > 100000 || me.classic))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquippedItem(4).tier > 100000 || me.classic))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquippedItem(4).tier > 100000 || me.classic))},
	];

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.arrayLooping(imbueArr);

	if (Item.getEquippedItem(4).tier < 100000) {
		Config.GambleItems.push("Javelin");
		Config.GambleItems.push("Pilum");
		Config.GambleItems.push("Short Spear");
		Config.GambleItems.push("Throwing Spear");
	}

	switch (me.gametype) {
	case sdk.game.gametype.Classic:
		// Res shield
		if (Item.getEquippedItem(5).tier < 487) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/PDiamondShield.js")) {
				include("SoloPlay/BuildFiles/Runewords/PDiamondShield.js");
			}
		}
		
		break;
	case sdk.game.gametype.Expansion:
		NTIP.addLine("[name] >= Vexrune && [name] <= Zodrune");

		Config.socketables = [];
		// basicSocketables located in Globals
		Config.socketables = Config.socketables.concat(basicSocketables.all);
		Config.socketables
			.push(
				{
					classid: sdk.items.Bill,
					socketWith: [],
					useSocketQuest: true,
					condition: (item) => me.normal && item.ilvl >= 26 && item.isBaseType
				},
				{
					classid: sdk.items.Shako,
					socketWith: [sdk.items.runes.Um],
					temp: [sdk.items.gems.Perfect.Ruby],
					useSocketQuest: true,
					condition: (item) => item.unique && !item.ethereal
				}
			);

		Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
		Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

		/* Crafting */
		// Going with Blood but TODO is test HitPower vs Blood
		if (Item.getEquippedItem(sdk.body.Neck).tier < 100000) {
			Config.Recipes.push([Recipe.Blood.Amulet]);
		}

		if (Item.getEquippedItem(sdk.body.RingLeft).tier < 100000) {
			Config.Recipes.push([Recipe.Blood.Ring]);
		}

		// FinalBuild specific setup
		switch (SetUp.finalBuild) {
		case 'Witchyzon':
		case 'Faithbowzon':
		case 'Wfzon':
			(["Witchyzon", "Wfzon", "Faithbowzon"].includes(SetUp.currentBuild)) && NTIP.addLine("[type] == bowquiver # # [maxquantity] == 1");

			if (SetUp.finalBuild === "Wfzon") {
				if (!Check.haveItem(sdk.items.HydraBow, "unique", "Windforce")) {
					NTIP.addLine("[name] == hydrabow && [quality] == unique # [manaleech] >= 6 # [maxquantity] == 1");
				}

				Config.socketables
				.push(
					{
						classid: sdk.items.HydraBow,
						socketWith: [sdk.items.runes.Shael],
						temp: [sdk.items.gems.Perfect.Amn],
						useSocketQuest: true,
						condition: (item) => item.quality === sdk.itemquality.Unique
					}
				);
			}

			if ((SetUp.finalBuild === "Faithbowzon") && !me.checkItem({name: sdk.locale.items.Faith}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Faith.js")) {
					include("SoloPlay/BuildFiles/Runewords/Faith.js");
				}
			}
				
			if (!Check.haveItem(sdk.items.DiamondBow, "unique", "Witchwild String") && (SetUp.finalBuild === "Witchyzon") || (!["Wfzon", "Faithbowzon"].includes(SetUp.currentBuild))) {
				NTIP.addLine("[name] == shortsiegebow && [quality] == unique # [fireresist] == 40 # [maxquantity] == 1");
				// Witchyzon only - keep the bow but don't upgrade it until we have our wanted belt
				((SetUp.finalBuild === "Witchyzon") && Check.haveItem("vampirefangbelt", "unique", "Nosferatu's Coil") || (["Wfzon", "Faithbowzon"].includes(SetUp.finalBuild)) && Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "Short Siege Bow", Roll.NonEth]));
			}

			// Spirit shield - while lvling and Wf final switch
			if ((me.ladder || Developer.addLadderRW) && (Item.getEquippedItem(5).tier < 1000 && (["Witchyzon", "Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1) || (SetUp.finalBuild === "Wfzon" && Item.getEquippedItem(12).prefixnum !== sdk.locale.items.Spirit))) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js")) {
					include("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
				}
			}

			Config.socketables
				.push(
					{
						classid: sdk.items.DiamondBow,
						socketWith: [sdk.items.runes.Nef, sdk.items.runes.Shael],
						temp: [sdk.items.gems.Perfect.Skull],
						useSocketQuest: false,
						condition: (item) => item.unique
					},
					{
						classid: sdk.items.BoneVisage,
						socketWith: [sdk.items.runes.Um],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.quality === sdk.itemquality.Unique && item.getStat(sdk.stats.LifeLeech) === 8 && item.getStat(sdk.stats.DamageResist) === 20 && !item.ethereal
					}
				);

			break;
		case 'Javazon':
			Config.SkipImmune = ["lightning and physical"];

			if (me.getSkill(sdk.skills.ChargedStrike, 0)) {
				// "Monster name": [-1, -1],
				Config.CustomAttack = {
					"Fire Tower": [sdk.skills.ChargedStrike, -1],
				};
			}

			// Infinity
			if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).prefixnum !== sdk.locale.items.Infinity) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js")) {
					include("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
				}
			}

			// Spirit shield
			if ((me.ladder || Developer.addLadderRW) && ((Item.getEquippedItem(5).tier < 1000 || Item.getEquippedItem(12).prefixnum !== sdk.locale.items.Spirit))) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js")) {
					include("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
				}
			}

			break;
		default:
			break;
		}

		// Call to Arms
		if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js")) {
				include("SoloPlay/BuildFiles/Runewords/CallToArms.js");
			}
		}

		// Chains of Honor
		if (!me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js")) {
				include("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
			}
		}

		// Merc Insight
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).tier < 3600) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js")) {
				include("SoloPlay/BuildFiles/Runewords/MercInsight.js");
			}
		}

		// Lore
		if (Item.getEquippedItem(1).tier < 250) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Lore.js")) {
				include("SoloPlay/BuildFiles/Runewords/Lore.js");
			}
		}

		// Ancients' Pledge
		if (Item.getEquippedItem(5).tier < 500 && (!["Witchyzon", "Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1)) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/AncientsPledge.js")) {
				include("SoloPlay/BuildFiles/Runewords/AncientsPledge.js");
			}
		}

		// Treachery
		if (Item.getEquippedItem(3).tier < 634) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Treachery.js")) {
				include("SoloPlay/BuildFiles/Runewords/Treachery.js");
			}
		}

		// Merc Doom
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).prefixnum !== 20532 && SetUp.finalBuild !== "Javazon") {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercDoom.js")) {
				include("SoloPlay/BuildFiles/Runewords/MercDoom.js");
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
		if (Item.getEquippedItem(3).tier < 634) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js")) {
				include("SoloPlay/BuildFiles/Runewords/Smoke.js");
			}
		}

		// Stealth
		if (Item.getEquippedItem(3).tier < 233) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js")) {
				include("SoloPlay/BuildFiles/Runewords/Stealth.js");
			}
		}

		SoloWants.buildList();

		break;
	}
}
