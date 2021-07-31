/*
*	@filename	Paladin.SoloLeveling.js
*	@author		isid0re
*	@desc		Config Settings for SoloLeveling Paladin
*
*	FinalBuild choices
*		To select your finalbuild.
*		1. Go into the D2BS console manager.
*		2. Select the Bots profile
*		3. In the info tag box enter one of the following choices:
*			Hammerdin
*			Smiter
*			Auradin
*			Zealer
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

	if (!isIncluded("SoloLeveling/Functions/Globals.js")) {
		include("SoloLeveling/Functions/Globals.js");
	}

	SetUp.include();

	/* Script */
	Scripts.UserAddon = false;
	Scripts.SoloLeveling = true;

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
	Config.Cubing = !me.classic ? me.getItem(549) : false;
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
	Config.LifeChicken = me.playertype ? 60 : 10;
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
	Config.BeltColumn = ["hp", "mp", "rv", "rv"];
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
		"[name] >= elrune && [name] <= lemrune",
		"[Name] == Mephisto'sSoulstone",
		"[Name] == HellForgeHammer",
		"[Name] == ScrollOfInifuss",
		"[Name] == KeyToTheCairnStones",
		"[name] == BookOfSkill",
		"[Name] == HoradricCube",
		"[Name] == ShaftOfTheHoradricStaff",
		"[Name] == TopOfTheHoradricStaff",
		"[Name] == HoradricStaff",
		"[Name] == ajadefigurine",
		"[Name] == TheGoldenBird",
		"[Name] == potionoflife",
		"[Name] == lamesen'stome",
		"[Name] == Khalim'sEye",
		"[Name] == Khalim'sHeart",
		"[Name] == Khalim'sBrain",
		"[Name] == Khalim'sFlail",
		"[Name] == Khalim'sWill",
		"[Name] == ScrollofResistance",
	];

	/* AutoEquip configuration. */
	Config.AutoEquip = true;

	var levelingTiers = [ // autoequip setup
		//weapon
		"([Type] == Scepter || [Type] == Mace && [Quality] >= Magic || [Type] == Sword && ([Quality] >= Magic || [flag] == runeword) || [Type] == knife && [Quality] >= Magic) && [flag] != ethereal # [secondarymindamage] == 0 && [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//Helmet
		"([type] == helm || [type] == circlet) && ([Quality] >= Magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//belt
		"[type] == belt && [Quality] >= Magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//boots
		"[Type] == Boots && [Quality] >= Magic && [Flag] != Ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//armor
		"[type] == armor && ([Quality] >= Magic || [flag] == runeword) && [Flag] != Ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//shield
		"([type] == shield || [type] == auricshields) && ([Quality] >= Magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//gloves
		"[Type] == Gloves && [Quality] >= Magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//ammy
		"[Type] == Amulet && [Quality] >= Magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//rings
		"[Type] == Ring && [Quality] >= Magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//Charms
		"[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		"[name] == smallcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
		//Special Charms
		"[name] == smallcharm && [quality] == unique # [itemallskills] == 1 # [charmtier] == 100000",
		"[name] == largecharm && [quality] == unique # [itemaddclassskills] == 3 # [charmtier] == 100000",
		"[name] == grandcharm && [quality] == unique # [itemmagicbonus] >= 30 || [itemgoldbonus] >= 150 # [charmtier] == 100000",
		//merc
		"([type] == circlet || [type] == helm) && ([Quality] >= Magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"[Type] == armor && ([Quality] >= Magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"me.charlvl > 14 && [Type] == Polearm && ([Quality] >= Magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
	];
	NTIP.arrayLooping(levelingTiers);

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
	Config.AutoStat.BlockChance = 75;
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
	Config.AvoidDolls = true;
	Config.Vigor = true;
	Config.Charge = true;
	Config.Redemption = [45, 25];

	/* LOD gear */
	if (!me.classic) {
		let finalGear = Check.finalBuild().finalGear;
		NTIP.arrayLooping(finalGear);
		NTIP.addLine("[name] >= vexrune && [name] <= zodrune");

		switch (SetUp.finalBuild) { // finalbuild autoequip setup
		case 'Smiter':
		case 'Zealer':
			if ((me.ladder || Developer.addLadderRW) && !Check.haveItem("sword", "runeword", "Grief")) {
				var Grief = [
					"[Name] == EthRune # # [MaxQuantity] == 1",
					"[Name] == TirRune # # [MaxQuantity] == 1",
					"[Name] == LoRune",
					"[Name] == MalRune # # [MaxQuantity] == 1",
					"[Name] == RalRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(Grief);

				if (!me.getItem(637) && Check.haveItem("sword", "runeword", "Call To Arms")) {		// Lo Rune - Only do this if already have CTA
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
					Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
				}

				if (me.getItem(637)) {	// Lo Rune
					NTIP.addLine("[Name] == PhaseBlade && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 5 # [MaxQuantity] == 1");
				} else {
					NTIP.addLine("[Name] == PhaseBlade && [Quality] == Superior # [enhanceddamage] >= 10 && [Sockets] == 5 # [MaxQuantity] == 1");
				}

				Config.Runewords.push([Runeword.Grief, "Phase Blade"]);
				Config.KeepRunewords.push("[Type] == sword # [ias] >= 30");
			}

			if (SetUp.finalBuild === "Zealer") {
				if (Check.haveItemAndNotSocketed("helm", "unique", "Vampire Gaze")) {
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]); // Sur to Ber
				}

				if (!Check.haveItem("BoneVisage", "unique", "Vampire Gaze")) {
					Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Grim Helm", Roll.NonEth]); // Upgrade Vamp Gaze to Elite
				}

				if (!Check.haveItem("auricshields", "runeword", "Exile")) {
					var Exile = [
						"[Name] == VexRune",
						"[Name] == OhmRune",
						"[Name] == IstRune",
						"[Name] == DolRune # # [MaxQuantity] == 1",
						"[Name] == SacredTarge && [Quality] >= Normal && [Quality] <= Superior # [fireresist] >= 30 && [Sockets] == 3 # [MaxQuantity] == 1",
					];
					NTIP.arrayLooping(Exile);

					if (!Check.haveBase("sacred targe", 4)) {
						NTIP.addLine("[Name] == SacredTarge && [Quality] == Normal # [fireresist] >= 30 && [Sockets] == 0 # [MaxQuantity] == 1");
					}

					Config.Recipes.push([Recipe.Socket.Shield, "Sacred Targe"]);
					Config.Runewords.push([Runeword.Exile, "Sacred Targe"]);
					Config.KeepRunewords.push("[type] == auricshields # [defianceaura] >= 13");
				}

				if ((me.ladder || Developer.addLadderRW) && !Check.haveItem("armor", "runeword", "Fortitude")) {
					if (!me.getItem(637)) {		// Lo Rune
						Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
						Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
						Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
						Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
					}

					if (me.getItem(637)) {	// Lo Rune
						NTIP.addLine("[name] == archonplate && [flag] != ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1");
					} else {
						NTIP.addLine("[name] == archonplate && [flag] != ethereal && [Quality] == Superior # [Sockets] == 4 && [enhanceddefense] >= 10 # [MaxQuantity] == 1");
					}

					Config.Runewords.push([Runeword.Fortitude, "Archon Plate"]);
					Config.KeepRunewords.push("[type] == armor # [enhanceddamage] >= 300 && [enhanceddefense] >= 200");
				}
			}

			break;
		case 'Hammerdin':
			if (!Check.haveItem("mace", "runeword", "Heart of the Oak")) {
				var HotO = [
					"[Name] == ThulRune # # [MaxQuantity] == 1",
					"[Name] == PulRune",
					"[Name] == KoRune # # [MaxQuantity] == 1",
					"[Name] == VexRune",
				];
				NTIP.arrayLooping(HotO);

				if (me.getItem(635)) {		// Vex Rune
					NTIP.addLine("([Name] == Flail || [Name] == Knout) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1");
				}

				if (!me.getItem(635)) {		// Vex Rune
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
				}

				Config.Runewords.push([Runeword.HeartoftheOak, "Knout"]);
				Config.Runewords.push([Runeword.HeartoftheOak, "Flail"]);
				Config.KeepRunewords.push("[Type] == mace # [FCR] == 40");
			}

			break;
		case 'Auradin':
			if ((me.ladder || Developer.addLadderRW) && !Check.haveItem("auricshields", "runeword", "Dream")) { // Dream shield
				var DreamShield = [
					"[Name] == IoRune # # [MaxQuantity] == 1",
					"[Name] == JahRune",
					"[Name] == PulRune",
					"[Name] == SacredTarge && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [fireresist] >= 45 && [Sockets] == 3 # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(DreamShield);

				if (!Check.haveBase("sacred targe", 3)) {
					NTIP.addLine("[Name] == SacredTarge && [Flag] != Ethereal && [Quality] == Normal # [fireresist] >= 45 && [Sockets] == 0 # [MaxQuantity] == 1");
				}

				Config.Recipes.push([Recipe.Socket.Shield, "Sacred Targe", Roll.NonEth]);
				Config.Runewords.push([Runeword.Dream, "Sacred Targe"]);
				Config.KeepRunewords.push("[type] == auricshields # [holyshockaura] >= 15");
			}

			if ((me.ladder || Developer.addLadderRW) && !Check.haveItem("helm", "runeword", "Dream")) { // Dream helm
				var DreamHelm = [
					"[Name] == IoRune # # [MaxQuantity] == 1",
					"[Name] == JahRune",
					"[Name] == PulRune",
					"[Name] == BoneVisage && [Flag] != Ethereal && [Quality] == Superior # [enhanceddefense] >= 15 && [Sockets] == 3 # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(DreamHelm);

				Config.Runewords.push([Runeword.Dream, "Bone Visage"]);
				Config.KeepRunewords.push("[type] == helm # [holyshockaura] >= 15");
			}

			if (!Check.haveItem("auricshields", "runeword", "Dream") || !Check.haveItem("helm", "runeword", "Dream") && (me.ladder || Developer.addLadderRW)) {
				if (!me.getItem(640)) {		// Jah Rune
					if (Check.haveItem("sword", "runeword", "Call To Arms")) {
						Config.Recipes.push([Recipe.Rune, "Mal Rune"]); // Mal to Ist
						Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
						Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
						Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
						Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
					}

					Config.Recipes.push([Recipe.Rune, "Lo Rune"]); // Lo to Sur
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]); // Sur to Ber
					Config.Recipes.push([Recipe.Rune, "Ber Rune"]); // Ber to Jah
				}

			}

			if (!Check.haveItem("sword", "runeword", "Call To Arms")) {
				if (!me.getItem(632) && Item.getEquippedItem(4).tier >= 110000) {
					Config.Recipes.push([Recipe.Rune, "Um Rune"]); // Um to Mal
				}
				
				if (!me.getItem(636)) { // Ohm Rune
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
				}
			}

			if ((me.ladder || Developer.addLadderRW) && !Check.haveItem("armor", "runeword", "Dragon") && Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream")) { // Dragon
				var Dragon = [
					"[Name] == SurRune",
					"[Name] == LoRune",
					"[Name] == SolRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(Dragon);

				if (!me.getItem(638)) {		// Sur Rune
					Config.Recipes.push([Recipe.Rune, "Lo Rune"]); // Lo to Sur
				}

				if (me.getItem(637) && me.getItem(638)) {
					Config.Runewords.push([Runeword.Dragon, "Archon Plate", Roll.NonEth]);
				}

				Config.KeepRunewords.push("[type] == armor # [holyfireaura] >= 14");
			}

			if (!Check.haveItem("sword", "runeword", "Hand of Justice") && Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream")) {
				var HoJ = [
					"[Name] == SurRune",
					"[Name] == ChamRune",
					"[Name] == AmnRune # # [MaxQuantity] == 1",
					"[Name] == LoRune",
					"[Name] == PhaseBlade && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(HoJ);

				if (!me.getItem(637) && Check.haveItem("sword", "runeword", "Call To Arms")) {		// Lo Rune - Only do this if already have CTA
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]); // Mal to Ist
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
					Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
				}

				if (!me.getItem(641)) {		// Cham Rune
					Config.Recipes.push([Recipe.Rune, "Ber Rune"]); // Ber to Jah
					Config.Recipes.push([Recipe.Rune, "Jah Rune"]); // Jah to Cham
				}

				Config.Runewords.push([Runeword.HandofJustice, "Phase Blade"]);
				Config.KeepRunewords.push("[Type] == sword # [holyfireaura] >= 16");

				NTIP.addLine("[Name] == PhaseBlade && [Flag] != Ethereal && [Quality] == unique # [enhanceddamage] >= 230 && [sanctuaryaura] >= 10 # [tier] == 115000");	// Azurewrath
			}

			if (!Check.haveItem("sword", "runeword", "Crescent Moon") && !Check.haveItem("sword", "runeword", "Hand of Justice") && Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream")) {
				var CrescentMoon = [
					"[Name] == ShaelRune # # [MaxQuantity] == 1",
					"[Name] == UmRune",
					"[Name] == TirRune # # [MaxQuantity] == 1",
					"[Name] == PhaseBlade && [Quality] == Normal # ([Sockets] == 0 || [Sockets] == 3) # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(CrescentMoon);

				if (!me.getItem(631)) {		// Um Rune
					Config.Recipes.push([Recipe.Rune, "Ko Rune"]); // Ko to Fal
					Config.Recipes.push([Recipe.Rune, "Fal Rune"]); // Fal to Lem
					Config.Recipes.push([Recipe.Rune, "Lem Rune"]); // Lem to Pul
					Config.Recipes.push([Recipe.Rune, "Pul Rune"]); // Pul to Um
				}

				Config.Recipes.push([Recipe.Socket.Weapon, "Phase Blade", Roll.NonEth]);

				Config.Runewords.push([Runeword.CrescentMoon, "Phase Blade"]);
				Config.KeepRunewords.push("[Type] == sword # [ias] >= 20 && [passiveltngpierce] >= 35");

				NTIP.addLine("[Name] == PhaseBlade && [Flag] != Ethereal && [Quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");	// Lightsabre
			}

			if (!Check.haveItem("sword", "runeword", "Voice of Reason") && !Check.haveItem("sword", "runeword", "Crescent Moon") && !Check.haveItem("sword", "runeword", "Hand of Justice") && Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream")) {
				var VoR = [
					"[Name] == LemRune",
					"[Name] == KoRune # # [MaxQuantity] == 1",
					"[Name] == ELRune # # [MaxQuantity] == 1",
					"[Name] == EldRune # # [MaxQuantity] == 1",
					"[Name] == PhaseBlade && [Quality] == Normal # ([Sockets] == 0 || [Sockets] == 4) # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(VoR);

				if (!me.getItem(629)) {		// Lem Rune
					Config.Recipes.push([Recipe.Rune, "Fal Rune"]); // Fal to Lem
				}

				Config.Recipes.push([Recipe.Socket.Weapon, "Phase Blade", Roll.NonEth]);

				Config.Runewords.push([Runeword.VoiceofReason, "Phase Blade"]);
				Config.KeepRunewords.push("[type] == sword # [passivecoldpierce] == 24 && [dexterity] == 10");
			}

			if (Check.haveItem("sword", "runeword", "Hand of Justice") && Check.haveItem("armor", "runeword", "Dragon") && Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream") && 
				Item.getEquippedItemMerc(3).prefixnum !== 20547 && (me.ladder || Developer.addLadderRW)) {
				var Fortitude = [
					"[Name] == ElRune # # [MaxQuantity] == 1",
					"[Name] == SolRune",
					"[Name] == DolRune # # [MaxQuantity] == 1",
					"[Name] == LoRune",
					"[name] == archonplate && [quality] == normal && [flag] == ethereal # [sockets] == 0 && [defense] >= 700",
					"[type] == armor && [quality] == normal && [class] == elite && [flag] == ethereal # [sockets] == 4 && [defense] >= 1000",
				];
				NTIP.arrayLooping(Fortitude);

				if (!me.getItem(637) && Check.haveItem("sword", "runeword", "Call To Arms")) {		// Lo Rune - Only do this if already have CTA
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]); // Mal to Ist
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
					Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
					Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
				}

				Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate", Roll.Eth]); // Socket ethereal Archon Plate
				Config.Runewords.push([Runeword.Fortitude, "Archon Plate", Roll.Eth]);

				Config.KeepRunewords.push("[type] == armor # [enhanceddamage] >= 300 && [enhanceddefense] >= 200");
			}

			break;
		default:
			break;
		}

		if (Check.haveItemAndNotSocketed("shield", "unique", "Moser's Blessed Circle")) {
			Config.Recipes.push([Recipe.Gem, "Flawless Diamond"]);
			NTIP.addLine("[name] == perfectdiamond # # [MaxQuantity] == 2");
			Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
			NTIP.addLine("[name] == UmRune # # [MaxQuantity] == 2");
		}

		if (Check.haveItemAndNotSocketed("helm", "unique", "Harlequin Crest")) {
			Config.Recipes.push([Recipe.Rune, "Pul Rune"]); // Pul to Um
			NTIP.addLine("[name] == UmRune # # [MaxQuantity] == 1");
		}

		var imbueableClassItems = [
			"me.diff == 0 && [name] == warscepter && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [Sockets] == 0 # [MaxQuantity] == 1",
			"me.diff == 1 && [name] == divinescepter && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [Sockets] == 0 # [MaxQuantity] == 1",
			"me.diff == 2 && [name] == mightyscepter && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [Sockets] == 0 # [MaxQuantity] == 1",
		];

		var imbueableBelts = [
			"me.diff == 0 && [name] == platedbelt && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [MaxQuantity] == 1",
			"me.diff == 1 && [name] == warbelt && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [MaxQuantity] == 1",
			"me.diff == 2 && [name] == mithrilcoil && [quality] >= normal && [quality] <= superior && [flag] != ethereal # # [MaxQuantity] == 1",
		];

		if (!me.smith) {
			if (Item.getEquippedItem(4).tier < 777) {
				NTIP.arrayLooping(imbueableClassItems);
			} else {
				NTIP.arrayLooping(imbueableBelts);
			}
		}

		if (!Check.haveItem("sword", "runeword", "Call To Arms")) {
			var CTA = [
				"[Name] == AmnRune # # [MaxQuantity] == 1",
				"[Name] == RalRune # # [MaxQuantity] == 1",
				"[Name] == MalRune",
				"[Name] == IstRune",
				"[Name] == OhmRune",
			];
			NTIP.arrayLooping(CTA);

			if (me.getItem(636)) { // have Ohm before collecting base
				NTIP.addLine("[Name] == CrystalSword && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 5 # [MaxQuantity] == 1");
			}

			if (!me.getItem(632)) {
				Config.Recipes.push([Recipe.Rune, "Um Rune"]); // Um to Mal
			}

			if (!me.getItem(636) && (["Hammerdin"].indexOf(SetUp.finalBuild) === -1 || Check.haveItem("mace", "runeword", "Heart of the Oak"))) { // Ohm Rune
				Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
				Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
			}

			Config.Runewords.push([Runeword.CallToArms, "Crystal Sword"]);
			Config.KeepRunewords.push("[type] == sword # [plusskillbattleorders] >= 1");
		}

		if (!Check.haveItem("armor", "runeword", "Enigma") && ["Hammerdin", "Smiter"].indexOf(SetUp.finalBuild) > -1) { // Enigma - Don't make if not Smiter or Hammerdin
			var Enigma = [
				"[Name] == JahRune",
				"[Name] == IthRune # # [MaxQuantity] == 1",
				"[Name] == BerRune",
			];
			NTIP.arrayLooping(Enigma);

			if (!me.getItem(640)) {		// Jah Rune
				Config.Recipes.push([Recipe.Rune, "Mal Rune"]); // Mal to Ist
				Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
				Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
				Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
				Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
				Config.Recipes.push([Recipe.Rune, "Lo Rune"]); // Lo to Sur
				Config.Recipes.push([Recipe.Rune, "Sur Rune"]); // Sur to Ber
				Config.Recipes.push([Recipe.Rune, "Ber Rune"]); // Ber to Jah
			}

			if (!me.getItem(639)) {		// Ber rune
				Config.Recipes.push([Recipe.Rune, "Mal Rune"]); // Mal to Ist
				Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Ist to Gul
				Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Gul to Vex
				Config.Recipes.push([Recipe.Rune, "Vex Rune"]); // Vex to Ohm
				Config.Recipes.push([Recipe.Rune, "Ohm Rune"]); // Ohm to Lo
				Config.Recipes.push([Recipe.Rune, "Lo Rune"]); // Lo to Sur
				Config.Recipes.push([Recipe.Rune, "Sur Rune"]); // Sur to Ber
			}

			if (me.getItem(639) && me.getItem(640)) {
				Config.Runewords.push([Runeword.Enigma, "Mage Plate", Roll.NonEth]);
				Config.Runewords.push([Runeword.Enigma, "DuskShroud", Roll.NonEth]);
				Config.Runewords.push([Runeword.Enigma, "WyrmHide", Roll.NonEth]);
				Config.Runewords.push([Runeword.Enigma, "ScarabHusk", Roll.NonEth]);

				NTIP.addLine("([Name] == MagePlate || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1");
			} else {
				NTIP.addLine("([Name] == MagePlate || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Flag] != Ethereal && [Quality] == Superior # [enhanceddefense] >= 10 && [Sockets] == 3 # [MaxQuantity] == 1");
			}

			Config.KeepRunewords.push("[type] == armor # [frw] >= 45");
		}

		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(4).tier < 777) { // Spirit Sword
			if (!Check.haveItem("sword", "runeword", "Spirit") && !me.hell) {
				var SpiritSword = [
					"[Name] == TalRune # # [MaxQuantity] == 1",
					"[Name] == ThulRune # # [MaxQuantity] == 1",
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == AmnRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(SpiritSword);

				if (!me.getItem(620)) { //Amn Rune
					Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
					Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
				}

				NTIP.addLine("([Name] == BroadSword || [Name] == CrystalSword) && [flag] != ethereal && [Quality] == Normal && [Level] >= 26 && [Level] <= 40 # ([Sockets] == 0 || [Sockets] == 4) # [MaxQuantity] == 1");
				
				Config.Recipes.push([Recipe.Socket.Weapon, "Crystal Sword", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Weapon, "Broad Sword", Roll.NonEth]);
			} else {
				NTIP.addLine("([Name] == BroadSword || [Name] == CrystalSword) && [flag] != ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1");
			}

			Config.Runewords.push([Runeword.Spirit, "Crystal Sword"]);
			Config.Runewords.push([Runeword.Spirit, "Broad Sword"]);

			Config.KeepRunewords.push("[type] == sword # [fcr] >= 25 && [maxmana] >= 89");
		}

		if ((me.ladder || Developer.addLadderRW) && (Item.getEquippedItem(5).tier < 1000 || Item.getEquippedItem(12).prefixnum !== 20635)) { // Spirit shield
			if (!Check.haveItem("auricshields", "runeword", "Spirit")) {
				var SpiritShield = [
					"[Name] == TalRune # # [MaxQuantity] == 1",
					"[Name] == ThulRune # # [MaxQuantity] == 1",
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == AmnRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(SpiritShield);
			}

			NTIP.addLine("([Name] == Targe || [Name] == Rondache || [Name] == HeraldicShield ||[Name] == AerinShield || [Name] == AkaranTarge || [Name] == AkaranRondache || [Name] == GildedShield ||[Name] == ProtectorShield || [Name] == SacredTarge) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [fireresist] > 0 && [Sockets] == 4");
			NTIP.addLine("([Name] == Targe || [Name] == Rondache || [Name] == HeraldicShield ||[Name] == AerinShield || [Name] == AkaranTarge || [Name] == AkaranRondache || [Name] == GildedShield ||[Name] == ProtectorShield || [Name] == SacredTarge) && [Flag] != Ethereal && [Quality] == Normal # [fireresist] > 0 && [Sockets] == 0");

			Config.Runewords.push([Runeword.Spirit, "Targe"]);
			Config.Runewords.push([Runeword.Spirit, "Rondache"]);
			Config.Runewords.push([Runeword.Spirit, "Heraldic Shield"]);
			Config.Runewords.push([Runeword.Spirit, "Aerin Shield"]);
			Config.Runewords.push([Runeword.Spirit, "Akaran Targe"]);
			Config.Runewords.push([Runeword.Spirit, "Akaran Rondache"]);
			Config.Runewords.push([Runeword.Spirit, "Protector Shield"]);
			Config.Runewords.push([Runeword.Spirit, "Gilded Shield"]);
			Config.Runewords.push([Runeword.Spirit, "Sacred Targe"]);

			Config.Recipes.push([Recipe.Socket.Shield, "Targe"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Rondache"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Heraldic Shield"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Aerin Shield"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Akaran Targe"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Akaran Rondache"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Protector Shield"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Gilded Shield"]);
			Config.Recipes.push([Recipe.Socket.Shield, "Sacred Targe"]);

			Config.KeepRunewords.push("([type] == shield || [type] == auricshields) # [fcr] >= 25 && [maxmana] >= 89");
		}

		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).tier < 3600) { // Merc Insight
			var Insight = [
				"([Name] == thresher || [Name] == crypticaxe || [Name] == greatpoleaxe || [Name] == giantthresher) && [Flag] == Ethereal && [Quality] == Normal # [Sockets] == 0 # [MaxQuantity] == 1",
				"!me.hell && ([Name] == voulge || [Name] == scythe || [Name] == poleaxe || [Name] == halberd || [Name] == warscythe || [Name] == bill || [Name] == battlescythe || [Name] == partizan || [Name] == grimscythe) && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1",
				"([Name] == thresher || [Name] == crypticaxe || [Name] == greatpoleaxe || [Name] == giantthresher) && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(Insight);

			if (!me.hell && Item.getEquippedItemMerc(4).prefixnum !== 20568 && !Check.haveBase("polearm", 4)) {
				NTIP.addLine("[Name] == voulge && [flag] != ethereal && [Quality] == Normal && [Level] >= 26 && [Level] <= 40 # [Sockets] == 0 # [MaxQuantity] == 1");
			}

			if (!me.getItem(621) && Item.getEquippedItemMerc(4).prefixnum !== 20568) {
				Config.Recipes.push([Recipe.Rune, "Amn Rune"]);		// Amn -> Sol
			}

			Config.Recipes.push([Recipe.Socket.Weapon, "Giant Thresher"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "Great Poleaxe"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "Cryptic Axe"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

			Config.Runewords.push([Runeword.Insight, "Giant Thresher"]);
			Config.Runewords.push([Runeword.Insight, "Great Poleaxe"]);
			Config.Runewords.push([Runeword.Insight, "Cryptic Axe"]);
			Config.Runewords.push([Runeword.Insight, "Thresher"]);
			Config.Runewords.push([Runeword.Insight, "Grim Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Partizan"]);
			Config.Runewords.push([Runeword.Insight, "Battle Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Bill"]);
			Config.Runewords.push([Runeword.Insight, "War Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Halberd"]);
			Config.Runewords.push([Runeword.Insight, "Poleaxe"]);
			Config.Runewords.push([Runeword.Insight, "Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Voulge"]);

			Config.KeepRunewords.push("[type] == polearm # [meditationaura] >= 12");
		}

		if (Item.getEquippedItem(1).tier < 315) { // Lore
			if (!Check.haveItem("helm", "runeword", "Lore")) {
				var loreRunes = [
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == SolRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(loreRunes);

				if (!me.getItem(621)) {
					Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
					Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
					Config.Recipes.push([Recipe.Rune, "Amn Rune"]);
				}
			}

			var loreHelm = [
				"!me.hell && ([Name] == Crown || [Name] == BoneHelm || [Name] == FullHelm) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
				"([Name] == Casque || [Name] == Sallet || [Name] == DeathMask || [Name] == GrimHelm) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(loreHelm);

			Config.Runewords.push([Runeword.Lore, "Crown"]);
			Config.Runewords.push([Runeword.Lore, "Grim Helm"]);
			Config.Runewords.push([Runeword.Lore, "Bone Helm"]);
			Config.Runewords.push([Runeword.Lore, "Sallet"]);
			Config.Runewords.push([Runeword.Lore, "Casque"]);
			Config.Runewords.push([Runeword.Lore, "Death Mask"]);
			Config.Runewords.push([Runeword.Lore, "Full Helm"]);
			Config.KeepRunewords.push("([type] == circlet || [type] == helm) # [LightResist] >= 25");
		}

		if (Item.getEquippedItem(5).tier < 500) { // Ancients' Pledge
			if (!Check.haveItem("shield", "runeword", "Ancients' Pledge") && !me.hell) {
				if (me.normal && !me.getItem(618)) {
					Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
				}

				var apRunes = [
					"[Name] == RalRune # # [MaxQuantity] == 1",
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == TalRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(apRunes);
			}

			var apShields = [
				"me.normal && [Name] == LargeShield && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
				"!me.hell && [Name] == KiteShield && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
				"([Name] == DragonShield || [Name] == Scutum) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
				"([Name] == Targe || [Name] == Rondache || [Name] == HeraldicShield ||[Name] == AerinShield || [Name] == AkaranTarge || [Name] == AkaranRondache || [Name] == GildedShield ||[Name] == ProtectorShield || [Name] == SacredTarge) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [fireresist] > 0 && [Sockets] == 3",
			];
			NTIP.arrayLooping(apShields);

			Config.Runewords.push([Runeword.AncientsPledge, "Targe"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Rondache"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Heraldic Shield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Aerin Shield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Akaran Targe"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Akaran Rondache"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Protector Shield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Gilded Shield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Sacred Targe"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Dragon Shield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Scutum"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Kite Shield"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Large Shield"]);

			Config.KeepRunewords.push("([type] == shield || [type] == auricshields) # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 187");
		}

		if (Item.getEquippedItemMerc(3).prefixnum !== 20547 && ["Hammerdin", "Smiter"].indexOf(SetUp.finalBuild) > -1) { // Merc Fortitude
			var fort = [
				"[Name] == ElRune # # [MaxQuantity] == 1",
				"[Name] == SolRune # # [MaxQuantity] == 1",
				"[Name] == DolRune # # [MaxQuantity] == 1",
				"[Name] == LoRune",
				"([Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Quality] == Normal && [Flag] == Ethereal # [Defense] >= 1000 && [Sockets] == 4 # [MaxQuantity] == 1",
				"([Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Quality] == Normal && [Flag] == Ethereal # [Defense] >= 700 && [Sockets] == 0 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(fort);

			Config.Recipes.push([Recipe.Socket.Armor, "Hellforge Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Kraken Shell"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Balrog Skin"]);
			Config.Recipes.push([Recipe.Socket.Armor, "BoneWeave"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Great Hauberk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Loricated Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Diamond Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Wire Fleece"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Scarab Husk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "WyrmHide"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Dusk Shroud"]);

			Config.Runewords.push([Runeword.Fortitude, "Breast Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Mage Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Hellforge Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Kraken Shell"]);
			Config.Runewords.push([Runeword.Fortitude, "Archon Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Balrog Skin"]);
			Config.Runewords.push([Runeword.Fortitude, "BoneWeave"]);
			Config.Runewords.push([Runeword.Fortitude, "Great Hauberk"]);
			Config.Runewords.push([Runeword.Fortitude, "Loricated Mail"]);
			Config.Runewords.push([Runeword.Fortitude, "Diamond Mail"]);
			Config.Runewords.push([Runeword.Fortitude, "Wire Fleece"]);
			Config.Runewords.push([Runeword.Fortitude, "Scarab Husk"]);
			Config.Runewords.push([Runeword.Fortitude, "WyrmHide"]);
			Config.Runewords.push([Runeword.Fortitude, "Dusk Shroud"]);

			Config.KeepRunewords.push("[type] == armor # [enhanceddefense] >= 200 && [enhanceddamage] >= 300");
		}

		if (Item.getEquippedItemMerc(3).tier < 15000) { // Merc Treachery
			var Treachery = [
				"([Name] == BreastPlate || [Name] == MagePlate || [Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
				"!me.normal && ([Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Quality] == Normal && [Flag] == Ethereal # [Sockets] == 0 # [MaxQuantity] == 1",
			];
			
			if (me.getItem(622) && me.getItem(629)) {	// Shael and Lem
				NTIP.arrayLooping(Treachery);
			}

			Config.Recipes.push([Recipe.Socket.Armor, "Hellforge Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Kraken Shell"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Balrog Skin"]);
			Config.Recipes.push([Recipe.Socket.Armor, "BoneWeave"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Great Hauberk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Loricated Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Diamond Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Wire Fleece"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Scarab Husk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "WyrmHide"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Dusk Shroud"]);

			Config.Runewords.push([Runeword.Treachery, "Breast Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Mage Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Hellforge Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Kraken Shell"]);
			Config.Runewords.push([Runeword.Treachery, "Archon Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Balrog Skin"]);
			Config.Runewords.push([Runeword.Treachery, "BoneWeave"]);
			Config.Runewords.push([Runeword.Treachery, "Great Hauberk"]);
			Config.Runewords.push([Runeword.Treachery, "Loricated Mail"]);
			Config.Runewords.push([Runeword.Treachery, "Diamond Mail"]);
			Config.Runewords.push([Runeword.Treachery, "Wire Fleece"]);
			Config.Runewords.push([Runeword.Treachery, "Scarab Husk"]);
			Config.Runewords.push([Runeword.Treachery, "WyrmHide"]);
			Config.Runewords.push([Runeword.Treachery, "Dusk Shroud"]);

			Config.KeepRunewords.push("[Type] == armor # [ias] == 45 && [coldresist] == 30");
		}

		if (Item.getEquippedItem(3).tier < 450) { // Smoke
			if (!Check.haveItem("armor", "runeword", "Smoke") && !me.hell) {
				if (!me.getItem(626)) { // Cube to Lum Rune
					Config.Recipes.push([Recipe.Rune, "Io Rune"]); // cube Io to Lum
				}

				var smokeRunes = [
					"[Name] == NefRune # # [MaxQuantity] == 1",
					"[Name] == LumRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(smokeRunes);
			}

			if (me.getItem(626)) {
				NTIP.addLine("([Name] == demonhidearmor || [Name] == DuskShroud || [Name] == GhostArmor || [Name] == LightPlate || [Name] == MagePlate || [Name] == SerpentskinArmor || [Name] == trellisedarmor || [Name] == WyrmHide) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1");
			}

			Config.Runewords.push([Runeword.Smoke, "demonhide armor"]);
			Config.Runewords.push([Runeword.Smoke, "Dusk Shroud"]);
			Config.Runewords.push([Runeword.Smoke, "Ghost Armor"]);
			Config.Runewords.push([Runeword.Smoke, "Light Plate"]);
			Config.Runewords.push([Runeword.Smoke, "Mage Plate"]);
			Config.Runewords.push([Runeword.Smoke, "Serpentskin Armor"]);
			Config.Runewords.push([Runeword.Smoke, "trellised armor"]);
			Config.Runewords.push([Runeword.Smoke, "WyrmHide"]);

			Config.KeepRunewords.push("[type] == armor # [fireresist] == 50");
		}

		if (Item.getEquippedItem(3).tier < 233) { // Stealth
			if (!Check.haveItem("armor", "runeword", "Stealth") && me.normal) {
				var stealthRunes = [
					"[Name] == TalRune # # [MaxQuantity] == 1",
					"[Name] == EthRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(stealthRunes);
			}

			var stealthArmor = [
				"!me.hell && ([Name] == StuddedLeather || [Name] == BreastPlate || [Name] == LightPlate) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
				"([Name] == GhostArmor || [Name] == SerpentskinArmor || [Name] == MagePlate) && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(stealthArmor);

			Config.Runewords.push([Runeword.Stealth, "Mage Plate"]);
			Config.Runewords.push([Runeword.Stealth, "Serpentskin Armor"]);
			Config.Runewords.push([Runeword.Stealth, "Ghost Armor"]);
			Config.Runewords.push([Runeword.Stealth, "Light Plate"]);
			Config.Runewords.push([Runeword.Stealth, "Breast Plate"]);
			Config.Runewords.push([Runeword.Stealth, "Studded Leather"]);

			Config.KeepRunewords.push("[type] == armor # [frw] == 25");
		}
	}
}
