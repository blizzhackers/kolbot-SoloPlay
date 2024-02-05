/**
*  @filename    Paladin.js
*  @author      theBGuy
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

(function LoadConfig () {
  includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");
  includeIfNotIncluded("SoloPlay/Functions/Globals.js");

  const LADDER_ENABLED = (me.ladder || Developer.addLadderRW);
  
  SetUp.include();
  SetUp.config();

  /* Pickit configuration. */
  Config.PickRange = 40;
  //	Config.PickitFiles.push("kolton.nip");
  //	Config.PickitFiles.push("LLD.nip");

  /* Gambling configuration. */
  Config.GambleItems.push("Amulet");
  Config.GambleItems.push("Ring");
  Config.GambleItems.push("Circlet");
  Config.GambleItems.push("Coronet");

  let weapons = [
    sdk.items.type.Scepter,
    sdk.items.type.Mace,
    sdk.items.type.Sword,
    sdk.items.type.Knife,
    sdk.items.type.Axe,
    sdk.items.type.Wand,
    sdk.items.type.Hammer,
    sdk.items.type.Club
  ].map(el => "[type] == " + el).join(" || ");

  // AutoEquip setup
  const levelingTiers = [
    // Weapon
    "(" + weapons + ") && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // Shield
    "([type] == shield || [type] == auricshields) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // non runeword white items
    "(" + weapons + ") && [quality] >= normal && [flag] != ethereal && [flag] != runeword && [2handed] == 0 # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 3) # [tier] == tierscore(item)",
    "([type] == shield || [type] == auricshields) && [quality] >= normal && [flag] != ethereal && [flag] != runeword # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 2) # [tier] == tierscore(item)",
  ];

  let miscCharmQuantity = me.charlvl < 40 ? 6 : 3;
  const expansionTiers = [
    // Switch
    "[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == 25000",			// Weaken charged wand
    "[name] == beardedaxe && [quality] == unique # [itemchargedskill] == 87 # [secondarytier] == 50000",	// Spellsteel Decrepify charged axe
    // Charms
    "[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == smallcharm && [quality] == magic # # [invoquantity] == " + miscCharmQuantity + " && [charmtier] == charmscore(item)",
    "[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
  ];

  /* Gear */
  NTIP.buildList(levelingTiers);
  me.expansion && NTIP.buildList(expansionTiers);

  /* Attack configuration. */
  Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
  Config.LowManaSkill = [0, 0];
  Config.MaxAttackCount = 1000;
  Config.BossPriority = me.normal;
  Config.ClearType = 0;
  Config.ClearPath = { Range: (Pather.canTeleport() ? 30 : 10), Spectype: 0 };

  /* Class specific configuration. */
  Config.AvoidDolls = true;
  Config.Vigor = true;
  Config.Charge = true;
  Config.Redemption = [45, 25];

  // Maybe add auric shield?
  Config.imbueables = (function () {
    /**
     * @param {number} name 
     * @param {function(): boolean} condition 
     */
    const _imbueObj = (name, condition) => ({ name: name, condition: condition });

    return [
      _imbueObj(
        sdk.items.WarScepter,
        function () {
          return me.normal;
        }
      ),
      _imbueObj(
        sdk.items.DivineScepter,
        function () {
          return !me.normal && (me.trueStr < 125 || me.trueDex < 60);
        }
      ),
      _imbueObj(
        sdk.items.MightyScepter,
        function () {
          return me.equipped.get(sdk.body.RightArm).tier < 777 && (me.trueStr >= 125 || me.trueDex >= 60);
        }
      ),
      _imbueObj(
        sdk.items.Belt,
        function () {
          return me.normal && (me.equipped.get(sdk.body.RightArm).tier > 777 || me.classic);
        }
      ),
      _imbueObj(
        sdk.items.MeshBelt,
        function () {
          return !me.normal && me.charlvl < 46 && me.trueStr > 58
            && (me.equipped.get(sdk.body.RightArm).tier > 777 || me.classic);
        }
      ),
      _imbueObj(
        sdk.items.SpiderwebSash,
        function () {
          return !me.normal && me.trueStr > 50 && (me.equipped.get(sdk.body.RightArm).tier > 777 || me.classic);
        }
      ),
    ].filter((item) => item.condition());
  })();

  let imbueArr = SetUp.imbueItems();

  !me.smith && NTIP.buildList(imbueArr);

  switch (me.gametype) {
  case sdk.game.gametype.Classic:
    // Res shield
    if (me.equipped.get(sdk.body.LeftArm).tier < 487) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/PDiamondShield.js");
    }

    break;
  case sdk.game.gametype.Expansion:
    NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");
    const { basicSocketables, addSocketableObj } = require("../Utils/General");

    Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);
    Config.socketables.push(addSocketableObj(sdk.items.Shako, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
      true, (item) => item.unique && !item.ethereal
    ));

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

    if (me.equipped.get(sdk.body.Gloves).tier < 110000) {
      Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
    }

    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      // Spirit on swap
      NTIP.addLine("[type] == auricshields && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000");
    }

    // FinalBuild specific setup
    let dreamerCheck;

    switch (SetUp.finalBuild) {
    case "Smiter":
    case "Zealer":
      // Grief
      if (LADDER_ENABLED && !me.checkItem({ name: sdk.locale.items.Grief }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Grief.js");
      }

      if (SetUp.finalBuild === "Zealer") {
        Config.socketables.push(addSocketableObj(sdk.items.GrimHelm,
          [sdk.items.runes.Ber], [sdk.items.gems.Perfect.Ruby],
          true, (item) => item.unique && item.getStat(sdk.stats.DamageResist) === 20 && !item.ethereal
        ));
        Config.socketables.push(addSocketableObj(sdk.items.BoneVisage,
          [sdk.items.runes.Ber], [sdk.items.gems.Perfect.Ruby],
          true, (item) => item.unique && item.getStat(sdk.stats.DamageResist) === 20 && !item.ethereal && item.fname.toLowerCase().includes("vampire gaze")
        ));

        Check.itemSockables(sdk.items.GrimHelm, "unique", "Vampire Gaze");
        Check.itemSockables(sdk.items.BoneVisage, "unique", "Vampire Gaze");

        if (!me.checkItem({ name: sdk.locale.items.VampireGaze, classid: sdk.items.BoneVisage }).have) {
          // Upgrade Vamp Gaze to Elite
          Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Grim Helm", Roll.NonEth]);
        }

        // Exile
        if (!me.checkItem({ name: sdk.locale.items.Exile, itemtype: sdk.items.type.AuricShields }).have) {
          includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Exile.js");
        }

        // Fortitude
        if (LADDER_ENABLED
          && !me.checkItem({ name: sdk.locale.items.Fortitude, itemtype: sdk.items.type.Armor }).have) {
          includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Fortitude.js");
        }
      }

      break;
    case "Hammerdin":
      // Heart of the Oak
      if (!me.checkItem({ name: sdk.locale.items.HeartoftheOak }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
      }

      // Spirit Shield
      if (LADDER_ENABLED && me.equipped.get(sdk.body.LeftArm).tier < 110000) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
      }

      break;
    case "Auradin":
      dreamerCheck = me.haveAll([
        { name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields },
        { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }
      ]);

      // Dream Shield
      if (LADDER_ENABLED
        && !me.checkItem({ name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/DreamShield.js");
      }

      // Dream Helm
      if (LADDER_ENABLED
        && !me.checkItem({ name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/DreamHelm.js");
      }

      if (LADDER_ENABLED && !dreamerCheck) {
        // Cube to Jah rune
        if (!me.getItem(sdk.items.runes.Jah)) {
          if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
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

      if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
        // Cube to Mal rune
        if (!me.getItem(sdk.items.runes.Mal) && me.equipped.get(sdk.body.RightArm).tier >= 110000) {
          Config.Recipes.push([Recipe.Rune, "Um Rune"]);
        }
        
        // Cube to Ohm rune
        if (!me.getItem(sdk.items.runes.Ohm)) {
          Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
          Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
        }
      }

      // Dragon Armor
      if (LADDER_ENABLED
        && !me.checkItem({ name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor }).have
        && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/DragonArmor.js");
      }

      if (!me.checkItem({ name: sdk.locale.items.HandofJustice }).have && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HandOfJustice.js");

        // Azurewrath
        NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 230 && [sanctuaryaura] >= 10 # [tier] == 115000");
      }

      if (!me.haveAll([
        { name: sdk.locale.items.CrescentMoon },
        { name: sdk.locale.items.HandofJustice }
      ]) && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");

        // Lightsabre
        NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");
      }

      if (!me.checkItem({ name: sdk.locale.items.VoiceofReason }).have
        && !me.haveSome([
          { name: sdk.locale.items.CrescentMoon },
          { name: sdk.locale.items.HandofJustice }
        ]) && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
      }

      if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude
        && me.haveAll([
          { name: sdk.locale.items.HandofJustice },
          { name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor },
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields },
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }
        ])) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
      }

      break;
    case "Sancdreamer":
      dreamerCheck = me.haveAll([
        { name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields },
        { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }
      ]);

      // Dream Shield
      if (LADDER_ENABLED
        && !me.checkItem({ name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/DreamShield.js");
      }

      // Dream Helm
      if (LADDER_ENABLED && !me.checkItem({ name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/DreamHelm.js");
      }

      if (LADDER_ENABLED && !dreamerCheck) {
        // Cube to Jah rune
        if (!me.getItem(sdk.items.runes.Jah)) {
          if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
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

      if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
        // Cube to Mal rune
        if (!me.getItem(sdk.items.runes.Mal) && me.equipped.get(sdk.body.RightArm).tier >= 110000) {
          Config.Recipes.push([Recipe.Rune, "Um Rune"]);
        }
        
        // Cube to Ohm rune
        if (!me.getItem(sdk.items.runes.Ohm)) {
          Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
          Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
        }
      }

      // Chains of Honor
      if (!me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
      }

      if (!me.checkItem({ name: sdk.locale.items.LastWish }).have && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/LastWish.js");
      }

      if (!me.haveAll([{ name: sdk.locale.items.CrescentMoon }, { name: sdk.locale.items.LastWish }]) && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");

        // Lightsabre
        NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");
      }

      if (!me.checkItem({ name: sdk.locale.items.VoiceofReason }).have
        && !me.haveSome([
          { name: sdk.locale.items.CrescentMoon },
          { name: sdk.locale.items.LastWish }
        ]) && dreamerCheck) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
      }

      if (LADDER_ENABLED && me.haveAll([
        { name: sdk.locale.items.LastWish },
        { name: sdk.locale.items.ChainsofHonor },
        { name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields },
        { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }
      ])) {
        // Infinity
        if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
          if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js")) {
            include("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
          }
        }
        // Merc Fortitude
        if (Item.getMercEquipped(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude) {
          if (!isIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js")) {
            include("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
          }
        }
      }

      break;
    case "Torchadin":
      // Dragon Armor
      if (LADDER_ENABLED && !me.checkItem({ name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/DragonArmor.js");
      }

      if (!me.checkItem({ name: sdk.locale.items.HandofJustice }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HandOfJustice.js");

        // Azurewrath
        NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 230 && [sanctuaryaura] >= 10 # [tier] == 115000");
      }

      // Exile
      if (LADDER_ENABLED
        && !me.checkItem({ name: sdk.locale.items.Exile, itemtype: sdk.items.type.AuricShields }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Exile.js");
      }

      if (LADDER_ENABLED && !me.haveAll([
        { name: sdk.locale.items.HandofJustice },
        { name: sdk.locale.items.Exile, itemtype: sdk.items.type.AuricShields },
        { name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor }
      ])) {
        // Cube to Cham rune
        if (!me.getItem(sdk.items.runes.Cham) || !me.getItem(sdk.items.runes.Sur) || !me.getItem(sdk.items.runes.Lo)) {
          if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
            Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
            Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
            Config.Recipes.push([Recipe.Rune, "Gul Rune"]);

            if (me.checkItem({ name: sdk.locale.items.Exile, itemtype: sdk.items.type.AuricShields }).have) {
              Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
              Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
            } else if (!me.checkItem({ name: sdk.locale.items.Exile, itemtype: sdk.items.type.AuricShields }).have
              && !me.getItem(sdk.items.runes.Ohm)) {
              Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
            }
          }

          if (me.checkItem({ name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor }).have) {
            Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
            Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
          } else if ((!me.haveAll([
            { name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor },
            { name: sdk.locale.items.HandofJustice }
          ]) && !me.getItem(sdk.items.runes.Sur))) {
            Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
          }

          Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
          Config.Recipes.push([Recipe.Rune, "Jah Rune"]);
        }
      }

      if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
        // Cube to Mal rune
        if (!me.getItem(sdk.items.runes.Mal) && me.equipped.get(sdk.body.RightArm).tier >= 110000) {
          Config.Recipes.push([Recipe.Rune, "Um Rune"]);
        }
        
        // Cube to Ohm rune
        if (!me.getItem(sdk.items.runes.Ohm)) {
          Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
          Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
        }
      }

      if (!me.haveAll([{ name: sdk.locale.items.CrescentMoon }, { name: sdk.locale.items.HandofJustice }])) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CrescentMoon.js");

        // Lightsabre
        NTIP.addLine("[name] == phaseblade && [flag] != ethereal && [quality] == unique # [enhanceddamage] >= 150 && [itemabsorblightpercent] == 25 # [tier] == 105000");
      }

      if (!me.checkItem({ name: sdk.locale.items.VoiceofReason }).have
        && !me.haveSome([
          { name: sdk.locale.items.CrescentMoon },
          { name: sdk.locale.items.HandofJustice }
        ])) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/VoiceOfReason.js");
      }

      if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude
        && me.haveAll([
          { name: sdk.locale.items.HandofJustice },
          { name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor },
          { name: sdk.locale.items.Exile, itemtype: sdk.items.type.AuricShields }
        ])) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
      }
      break;
    default:
      break;
    }

    Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
    Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

    // Call to Arms
    if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
    }

    // Enigma - Don't make if not Smiter or Hammerdin
    if (!me.checkItem({ name: sdk.locale.items.Enigma }).have && ["Hammerdin", "Smiter"].includes(SetUp.finalBuild)) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js");
    }

    // Spirit Sword
    if (LADDER_ENABLED && me.equipped.get(sdk.body.RightArm).tier < 777) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
    }

    // Spirit Shield
    if (LADDER_ENABLED
      && (
        me.equipped.get(sdk.body.LeftArm).tier < 1000
        || me.equipped.get(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit
      )) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
    }

    // Merc Insight
    if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
    }

    // Lore
    if (me.equipped.get(sdk.body.Head).tier < 315) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Lore.js");
    }

    /**
     * @todo Rhyme and Splendor
     */

    // Ancients' Pledge
    if (me.equipped.get(sdk.body.LeftArm).tier < 500) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/AncientsPledge.js");
    }

    // Merc Fortitude
    if (Item.getMercEquipped(sdk.body.Armor).prefixnum !== sdk.locale.items.Fortitude && ["Hammerdin", "Smiter"].includes(SetUp.finalBuild)) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercFortitude.js");
    }

    // Merc Treachery
    if (Item.getMercEquipped(sdk.body.Armor).tier < 15000) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
    }

    // Smoke
    if (me.equipped.get(sdk.body.Armor).tier < 450) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js");
    }

    // Stealth
    if (me.equipped.get(sdk.body.Armor).tier < 233) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js");
    }

    /* if (SetUp.currentBuild === "Start") {
      let { maxStr, maxDex } = Check.currentBuild();
      let basic = "[flag] != ethereal && [quality] >= normal && [quality] <= superior";
      let myStatsReq = "[strreq] <= " + maxStr + " && [dexreq] <= " + maxDex;
      let statsReq = "[sockets] == 2";
      let quantityReq = "[maxquantity] == 1";
      // add Steel RW
      NTIP.buildList([
        "[name] == TirRune # # [maxquantity] == 2",
        "[name] == ElRune # # [maxquantity] == 2",
        "([type] == sword || [type] == mace || [type] == axe) && " + basic + " && " + myStatsReq + " # " + statsReq + " # " + quantityReq,
      ]);

      // need to make runewords able to process types, maybe a hacky method of just taking a nip line?
      // or could create a base item data module and loop through whatever meets the reqs but that feels ugly too
      Config.KeepRunewords.push("([type] == sword || [type] == mace || [type] == axe) # [enhanceddamage] >= 20 && [ias] >= 25");
    } */

    SoloWants.buildList();

    break;
  }

  return true;
})();
