/**
*  @filename    Sorceress.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Sorceress
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Meteorb
*        Cold
*        BlizzBaller
*        Blova
*        Lightning
*      4. Save the profile and start
*/

function LoadConfig () {
	!isIncluded("SoloPlay/Functions/MiscOverrides.js") && include("SoloPlay/Functions/MiscOverrides.js");
	!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");

	SetUp.include();

	/* Script */
	Scripts.SoloPlay = true;

	/* Level Specifc Settings */
	Config.respecOne = me.expansion ? 26 : 26;
	Config.respecOneB = me.expansion ? 65 : 60;
	Config.levelCap = (function() {
		let tmpCap;
		if (me.softcore) {
			tmpCap = me.expansion ? [33, 67, 100] : [33, 60, 100];
		} else {
			tmpCap = me.expansion ? [33, 67, 100] : [33, 67, 100];
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
	Config.UseHP = me.hardcore ? 90 : 80;
	Config.UseRejuvHP = me.hardcore ? 65 : 50;
	Config.UseMP = me.hardcore ? 75 : 65;
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
	//Config.PickitFiles.push("test.nip");

	/* Gambling configuration. */
	Config.Gamble = true;
	Config.GambleGoldStart = 1250000;
	Config.GambleGoldStop = 750000;
	// TODO: should gambling be re-written to try and gamble for our current lowest tier'd item
	// for example if our gloves are the lowest tier then only gamble gloves or maybe just make the others conditional like why include
	// gambling for rings/ammys if we have our end game one
	Config.GambleItems.push("Amulet");
	Config.GambleItems.push("Ring");
	Config.GambleItems.push("Circlet") && Config.GambleItems.push("Coronet");
	
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
		"me.charlvl > 1 && ([type] == orb || [type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"me.classic && [type] == staff && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == circlet) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Boots
		"[type] == boots && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Armor
		"[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Shield
		"[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
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
		"[type] == wand && [quality] >= Normal # [itemchargedskill] == 72 # [secondarytier] == 25000",								// Weaken charged wand
		"[type] == wand && [quality] >= Normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
		// Charms
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
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
	Skill.usePvpRange = true;
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [-1, -1];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = false;
	Config.ClearType = 0;
	Config.ClearPath = { Range: 30, Spectype: 0};

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipAura = [];
	me.lightRes < 75 && Config.SkipEnchant.push("lightning enchanted");

	/* Shrine scan configuration. */
	Config.ScanShrines = [15, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];

	/* Class specific configuration. */
	Config.UseTelekinesis = !!me.getSkill(sdk.skills.Telekinesis, 0); // use telekinesis if have skill
	Config.UseColdArmor = true;
	Config.Dodge = !!(me.charlvl >= Config.respecOne); // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
	Config.DodgeRange = 15; // Distance to keep from monsters.
	Config.DodgeHP = me.hardcore ? 90 : 75; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
	Config.TeleStomp = false; // Use merc to attack bosses if they're immune to attacks, but not to physical damage
	Config.CastStatic = me.classic ? 15 : [25, 33, 50][me.diff];
	Config.StaticList = [];

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.arrayLooping(finalGear);

	Config.imbueables = [
		{name: sdk.items.JaredsStone, condition: () => (me.normal && me.expansion)},
		{name: sdk.items.SwirlingCrystal, condition: () => (!me.normal && me.charlvl < 66 && me.expansion)},
		{name: sdk.items.DimensionalShard, condition: () => (Item.getEquippedItem(4).tier < 777 && me.expansion)},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquippedItem(4).tier > 777 || me.classic))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquippedItem(4).tier > 777 || me.classic))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquippedItem(4).tier > 777 || me.classic))},
	].filter((item) => item.condition());

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.arrayLooping(imbueArr);

	switch (me.gametype) {
	case sdk.game.gametype.Classic:
		// Res shield
		if ((Item.getEquippedItem(5).tier < 487 && !Item.getEquippedItem(4).twoHanded) || (Item.getEquippedItem(4).tier < 487 && Item.getEquippedItem(4).twoHanded)) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/PDiamondShield.js")) {
				include("SoloPlay/BuildFiles/Runewords/PDiamondShield.js");
			}
		}

		break;
	case sdk.game.gametype.Expansion:
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

		/* Crafting */
		if (Item.getEquippedItem(sdk.body.Neck).tier < 100000) {
			Config.Recipes.push([Recipe.Caster.Amulet]);
		}

		if (Item.getEquippedItem(sdk.body.Gloves).tier < 110000) {
			Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
			["Blova", "Lightning"].includes(SetUp.finalBuild) && Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
		}

		Config.socketables = [];
		// basicSocketables located in Globals
		Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);

		// FinalBuild specific setup
		switch (SetUp.finalBuild) {
		case 'Blova':
		case 'Lightning':
			// Infinity
			if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).prefixnum !== sdk.locale.items.Infinity) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js")) {
					include("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
				}
			}

			// Spirit Shield
			if ((me.ladder || Developer.addLadderRW) && SetUp.currentBuild === SetUp.finalBuild && (Item.getEquippedItem(5).tier < 1000 || Item.getEquippedItem(12).prefixnum !== sdk.locale.items.Spirit)) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js")) {
					include("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
				}
			}

			// Chains of Honor
			if (!Check.haveItem("armor", "runeword", "Chains of Honor")) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js")) {
					include("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
				}
			}

			// Heart of the Oak
			if (!Check.haveItem("mace", "runeword", "Heart of the Oak")) {
				if (!isIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js")) {
					include("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
				}
			}

			Config.socketables
				.push(
					{
						classid: sdk.items.Monarch,
						socketWith: [],
						useSocketQuest: true,
						condition: (item) => !me.hell && !Check.haveBase("monarch", 4) && item.ilvl >= 41 && item.isBaseType && !item.ethereal
					},
					{
						classid: sdk.items.Shako,
						socketWith: [sdk.items.runes.Um],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.unique && !item.ethereal
					}
				);

			Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

			break;
		case "Meteorb":
		case "Cold":
		case "Blizzballer":
			Config.socketables
				.push(
					{
						classid: sdk.items.DeathMask,
						socketWith: [sdk.items.runes.Um],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.set && !item.ethereal
					},
					{
						classid: sdk.items.LacqueredPlate,
						socketWith: [sdk.items.runes.Ber],
						temp: [sdk.items.gems.Perfect.Ruby],
						useSocketQuest: true,
						condition: (item) => item.set && !item.ethereal
					},
					{
						classid: sdk.items.SwirlingCrystal,
						socketWith: [sdk.items.runes.Ist], // would a 5/5 facet be better?
						useSocketQuest: false,
						condition: (item) => item.set && !item.ethereal
					}
				);

			Check.itemSockables(sdk.items.LacqueredPlate, "set", "Tal Rasha's Guardianship");
			Check.itemSockables(sdk.items.DeathMask, "set", "Tal Rasha's Horadric Crest");

			break;
		default:
			break;
		}

		// Go ahead and keep two P-diamonds prior to finding a moser's unless already using a better shield
		if (!Check.haveItem("shield", "unique", "Moser's Blessed Circle") && (!Check.haveItem("shield", "runeword", "Sanctuary") || !Check.haveItem("shield", "runeword", "Spirit"))) {
			NTIP.addLine("[name] == perfectdiamond # # [maxquantity] == 2");

			if (Item.getQuantityOwned(me.getItem(sdk.items.gems.Perfect.Diamond) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
			}
		}

		Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");

		// Sanctuary
		if (!Check.haveItem("shield", "runeword", "Sanctuary") && !Check.haveItem("shield", "runeword", "Spirit") && ["Blova", "Lightning"].indexOf(SetUp.currentBuild) === -1) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Sanctuary.js")) {
				include("SoloPlay/BuildFiles/Runewords/Sanctuary.js");
			}
		}

		// Call to Arms
		if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js")) {
				include("SoloPlay/BuildFiles/Runewords/CallToArms.js");
			}
		}

		// Spirit Sword
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(4).tier < 777) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js")) {
				include("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
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
		if (Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
				include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
			}
		}

		// Bone
		if (Item.getEquippedItem(3).tier < 450) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Bone.js")) {
				include("SoloPlay/BuildFiles/Runewords/Bone.js");
			}
		}

		// Merc Treachery
		if (Item.getEquippedItemMerc(3).tier < 15000) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js")) {
				include("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
			}
		}

		// Smoke
		if (Item.getEquippedItem(3).tier < 300) {
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
