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
	Config.UseHP = me.hardcore ? 90 : 80;
	Config.UseRejuvHP = me.hardcore ? 65 : 50;
	Config.UseMP = me.hardcore ? 75 : 65;
	Config.UseMercHP = 75;

	/* Belt configuration. */
	Config.BeltColumn = ["hp", "mp", "mp", "rv"];
	SetUp.belt();

	/* Pickit configuration. */
	Config.PickRange = 40;
	// Config.PickitFiles.push("kolton.nip");
	// Config.PickitFiles.push("test.nip");

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
	const levelingTiers = [
		// Weapon
		"me.normal && [type] == orb && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"me.charlvl > 1 && ([type] == orb || [type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"me.classic && [type] == staff && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == circlet) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"me.normal && [type] == belt && [quality] >= lowquality && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
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

	const expansionTiers = [
		// Switch
		"[type] == wand && [quality] >= Normal # [itemchargedskill] == 72 # [secondarytier] == 25000",								// Weaken charged wand
		"[type] == wand && [quality] >= Normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
		// Charms
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"me.charlvl < 40 && [name] == smallcharm && [quality] == magic ## [invoquantity] == 4 && [charmtier] == charmscore(item)",
		"[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
	];

	if (SetUp.currentBuild !== "Start") {
		NTIP.addLine("([type] == orb || [type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] == ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)");
	}

	NTIP.arrayLooping(levelingTiers);
	me.expansion && NTIP.arrayLooping(expansionTiers);

	/* Attack configuration. */
	Skill.usePvpRange = true;
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [-1, -1];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = false;
	Config.ClearType = 0;
	Config.ClearPath = {Range: 30, Spectype: (me.hell && Pather.canTeleport() ? 0xF : 0)};

	/* Monster skip configuration. */
	Pather.canTeleport() && me.lightRes < 75 && Config.SkipEnchant.push("lightning enchanted");

	/* Class specific configuration. */
	Config.UseTelekinesis = true; // use telekinesis if have skill
	Config.UseColdArmor = true;
	Config.Dodge = !!(me.charlvl >= CharInfo.respecOne); // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
	Config.DodgeRange = 15; // Distance to keep from monsters.
	Config.DodgeHP = me.hardcore ? 90 : 75; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
	Config.TeleStomp = false; // Use merc to attack bosses if they're immune to attacks, but not to physical damage
	Config.CastStatic = me.classic ? 15 : [25, 33, 50][me.diff];

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.arrayLooping(finalGear);

	Config.imbueables = [
		{name: sdk.items.JaredsStone, condition: () => (me.normal && me.expansion)},
		{name: sdk.items.SwirlingCrystal, condition: () => (!me.normal && me.charlvl < 66 && me.expansion)},
		{name: sdk.items.DimensionalShard, condition: () => (Item.getEquipped(sdk.body.RightArm).tier < 777 && me.expansion)},
		{name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquipped(sdk.body.RightArm).tier > 777 || me.classic))},
		{name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquipped(sdk.body.RightArm).tier > 777 || me.classic))},
		{name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquipped(sdk.body.RightArm).tier > 777 || me.classic))},
	].filter((item) => item.condition());

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.arrayLooping(imbueArr);

	switch (me.gametype) {
	case sdk.game.gametype.Classic:
		// Res shield
		if ((Item.getEquipped(sdk.body.LeftArm).tier < 487 && !Item.getEquipped(sdk.body.RightArm).twoHanded) || (Item.getEquipped(sdk.body.RightArm).tier < 487 && Item.getEquipped(sdk.body.RightArm).twoHanded)) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/PDiamondShield.js");
		}

		break;
	case sdk.game.gametype.Expansion:
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");
		const { basicSocketables, addSocketableObj } = require("../Utils/General");

		/* Crafting */
		if (Item.getEquipped(sdk.body.Neck).tier < 100000) {
			Config.Recipes.push([Recipe.Caster.Amulet]);
		}

		if (Item.getEquipped(sdk.body.Gloves).tier < 110000) {
			Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
			["Blova", "Lightning"].includes(SetUp.finalBuild) && Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
		}

		Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);

		// FinalBuild specific setup
		switch (SetUp.finalBuild) {
		case "Blova":
		case "Lightning":
			// Infinity
			if ((me.ladder || Developer.addLadderRW) && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
				includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
			}

			// Spirit Shield
			if ((me.ladder || Developer.addLadderRW) && SetUp.currentBuild === SetUp.finalBuild && (Item.getEquipped(sdk.body.LeftArm).tier < 1000 || Item.getEquipped(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
				includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
			}

			// Chains of Honor
			if (!me.checkItem({name: sdk.locale.items.ChainsofHonor}).have) {
				includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
			}

			// Heart of the Oak
			if (!me.checkItem({name: sdk.locale.items.HeartoftheOak}).have) {
				includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
			}

			Config.socketables.push(addSocketableObj(sdk.items.Monarch, [], [],
				!me.hell, (item) => !Check.haveBase("monarch", 4) && item.ilvl >= 41 && item.isBaseType && !item.ethereal
			));
			Config.socketables.push(addSocketableObj(sdk.items.Shako, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
				true, (item) => item.unique && !item.ethereal
			));

			Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

			break;
		case "Meteorb":
		case "Cold":
		case "Blizzballer":
			Config.socketables.push(addSocketableObj(sdk.items.DeathMask, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
				true, (item) => item.set && !item.ethereal
			));
			Config.socketables.push(addSocketableObj(sdk.items.LacqueredPlate, [sdk.items.runes.Ber], [sdk.items.gems.Perfect.Ruby],
				true, (item) => item.set && !item.ethereal
			));
			Config.socketables.push(addSocketableObj(sdk.items.SwirlingCrystal, [sdk.items.runes.Ist], [],
				false, (item) => item.set && !item.ethereal
			));

			Check.itemSockables(sdk.items.LacqueredPlate, "set", "Tal Rasha's Guardianship");
			Check.itemSockables(sdk.items.DeathMask, "set", "Tal Rasha's Horadric Crest");

			break;
		default:
			break;
		}

		// Go ahead and keep two P-diamonds prior to finding a moser's unless already using a better shield
		if (!Check.haveItem("shield", "unique", "Moser's Blessed Circle") && !me.haveSome([{name: sdk.locale.items.Sanctuary}, {name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Shield}])) {
			NTIP.addLine("[name] == perfectdiamond # # [maxquantity] == 2");

			if (Item.getQuantityOwned(me.getItem(sdk.items.gems.Perfect.Diamond)) < 2) {
				Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
			}
		}

		Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");

		// Sanctuary
		if (!me.haveSome([{name: sdk.locale.items.Sanctuary}, {name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Shield}]) && ["Blova", "Lightning"].indexOf(SetUp.currentBuild) === -1) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Sanctuary.js");
		}

		// Call to Arms
		if (!me.checkItem({name: sdk.locale.items.CalltoArms}).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
		}

		// Spirit Sword
		if ((me.ladder || Developer.addLadderRW) && Item.getEquipped(sdk.body.RightArm).tier < 777) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
		}

		// Merc Insight
		if ((me.ladder || Developer.addLadderRW) && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
		}

		// Lore
		if (Item.getEquipped(sdk.body.Head).tier < 315) {
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

		// Bone
		if (Item.getEquipped(sdk.body.Armor).tier < 450) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Bone.js");
		}

		// Merc Treachery
		if (Item.getMercEquipped(sdk.body.Armor).tier < 15000) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
		}

		// Smoke
		if (Item.getEquipped(sdk.body.Armor).tier < 300) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js");
		}

		// Stealth
		if (Item.getEquipped(sdk.body.Armor).tier < 233) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js");
		}

		SoloWants.buildList();

		break;
	}

	return true;
})();
