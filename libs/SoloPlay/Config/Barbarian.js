/**
*  @filename    Barbarian.js
*  @author      theBGuy
*  @desc        Config Settings for SoloPlay Barbarian
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Whirlwind
*        Immortalwhirl
*        Frenzy
*        Uberconc
*        Singer
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
	Config.respecOneB = 74;
	Config.levelCap = (function() {
		let tmpCap;
		if (me.softcore) {
			tmpCap = me.expansion ? [33, 75, 100] : [33, 75, 100];
		} else {
			tmpCap = me.expansion ? [33, 75, 100] : [33, 75, 100];
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
	Config.UseMP = me.hardcore ? 75 : 45;
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
		"me.charlvl < 12 && [type] == sword && ([quality] >= normal || [flag] == runeword) && [flag] != ethereal && [wsm] <= 20 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[type] == sword && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [wsm] <= 10 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[name] == phaseblade && [quality] == unique && [flag] == ethereal # [enhanceddamage] >= 100 && [ias] == 30 && [magicdamagereduction] >= 7 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == primalhelm) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
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
		// Charms
		"[name] == smallcharm && [quality] == magic # # [invoquantity] == 8 && [charmtier] == charmscore(item)",
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
	me.expansion && NTIP.arrayLooping(expansionTiers);

	/* Attack configuration. */
	Config.AttackSkill = [-1, 0, 0, 0, 0];
	Config.LowManaSkill = me.getSkill(sdk.skills.DoubleSwing, sdk.skills.subindex.softpoints) >= 9 ? [sdk.skills.DoubleSwing, 0] : [0, -1];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal;
	Config.ClearType = 0;
	Config.ClearPath = {Range: (Pather.canTeleport() ? 30 : 10), Spectype: sdk.units.monsters.spectype.All};

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipEnchant = [];
	Config.SkipAura = [];

	/* Shrine scan configuration. */
	if (Check.currentBuild().caster) {
		Config.ScanShrines = [
			sdk.shrines.Refilling,
			sdk.shrines.Health,
			sdk.shrines.Mana,
			sdk.shrines.Gem,
			sdk.shrines.Monster,
			sdk.shrines.HealthExchange,
			sdk.shrines.ManaExchange,
			sdk.shrines.Experience,
			sdk.shrines.Armor,
			sdk.shrines.ResistFire,
			sdk.shrines.ResistCold,
			sdk.shrines.ResistLightning,
			sdk.shrines.ResistPoison,
			sdk.shrines.Skill,
			sdk.shrines.ManaRecharge,
			sdk.shrines.Stamina];
	} else {
		Config.ScanShrines = [
			sdk.shrines.Refilling,
			sdk.shrines.Health,
			sdk.shrines.Mana,
			sdk.shrines.Gem,
			sdk.shrines.Monster,
			sdk.shrines.HealthExchange,
			sdk.shrines.ManaExchange,
			sdk.shrines.Experience,
			sdk.shrines.Combat,
			sdk.shrines.Skill,
			sdk.shrines.Armor,
			sdk.shrines.ResistFire,
			sdk.shrines.ResistCold,
			sdk.shrines.ResistLightning,
			sdk.shrines.ResistPoison,
			sdk.shrines.ManaRecharge,
			sdk.shrines.Stamina];
	}
	// Class specific config
	Config.FindItem = true; 		// Use Find Item skill on corpses after clearing.
	Config.FindItemSwitch = false; 	// Switch to non-primary slot when using Find Item skills

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.arrayLooping(finalGear);

	Config.imbueables = [
		{name: sdk.items.AvengerGuard, condition: () => (me.normal && me.expansion)},
		{name: sdk.items.SlayerGuard, condition: () => (!me.normal && me.trueStr >= 118 && me.expansion)},
		{name: sdk.items.CarnageHelm, condition: () => (Item.getEquippedItem(sdk.body.Head).tier < 100000 && me.trueStr >= 106 && me.expansion)},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquippedItem(sdk.body.Head).tier > 100000 || me.classic))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquippedItem(sdk.body.RightArm).tier > 100000 || me.classic))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquippedItem(sdk.body.RightArm).tier > 100000 || me.classic))},
	].filter((item) => item.condition());

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.arrayLooping(imbueArr);

	switch (me.gametype) {
	case sdk.game.gametype.Classic:
		break;
	case sdk.game.gametype.Expansion:
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

		Config.socketables = [];
		// basicSocketables located in Globals
		Config.socketables = Config.socketables.concat(basicSocketables.all);
		Config.socketables
			.push(
				{
					classid: sdk.items.Flamberge,
					socketWith: [],
					useSocketQuest: true,
					condition: (item) => me.normal && Item.getEquippedItem(sdk.body.LeftArm).tier < 600 && !Check.haveBase("sword", 5) && !me.checkItem({name: sdk.locale.items.Honor}).have && item.ilvl >= 41 && item.isBaseType && !item.ethereal
				},
				{
					classid: sdk.items.Zweihander,
					socketWith: [],
					useSocketQuest: true,
					condition: (item) => Item.getEquippedItem(sdk.body.LeftArm).tier < 1000 && !Check.haveBase("sword", 5) && !me.checkItem({name: sdk.locale.items.Honor}).have && item.ilvl >= 41 && item.isBaseType && !item.ethereal
				}
			);

		if (SetUp.finalBuild !== "Immortalwhirl") {
			Config.socketables
				.push(
					{
						classid: sdk.items.SlayerGuard,
						socketWith: [sdk.items.runes.Cham],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.unique && !item.ethereal
					}
				);
		}

		if (["Immortalwhirl", "Singer"].indexOf(SetUp.finalBuild) === -1) {
			// Grief
			if ((me.ladder || Developer.addLadderRW) && (!me.checkItem({name: sdk.locale.items.Grief}).have || (SetUp.finalBuild === "Whirlwind" && Item.getEquippedItem(sdk.body.LeftArm).prefixnum !== sdk.locale.items.Grief))) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Grief.js")) {
					include("SoloPlay/BuildFiles/Runewords/Grief.js");
				}
			}

			// Fortitude
			if ((me.ladder || Developer.addLadderRW) && SetUp.finalBuild !== "Uberconc" && me.checkItem({name: sdk.locale.items.Grief}).have && !me.checkItem({name: sdk.locale.items.Fortitude, itemtype: sdk.itemtype.Armor}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Fortitude.js")) {
					include("SoloPlay/BuildFiles/Runewords/Fortitude.js");
				}
			}

			// Doom
			if ((me.ladder || Developer.addLadderRW) && Item. getEquippedItemmerc(sdk.body.RightArm).prefixnum !== 20532) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercDoom.js")) {
					include("SoloPlay/BuildFiles/Runewords/MercDoom.js");
				}
			}
		}

		// FinalBuild specific setup
		switch (SetUp.finalBuild) {
		case 'Uberconc':
			if (me.checkItem({name: sdk.locale.items.Grief}).have && SetUp.finalBuild === "Uberconc") {
				// Add Stormshield
				NTIP.addLine("[name] == monarch && [quality] == unique && [flag] != ethereal # [damageresist] >= 35 # [tier] == 100000");
			}

			// Chains of Honor
			if (!me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js")) {
					include("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
				}
			}

			break;
		case 'Frenzy':
			// Breathe of the Dying
			if (!me.checkItem({name: sdk.locale.items.BreathoftheDying}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/BreathoftheDying.js")) {
					include("SoloPlay/BuildFiles/Runewords/BreathoftheDying.js");
				}
			}

			break;
		case 'Singer':
			// Heart of the Oak
			if (Item.getEquippedItem(sdk.body.LeftArm).prefixnum !== sdk.locale.items.HeartoftheOak && me.checkItem({name: sdk.locale.items.Enigma}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js")) {
					include("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
				}
			}

			// Enigma
			if (!me.checkItem({name: sdk.locale.items.Enigma}).have) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js")) {
					include("SoloPlay/BuildFiles/Runewords/Enigma.js");
				}
			}

			break;
		case 'Immortalwhirl':
			// Infinity
			if ((me.ladder || Developer.addLadderRW) && Item. getEquippedItemmerc(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js")) {
					include("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
				}
			}

			Config.socketables
				.push(
					{
						classid: sdk.items.AvengerGuard,
						socketWith: [sdk.items.runes.Ber],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: false,
						condition: (item) => item.set && !item.ethereal
					},
					{
						classid: sdk.items.OgreMaul,
						socketWith: [sdk.items.runes.Shael],
						useSocketQuest: false,
						condition: (item) => item.set && !item.ethereal
					},
					{
						classid: sdk.items.SacredArmor,
						socketWith: [sdk.items.runes.Ber],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.set && !item.ethereal
					}
				);

			Check.itemSockables(sdk.items.OgreMaul, "set", "Immortal King's Stone Crusher");

			break;
		case 'Whirlwind':
			break;
		default:
			break;
		}

		/* Crafting */
		if (Item.getEquippedItem(sdk.body.Neck).tier < 100000) {
			Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Amulet]) : Config.Recipes.push([Recipe.Blood.Amulet]);
		}

		if (Item.getEquippedItem(sdk.body.RingLeft).tier < 100000) {
			Check.currentBuild().caster ? Config.Recipes.push([Recipe.Caster.Ring]) : Config.Recipes.push([Recipe.Blood.Ring]);
		}

		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 1370) {
			if (me.rawStrength >= 150 && me.rawDexterity >= 88) {
				// Upgrade Bloodletter to Elite
				Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "Gladius", Roll.NonEth]);
			}

			if (me.rawStrength >= 25 && me.rawDexterity >= 136) {
				// Upgrade Ginther's Rift to Elite
				Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "dimensionalblade", Roll.Eth]);
			}

			if (!Check.haveItem("falcata", "unique", "Bloodletter")) {
				NTIP.addLine("[name] == PulRune # # [maxquantity] == 1");
				NTIP.addLine("[name] == perfectemerald # # [maxquantity] == 1");
				// Bloodletter
				NTIP.addLine("[name] == gladius && [quality] == unique && [flag] != ethereal # [enhanceddamage] >= 140 && [ias] >= 20 # [maxquantity] == 1");
				// upped Bloodletter
				NTIP.addLine("[name] == falcata && [quality] == unique && [flag] != ethereal # [enhanceddamage] >= 140 && [ias] >= 20 # [maxquantity] == 1");
			}

			if (!Check.haveItem("dimensionalblade", "unique", "Ginther's Rift")) {
				NTIP.addLine("[name] == PulRune # # [maxquantity] == 1");
				NTIP.addLine("[name] == perfectemerald # # [maxquantity] == 1");

				// Have Pul rune before looking for eth ginther's
				if (me.getItem(sdk.items.runes.Pul)) {
					// Eth Ginther's Rift
					NTIP.addLine("[name] == dimensionalblade && [quality] == unique && [flag] == ethereal # [enhanceddamage] >= 100 && [ias] == 30 && [magicdamagereduction] >= 7 # [maxquantity] == 1");
				}

				// upped Ginther's Rift
				NTIP.addLine("[name] == phaseblade && [quality] == unique && [flag] == ethereal # [enhanceddamage] >= 100 && [ias] == 30 && [magicdamagereduction] >= 7 # [maxquantity] == 1");
			}
		}

		// Lawbringer - Amn/Lem/Ko
		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 1370) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Lawbringer.js")) {
				include("SoloPlay/BuildFiles/Runewords/Lawbringer.js");
			}
		}

		// Voice Of Reason - Lem/Ko/El/Eld
		if (Item.getEquippedItem(sdk.body.RightArm).tier > 1100 && Item.getEquippedItem(sdk.body.LeftArm).tier < 1270 && !Check.haveItem("ring", "unique", "Raven Frost")) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js")) {
				include("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
			}
		}

		// Crescent Moon - Shael/Um/Tir
		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 1100) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js")) {
				include("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");
			}
		}

		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 1200) {
			// Cube to Ko Rune
			if (!me.getItem(sdk.items.runes.Ko)) {
				Config.Recipes.push([Recipe.Rune, "Hel Rune"]);
				Config.Recipes.push([Recipe.Rune, "Io Rune"]);
				Config.Recipes.push([Recipe.Rune, "Lum Rune"]);
			}

			// Cube to Lem Rune
			if (!me.getItem(sdk.items.runes.Lem)) {
				Config.Recipes.push([Recipe.Rune, "Dol Rune"]);
				Config.Recipes.push([Recipe.Rune, "Io Rune"]);
				Config.Recipes.push([Recipe.Rune, "Lum Rune"]);
				Config.Recipes.push([Recipe.Rune, "Ko Rune"]);
				Config.Recipes.push([Recipe.Rune, "Fal Rune"]);
			}
		}

		// Honor - Amn/El/Ith/Tir/Sol
		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 1050) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Honor.js")) {
				include("SoloPlay/BuildFiles/Runewords/Honor.js");
			}
		}

		// Merc Insight
		if ((me.ladder || Developer.addLadderRW) && Item. getEquippedItemmerc(sdk.body.RightArm).tier < 3600) {
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

		// Merc Fortitude
		if ((me.ladder || Developer.addLadderRW) && Item. getEquippedItemmerc(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
				include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
			}
		}

		// Merc Treachery
		if (Item. getEquippedItemmerc(sdk.body.Armor).tier < 15000 && Item.getEquippedItem(sdk.body.RightArm).tier > 1100) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js")) {
				include("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
			}
		}

		// Treachery
		if (Item.getEquippedItem(sdk.body.Armor).tier < 634 && Item.getEquippedItem(sdk.body.RightArm).tier > 1100) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Treachery.js")) {
				include("SoloPlay/BuildFiles/Runewords/Treachery.js");
			}
		}

		// Smoke
		if (Item.getEquippedItem(sdk.body.Armor).tier < 350) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js")) {
				include("SoloPlay/BuildFiles/Runewords/Smoke.js");
			}
		}

		// Duress
		if (Item.getEquippedItem(sdk.body.Armor).tier < 600 && (me.checkItem({name: sdk.locale.items.CrescentMoon}).have || Item.getEquippedItem(sdk.body.LeftArm).tier > 900)) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Duress.js")) {
				include("SoloPlay/BuildFiles/Runewords/Duress.js");
			}
		}

		// Myth
		if (Item.getEquippedItem(sdk.body.Armor).tier < 340) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Myth.js")) {
				include("SoloPlay/BuildFiles/Runewords/Myth.js");
			}
		}

		// Kings Grace - Amn/Ral/Thul
		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 770) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/KingsGrace.js")) {
				include("SoloPlay/BuildFiles/Runewords/KingsGrace.js");
			}
		}

		// Steel - Tir/El
		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 500) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Steel.js")) {
				include("SoloPlay/BuildFiles/Runewords/Steel.js");
			}
		}

		// Spirit Sword
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js")) {
				include("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
			}
		}

		// Malice - IthElEth
		if (Item.getEquippedItem(sdk.body.LeftArm).tier < 175) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Malice.js")) {
				include("SoloPlay/BuildFiles/Runewords/Malice.js");
			}
		}

		// Stealth
		if (Item.getEquippedItem(sdk.body.Armor).tier < 233) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js")) {
				include("SoloPlay/BuildFiles/Runewords/Stealth.js");
			}
		}

		/*if (Item.getEquippedItem(sdk.body.Gloves).tier < 233) {
			NTIP.addLine("[name] == heavygloves && [flag] != ethereal && [quality] == magic # [itemchargedskill] >= 0 # [maxquantity] == 1");
			Config.Recipes.push([Recipe.Blood.Gloves, "Heavy Gloves"]); // Craft Blood Gloves
		}*/

		Check.itemSockables(sdk.items.Ataghan, "unique", "Djinn Slayer");
		SoloWants.buildList();

		break;
	}
}
