/*
*	@filename	Druid.SoloPlay.js
*	@author		isid0re, theBGuy
*	@desc		Config Settings for SoloPlay Druid
*
*	FinalBuild choices
*		To select your finalbuild.
*		1. Go into the D2BS console manager.
*		2. Select the Bots profile
*		3. In the info tag box enter one of the following choices:
*			Wind
*			Elemental
*			Wolf
*			Plaguewolf
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
	Config.Cubing = !me.classic ? me.getItem(sdk.quest.cube) : false;
	Config.MakeRunewords = !me.classic ? true : false;

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
	Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
	Config.TownMP = 0;

	/* Potions configuration. */
	Config.UseHP = me.playertype ? 90 : 75;
	Config.UseRejuvHP = me.playertype ? 65 : 40;
	Config.UseMP = me.playertype ? 75 : 55;
	Config.UseMercHP = 75;

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
	Config.GambleItems.push("amulet");
	//Config.GambleItems.push("ring");
	Config.GambleItems.push("circlet");
	Config.GambleItems.push("coronet");

	/* AutoMule configuration. */
	Config.AutoMule.Trigger = [];
	Config.AutoMule.Force = [];
	Config.AutoMule.Exclude = [
		"[name] >= Elrune && [name] <= Lemrune",
		"[name] == mephisto'ssoulstone",
		"[name] == hellForgehammer",
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
	Config.Wereform = false; // 0 / false - don't shapeshift, 1 / "Werewolf" - change to werewolf, 2 / "Werebear" - change to werebear

	Config.SummonRaven = false;
	Config.SummonAnimal = 0; // 0 = disabled, 1 or "Spirit Wolf" = summon spirit wolf, 2 or "Dire Wolf" = summon dire wolf, 3 or "Grizzly" = summon grizzly
	Config.SummonSpirit = 0; // 0 = disabled, 1 / "Oak Sage", 2 / "Heart of Wolverine", 3 / "Spirit of Barbs"
	Config.SummonVine = 0; // 0 = disabled, 1 / "Poison Creeper", 2 / "Carrion Vine", 3 / "Solar Creeper"

	/* LOD gear */
	if (!me.classic) {
		let finalGear = Check.finalBuild().finalGear;
		NTIP.arrayLooping(finalGear);
		NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

		if (Check.haveItem("sword", "runeword", "Call To Arms")) {
			// Spirit on swap
			NTIP.addLine("[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000");
		}

		// FinalBuild specific setup
		switch (SetUp.finalBuild) {
		case 'Wind':
		case 'Elemental':
			// Call to Arms
			if (!Check.haveItem("sword", "runeword", "Call To Arms")) {
				var CTA = [
					"[name] == AmnRune # # [maxquantity] == 1",
					"[name] == RalRune # # [maxquantity] == 1",
					"[name] == MalRune",
					"[name] == IstRune",
					"[name] == OhmRune",
				];
				NTIP.arrayLooping(CTA);

				// Have Ohm before collecting base
				if (me.getItem(sdk.runes.Ohm)) {
					NTIP.addLine("[name] == crystalsword && [quality] >= normal && [quality] <= superior # [sockets] == 5 # [maxquantity] == 1");
				}

				// Cube to Mal rune
				if (!me.getItem(sdk.runes.Mal)) {
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
				}

				// Cube to Ohm Rune
				if (!me.getItem(sdk.runes.Ohm)) {
					Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
					Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);

					if (Check.haveItem("mace", "runeword", "Heart of the Oak")) {
						Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
					}
				}

				Config.Runewords.push([Runeword.CallToArms, "crystal sword"]);
				Config.KeepRunewords.push("[type] == sword # [plusskillbattleorders] >= 1");
			}

			// Heart of the Oak
			if (!Check.haveItem("mace", "runeword", "Heart of the Oak")) {
				var HotO = [
					"[name] == ThulRune # # [maxquantity] == 1",
					"[name] == PulRune",
					"[name] == KoRune # # [maxquantity] == 1",
					"[name] == VexRune",
				];
				NTIP.arrayLooping(HotO);

				// Have Vex rune before looking for base
				if (me.getItem(sdk.runes.Vex)) {
					NTIP.addLine("([name] == flail || [name] == knout) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
				}

				// Cube to Vex rune
				if (!me.getItem(sdk.runes.Vex)) {
					Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
					Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
				}

				Config.Runewords.push([Runeword.HeartoftheOak, "knout"]);
				Config.Runewords.push([Runeword.HeartoftheOak, "flail"]);
				Config.KeepRunewords.push("[type] == mace # [itemallskills] == 3");
			}

			// Enigma
			if (!Check.haveItem("armor", "runeword", "Enigma")) {
				var Enigma = [
					"[name] == JahRune",
					"[name] == IthRune # # [maxquantity] == 1",
					"[name] == BerRune",
				];
				NTIP.arrayLooping(Enigma);

				// Cube to Ber rune
				if (!me.getItem(sdk.runes.Ber)) {
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
				}

				// Cube to Jah rune
				if (!me.getItem(sdk.runes.Jah)) {
					Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
				}

				// Have Ber and Jah runes before looking for normal base
				if (me.getItem(sdk.runes.Ber) && me.getItem(sdk.runes.Jah)) {
					Config.Runewords.push([Runeword.Enigma, "mageplate", Roll.NonEth]);
					Config.Runewords.push([Runeword.Enigma, "duskshroud", Roll.NonEth]);
					Config.Runewords.push([Runeword.Enigma, "wyrmhide", Roll.NonEth]);
					Config.Runewords.push([Runeword.Enigma, "scarabhusk", Roll.NonEth]);

					NTIP.addLine("([name] == mageplate || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1");
				} else {
					NTIP.addLine("([name] == mageplate || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 3 # [maxquantity] == 1");
				}

				Config.KeepRunewords.push("[type] == armor # [itemallskills] == 2");
			}

			break;
		case 'Wolf':
		case 'Plaguewolf':
			if (SetUp.currentBuild === SetUp.finalBuild) {
				// Weaken charged wand
				NTIP.addLine("[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == -1");
				// Spellsteel Decrepify charged axe
				NTIP.addLine("[name] == beardedaxe && [quality] == unique # [itemchargedskill] == 87 # [secondarytier] == -1");
				// Ondal's
				NTIP.addLine("[name] == elderstaff && [quality] == unique # [itemallskills] >= 2 # [secondarytier] == tierscore(item)");
				// Mang Song's
				NTIP.addLine("[name] == archonstaff && [quality] == unique # [itemallskills] == 5 # [secondarytier] == tierscore(item)");
			}

			// Chains of Honor
			if (!Check.haveItem("armor", "runeword", "Chains of Honor")) {
				var CoH = [
					"[name] == DolRune # # [maxquantity] == 1",
					"[name] == UmRune",
					"[name] == BerRune",
					"[name] == IstRune",
				];
				NTIP.arrayLooping(CoH);

				// Cube to Ber rune
				if (!me.getItem(sdk.runes.Ber)) {
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
					Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
				}

				// Cube to Um rune
				if (!me.getItem(sdk.runes.Um)) {
					Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
					Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
				}

				// Have Ber rune before looking for normal base
				if (me.getItem(sdk.runes.Ber)) {
					if (!Check.haveBase("armor", 4)) {
						NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 0 # [maxquantity] == 1");
					}

					NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
				} else {
					NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 4 # [maxquantity] == 1");
				}

				Config.Recipes.push([Recipe.Socket.Armor, "archonplate", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Armor, "duskshroud", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide", Roll.NonEth]);

				Config.Runewords.push([Runeword.ChainsofHonor, "archonplate"]);
				Config.Runewords.push([Runeword.ChainsofHonor, "duskshroud"]);
				Config.Runewords.push([Runeword.ChainsofHonor, "wyrmhide"]);

				Config.KeepRunewords.push("[type] == armor # [fireresist] == 65 && [hpregen] == 7");
			}

			if (SetUp.finalBuild === 'Plaguewolf') {
				// Only start making Grief after Chains of Honor is made
				if (!Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("armor", "runeword", "Chains of Honor")) {
					var Grief = [
						"[name] == EthRune # # [maxquantity] == 1",
						"[name] == TirRune # # [maxquantity] == 1",
						"[name] == LoRune # # [maxquantity] == 1",
						"[name] == MalRune # # [maxquantity] == 1",
						"[name] == RalRune # # [maxquantity] == 1",
						"[name] == phaseblade && [quality] == superior # [enhanceddamage] == 15 && [sockets] == 5 # [maxquantity] == 1",
					];
					NTIP.arrayLooping(Grief);

					// Cube to Lo Rune
					if (!me.getItem(sdk.runes.Lo)) {
						Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
						Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
						Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
						Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
					}

					// Cube to Mal Rune
					if (!me.getItem(sdk.runes.Mal)) {
						Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
						Config.Recipes.push([Recipe.Rune, "Um Rune"]);
					}

					Config.Runewords.push([Runeword.Grief, "phaseblade"]);
					Config.KeepRunewords.push("[type] == sword # [ias] >= 30");
				}
			} else {
				// Make sure to have CoH first
				if (Check.haveItem("armor", "runeword", "Chains of Honor")) {
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

		if (Check.haveItemAndNotSocketed("shield", "unique", "Moser's Blessed Circle")) {
			NTIP.addLine("[name] == perfectdiamond # # [maxquantity] == 2");

			if (Item.getQuantityOwned(me.getItem(sdk.gems.Perfect.Diamond) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
			}

			if (Item.getQuantityOwned(me.getItem(sdk.runes.Um) < 2)) {
				Config.Recipes.push([Recipe.Rune, "PulRune"]);
			}

			NTIP.addLine("[name] == UmRune # # [maxquantity] == 2");
		}

		if (Check.haveItemAndNotSocketed("helm", "unique", "Harlequin Crest")) {
			if (!me.getItem(sdk.runes.Um)) {
				Config.Recipes.push([Recipe.Rune, "PulRune"]);
			}

			NTIP.addLine("[name] == UmRune # # [maxquantity] == 1");
		}

		if (Check.haveItemAndNotSocketed("pelt", "unique", "Jalal's Mane")) {
			if (!me.getItem(sdk.runes.Um)) {
				Config.Recipes.push([Recipe.Rune, "PulRune"]);
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

		if (!wep.isRuneword && [4, 6].indexOf(wep.quality) > -1 && wep.sockets > 0 && !wep.socketed) {
			switch (wep.sockets) {
			case 1:
				if (me.normal) {
					NTIP.addLine("[name] == TirRune # # [maxquantity] == 1");	// Mana after kill
				} else {
					NTIP.addLine("[name] == IoRune # # [maxquantity] == 1");	// 10 to vitality
				}

				break;
			case 2:
				if (me.normal) {
					NTIP.addLine("[name] == TirRune # # [maxquantity] == 2");	// Mana after kill
				} else {
					NTIP.addLine("[name] == IoRune # # [maxquantity] == 2");	// 10 to vitality
				}

				break;
			case 3:
				if (me.normal) {
					NTIP.addLine("[name] == TirRune # # [maxquantity] == 3");	// Mana after kill
				} else {
					NTIP.addLine("[name] == IoRune # # [maxquantity] == 3");	// 10 to vitality
				}

				break;
			}
		}

		if (!shield.isRuneword && [4, 6].indexOf(shield.quality) > -1 && shield.sockets > 0 && !shield.socketed) {
			if (Item.getQuantityOwned(me.getItem(sdk.gems.Perfect.Diamond) < 2)) {
				Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
			}
		}

		var imbueableClassItems = [
			"me.diff == 0 && [name] == spiritmask && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1",
			"me.diff == 1 && [name] == totemicmask && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1",
			"me.diff == 2 && [name] == dreamspirit && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1",
		];

		var imbueableBelts = [
			"me.diff == 0 && [name] == platedbelt && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [maxquantity] == 1",
			"me.diff == 1 && [name] == warbelt && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [maxquantity] == 1",
			"me.diff == 2 && [name] == mithrilcoil && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [maxquantity] == 1",
		];

		if (!me.smith) {
			if (Item.getEquippedItem(1).tier < 100000) {
				NTIP.arrayLooping(imbueableClassItems);
			} else {
				NTIP.arrayLooping(imbueableBelts);
			}
		}

		// Spirit Sword
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(4).tier < 777) {
			if (!Check.haveItem("sword", "runeword", "Spirit") && !me.hell) {
				var SpiritSword = [
					"[name] == TalRune # # [maxquantity] == 1",
					"[name] == ThulRune # # [maxquantity] == 1",
					"[name] == OrtRune # # [maxquantity] == 1",
					"[name] == AmnRune # # [maxquantity] == 1",
				];
				NTIP.arrayLooping(SpiritSword);

				// Cube to Amn Rune
				if (!me.getItem(sdk.runes.Amn)) {
					Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
					Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
				}

				NTIP.addLine("([name] == broadsword || [name] == crystalsword) && [flag] != ethereal && [quality] == normal && [Level] >= 26 && [Level] <= 40 # ([sockets] == 0 || [sockets] == 4) # [maxquantity] == 1");
				
				Config.Recipes.push([Recipe.Socket.Weapon, "crystalsword", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Weapon, "broadsword", Roll.NonEth]);
			} else {
				NTIP.addLine("([name] == broadsword || [name] == crystalsword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
			}

			Config.Runewords.push([Runeword.Spirit, "crystalsword"]);
			Config.Runewords.push([Runeword.Spirit, "broadsword"]);

			Config.KeepRunewords.push("[type] == sword # [fcr] >= 25 && [maxmana] >= 89");
		}

		// Spirit Shield
		if ((me.ladder || Developer.addLadderRW) && (Item.getEquippedItem(5).tier < 1000 || Item.getEquippedItem(12).prefixnum !== sdk.locale.items.Spirit)) {
			if (!Check.haveItem("shield", "runeword", "Spirit") && me.hell) {
				var SpiritShield = [
					"[name] == TalRune # # [maxquantity] == 1",
					"[name] == ThulRune # # [maxquantity] == 1",
					"[name] == OrtRune # # [maxquantity] == 1",
					"[name] == AmnRune # # [maxquantity] == 1",
					"[name] == monarch && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
				];
				NTIP.arrayLooping(SpiritShield);
			}

			if (!Check.haveBase("shield", 4)) {
				NTIP.addLine("[name] == monarch && [flag] != ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
			}

			Config.Recipes.push([Recipe.Socket.Shield, "monarch", Roll.NonEth]);
			Config.Runewords.push([Runeword.Spirit, "monarch"]);
			Config.KeepRunewords.push("[type] == shield # [fcr] >= 25 && [maxmana] >= 89");
		}

		// Merc Insight
		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).tier < 3600) {
			var Insight = [
				"([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1",
				"!me.hell && ([name] == voulge || [name] == scythe || [name] == poleaxe || [name] == halberd || [name] == warscythe || [name] == bill || [name] == battlescythe || [name] == partizan || [name] == grimscythe) && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
				"([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
			];
			NTIP.arrayLooping(Insight);

			if (!me.hell && Item.getEquippedItemMerc(4).prefixnum !== sdk.locale.items.Insight && !Check.haveBase("polearm", 4)) {
				NTIP.addLine("[name] == voulge && [flag] != ethereal && [quality] == normal && [Level] >= 26 && [Level] <= 40 # [sockets] == 0 # [maxquantity] == 1");
			}

			Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

			Config.Runewords.push([Runeword.Insight, "giantthresher"]);
			Config.Runewords.push([Runeword.Insight, "greatpoleaxe"]);
			Config.Runewords.push([Runeword.Insight, "crypticaxe"]);
			Config.Runewords.push([Runeword.Insight, "thresher"]);
			Config.Runewords.push([Runeword.Insight, "grimscythe"]);
			Config.Runewords.push([Runeword.Insight, "partizan"]);
			Config.Runewords.push([Runeword.Insight, "battlescythe"]);
			Config.Runewords.push([Runeword.Insight, "bill"]);
			Config.Runewords.push([Runeword.Insight, "Warscythe"]);
			Config.Runewords.push([Runeword.Insight, "halberd"]);
			Config.Runewords.push([Runeword.Insight, "poleaxe"]);
			Config.Runewords.push([Runeword.Insight, "scythe"]);
			Config.Runewords.push([Runeword.Insight, "voulge"]);

			Config.KeepRunewords.push("[type] == polearm # [meditationaura] >= 12");
		}

		// Lore
		if (Item.getEquippedItem(1).tier < 100000) {
			if (!Check.haveItem("helm", "runeword", "Lore")) {
				var loreRunes = [
					"[name] == OrtRune # # [maxquantity] == 1",
					"[name] == SolRune # # [maxquantity] == 1",
				];
				NTIP.arrayLooping(loreRunes);

				// Cube to Sol rune
				if (!me.getItem(sdk.runes.Sol)) {
					Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
					Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Amn Rune"]);
				}
			} else {
				// Cube to Sol rune
				if (!me.getItem(sdk.runes.Sol)) {
					Config.Recipes.push([Recipe.Rune, "Amn Rune"]);
				}
			}

			var loreHelm = [
				"[type] == pelt && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2",
				"[type] == pelt && [quality] == normal # ([druidskills]+[elementalskilltab]+[skillcyclonearmor]+[skilltwister]+[skilltornado]+[skillhurricane]) >= 1 && [sockets] == 0",
			];
			NTIP.arrayLooping(loreHelm);

			if (Item.getEquippedItem(1).tier < 150) {
				NTIP.addLine("!me.hell && ([name] == crown || [name] == bonehelm || [name] == fullhelm) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1");
				NTIP.addLine("([name] == casque || [name] == sallet || [name] == deathmask || [name] == grimHelm) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1")
			}

			// Pelts
			Config.Runewords.push([Runeword.Lore, "wolfhead"]);
			Config.Runewords.push([Runeword.Lore, "hawkhelm"]);
			Config.Runewords.push([Runeword.Lore, "antlers"]);
			Config.Runewords.push([Runeword.Lore, "falconmask"]);
			Config.Runewords.push([Runeword.Lore, "spiritmask"]);
			Config.Runewords.push([Runeword.Lore, "alphahelm"]);
			Config.Runewords.push([Runeword.Lore, "griffonheaddress"]);
			Config.Runewords.push([Runeword.Lore, "hunter'sguise"]);
			Config.Runewords.push([Runeword.Lore, "sacredfeathers"]);
			Config.Runewords.push([Runeword.Lore, "totemicmask"]);
			Config.Runewords.push([Runeword.Lore, "bloodspirit"]);
			Config.Runewords.push([Runeword.Lore, "sunspirit"]);
			Config.Runewords.push([Runeword.Lore, "earthspirit"]);
			Config.Runewords.push([Runeword.Lore, "skyspirit"]);
			Config.Runewords.push([Runeword.Lore, "dreamspirit"]);

			Config.Recipes.push([Recipe.Socket.Helm, "wolfhead"]);
			Config.Recipes.push([Recipe.Socket.Helm, "hawkhelm"]);
			Config.Recipes.push([Recipe.Socket.Helm, "antlers"]);
			Config.Recipes.push([Recipe.Socket.Helm, "falconmask"]);
			Config.Recipes.push([Recipe.Socket.Helm, "alphahelm"]);
			Config.Recipes.push([Recipe.Socket.Helm, "griffonheaddress"]);
			Config.Recipes.push([Recipe.Socket.Helm, "hunter'sguise"]);
			Config.Recipes.push([Recipe.Socket.Helm, "sacredfeathers"]);
			Config.Recipes.push([Recipe.Socket.Helm, "totemicmask"]);
			Config.Recipes.push([Recipe.Socket.Helm, "bloodspirit"]);
			Config.Recipes.push([Recipe.Socket.Helm, "sunspirit"]);
			Config.Recipes.push([Recipe.Socket.Helm, "earthspirit"]);
			Config.Recipes.push([Recipe.Socket.Helm, "skyspirit"]);
			Config.Recipes.push([Recipe.Socket.Helm, "dreamspirit"]);

			// Normal helms
			Config.Runewords.push([Runeword.Lore, "crown"]);
			Config.Runewords.push([Runeword.Lore, "grimhelm"]);
			Config.Runewords.push([Runeword.Lore, "bonehelm"]);
			Config.Runewords.push([Runeword.Lore, "sallet"]);
			Config.Runewords.push([Runeword.Lore, "casque"]);
			Config.Runewords.push([Runeword.Lore, "deathmask"]);
			Config.Runewords.push([Runeword.Lore, "fullhelm"]);

			Config.KeepRunewords.push("([type] == circlet || [type] == helm || [type] == pelt) # [LightResist] >= 25");
		}

		// Ancients' Pledge
		if (Item.getEquippedItem(5).tier < 500) {
			if (!Check.haveItem("shield", "runeword", "Ancients' Pledge") && !me.hell) {
				// Cube to Ort rune
				if (me.normal && !me.getItem(sdk.runes.Ort)) {
					Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
				}

				var apRunes = [
					"[name] == RalRune # # [maxquantity] == 1",
					"[name] == OrtRune # # [maxquantity] == 1",
					"[name] == TalRune # # [maxquantity] == 1",
				];
				NTIP.arrayLooping(apRunes);
			}

			var apShields = [
				"me.normal && [name] == largeshield && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
				"!me.hell && [name] == kiteshield && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
				"([name] == dragonshield || [name] == scutum) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
			];
			NTIP.arrayLooping(apShields);

			Config.Runewords.push([Runeword.AncientsPledge, "dragonshield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "scutum"]);
			Config.Runewords.push([Runeword.AncientsPledge, "kiteshield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "largeshield"]);

			Config.KeepRunewords.push("[type] == shield # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 187");
		}

		// Merc Fortitude
		if (Item.getEquippedItemMerc(3).prefixnum !== sdk.locale.items.Fortitude) {
			var fort = [
				"[name] == ElRune # # [maxquantity] == 1",
				"[name] == SolRune # # [maxquantity] == 1",
				"[name] == DolRune # # [maxquantity] == 1",
				"[name] == LoRune",
				"([name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] == normal && [flag] == ethereal # [Defense] >= 1000 && [sockets] == 4 # [maxquantity] == 1",
				"([name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] == normal && [flag] == ethereal # [Defense] >= 700 && [sockets] == 0 # [maxquantity] == 1",
			];
			NTIP.arrayLooping(fort);

			Config.Recipes.push([Recipe.Socket.Armor, "hellforgeplate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "krakenshell"]);
			Config.Recipes.push([Recipe.Socket.Armor, "archonplate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "balrogskin"]);
			Config.Recipes.push([Recipe.Socket.Armor, "boneweave"]);
			Config.Recipes.push([Recipe.Socket.Armor, "greathauberk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "loricatedmail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "diamondmail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "wirefleece"]);
			Config.Recipes.push([Recipe.Socket.Armor, "scarabhusk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide"]);
			Config.Recipes.push([Recipe.Socket.Armor, "duskshroud"]);

			Config.Runewords.push([Runeword.Fortitude, "hellforgeplate"]);
			Config.Runewords.push([Runeword.Fortitude, "krakenshell"]);
			Config.Runewords.push([Runeword.Fortitude, "archonplate"]);
			Config.Runewords.push([Runeword.Fortitude, "balrogskin"]);
			Config.Runewords.push([Runeword.Fortitude, "boneweave"]);
			Config.Runewords.push([Runeword.Fortitude, "greathauberk"]);
			Config.Runewords.push([Runeword.Fortitude, "loricatedmail"]);
			Config.Runewords.push([Runeword.Fortitude, "diamondmail"]);
			Config.Runewords.push([Runeword.Fortitude, "wirefleece"]);
			Config.Runewords.push([Runeword.Fortitude, "scarabhusk"]);
			Config.Runewords.push([Runeword.Fortitude, "wyrmhide"]);
			Config.Runewords.push([Runeword.Fortitude, "duskshroud"]);

			Config.KeepRunewords.push("[type] == armor # [enhanceddefense] >= 200 && [enhanceddamage] >= 300");
		}

		// Merc Treachery
		if (Item.getEquippedItemMerc(3).tier < 15000) {
			var Treachery = [
				"([name] == breastplate || [name] == mageplate || [name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
				"!me.normal && ([name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] == normal && [flag] == ethereal # [sockets] == 0 # [maxquantity] == 1",
			];

			// Have Shael and Lem before looking for base
			if (me.getItem(sdk.runes.Shael) && me.getItem(sdk.runes.Lem)) {
				NTIP.arrayLooping(Treachery);
			}

			Config.Recipes.push([Recipe.Socket.Armor, "hellforgeplate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "krakenshell"]);
			Config.Recipes.push([Recipe.Socket.Armor, "archonplate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "balrogskin"]);
			Config.Recipes.push([Recipe.Socket.Armor, "boneweave"]);
			Config.Recipes.push([Recipe.Socket.Armor, "greathauberk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "loricatedmail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "diamondmail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "wirefleece"]);
			Config.Recipes.push([Recipe.Socket.Armor, "scarabhusk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide"]);
			Config.Recipes.push([Recipe.Socket.Armor, "duskshroud"]);

			Config.Runewords.push([Runeword.Treachery, "breastplate"]);
			Config.Runewords.push([Runeword.Treachery, "mageplate"]);
			Config.Runewords.push([Runeword.Treachery, "hellforgeplate"]);
			Config.Runewords.push([Runeword.Treachery, "krakenshell"]);
			Config.Runewords.push([Runeword.Treachery, "archonplate"]);
			Config.Runewords.push([Runeword.Treachery, "balrogskin"]);
			Config.Runewords.push([Runeword.Treachery, "boneweave"]);
			Config.Runewords.push([Runeword.Treachery, "greathauberk"]);
			Config.Runewords.push([Runeword.Treachery, "loricatedmail"]);
			Config.Runewords.push([Runeword.Treachery, "diamondmail"]);
			Config.Runewords.push([Runeword.Treachery, "wirefleece"]);
			Config.Runewords.push([Runeword.Treachery, "scarabhusk"]);
			Config.Runewords.push([Runeword.Treachery, "wyrmhide"]);
			Config.Runewords.push([Runeword.Treachery, "duskshroud"]);

			Config.KeepRunewords.push("[type] == armor # [ias] == 45 && [coldresist] == 30");
		}

		// Smoke
		if (Item.getEquippedItem(3).tier < 634) {
			if (!Check.haveItem("armor", "runeword", "Smoke") && !me.hell) {
				// Cube to Lum Rune
				if (!me.getItem(sdk.runes.Lum)) {
					Config.Recipes.push([Recipe.Rune, "Io Rune"]);
				}

				var smokeRunes = [
					"[name] == NefRune # # [maxquantity] == 1",
					"[name] == LumRune # # [maxquantity] == 1",
				];
				NTIP.arrayLooping(smokeRunes);
			}

			// Have Lum rune before looking for base
			if (me.getItem(sdk.runes.Lum)) {
				NTIP.addLine("([name] == demonhidearmor || [name] == duskshroud || [name] == ghostarmor || [name] == lightplate || [name] == mageplate || [name] == serpentskinarmor || [name] == trellisedarmor || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1");
			}

			Config.Runewords.push([Runeword.Smoke, "demonhidearmor"]);
			Config.Runewords.push([Runeword.Smoke, "duskshroud"]);
			Config.Runewords.push([Runeword.Smoke, "ghostarmor"]);
			Config.Runewords.push([Runeword.Smoke, "lightplate"]);
			Config.Runewords.push([Runeword.Smoke, "mageplate"]);
			Config.Runewords.push([Runeword.Smoke, "serpentskinarmor"]);
			Config.Runewords.push([Runeword.Smoke, "trellisedarmor"]);
			Config.Runewords.push([Runeword.Smoke, "wyrmhide"]);

			Config.KeepRunewords.push("[type] == armor # [fireresist] == 50");
		}

		// Stealth
		if (Item.getEquippedItem(3).tier < 233) {
			if (!Check.haveItem("armor", "runeword", "Stealth") && me.normal) {
				var stealthRunes = [
					"[name] == TalRune # # [maxquantity] == 1",
					"[name] == EthRune # # [maxquantity] == 1",
				];
				NTIP.arrayLooping(stealthRunes);
			}

			var stealthArmor = [
				"!me.hell && ([name] == studdedleather || [name] == breastplate || [name] == lightplate) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
				"([name] == ghostarmor || [name] == serpentskinarmor || [name] == mageplate) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
			];
			NTIP.arrayLooping(stealthArmor);

			Config.Runewords.push([Runeword.Stealth, "mageplate"]);
			Config.Runewords.push([Runeword.Stealth, "serpentskinarmor"]);
			Config.Runewords.push([Runeword.Stealth, "ghostarmor"]);
			Config.Runewords.push([Runeword.Stealth, "lightplate"]);
			Config.Runewords.push([Runeword.Stealth, "breastplate"]);
			Config.Runewords.push([Runeword.Stealth, "studdedleather"]);

			Config.KeepRunewords.push("[type] == armor # [frw] == 25");
		}
	}
}
