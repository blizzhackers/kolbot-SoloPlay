/**
*  @filename    Necromancer.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Necromancer
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Bone
*        Poison
*        Summon
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
	Config.IronGolemChicken = 30;
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
	const levelingTiers = [
		// Weapon
		"([type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[type] == wand && [quality] >= normal && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 && [sockets] != 2 # [tier] == tierscore(item)",
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
		"([type] == shield && ([quality] >= magic || [flag] == runeword) || [type] == voodooheads) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[type] == voodooheads && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && [sockets] == 1 # [tier] == tierscore(item)",
		"me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Gloves
		"[type] == gloves && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Amulet
		"[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Rings
		"[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
	];

	const expansionTiers = [
		"me.charlvl < 33 && [name] == smallcharm && [quality] == magic # [maxmana] >= 1 # [invoquantity] == 4 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
	];

	NTIP.buildList(levelingTiers);
	me.expansion && NTIP.buildList(expansionTiers);

	/* Attack configuration. */
	Skill.usePvpRange = true;
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [0, 0];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal;
	Config.ClearType = 0;
	Config.ClearPath = { Range: (Pather.canTeleport() ? 30 : 20), Spectype: 0 };

	/* Class specific configuration. */
	Config.Dodge = Check.haveItem("armor", "runeword", "Enigma");
	Config.DodgeRange = Check.haveItem("armor", "runeword", "Enigma") ? 10 : 5;
	Config.DodgeHP = 90; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.

	/* Summons. */
	Config.ReviveUnstackable = true;
	Config.ActiveSummon = me.charlvl < 10 || SetUp.currentBuild === "Summon";
	Config.Golem = me.checkSkill(sdk.skills.ClayGolem, sdk.skills.subindex.HardPoints) ? "Clay" : "None";
	Config.Skeletons = (me.charlvl > 10 && SetUp.currentBuild !== "Summon") ? 0 : "max";
	Config.SkeletonMages = (me.charlvl > 10 && SetUp.currentBuild !== "Summon") ? 0 : "max";
	Config.Revives = (me.charlvl > 10 && SetUp.currentBuild !== "Summon") ? 0 : "max";

	/* Skill Specific */
	Config.PoisonNovaDelay = 1;		// In Seconds
	Config.ExplodeCorpses = me.checkSkill(sdk.skills.CorpseExplosion, sdk.skills.subindex.HardPoints) ? sdk.skills.CorpseExplosion : me.checkSkill(sdk.skills.PoisonExplosion, sdk.skills.subindex.HardPoints) ? sdk.skills.PoisonExplosion : 0;

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.buildList(finalGear);
	NTIP.buildFinalGear(finalGear);

	Config.imbueables = [
		{ name: sdk.items.DemonHead, condition: () => (me.normal && me.expansion) },
		{ name: sdk.items.HierophantTrophy, condition: () => (!me.normal && (me.charlvl < 66 || me.trueStr < 106) && me.expansion) },
		{ name: sdk.items.BloodlordSkull, condition: () => (Item.getEquipped(sdk.body.LeftArm).tier < 1000 && me.expansion) },
		{ name: sdk.items.Belt, condition: () => (me.normal && (Item.getEquipped(sdk.body.LeftArm).tier > 1000 || me.classic)) },
		{ name: sdk.items.MeshBelt, condition: () => (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquipped(sdk.body.LeftArm).tier > 1000 || me.classic)) },
		{ name: sdk.items.SpiderwebSash, condition: () => (!me.normal && me.trueStr > 50 && (Item.getEquipped(sdk.body.LeftArm).tier > 1000 || me.classic)) },
	].filter((item) => item.condition());

	let imbueArr = SetUp.imbueItems();

	!me.smith && NTIP.buildList(imbueArr);

	switch (me.gametype) {
	case sdk.game.gametype.Classic:
		// Res shield
		if (Item.getEquipped(sdk.body.LeftArm).tier < 487) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/PDiamondShield.js");
		}

		break;
	case sdk.game.gametype.Expansion:
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");
		const { basicSocketables, addSocketableObj } = require("../Utils/General");

		Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);
		Config.socketables.push(addSocketableObj(sdk.items.Monarch, [], [],
			!me.hell, (item) => !Check.haveBase("monarch", 4) && item.ilvl >= 41 && item.isBaseType && !item.ethereal
		));
		Config.socketables.push(addSocketableObj(sdk.items.Shako, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
			true, (item) => item.unique && !item.ethereal
		));

		/* Crafting */
		if (Item.getEquipped(sdk.body.Neck).tier < 100000) {
			Config.Recipes.push([Recipe.Caster.Amulet]);
		}

		// upgrade magefist
		if (Item.getEquipped(sdk.body.Gloves).tier < 110000) {
			Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
			Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
		}

		Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
		Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

		/* Crafting */
		if (Item.getEquipped(sdk.body.Neck).tier < 100000) {
			Config.Recipes.push([Recipe.Caster.Amulet]);
		}

		if (Item.getEquipped(sdk.body.RingLeft).tier < 100000) {
			Config.Recipes.push([Recipe.Caster.Ring]);
		}

		// Call to Arms
		if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
		}

		// White
		if (SetUp.currentBuild !== "Summon") {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/White.js");
		}

		// Rhyme
		if (Item.getEquipped(sdk.body.LeftArm).tier < 650) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Rhyme.js");
		}
			
		// Enigma
		if (!me.checkItem({ name: sdk.locale.items.Enigma }).have) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js");
		}

		// Spirit Sword
		if ((me.ladder || Developer.addLadderRW) && Item.getEquipped(sdk.body.RightArm).tier < 777) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
		}

		// Spirit shield
		if ((me.ladder || Developer.addLadderRW) && (Item.getEquipped(sdk.body.LeftArm).tier < 1000 || Item.getEquipped(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
		}

		// Merc Insight
		if ((me.ladder || Developer.addLadderRW) && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
		}

		if (!me.haveSome([{ name: sdk.locale.items.Enigma }, { name: sdk.locale.items.Bone }]) && Item.getEquipped(sdk.body.Armor).tier < 650) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Bone.js");
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

		// Merc Treachery
		if (Item.getMercEquipped(sdk.body.Armor).tier < 15000) {
			includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
		}

		// Smoke
		if (Item.getEquipped(sdk.body.Armor).tier < 450) {
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
