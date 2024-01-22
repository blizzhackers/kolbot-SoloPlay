/**
*  @filename    Amazon.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Amazon
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Witchyzon
*        Wfzon
*        Faithbowzon
*        Javazon
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
  //	Config.PickitFiles.push("kolton.nip");
  //	Config.PickitFiles.push("LLD.nip");

  /* Gambling configuration. */
  if (me.equipped.get(sdk.body.Neck).tier < 100000) {
    Config.GambleItems.push("Amulet");
  }
  if (me.equipped.get(sdk.body.RingLeft).tier < 100000
    || me.equipped.get(sdk.body.RingRight).tier < 100000) {
    Config.GambleItems.push("Ring");
  }
  if (me.equipped.get(sdk.body.Head).tier < 100000) {
    Config.GambleItems.push("Circlet");
    Config.GambleItems.push("Coronet");
  }

  if (me.equipped.get(sdk.body.RightArm).tier < 100000) {
    Config.GambleItems.push("Javelin");
    Config.GambleItems.push("Pilum");
    Config.GambleItems.push("Short Spear");
    Config.GambleItems.push("Throwing Spear");
  }
  // AutoEquip setup
  const levelingTiers = [
    // Weapon
    "([type] == javelin || [type] == amazonjavelin) && [quality] >= normal && [flag] != ethereal && [wsm] <= 10 && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // "[name] == ceremonialjavelin && [quality] == unique && [flag] == ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)", // too many issues with eth titans
  ];

  const expansionTiers = [
    // Switch
    "[type] == wand && [quality] >= normal # [itemchargedskill] == 72 # [secondarytier] == 25000",								// Weaken charged wand
    "[type] == wand && [quality] >= normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
    // Charms
    "[name] == smallcharm && [quality] == magic # # [invoquantity] == 8 && [charmtier] == charmscore(item)",
    "[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
  ];

  NTIP.buildList(levelingTiers);
  me.expansion && NTIP.buildList(expansionTiers);

  if (["Witchyzon", "Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1) {
    NTIP.addLine("[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)");
    NTIP.addLine("([type] == shield) && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 2) # [tier] == tierscore(item)");
    NTIP.addLine("me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)");
  }

  /* Attack configuration. */
  Config.AttackSkill = [0, 0, 0, 0, 0];
  Config.LowManaSkill = [-1, -1];
  Config.MaxAttackCount = 1000;
  Config.BossPriority = false;
  Config.ClearType = 0;
  Config.ClearPath = { Range: (Pather.canTeleport() ? 30 : 20), Spectype: sdk.monsters.spectype.All };

  // Class specific config
  Config.LightningFuryDelay = 10; // Lightning fury interval in seconds. LF is treated as timed skill.
  Config.SummonValkyrie = true; 	// Summon Valkyrie

  Config.imbueables = (function () {
    /**
     * @param {number} name 
     * @param {function(): boolean} condition 
     */
    const _imbueObj = (name, condition) => ({ name: name, condition: condition });

    return [
      _imbueObj(
        sdk.items.MaidenJavelin,
        function () {
          return me.normal && me.expansion;
        }
      ),
      _imbueObj(
        sdk.items.CeremonialJavelin,
        function () {
          return !me.normal && (me.charlvl < 48 || me.trueStr < 107 || me.trueDex < 151) && me.expansion;
        }
      ),
      _imbueObj(
        sdk.items.MatriarchalJavelin,
        function () {
          return me.equipped.get(sdk.body.RightArm).tier < 100000
            && me.trueStr >= 107 && me.trueDex >= 151 && me.expansion;
        }
      ),
      _imbueObj(
        sdk.items.Belt,
        function () {
          return me.normal && (me.equipped.get(sdk.body.RightArm).tier > 100000 || me.classic);
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
          return !me.normal && me.trueStr > 50
            && (me.equipped.get(sdk.body.RightArm).tier > 100000 || me.classic);
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
    NTIP.addLine("[name] >= Vexrune && [name] <= Zodrune");
    const { basicSocketables, addSocketableObj } = require("../Utils/General");

    Config.socketables = Config.socketables.concat(basicSocketables.all);
    Config.socketables.push(addSocketableObj(
      sdk.items.Bill, [], [],
      me.normal, (item) => item.ilvl >= 26 && item.isBaseType
    ));
    Config.socketables.push(addSocketableObj(
      sdk.items.Shako,
      [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
      true, (item) => item.unique && !item.ethereal
    ));

    Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
    Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

    /* Crafting */
    // Going with Blood but TODO is test HitPower vs Blood
    if (me.equipped.get(sdk.body.Neck).tier < 100000) {
      Config.Recipes.push([Recipe.Blood.Amulet]);
    }

    if (me.equipped.get(sdk.body.RingLeft).tier < 100000) {
      Config.Recipes.push([Recipe.Blood.Ring]);
    }

    // FinalBuild specific setup
    switch (SetUp.finalBuild) {
    case "Witchyzon":
    case "Faithbowzon":
    case "Wfzon":
      if (["Witchyzon", "Wfzon", "Faithbowzon"].includes(SetUp.currentBuild)) {
        NTIP.addLine("[type] == bowquiver # # [maxquantity] == 1");
      }

      if (SetUp.finalBuild === "Wfzon") {
        if (!me.checkItem({ name: sdk.locale.items.Windforce, classid: sdk.items.HydraBow }).have) {
          NTIP.addLine("[name] == hydrabow && [quality] == unique # [manaleech] >= 6 # [maxquantity] == 1");
        }

        Config.socketables.push(addSocketableObj(
          sdk.items.HydraBow,
          [sdk.items.runes.Shael], [sdk.items.runes.Amn],
          true,
          (item) => item.unique
        ));
      }

      if ((SetUp.finalBuild === "Faithbowzon")
        && !me.checkItem({ name: sdk.locale.items.Faith, classid: sdk.items.GrandMatronBow }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Faith.js");
      }
        
      if (!me.checkItem({ name: sdk.locale.items.WitchwildString, classid: sdk.items.DiamondBow }).have
        && (SetUp.finalBuild === "Witchyzon" || ["Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1)) {
        NTIP.addLine("[name] == shortsiegebow && [quality] == unique # [fireresist] == 40 # [maxquantity] == 1");
        // Witchyzon only - keep the bow but don't upgrade it until we have our wanted belt
        if (["Wfzon", "Faithbowzon"].includes(SetUp.finalBuild)
          || (
            SetUp.finalBuild === "Witchyzon"
            && me.checkItem({ name: sdk.locale.items.NosferatusCoil }).have
          )) {
          Config.Recipes.push([Recipe.Unique.Weapon.ToElite, "Short Siege Bow", Roll.NonEth]);
        }
      }

      // Spirit shield - while lvling and Wf final switch
      if ((LADDER_ENABLED) && (me.equipped.get(5).tier < 1000
        && (["Witchyzon", "Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1)
        || (SetUp.finalBuild === "Wfzon" && me.equipped.get(12).prefixnum !== sdk.locale.items.Spirit))) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
      }

      Config.socketables.push(addSocketableObj(
        sdk.items.DiamondBow,
        [sdk.items.runes.Nef, sdk.items.runes.Shael], [sdk.items.gems.Perfect.Skull],
        false,
        (item) => item.unique
      ));
      Config.socketables.push(addSocketableObj(
        sdk.items.BoneVisage,
        [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
        true,
        (item) => (item.unique && item.getStat(sdk.stats.LifeLeech) === 8
          && item.getStat(sdk.stats.DamageResist) === 20 && !item.ethereal)
      ));

      break;
    case "Javazon":
      Config.SkipImmune = ["lightning and physical"];

      if (me.checkSkill(sdk.skills.ChargedStrike, sdk.skills.subindex.HardPoints)) {
        // "Monster name": [-1, -1],
        Config.CustomAttack = {
          "Fire Tower": [sdk.skills.ChargedStrike, -1],
        };
      }

      // Infinity
      if ((LADDER_ENABLED)
        && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
      }

      // Spirit shield
      if (LADDER_ENABLED
        && (me.equipped.get(sdk.body.LeftArm).tier < 1000
        || me.equipped.get(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
      }

      break;
    default:
      break;
    }

    // Call to Arms
    if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
    }

    // Chains of Honor
    if (!me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
    }

    // Merc Insight
    if ((LADDER_ENABLED) && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
    }

    // Lore
    if (me.equipped.get(sdk.body.Head).tier < 250) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Lore.js");
    }

    // Ancients' Pledge
    if (me.equipped.get(sdk.body.LeftArm).tier < 500 && ["Witchyzon", "Wfzon", "Faithbowzon"].indexOf(SetUp.currentBuild) === -1) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/AncientsPledge.js");
    }

    // Treachery
    if (me.equipped.get(sdk.body.Armor).tier < 634) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Treachery.js");
    }

    // Merc Doom
    if ((LADDER_ENABLED) && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== 20532 && SetUp.finalBuild !== "Javazon") {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercDoom.js");
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
    if (me.equipped.get(sdk.body.Armor).tier < 634) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Smoke.js");
    }

    // Stealth
    if (me.equipped.get(sdk.body.Armor).tier < 233) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Stealth.js");
    }

    SoloWants.buildList();

    break;
  }

  return true;
})();
