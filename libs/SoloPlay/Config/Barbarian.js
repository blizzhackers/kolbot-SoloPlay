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

(function LoadConfig () {
  includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");
  includeIfNotIncluded("SoloPlay/Functions/Globals.js");

  const LADDER_ENABLED = (me.ladder || Developer.addLadderRW);
  
  SetUp.include();
  SetUp.config();

  /* Pickit configuration. */
  Config.PickRange = 40;
  Config.FieldID.UsedSpace = 80; // how much space has been used before trying to field id, set to 0 to id after every item picked
  //	Config.PickitFiles.push("kolton.nip");
  //	Config.PickitFiles.push("LLD.nip");

  /* Gambling configuration. */
  Config.GambleItems.push("Amulet");
  Config.GambleItems.push("Ring");

  /* AutoEquip configuration. */
  Config.AutoEquip = true;

  // AutoEquip setup
  const levelingTiers = [
    // Weapon
    "me.charlvl < 12 && [type] == sword && ([quality] >= normal || [flag] == runeword) && [flag] != ethereal && [wsm] <= 20 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "[type] == sword && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [wsm] <= 10 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "[name] == phaseblade && [quality] == unique && [flag] == ethereal # [enhanceddamage] >= 100 && [ias] == 30 && [magicdamagereduction] >= 7 # [tier] == tierscore(item)",
    // Helmet
    "([type] == primalhelm) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "([type] == primalhelm) && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 3) # [tier] == tierscore(item)",
  ];

  const expansionTiers = [
    // Charms
    "[name] == smallcharm && [quality] == magic # # [invoquantity] == 8 && [charmtier] == charmscore(item)",
    "[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
  ];

  NTIP.buildList(levelingTiers);
  me.expansion && NTIP.buildList(expansionTiers);

  /* Attack configuration. */
  Config.AttackSkill = [-1, 0, 0, 0, 0];
  Config.LowManaSkill = me.getSkill(sdk.skills.DoubleSwing, sdk.skills.subindex.SoftPoints) >= 9
    ? [sdk.skills.DoubleSwing, 0]
    : [0, -1];
  Config.MaxAttackCount = 1000;
  Config.BossPriority = me.normal;
  Config.ClearType = 0;
  Config.ClearPath = { Range: (Pather.canTeleport() ? 30 : 10), Spectype: 0 };

  // Class specific config
  Config.FindItem = true; 		// Use Find Item skill on corpses after clearing.
  Config.FindItemSwitch = false; 	// Switch to non-primary slot when using Find Item skills

  Config.imbueables = (function () {
    /**
     * @param {number} name 
     * @param {function(): boolean} condition 
     */
    const _imbueObj = (name, condition) => ({ name: name, condition: condition });

    return [
      _imbueObj(
        sdk.items.AvengerGuard,
        function () {
          return me.normal && me.expansion;
        }
      ),
      _imbueObj(
        sdk.items.SlayerGuard,
        function () {
          return !me.normal && me.trueStr >= 118 && me.expansion;
        }
      ),
      _imbueObj(
        sdk.items.CarnageHelm,
        function () {
          return me.equipped.get(sdk.body.Head).tier < 100000 && me.trueStr >= 106 && me.expansion;
        }
      ),
      _imbueObj(
        sdk.items.Belt,
        function () {
          return me.normal && (me.equipped.get(sdk.body.Head).tier > 100000 || me.classic);
        }
      ),
      _imbueObj(
        sdk.items.MeshBelt,
        function () {
          return !me.normal && me.charlvl < 46 && me.trueStr > 58
            && (me.equipped.get(sdk.body.RightArm).tier > 100000 || me.classic);
        }
      ),
      _imbueObj(
        sdk.items.SpiderwebSash,
        function () {
          return !me.normal && me.trueStr > 50 && (me.equipped.get(sdk.body.RightArm).tier > 100000 || me.classic);
        }
      ),
    ].filter((item) => item.condition());
  })();

  let imbueArr = SetUp.imbueItems();

  !me.smith && NTIP.buildList(imbueArr);

  switch (me.gametype) {
  case sdk.game.gametype.Classic:
    break;
  case sdk.game.gametype.Expansion:
    NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");
    const { basicSocketables, addSocketableObj } = require("../Utils/General");
    
    /** @param {ItemUnit} item */
    const honorCheck = function (item) {
      /** @type {GetOwnedSettings} */
      const wanted = {
        itemType: sdk.items.type.Sword,
        mode: sdk.items.mode.inStorage,
        sockets: 5,
        /** @param {ItemUnit} item */
        cb: function (item) {
          return item.isBaseType;
        }
      };
      return (item.ilvl >= 41 && item.isBaseType && !item.ethereal
        && !me.getOwned(wanted).length
        && !me.checkItem({ name: sdk.locale.items.Honor }).have);
    };

    Config.socketables = Config.socketables.concat(basicSocketables.all);
    Config.socketables.push(addSocketableObj(sdk.items.Flamberge, [], [],
      true,
      /** @param {ItemUnit} item */
      function (item) {
        return me.normal && me.equipped.get(sdk.body.LeftArm).tier < 600 && honorCheck(item);
      }
    ));
    Config.socketables.push(addSocketableObj(sdk.items.Zweihander, [], [],
      true,
      /** @param {ItemUnit} item */
      function (item) {
        return me.equipped.get(sdk.body.LeftArm).tier < 1000 && honorCheck(item);
      }
    ));

    if (SetUp.finalBuild !== "Immortalwhirl") {
      Config.socketables.push(addSocketableObj(sdk.items.SlayerGuard,
        [sdk.items.runes.Cham], [sdk.items.gems.Perfect.Ruby],
        true, (item) => item.unique && !item.ethereal
      ));
    }

    if (["Immortalwhirl", "Singer"].indexOf(SetUp.finalBuild) === -1) {
      // Grief
      if (LADDER_ENABLED
        && (
          !me.checkItem({ name: sdk.locale.items.Grief }).have
          || (SetUp.finalBuild === "Whirlwind" && me.equipped.get(sdk.body.LeftArm).prefixnum !== sdk.locale.items.Grief)
        )) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Grief.js");
      }

      // Fortitude
      if (LADDER_ENABLED && SetUp.finalBuild !== "Uberconc"
        && me.checkItem({ name: sdk.locale.items.Grief }).have
        && !me.checkItem({ name: sdk.locale.items.Fortitude, itemtype: sdk.items.type.Armor }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Fortitude.js");
      }

      // Doom
      if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== 20532) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercDoom.js");
      }
    }

    // FinalBuild specific setup
    switch (SetUp.finalBuild) {
    case "Uberconc":
      if (me.checkItem({ name: sdk.locale.items.Grief }).have && SetUp.finalBuild === "Uberconc") {
        // Add Stormshield
        NTIP.addLine("[name] == monarch && [quality] == unique && [flag] != ethereal # [damageresist] >= 35 # [tier] == 100000");
      }

      // Chains of Honor
      if (!me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
      }

      break;
    case "Frenzy":
      // Breathe of the Dying
      if (!me.checkItem({ name: sdk.locale.items.BreathoftheDying }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/BreathoftheDying.js");
      }

      break;
    case "Singer":
      // Heart of the Oak
      if (me.equipped.get(sdk.body.LeftArm).prefixnum !== sdk.locale.items.HeartoftheOak
        && me.checkItem({ name: sdk.locale.items.Enigma }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
      }

      // Enigma
      if (!me.checkItem({ name: sdk.locale.items.Enigma }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js");
      }

      break;
    case "Immortalwhirl":
      // Infinity
      if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
      }

      Config.socketables.push(addSocketableObj(sdk.items.AvengerGuard,
        [sdk.items.runes.Ber], [sdk.items.gems.Perfect.Ruby],
        false, (item) => item.set && !item.ethereal
      ));
      Config.socketables.push(addSocketableObj(sdk.items.OgreMaul,
        [sdk.items.runes.Shael], [],
        false, (item) => item.set && !item.ethereal
      ));
      Config.socketables.push(addSocketableObj(sdk.items.SacredArmor,
        [sdk.items.runes.Ber], [sdk.items.gems.Perfect.Ruby],
        true, (item) => item.set && !item.ethereal
      ));

      Check.itemSockables(sdk.items.OgreMaul, "set", "Immortal King's Stone Crusher");

      break;
    case "Whirlwind":
      break;
    default:
      break;
    }

    /* Crafting */
    if (me.equipped.get(sdk.body.Neck).tier < 100000) {
      Check.currentBuild().caster
        ? Config.Recipes.push([Recipe.Caster.Amulet])
        : Config.Recipes.push([Recipe.Blood.Amulet]);
    }

    if (me.equipped.get(sdk.body.RingLeft).tier < 100000) {
      Check.currentBuild().caster
        ? Config.Recipes.push([Recipe.Caster.Ring])
        : Config.Recipes.push([Recipe.Blood.Ring]);
    }

    if (me.equipped.get(sdk.body.LeftArm).tier < 1370) {
      if (me.rawStrength >= 150 && me.rawDexterity >= 88) {
        // Upgrade Bloodletter to Elite
        Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "Gladius", Roll.NonEth]);
      }

      if (me.rawStrength >= 25 && me.rawDexterity >= 136) {
        // Upgrade Ginther's Rift to Elite
        Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "dimensionalblade", Roll.Eth]);
      }

      if (!me.checkItem({ name: sdk.locale.items.Bloodletter, classid: sdk.items.Falcata }).have) {
        NTIP.addLine("[name] == PulRune # # [maxquantity] == 1");
        NTIP.addLine("[name] == perfectemerald # # [maxquantity] == 1");
        // Bloodletter
        NTIP.addLine("[name] == gladius && [quality] == unique && [flag] != ethereal # [enhanceddamage] >= 140 && [ias] >= 20 # [maxquantity] == 1");
        // upped Bloodletter
        NTIP.addLine("[name] == falcata && [quality] == unique && [flag] != ethereal # [enhanceddamage] >= 140 && [ias] >= 20 # [maxquantity] == 1");
      }

      if (!me.checkItem({ name: sdk.locale.items.GinthersRift, classid: sdk.items.DimensionalBlade }).have) {
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
    if (me.equipped.get(sdk.body.LeftArm).tier < 1370) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Lawbringer.js");
    }

    // Voice Of Reason - Lem/Ko/El/Eld
    if (me.equipped.get(sdk.body.RightArm).tier > 1100
      && me.equipped.get(sdk.body.LeftArm).tier < 1270
      && !me.checkItem({ name: sdk.locale.items.Ravenfrost }).have
    ) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
    }

    // Crescent Moon - Shael/Um/Tir
    if (me.equipped.get(sdk.body.LeftArm).tier < 1100) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");
    }

    if (me.equipped.get(sdk.body.LeftArm).tier < 1200) {
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
    if (me.equipped.get(sdk.body.LeftArm).tier < 1050) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Honor.js");
    }

    // Merc Insight
    if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
    }

    // Lore
    if (me.equipped.get(sdk.body.Head).tier < 100000) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Lore.js");
    }

    // Merc Fortitude
    if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
    }

    // Merc Treachery
    if (Item.getMercEquipped(sdk.body.Armor).tier < 15000 && me.equipped.get(sdk.body.RightArm).tier > 1100) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
    }

    // Treachery
    if (me.equipped.get(sdk.body.Armor).tier < 634 && me.equipped.get(sdk.body.RightArm).tier > 1100) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Treachery.js");
    }

    // Smoke
    if (me.equipped.get(sdk.body.Armor).tier < 350) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js");
    }

    // Duress
    if (me.equipped.get(sdk.body.Armor).tier < 600
      && (
        me.checkItem({ name: sdk.locale.items.CrescentMoon }).have
        || me.equipped.get(sdk.body.LeftArm).tier > 900
      )) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Duress.js");
    }

    // Myth
    if (me.equipped.get(sdk.body.Armor).tier < 340) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Myth.js");
    }

    // Kings Grace - Amn/Ral/Thul
    if (me.equipped.get(sdk.body.LeftArm).tier < 770) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/KingsGrace.js");
    }

    // Steel - Tir/El
    if (me.equipped.get(sdk.body.LeftArm).tier < 500) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Steel.js");
    }

    // Spirit Sword
    if (LADDER_ENABLED && me.equipped.get(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
    }

    // Malice - IthElEth
    if (me.equipped.get(sdk.body.LeftArm).tier < 175) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Malice.js");
    }

    // Stealth
    if (me.equipped.get(sdk.body.Armor).tier < 233) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js");
    }

    /*if (me.equipped.get(sdk.body.Gloves).tier < 233) {
      NTIP.addLine("[name] == heavygloves && [flag] != ethereal && [quality] == magic # [itemchargedskill] >= 0 # [maxquantity] == 1");
      Config.Recipes.push([Recipe.Blood.Gloves, "Heavy Gloves"]); // Craft Blood Gloves
    }*/

    Check.itemSockables(sdk.items.Ataghan, "unique", "Djinn Slayer");
    SoloWants.buildList();

    break;
  }

  return true;
})();
