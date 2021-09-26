/*
*	@filename	Necromancer.SoloPlay.js
*	@author		isid0re, theBGuy
*	@desc		Config Settings for SoloPlay Necromancer
*
*	FinalBuild choices
*		To select your finalbuild.
*		1. Go into the D2BS console manager.
*		2. Select the Bots profile
*		3. In the info tag box enter one of the following choices:
*			Bone
*			Poison
*			Summon
*		4. Save the profile and start
*/

function LoadConfig () {
	if (!isIncluded("common/Storage.js")) {
		include("common/Storage.js");
	}

	if (!isIncluded("common/Misc.js")) {
		include("common/Misc.js");
	}

	if (!isIncluded("NTItemParser.dbl")) {
		include("NTItemParser.dbl");
	}

	if (!isIncluded("SoloPlay/Functions/globals.js")) {
		include("SoloPlay/Functions/globals.js");
	}

	SetUp.include();

	/* Script */
	Scripts.UserAddon = false;
	Scripts.SoloPlay = true;

	/* General configuration. */
	Config.MinGameTime = 400;
	Config.MaxGameTime = 7200;
	Config.MiniShopBot = true;
	Config.PacketShopping = true;
	Config.TownCheck = me.findItem("tbk", 0, 3);
	Config.LogExperience = false;
	Config.PingQuit = [{Ping: 600, Duration: 10}];
	Config.Silence = true;
	Config.OpenChests = me.hell ? 2 : true;
	Config.LowGold = me.normal ? 25000 : me.nightmare ? 50000 : 100000;
	Config.PrimarySlot = 0;
	Config.PacketCasting = 1;
	Config.WaypointMenu = true;
	Config.Cubing = !me.classic ? me.getItem(sdk.items.quest.Cube) : false;
	Config.MakeRunewords = !me.classic ? true : false;

	/* DClone. */
	Config.StopOnDClone = true; // Go to town and idle as soon as Diablo walks the Earth
	Config.SoJWaitTime = 5; 	// Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
	Config.KillDclone = true;
	Config.DCloneQuit = false; 	// 1 = quit when Diablo walks, 2 = quit on soj sales, false = disabled

	/* General logging. */
	Config.ItemInfo = false;
	Config.LogKeys = false;
	Config.LogOrgans = false;
	Config.LogMiddleRunes = true;
	Config.LogHighRunes = true;
	Config.ShowCubingInfo = true;

	/* Town configuration. */
	Config.HealHP = 99;
	Config.HealMP = 99;
	Config.HealStatus = true;
	Config.UseMerc = true;
	Config.MercWatch = true;
	Config.StashGold = me.charlvl * 100;
	Config.ClearInvOnStart = false;

	/* Chicken configuration. */
	Config.LifeChicken = me.playertype ? 45 : 10;
	Config.ManaChicken = 0;
	Config.MercChicken = 0;
	Config.IronGolemChicken = 30;
	Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
	Config.TownMP = 0;

	/* Potions configuration. */
	Config.UseHP = me.playertype ? 90 : 75;
	Config.UseRejuvHP = me.playertype ? 65 : 40;
	Config.UseMP = me.playertype ? 75 : 55;
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

	/* Gambling configuration. */
	Config.Gamble = true;
	Config.GambleGoldStart = 2000000;
	Config.GambleGoldStop = 750000;
	Config.GambleItems.push("Amulet");
	//Config.GambleItems.push("Ring");
	Config.GambleItems.push("Circlet");
	Config.GambleItems.push("Coronet");

	/* AutoMule configuration. */
	Config.AutoMule.Trigger = [];
	Config.AutoMule.Force = [];
	Config.AutoMule.Exclude = [
		"[name] >= Elrune && [name] <= Lemrune",
		"[name] == mephisto'ssoulstone",
		"[name] == hellforgehammer",
		"[name] == scrollofinifuss",
		"[name] == keytothecairnstones",
		"[name] == bookofskill",
		"[name] == horadriccube",
		"[name] == shaftofthehoradricstaff",
		"[name] == topofthehoradricstaff",
		"[name] == horadricstaff",
		"[name] == ajadefigurine",
		"[name] == thegoldenbird",
		"[name] == potionoflife",
		"[name] == lamesen'stome",
		"[name] == khalim'seye",
		"[name] == khalim'sheart",
		"[name] == khalim'sbrain",
		"[name] == khalim'sflail",
		"[name] == khalim'swill",
		"[name] == scrollofresistance",
	];

	/* AutoEquip configuration. */
	Config.AutoEquip = true;

	// AutoEquip setup
	var levelingTiers = [
		// Weapon
		"([type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		"[type] == wand && [quality] >= normal && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 && [sockets] != 2 # [tier] == tierscore(item)",
		// Helmet
		"([type] == helm || [type] == circlet) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Belt
		"[type] == belt && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Boots
		"[type] == boots && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Armor
		"[type] == armor && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Shield
		"([type] == shield && ([quality] >= magic || [flag] == runeword) || [type] == voodooheads) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Gloves
		"[type] == gloves && [quality] >= magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Amulet
		"[type] == amulet && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		// Rings
		"[type] == ring && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
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
		"me.charlvl > 14 && ([type] == polearm || [type] == spear) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
	];

	var imbueableClassItems = [
		"me.diff == 0 && [name] == demonhead && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1",
		"me.diff == 1 && [name] == hierophanttrophy && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1",
		"me.diff == 2 && [name] == bloodlordskull && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1",
	];

	var imbueableBelts = [
		"me.diff == 0 && [name] == platedbelt && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [maxquantity] == 1",
		"me.diff == 1 && [name] == warbelt && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [maxquantity] == 1",
		"me.diff == 2 && [name] == mithrilcoil && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [maxquantity] == 1",
	];

	NTIP.arrayLooping(levelingTiers);
	NTIP.arrayLooping(nipItems.Gems);

	if (!me.smith) {
		if (Item.getEquippedItem(5).tier < 1000) {
			NTIP.arrayLooping(imbueableClassItems);
		} else {
			NTIP.arrayLooping(imbueableBelts);
		}
	}

	/* FastMod configuration. */
	Config.FCR = 255;
	Config.FHR = 255;
	Config.FBR = 255;
	Config.IAS = me.realm ? 0 : 255;

	/* Attack configuration. */
	Skill.usePvpRange = true;
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [0, 0];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal ? true : false;
	Config.ClearType = 0;
	Config.ClearPath = {
		Range: 30,
		Spectype: 0xF,
	};

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
	Config.Dodge = Check.haveItem("armor", "runeword", "Enigma");
	Config.DodgeRange = Check.haveItem("armor", "runeword", "Enigma") ? 10 : 5;
	Config.DodgeHP = 90; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.

	/* Curses. */ 
	Config.Curse[0] = -1; // Boss curse.
	Config.Curse[1] = -1; // Other monsters curse.

	/* Summons. */
	Config.ReviveUnstackable = true;
	Config.ActiveSummon = me.charlvl < 10 || SetUp.currentBuild === "Summon";
	Config.Golem = me.getSkill(sdk.skills.ClayGolem, 0) ? "Clay" : "None";
	Config.Skeletons = (me.charlvl > 10 && SetUp.currentBuild !== "Summon") ? 0 : "max";
	Config.SkeletonMages = (me.charlvl > 10 && SetUp.currentBuild !== "Summon") ? 0 : "max";
	Config.Revives = (me.charlvl > 10 && SetUp.currentBuild !== "Summon") ? 0 : "max";

	/* Skill Specific */
	Config.PoisonNovaDelay = 1;		// In Seconds
	Config.ExplodeCorpses = me.getSkill(sdk.skills.CorpseExplosion, 0) ? sdk.skills.CorpseExplosion : me.getSkill(sdk.skills.PoisonExplosion, 0) ? sdk.skills.PoisonExplosion : 0;

	/* LOD gear */
	if (!me.classic) {
		let finalGear = Check.finalBuild().finalGear;
		NTIP.arrayLooping(finalGear);
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

		if (Check.haveItemAndNotSocketed("shield", "unique", "Moser's Blessed Circle")) {
			NTIP.addLine("[name] == perfectdiamond # # [maxquantity] == 2");

			if (Item.getQuantityOwned(me.getItem(sdk.gems.Perfect.Diamond) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
			}

			if (Item.getQuantityOwned(me.getItem(sdk.runes.Um) < 2)) {
				Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
			}

			NTIP.addLine("[name] == UmRune # # [maxquantity] == 2");
		}

		if (Check.haveItemAndNotSocketed("helm", "unique", "Harlequin Crest")) {
			if (!me.getItem(sdk.runes.Um)) {
				Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
			}

			NTIP.addLine("[name] == UmRune # # [maxquantity] == 1");
		}

		let helm = Item.getEquippedItem(1);
		let body = Item.getEquippedItem(3);
		let wep = Item.getEquippedItem(4);
		let shield = Item.getEquippedItem(5);

		if (!helm.isRuneword && [4, 6].indexOf(helm.quality) > -1 && helm.sockets > 0 && !helm.socketed) {
			if (Item.getQuantityOwned(me.getItem(sdk.gems.Perfect.Ruby) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessruby"]);
			}
		}

		if (!body.isRuneword && [4, 6].indexOf(body.quality) > -1 && body.sockets > 0 && !body.socketed) {
			if (Item.getQuantityOwned(me.getItem(sdk.gems.Perfect.Ruby) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessruby"]);
			}
		}

		// Tir Rune - Mana after kill
		// Io Rune - 10 to vitality
		if (!wep.isRuneword && [4, 6].indexOf(wep.quality) > -1 && wep.sockets > 0 && !wep.socketed) {
			switch (wep.sockets) {
			case 1:
				if (me.normal) {
					NTIP.addLine("[name] == TirRune # # [maxquantity] == 1");
				} else {
					NTIP.addLine("[name] == IoRune # # [maxquantity] == 1");
				}

				break;
			case 2:
				if (me.normal) {
					NTIP.addLine("[name] == TirRune # # [maxquantity] == 2");
				} else {
					NTIP.addLine("[name] == IoRune # # [maxquantity] == 2");
				}

				break;
			case 3:
				if (me.normal) {
					NTIP.addLine("[name] == TirRune # # [maxquantity] == 3");
				} else {
					NTIP.addLine("[name] == IoRune # # [maxquantity] == 3");
				}

				break;
			}
		}

		if (!shield.isRuneword && [4, 6].indexOf(shield.quality) > -1 && shield.sockets > 0 && !shield.socketed) {
			if (Item.getQuantityOwned(me.getItem(sdk.gems.Perfect.Diamond) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
			}
		}

		// Call to Arms
		if (!Check.haveItem("sword", "runeword", "Call To Arms")) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js")) {
				include("SoloPlay/BuildFiles/Runewords/CallToArms.js");
			}
		}

		// White
		if (SetUp.currentBuild !== "Summon") {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/White.js")) {
				include("SoloPlay/BuildFiles/Runewords/White.js");
			}
		}

		// Rhyme
		if (Item.getEquippedItem(5).tier < 650) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Rhyme.js")) {
				include("SoloPlay/BuildFiles/Runewords/Rhyme.js");
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

		if (!Check.haveItem("armor", "runeword", "Enigma") && !Check.haveItem("armor", "runeword", "Bone") && Item.getEquippedItem(3).tier < 650) {
			if (!isIncluded("SoloPlay/BuildFiles/Runewords/Bone.js")) {
				include("SoloPlay/BuildFiles/Runewords/Bone.js");
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
}
