/**
*  @filename    Assassin.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Assassin
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Trapsin
*        Whirlsin
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
  NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");

  /* Gambling configuration. */
  if (me.equipped.get(sdk.body.Neck).tier < 100000) {
    Config.GambleItems.push("Amulet");
  }
  if (me.equipped.get(sdk.body.RingLeft).tier < 100000
    || me.equipped.get(sdk.body.RingRight).tier < 100000) {
    Config.GambleItems.push("Ring");
  }
  // Config.GambleItems.push("Circlet");
  // Config.GambleItems.push("Coronet");

  /* AutoEquip configuration. */
  Config.AutoEquip = true;

  // AutoEquip setup
  const levelingTiers = [
    // Weapon
    "([type] == knife || [type] == sword && [flag] == runeword || ([type] == handtohand || [type] == assassinclaw) && [quality] >= magic) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // Shield
    "[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // Switch
    "[type] == wand && [quality] >= normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
    // Charms
    "[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == smallcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    // non runeword white items
    "([type] == shield) && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 2) # [tier] == tierscore(item)",
  ];

  NTIP.buildList(levelingTiers);

  /* Attack configuration. */
  Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
  Config.LowManaSkill = [0, 0];
  Config.MaxAttackCount = 1000;
  Config.BossPriority = me.normal;
  Config.ClearType = 0;
  Config.ClearPath = { Range: (Pather.canTeleport() ? 30 : 20), Spectype: 0 };
  
  /* Class specific configuration. */
  Config.UseTraps = true;
  Config.Traps = [
    sdk.skills.LightningSentry,
    sdk.skills.LightningSentry,
    sdk.skills.LightningSentry,
    sdk.skills.DeathSentry,
    sdk.skills.DeathSentry
  ];
  Config.BossTraps = [
    sdk.skills.LightningSentry,
    sdk.skills.LightningSentry,
    sdk.skills.LightningSentry,
    sdk.skills.LightningSentry,
    sdk.skills.LightningSentry
  ];

  Config.SummonShadow = me.checkSkill(sdk.skills.ShadowMaster, sdk.skills.subindex.HardPoints) ? "Master" : 0;
  Config.UseFade = me.checkSkill(sdk.skills.Fade, sdk.skills.subindex.HardPoints);
  Config.UseBoS = me.checkSkill(sdk.skills.BurstofSpeed, sdk.skills.subindex.HardPoints);
  Config.UseVenom = false;
  Config.UseCloakofShadows = me.checkSkill(sdk.skills.CloakofShadows, sdk.skills.subindex.HardPoints);
  Config.AggressiveCloak = false;

  /* Dodge configuration. */
  Config.Dodge = me.checkSkill(sdk.skills.LightningSentry, sdk.skills.subindex.HardPoints);
  Config.DodgeRange = 10;
  Config.DodgeHP = 75;

  Config.imbueables = (function () {
    /**
     * @param {number} name 
     * @param {function(): boolean} condition 
     */
    const _imbueObj = (name, condition) => ({ name: name, condition: condition });

    return [
      _imbueObj(
        sdk.items.Claws,
        function () {
          return me.normal;
        }
      ),
      _imbueObj(
        sdk.items.HandScythe,
        function () {
          return !me.normal && me.equipped.get(sdk.body.RightArm).tier < 777 && (me.trueStr < 79 || me.trueDex < 79);
        }
      ),
      _imbueObj(
        sdk.items.GreaterTalons,
        function () {
          return me.equipped.get(sdk.body.RightArm).tier < 777 && me.trueStr >= 79 && me.trueDex >= 79;
        }
      ),
      _imbueObj(
        sdk.items.Belt,
        function () {
          return me.normal && me.equipped.get(sdk.body.RightArm).tier > 777;
        }
      ),
      _imbueObj(
        sdk.items.MeshBelt,
        function () {
          return !me.normal && me.charlvl < 46 && me.trueStr > 58 && me.equipped.get(sdk.body.RightArm).tier > 777;
        }
      ),
      _imbueObj(
        sdk.items.SpiderwebSash,
        function () {
          return !me.normal && me.trueStr > 50 && me.equipped.get(sdk.body.RightArm).tier > 777;
        }
      ),
    ].filter((item) => item.condition());
  })();
  
  let imbueArr = SetUp.imbueItems();

  !me.smith && NTIP.buildList(imbueArr);

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
  Config.socketables.push(addSocketableObj(
    sdk.items.Shako,
    [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
    true, (item) => item.unique && !item.ethereal
  ));

  switch (SetUp.finalBuild) {
  case "Whirlsin":
    Config.socketables.push(addSocketableObj(
      sdk.items.WingedHelm,
      [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
      true, (item) => item.unique && !item.ethereal
    ));
    
    // Pride
    if ((LADDER_ENABLED) && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Pride) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercPride.js");
    }

    // Chaos
    if (!me.checkItem({ name: sdk.locale.items.Chaos }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Chaos.js");
    }

    // Fury
    if (!me.checkItem({ name: sdk.locale.items.Fury }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Fury.js");
    }

    // Fortitude
    if ((LADDER_ENABLED) && !me.checkItem({ name: sdk.locale.items.Fortitude, itemtype: sdk.items.type.Armor }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Fortitude.js");
    }

    break;
  default:
    Config.socketables.push(addSocketableObj(
      sdk.items.Demonhead,
      [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
      true, (item) => item.unique && !item.ethereal
    ));
    
    // Infinity
    if ((LADDER_ENABLED) && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
    }

    // Heart of the Oak
    if (!me.checkItem({ name: sdk.locale.items.HeartoftheOak }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
    }

    // Enigma
    if (!me.checkItem({ name: sdk.locale.items.Enigma }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Enigma.js");
    }

    break;
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
    includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
  }

  // Spirit Sword
  if ((LADDER_ENABLED) && me.equipped.get(sdk.body.RightArm).tier < 777) {
    includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
  }

  // Spirit shield
  if ((LADDER_ENABLED)
    && (me.equipped.get(sdk.body.LeftArm).tier < 1000
    || me.equipped.get(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
    includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
  }

  // Merc Insight
  if ((LADDER_ENABLED) && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
    includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInsight.js");
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

  return true;
})();
