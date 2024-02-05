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

  const LADDER_ENABLED = (me.ladder || Developer.addLadderRW);
  
  SetUp.include();
  SetUp.config();

  /* Necro specific Chicken configuration. */
  Config.IronGolemChicken = 30;

  /* Pickit configuration. */
  Config.PickRange = 40;
  //	Config.PickitFiles.push("kolton.nip");
  //	Config.PickitFiles.push("LLD.nip");

  /* Gambling configuration. */
  Config.GambleItems.push("Amulet");
  Config.GambleItems.push("Ring");
  Config.GambleItems.push("Circlet");
  Config.GambleItems.push("Coronet");

  // AutoEquip setup
  const levelingTiers = [
    // Weapon
    "([type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "[type] == wand && [quality] >= normal && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 && [sockets] != 2 # [tier] == tierscore(item)",
    // Shield
    "([type] == shield && ([quality] >= magic || [flag] == runeword) || [type] == voodooheads) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "[type] == voodooheads && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && [sockets] == 1 # [tier] == tierscore(item)",
    "me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // non runeword white items
    "([type] == shield) && [quality] >= normal && [flag] != ethereal && [flag] != runeword # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 2) # [tier] == tierscore(item)",
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
  Config.Dodge = me.checkItem({ name: sdk.locale.items.Enigma, itemtype: sdk.items.type.Armor }).have;
  Config.DodgeRange = me.checkItem({ name: sdk.locale.items.Enigma, itemtype: sdk.items.type.Armor }).have ? 10 : 5;
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
  Config.ExplodeCorpses = me.checkSkill(sdk.skills.CorpseExplosion, sdk.skills.subindex.HardPoints)
    ? sdk.skills.CorpseExplosion
    : me.checkSkill(sdk.skills.PoisonExplosion, sdk.skills.subindex.HardPoints)
      ? sdk.skills.PoisonExplosion
      : 0;

  Config.imbueables = (function () {
    /**
     * @param {number} name 
     * @param {function(): boolean} condition 
     */
    const _imbueObj = (name, condition) => ({ name: name, condition: condition });

    return [
      _imbueObj(
        sdk.items.DemonHead,
        () => (me.normal && me.expansion)
      ),
      _imbueObj(
        sdk.items.HierophantTrophy,
        () => (!me.normal && (me.charlvl < 66 || me.trueStr < 106) && me.expansion)
      ),
      _imbueObj(
        sdk.items.BloodlordSkull,
        () => (me.equipped.get(sdk.body.LeftArm).tier < 1000 && me.expansion)
      ),
      _imbueObj(
        sdk.items.Belt,
        () => (me.normal && (me.equipped.get(sdk.body.LeftArm).tier > 1000 || me.classic))
      ),
      _imbueObj(
        sdk.items.MeshBelt,
        () => (!me.normal && me.charlvl < 46 && me.trueStr > 58
          && (me.equipped.get(sdk.body.LeftArm).tier > 1000 || me.classic))
      ),
      _imbueObj(
        sdk.items.SpiderwebSash,
        () => (!me.normal && me.trueStr > 50
          && (me.equipped.get(sdk.body.LeftArm).tier > 1000 || me.classic))
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
    Config.socketables.push(addSocketableObj(sdk.items.Monarch, [], [],
      !me.hell,
      /** @param {ItemUnit} item */
      function (item) {
        /** @type {GetOwnedSettings} */
        const wanted = {
          classid: sdk.items.Monarch,
          mode: sdk.items.mode.inStorage,
          sockets: 4,
          /** @param {ItemUnit} item */
          cb: function (item) {
            return item.isBaseType;
          }
        };
        return !me.getOwned(wanted).length && item.ilvl >= 41 && item.isBaseType && !item.ethereal;
      }
    ));
    Config.socketables.push(addSocketableObj(sdk.items.Shako, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
      true, (item) => item.unique && !item.ethereal
    ));

    /* Crafting */
    if (me.equipped.get(sdk.body.Neck).tier < 100000) {
      Config.Recipes.push([Recipe.Caster.Amulet]);
    }

    // upgrade magefist
    if (me.equipped.get(sdk.body.Gloves).tier < 110000) {
      Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
      Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
    }

    Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");
    Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

    /* Crafting */
    if (me.equipped.get(sdk.body.Neck).tier < 100000) {
      Config.Recipes.push([Recipe.Caster.Amulet]);
    }

    if (me.equipped.get(sdk.body.RingLeft).tier < 100000) {
      Config.Recipes.push([Recipe.Caster.Ring]);
    }

    // Call to Arms
    if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      NTIP.addLine("[type] == staff && [quality] == Magic # [itemchargedskill] == 54 # [secondarytier] == 50000 + chargeditemscore(item, 54)");
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
    }

    // White
    if (SetUp.currentBuild !== "Summon") {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/White.js");
    }

    // Rhyme
    if (me.equipped.get(sdk.body.LeftArm).tier < 650) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Rhyme.js");
    }
      
    // Enigma
    if (!me.checkItem({ name: sdk.locale.items.Enigma }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js");
    }

    // Spirit Sword
    if (LADDER_ENABLED && me.equipped.get(sdk.body.RightArm).tier < 777) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
    }

    // Spirit shield
    if (LADDER_ENABLED
      && (me.equipped.get(sdk.body.LeftArm).tier < 1000
      || (me.equipped.get(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)
      && me.equipped.get(sdk.body.RightArmSecondary).prefixnum === sdk.locale.items.CalltoArms)) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
    }

    // Merc Insight
    if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
    }

    if (!me.haveSome([{ name: sdk.locale.items.Enigma }, { name: sdk.locale.items.Bone }])
      && me.equipped.get(sdk.body.Armor).tier < 650) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Bone.js");
    }

    // Lore
    if (me.equipped.get(sdk.body.Head).tier < 315) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Lore.js");
    }

    // Ancients' Pledge
    if (me.equipped.get(sdk.body.LeftArm).tier < 500) {
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
    if (me.equipped.get(sdk.body.Armor).tier < 450) {
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
