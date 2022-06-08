/**
*  @filename    Paladin.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Paladin
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Hammerdin
*        Smiter
*        Auradin
*        Zealer
*        Classicauradin
*        Hammershock
*        Torchadin
*        Sancdreamer
*      4. Save the profile and start
*/

// todo: clean-up how cubing to runes is handled
// move shared config settings into its own function call
// make and initialize me.equippedItems object so don't have to do repeated Item.getEquippedItem(whatever) call

function LoadConfig () {
	!isIncluded("SoloPlay/Functions/MiscOverrides.js") && include("SoloPlay/Functions/MiscOverrides.js");
	!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");

	SetUp.include();

	/* Script */
	Scripts.SoloPlay = true;

	/* Level Specifc Settings */
	Config.respecOne = 19;
	Config.respecOneB = 0;
	Config.levelCap = (function() {
		let tmpCap;
		if (me.softcore) {
			tmpCap = me.expansion ? [33, 65, 100] : [33, 65, 100];
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
	Config.BeltColumn = ["hp", "mp", "rv", "rv"];
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
	Config.GambleGoldStart = 2000000;
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
		"([type] == scepter || [type] == mace || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == circlet) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Boots
		"[type] == boots && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Armor
		"[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Shield
		"([type] == shield || [type] == auricshields) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Gloves
		"[type] == gloves && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Amulet
		"[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Rings
		"[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
	];

	let expansionTiers = [
		// Switch
		"[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == 25000",			// Weaken charged wand
		"[name] == beardedaxe && [quality] == unique # [itemchargedskill] == 87 # [secondarytier] == 50000",	// Spellsteel Decrepify charged axe
		// Charms
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
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

	/* Attack configuration. */
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [0, 0];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal ? true : false;
	Config.ClearType = 0;
	Config.ClearPath = {Range: (Pather.canTeleport() ? 30 : 10), Spectype: 0};

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipEnchant = [];
	Config.SkipAura = [];

	/* Shrine scan configuration. */
	Config.ScanShrines = [15, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];

	/* Class specific configuration. */
	Config.AvoidDolls = true;
	Config.Vigor = true;
	Config.Charge = true;
	Config.Redemption = [45, 25];

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.arrayLooping(finalGear);

	// Maybe add auric shield?
	Config.imbueables = [
		{name: sdk.items.WarScepter, condition: () => me.normal},
		{name: sdk.items.DivineScepter, condition: () => (!me.normal && (me.trueStr < 125 || me.trueDex < 60))},
		{name: sdk.items.MightyScepter, condition: () => (Item.getEquippedItem(4).tier < 777 && (me.trueStr >= 125 || me.trueDex >= 60))},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquippedItem(4).tier > 777 || me.classic))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquippedItem(4).tier > 777 || me.classic))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquippedItem(4).tier > 777 || me.classic))},
	];

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.arrayLooping(imbueArr);

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
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

		Config.socketables = [];
		// basicSocketables located in Globals
		Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);
		Config.socketables
			.push(
				{
					classid: sdk.items.Shako,
					socketWith: [sdk.items.runes.Um],
					temp: [sdk.items.gems.Perfect.Ruby],
					useSocketQuest: true,
					condition: (item) => item.unique && !item.ethereal
				}
			);

		/* Crafting */
		if (Item.getEquippedItem(sdk.body.Neck).tier < 100000) {
			Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Amulet]) : Config.Recipes.push([Recipe.Blood.Amulet]);
		}

		if (Item.getEquippedItem(sdk.body.RingLeft).tier < 100000) {
			Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Ring]) : Config.Recipes.push([Recipe.Blood.Ring]);
		}

		if (Item.getEquippedItem(sdk.body.Gloves).tier < 110000) {
			Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
		}

		if (me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			// Spirit on swap
			NTIP.addLine("[type] == auricshields && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000");
		}

		// FinalBuild specific setup
		let dreamerCheck;

		switch (SetUp.finalBuild) {
		case 'Smiter':
		case 'Zealer':
			// Grief
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Grief}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Grief.js")) {
					include("SoloPlay/BuildFiles/Runewords/Grief.js");
				}
			}

			if (SetUp.finalBuild === "Zealer") {
				Config.socketables
					.push(
						{
							classid: sdk.items.GrimHelm,
							socketWith: [sdk.items.runes.Ber],
							temp: [sdk.items.gems.Perfect.Ruby],
							useSocketQuest: true,
							condition: (item) => item.unique && item.getStat(sdk.stats.DamageResist) === 20 && !item.ethereal
						},
						{
							classid: sdk.items.BoneVisage,
							socketWith: [sdk.items.runes.Ber],
							temp: [sdk.items.gems.Perfect.Ruby],
							useSocketQuest: true,
							condition: (item) => item.unique && item.getStat(sdk.stats.DamageResist) === 20 && !item.ethereal && item.fname.toLowerCase().includes("vampire gaze")
						}
					);

				Check.itemSockables(sdk.items.GrimHelm, "unique", "Vampire Gaze");
				Check.itemSockables(sdk.items.BoneVisage, "unique", "Vampire Gaze");

				if (!Check.haveItem("bonevisage", "unique", "Vampire Gaze")) {
					// Upgrade Vamp Gaze to Elite
					Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Grim Helm", Roll.NonEth]);
				}

				// Exile
				if (!me.checkItem({name: sdk.locale.items.Exile, itemtype: sdk.itemtype.AuricShields}).have) {
					if (!isIncluded("SoloPlay/BuildFiles/Runewords/Exile.js")) {
						include("SoloPlay/BuildFiles/Runewords/Exile.js");
					}
				}

				// Fortitude
				if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Fortitude, itemtype: sdk.itemtype.Armor}).have) {
					if (!isIncluded("SoloPlay/BuildFiles/Runewords/Fortitude.js")) {
						include("SoloPlay/BuildFiles/Runewords/Fortitude.js");
					}
				}
			}

			break;
		case 'Hammerdin':
			// Heart of the Oak
			if (!me.checkItem({name: sdk.locale.items.HeartoftheOak}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js")) {
					include("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
				}
			}

			break;
		case 'Auradin':
			dreamerCheck = me.haveAll([{name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}, {name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}]);

			// Dream Shield
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/DreamShield.js")) {
					include("SoloPlay/BuildFiles/Runewords/DreamShield.js");
				}
			}

			// Dream Helm
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/DreamHelm.js")) {
					include("SoloPlay/BuildFiles/Runewords/DreamHelm.js");
				}
			}

			if ((me.ladder || Developer.addLadderRW) && !dreamerCheck) {
				// Cube to Jah rune
				if (!me.getItem(sdk.items.runes.Jah)) {
					if (me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
						Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
						Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
						Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
						Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
						Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
					}

					Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
				}

			}

			if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
				// Cube to Mal rune
				if (!me.getItem(sdk.items.runes.Mal) && Item.getEquippedItem(4).tier >= 110000) {
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
				}
				
				// Cube to Ohm rune
				if (!me.getItem(sdk.items.runes.Ohm)) {
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
				}
			}

			// Dragon Armor
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor}).have && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/DragonArmor.js")) {
					include("SoloPlay/BuildFiles/Runewords/DragonArmor.js");
				}
			}

			if (!me.checkItem({name: sdk.locale.items.HandofJustice}).have && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/HandOfJustice.js")) {
					include("SoloPlay/BuildFiles/Runewords/HandOfJustice.js");
				}

				// Azurewrath
				NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 230 && [sanctuaryaura] >= 10 # [tier] == 115000");
			}

			if (!me.allHave([{name: sdk.locale.items.CrescentMoon}, {name: sdk.locale.items.HandofJustice}]) && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js")) {
					include("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");
				}

				// Lightsabre
				NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");
			}

			if (!me.checkItem({name: sdk.locale.items.VoiceofReason}).have && !me.haveSome([{name: sdk.locale.items.CrescentMoon}, {name: sdk.locale.items.HandofJustice}]) && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js")) {
					include("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
				}
			}

			if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude
				&& me.haveAll([{name: sdk.locale.items.HandofJustice}, {name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor},
				{name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}, {name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}])) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
					include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
				}
			}

			break;
		case 'Sancdreamer':
			dreamerCheck = me.haveAll([{name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}, {name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}]);

			// Dream Shield
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/DreamShield.js")) {
					include("SoloPlay/BuildFiles/Runewords/DreamShield.js");
				}
			}

			// Dream Helm
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/DreamHelm.js")) {
					include("SoloPlay/BuildFiles/Runewords/DreamHelm.js");
				}
			}

			if ((me.ladder || Developer.addLadderRW) && !dreamerCheck) {
				// Cube to Jah rune
				if (!me.getItem(sdk.items.runes.Jah)) {
					if (me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
						Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
						Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
						Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
						Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
						Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
					}

					Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
				}
			}

			if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
				// Cube to Mal rune
				if (!me.getItem(sdk.items.runes.Mal) && Item.getEquippedItem(4).tier >= 110000) {
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
				}
				
				// Cube to Ohm rune
				if (!me.getItem(sdk.items.runes.Ohm)) {
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
				}
			}

			// Chains of Honor
			if (!me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js")) {
					include("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
				}
			}

			if (!me.checkItem({name: sdk.locale.items.LastWish}).have && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/LastWish.js")) {
					include("SoloPlay/BuildFiles/Runewords/LastWish.js");
				}
			}

			if (!me.haveAll([{name: sdk.locale.items.CrescentMoon}, {name: sdk.locale.items.LastWish}]) && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js")) {
					include("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");
				}

				// Lightsabre
				NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");
			}

			if (!me.checkItem({name: sdk.locale.items.VoiceofReason}).have && !me.haveSome([{name: sdk.locale.items.CrescentMoon}, {name: sdk.locale.items.LastWish}]) && dreamerCheck) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js")) {
					include("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
				}
			}

			if ((me.ladder || Developer.addLadderRW) && me.haveAll([{name: sdk.locale.items.LastWish}, {name: sdk.locale.items.ChainsofHonor},
				{name: sdk.locale.items.Dream, itemtype: sdk.itemtype.AuricShields}, {name: sdk.locale.items.Dream, itemtype: sdk.itemtype.Helm}])) {
				// Infinity
				if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).prefixnum !== sdk.locale.items.Infinity) {
					if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js")) {
						include("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
					}
				}
				// Merc Fortitude
				if (Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude) {
					if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
						include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
					}
				}
			}

			break;
		case 'Torchadin':
			// Dragon Armor
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/DragonArmor.js")) {
					include("SoloPlay/BuildFiles/Runewords/DragonArmor.js");
				}
			}

			if (!me.checkItem({name: sdk.locale.items.HandofJustice}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/HandOfJustice.js")) {
					include("SoloPlay/BuildFiles/Runewords/HandOfJustice.js");
				}

				// Azurewrath
				NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 230 && [sanctuaryaura] >= 10 # [tier] == 115000");
			}

			// Exile
			if ((me.ladder || Developer.addLadderRW) && !me.checkItem({name: sdk.locale.items.Exile, itemtype: sdk.itemtype.AuricShields}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Exile.js")) {
					include("SoloPlay/BuildFiles/Runewords/Exile.js");
				}
			}

			if ((me.ladder || Developer.addLadderRW) && !me.haveAll([{name: sdk.locale.items.HandofJustice},
				{name: sdk.locale.items.Exile, itemtype: sdk.itemtype.AuricShields}, {name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor}])) {
				// Cube to Cham rune
				if (!me.getItem(sdk.items.runes.Cham) || !me.getItem(sdk.items.runes.Sur) || !me.getItem(sdk.items.runes.Lo)) {
					if (me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
						Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
						Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
						Config.Recipes.push([Recipe.Rune, "Gul Rune"]);

						if (me.checkItem({name: sdk.locale.items.Exile, itemtype: sdk.itemtype.AuricShields}).have) {
							Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
							Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
						} else if (!me.checkItem({name: sdk.locale.items.Exile, itemtype: sdk.itemtype.AuricShields}).have && !me.getItem(sdk.items.runes.Ohm)) {
							Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
						}
					}

					if (me.checkItem({name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor}).have) {
						Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
						Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
					} else if ((!me.haveAll([{name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor}, {name: sdk.locale.items.HandofJustice}]) && !me.getItem(sdk.items.runes.Sur))) {
						Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
					}

					Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
					Config.Recipes.push([Recipe.Rune, "Jah Rune"]);
				}
			}

			if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
				// Cube to Mal rune
				if (!me.getItem(sdk.items.runes.Mal) && Item.getEquippedItem(4).tier >= 110000) {
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
				}
				
				// Cube to Ohm rune
				if (!me.getItem(sdk.items.runes.Ohm)) {
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
				}
			}

			if (!me.haveAll([{name: sdk.locale.items.CrescentMoon}, {name: sdk.locale.items.HandofJustice}])) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js")) {
					include("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");
				}

				// Lightsabre
				NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");
			}

			if (!me.checkItem({name: sdk.locale.items.VoiceofReason}).have && !me.haveSome([{name: sdk.locale.items.CrescentMoon}, {name: sdk.locale.items.HandofJustice}])) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js")) {
					include("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
				}
			}

			if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude
				&& me.haveAll([{name: sdk.locale.items.HandofJustice}, {name: sdk.locale.items.Dragon, itemtype: sdk.itemtype.Armor}, {name: sdk.locale.items.Exile, itemtype: sdk.itemtype.AuricShields}])) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
					include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
				}
			}
			break;
		default:
			break;
		}

		Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
		Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

		// Call to Arms
		if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js")) {
				include("SoloPlay/BuildFiles/Runewords/CallToArms.js");
			}
		}

		// Enigma - Don't make if not Smiter or Hammerdin
		if (!me.checkItem({name: sdk.locale.items.Enigma}).have && ["Hammerdin", "Smiter"].indexOf(SetUp.finalBuild) > -1) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js")) {
				include("SoloPlay/BuildFiles/Runewords/Enigma.js");
			}
		}

		// Spirit Sword
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(4).tier < 777) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js")) {
				include("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
			}
		}

		// Spirit Shield
		if ((me.ladder || Developer.addLadderRW) && (Item.getEquippedItem(5).tier < 1000 || Item.getEquippedItem(12).prefixnum !== sdk.locale.items.Spirit)) {
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
		if (Item.getEquippedItem(1).tier < 315) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Lore.js")) {
				include("SoloPlay/BuildFiles/Runewords/Lore.js");
			}
		}

		// Ancients' Pledge
		if (Item.getEquippedItem(5).tier < 500) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/AncientsPledge.js")) {
				include("SoloPlay/BuildFiles/Runewords/AncientsPledge.js");
			}
		}

		// Merc Fortitude
		if (Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude && ["Hammerdin", "Smiter"].indexOf(SetUp.finalBuild) > -1) {
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
		if (Item.getEquippedItem(3).tier < 450) {
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
