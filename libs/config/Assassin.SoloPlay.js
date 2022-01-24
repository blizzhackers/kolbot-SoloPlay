/*
*	@filename	Assassin.SoloPlay.js
*	@author		theBGuy
*	@credit		isid0re
*	@desc		Config Settings for SoloPlay Assassin
*
*	FinalBuild choices
*		To select your finalbuild.
*		1. Go into the D2BS console manager.
*		2. Select the Bots profile
*		3. In the info tag box enter one of the following choices:
*			Trapsin
*		4. Save the profile and start
*/

function LoadConfig () {
	if (!isIncluded("SoloPlay/Functions/MiscOverrides.js")) { include("SoloPlay/Functions/MiscOverrides.js"); }
	if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }

	SetUp.include();

	/* Script */
	Scripts.UserAddon = false;
	Scripts.SoloPlay = true;

	/* Level Specifc Settings */
	Config.respecOne = 32;
	Config.respecOneB = 0;
	Config.levelCap = (function() {
		let tmpCap;
		if (me.softcore) {
			tmpCap = [33, 65, 100];
		} else {
			tmpCap = [33, 65, 100];
		}
		return tmpCap[me.diff];
	})();

	/* General configuration. */
	Config.MinGameTime = 400;
	Config.MaxGameTime = 7200;
	Config.MiniShopBot = true;
	Config.PacketShopping = true;
	Config.TownCheck = true;
	Config.LogExperience = false;
	Config.PingQuit = [{Ping: 600, Duration: 10}];
	Config.Silence = true;
	Config.OpenChests = me.hell ? 2 : true;
	Config.LowGold = me.normal ? 25000 : me.nightmare ? 50000 : 100000;
	Config.PrimarySlot = 0;
	Config.PacketCasting = 1;
	Config.WaypointMenu = true;
	Config.Cubing = !!me.getItem(sdk.items.quest.Cube);
	Config.MakeRunewords = true;

	/* General logging. */
	Config.ItemInfo = false;
	Config.LogKeys = false;
	Config.LogOrgans = false;
	Config.LogMiddleRunes = true;
	Config.LogHighRunes = true;
	Config.ShowCubingInfo = true;

	/* DClone. */
	Config.StopOnDClone = true; // Go to town and idle as soon as Diablo walks the Earth
	Config.SoJWaitTime = 5; 	// Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
	Config.KillDclone = true;
	Config.DCloneQuit = false; 	// 1 = quit when Diablo walks, 2 = quit on soj sales, false = disabled

	/* Town configuration. */
	Config.HealHP = 99;
	Config.HealMP = 99;
	Config.HealStatus = true;
	Config.UseMerc = true;
	Config.MercWatch = true;
	Config.StashGold = me.charlvl * 100;
	Config.ClearInvOnStart = false;

	/* Chicken configuration. */
	Config.LifeChicken = me.hardcore ? 45 : 10;
	Config.ManaChicken = 0;
	Config.MercChicken = 0;
	Config.TownHP = me.hardcore ? 0 : Config.TownCheck ? 35 : 0;
	Config.TownMP = 0;

	/* Potions configuration. */
	Config.UseHP = me.hardcore ? 90 : 75;
	Config.UseRejuvHP = me.hardcore ? 65 : 40;
	Config.UseMP = me.hardcore ? 75 : 55;
	Config.UseMercHP = 75;
	Config.HPBuffer = 0;
	Config.MPBuffer = 0;
	Config.RejuvBuffer = 0;

	/* Belt configuration. */
	Config.BeltColumn = ["hp", "mp", "mp", "rv"];
	Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
	Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
	Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
	Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;

	/* Inventory buffers and lock configuration. */
	Config.HPBuffer = 0;
	Config.MPBuffer = 0;
	Config.RejuvBuffer = 4;
	Config.Inventory[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	Config.Inventory[1] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	Config.Inventory[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	Config.Inventory[3] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

	/* Pickit configuration. */
	Config.PickRange = 40;
	Config.FastPick = false;
	Config.CainID.Enable = false;
	Config.FieldID = false;
	//	Config.PickitFiles.push("kolton.nip");
	//	Config.PickitFiles.push("LLD.nip");
	NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

	/* Gambling configuration. */
	Config.Gamble = true;
	Config.GambleGoldStart = 2000000;
	Config.GambleGoldStop = 750000;
	Config.GambleItems.push("Amulet");
	Config.GambleItems.push("Ring");
	//Config.GambleItems.push("Circlet");
	//Config.GambleItems.push("Coronet");

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
		//weapon
		"([type] == knife || [type] == sword && [flag] == runeword || ([type] == handtohand || [type] == assassinclaw) && [quality] >= magic) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//Helmet
		"([type] == helm || [type] == circlet) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//boots
		"[type] == boots && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//armor
		"[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//shield
		"[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//gloves
		"[type] == gloves && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//ammy
		"[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//rings
		"[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//Switch
		"[type] == wand && [quality] >= normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
		//Charms
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		//Special Charms
		"[name] == smallcharm && [quality] == unique # [itemallskills] == 1 # [charmtier] == 100000",
		"[name] == largecharm && [quality] == unique # [itemaddclassskills] == 3 # [charmtier] == 100000",
		"[name] == grandcharm && [quality] == unique # [itemmagicbonus] >= 30 || [itemgoldbonus] >= 150 # [charmtier] == 100000",
		//merc
		"([type] == circlet || [type] == helm) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"[type] == armor && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"me.charlvl > 14 && ([type] == polearm || [type] == spear) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
	];

	NTIP.arrayLooping(levelingTiers);
	NTIP.arrayLooping(nipItems.Gems);

	/* FastMod configuration. */
	Config.FCR = 255;
	Config.FHR = 255;
	Config.FBR = 255;
	Config.IAS = me.realm ? 0 : 255;

	/* Attack configuration. */
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [0, 0];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal ? true : false;
	Config.ClearType = 0;
	Config.ClearPath = { Range: 30, Spectype: 0xF };

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipEnchant = [];
	Config.SkipAura = [];

	/* Shrine scan configuration. */
	Config.ScanShrines = [15, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];

	/* AutoStat configuration. */
	Config.AutoStat.Enabled = true;
	Config.AutoStat.Save = 0;
	Config.AutoStat.BlockChance = 57;
	Config.AutoStat.UseBulk = true;
	Config.AutoStat.Build = SetUp.specPush("stats");

	/* AutoSkill configuration. */
	Config.AutoSkill.Enabled = true;
	Config.AutoSkill.Save = 0;
	Config.AutoSkill.Build = SetUp.specPush("skills");

	/* AutoBuild configuration. */
	Config.AutoBuild.Enabled = true;
	Config.AutoBuild.Verbose = false;
	Config.AutoBuild.DebugMode = false;
	Config.AutoBuild.Template = SetUp.getBuild();

	/* Class specific configuration. */
	Config.UseTraps = true;
	Config.Traps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
	Config.BossTraps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry];

	Config.SummonShadow = me.getSkill(sdk.skills.ShadowMaster, 0) ? "Master" : 0;
	Config.UseFade = !!me.getSkill(sdk.skills.Fade, 0);
	Config.UseBoS = !!me.getSkill(sdk.skills.BurstofSpeed, 0);
	Config.UseVenom = false;
	Config.UseCloakofShadows = !!me.getSkill(sdk.skills.CloakofShadows, 0);
	Config.AggressiveCloak = false;

	/* Dodge configuration. */
	Config.Dodge = !!me.getSkill(sdk.skills.LightningSentry, 0);
	Config.DodgeRange = 10;

	/* Gear */
	let finalGear = Check.finalBuild().finalGear;
	!!finalGear && NTIP.arrayLooping(finalGear);

	Config.imbueables = [
		{name: sdk.items.Claws, condition: (me.normal)},
		{name: sdk.items.HandScythe, condition: (!me.normal && Item.getEquippedItem(4).tier < 777 && (me.trueStr < 79 || me.trueDex < 79))},
		{name: sdk.items.GreaterTalons, condition: (Item.getEquippedItem(4).tier < 777 && me.trueStr >= 79 && me.trueDex >= 79)},
		{name: sdk.items.Belt, condition: (me.normal && (Item.getEquippedItem(4).tier > 777))},
		{name: sdk.items.MeshBelt, condition: (!me.normal && me.charlvl < 46 && me.trueStr > 58 && (Item.getEquippedItem(4).tier > 777))},
		{name: sdk.items.SpiderwebSash, condition: (!me.normal && me.trueStr > 50 && (Item.getEquippedItem(4).tier > 777))},
	].filter(function (item) { return !!item.condition; });

	let imbueArr = (function () {
		let temp = [];
		for (let imbueItem of Config.imbueables) {
			try {
				if (imbueItem.condition) {
					temp.push("[name] == " + imbueItem.name + " && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [Sockets] == 0 # [maxquantity] == 1");
				}
			} catch (e) {
				print(e);
			}
		}
		return temp;
	})();

	!me.smith && NTIP.arrayLooping(imbueArr);

	if (Check.haveItemAndNotSocketed("shield", "unique", "Moser's Blessed Circle")) {
		NTIP.addLine("[name] == perfectdiamond # # [maxquantity] == 2");

		if (Item.getQuantityOwned(me.getItem(sdk.items.gems.Perfect.Diamond) < 2)) {
			Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
		}

		if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Um) < 2)) {
			Config.Recipes.push([Recipe.Rune, "PulRune"]);
		}

		NTIP.addLine("[name] == UmRune # # [maxquantity] == 2");
	}

	if (Check.haveItemAndNotSocketed("helm", "unique", "Harlequin Crest")) {
		if (!me.getItem(sdk.items.runes.Um)) {
			Config.Recipes.push([Recipe.Rune, "PulRune"]);
		}

		NTIP.addLine("[name] == UmRune # # [maxquantity] == 1");
	}

	/* Crafting */
	if (Item.getEquippedItem(sdk.body.Neck).tier < 100000) {
		Config.Recipes.push([Recipe.Caster.Amulet]);
	}

	if (Item.getEquippedItem(sdk.body.RingLeft).tier < 100000) {
		Config.Recipes.push([Recipe.Caster.Ring]);
	}

	let helm = Item.getEquippedItem(1);
	let body = Item.getEquippedItem(3);
	let wep = Item.getEquippedItem(4);
	let shield = Item.getEquippedItem(5);

	if (!helm.isRuneword && [4, 6].indexOf(helm.quality) > -1 && helm.sockets > 0 && !helm.socketed) {
		if (Item.getQuantityOwned(me.getItem(sdk.items.gems.Perfect.Ruby) < 2)) {
			Config.Recipes.push([Recipe.Gem, "flawlessruby"]);
		}
	}

	if (!body.isRuneword && [4, 6].indexOf(body.quality) > -1 && body.sockets > 0 && !body.socketed) {
		if (Item.getQuantityOwned(me.getItem(sdk.items.gems.Perfect.Ruby) < 2)) {
			Config.Recipes.push([Recipe.Gem, "flawlessruby"]);
		}
	}

	// Tir Rune - Mana after kill
	// Shael Rune - 20 IAS
	if (!wep.isRuneword && [4, 6].indexOf(wep.quality) > -1 && wep.sockets > 0 && !wep.socketed) {
		me.normal ? NTIP.addLine("[name] == TirRune # # [maxquantity] == " + wep.sockets) : NTIP.addLine("[name] == ShaelRune # # [maxquantity] == " + wep.sockets);
	}

	if (!shield.isRuneword && [4, 6].indexOf(shield.quality) > -1 && shield.sockets > 0 && !shield.socketed) {
		if (Item.getQuantityOwned(me.getItem(sdk.items.gems.Perfect.Diamond) < 2)) {
			Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
		}
	}

	// Infinity
	if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).prefixnum !== sdk.locale.items.Infinity) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js")) {
			include("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
		}
	}

	// Call to Arms
	if (!Check.haveItem("dontcare", "runeword", "Call to Arms")) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js")) {
			include("SoloPlay/BuildFiles/Runewords/CallToArms.js");
		}
	}

	// Heart of the Oak
	if (!Check.haveItem("mace", "runeword", "Heart of the Oak")) {
		if (!isIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js")) {
			include("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
		}
	}

	// Enigma
	if (!Check.haveItem("armor", "runeword", "Enigma")) {
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

	// Spirit shield
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
}
