/**
*  @filename    Sorceress.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Config Settings for SoloPlay Sorceress
*
*  @FinalBuild
*    To select your finalbuild:
*      1. Go into the D2BS console manager.
*      2. Select the Bots profile
*      3. In the info tag box enter one of the following choices:
*        Meteorb
*        Cold
*        BlizzBaller
*        Blova
*        Lightning
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
  // Config.PickitFiles.push("kolton.nip");
  // Config.PickitFiles.push("test.nip");

  /* Gambling configuration. */
  // TODO: should gambling be re-written to try and gamble for our current lowest tier'd item
  // for example if our gloves are the lowest tier then only gamble gloves or maybe just make the others conditional like why include
  // gambling for rings/ammys if we have our end game one
  Config.GambleItems.push("Amulet");
  Config.GambleItems.push("Ring");
  Config.GambleItems.push("Circlet");
  Config.GambleItems.push("Coronet");

  // AutoEquip setup
  const levelingTiers = [
    // Weapon
    "me.normal && [type] == orb && [quality] >= normal && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "me.charlvl > 1 && ([type] == orb || [type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "me.classic && [type] == staff && [quality] >= magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // Shield
    "[type] == shield && ([quality] >= magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    "me.classic && [type] == shield && [quality] >= normal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
    // non runeword white items
    "([type] == shield) && [quality] >= normal && [flag] != ethereal && [flag] != runeword # [itemchargedskill] >= 0 && ([sockets] == 1 || [sockets] == 2) # [tier] == tierscore(item)",
  ];

  const expansionTiers = [
    // Switch
    "[type] == wand && [quality] >= Normal # [itemchargedskill] == 72 # [secondarytier] == 25000",  // Weaken charged wand
    "[type] == wand && [quality] >= Normal # [itemchargedskill] == 91 # [secondarytier] == 50000 + chargeditemscore(item, 91)",	// Lower Resist charged wand
    // Charms
    "[name] == smallcharm && [quality] == magic # [maxhp] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == smallcharm && [quality] == magic # [itemmagicbonus] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "[name] == smallcharm && [quality] == magic # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 1 # [invoquantity] == 2 && [charmtier] == charmscore(item)",
    "me.charlvl < 40 && [name] == smallcharm && [quality] == magic ## [invoquantity] == 4 && [charmtier] == charmscore(item)",
    "[name] == grandcharm && [quality] == magic # # [invoquantity] == 2 && [charmtier] == charmscore(item)",
  ];

  if (SetUp.currentBuild !== "Start") {
    NTIP.addLine("([type] == orb || [type] == wand || [type] == sword || [type] == knife) && ([quality] >= magic || [flag] == runeword) && [flag] == ethereal && [2handed] == 0 # [itemchargedskill] >= 0 # [tier] == tierscore(item)");
  }

  /* Attack configuration. */
  Skill.usePvpRange = true;
  Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
  Config.LowManaSkill = [-1, -1];
  Config.MaxAttackCount = 1000;
  Config.BossPriority = false;
  Config.ClearType = 0;
  Config.ClearPath = { Range: 30, Spectype: (me.hell && Pather.canTeleport() ? 0xF : 0) };

  /* Monster skip configuration. */
  Pather.canTeleport() && me.lightRes < 75 && Config.SkipEnchant.push("lightning enchanted");

  /* Class specific configuration. */
  Config.UseTelekinesis = true; // use telekinesis if have skill
  Config.UseColdArmor = true;
  Config.Dodge = !!(me.charlvl >= CharInfo.respecOne); // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
  Config.DodgeRange = 15; // Distance to keep from monsters.
  Config.DodgeHP = me.hardcore ? 90 : 75; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
  Config.TeleStomp = false; // Use merc to attack bosses if they're immune to attacks, but not to physical damage
  Config.CastStatic = me.classic ? 15 : [25, 33, 50][me.diff];

  /* Gear */
  NTIP.buildList(levelingTiers);
  me.expansion && NTIP.buildList(expansionTiers);

  Config.imbueables = (function () {
    /**
     * @param {number} name 
     * @param {function(): boolean} condition 
     */
    const _imbueObj = (name, condition) => ({ name: name, condition: condition });

    return [
      _imbueObj(
        sdk.items.JaredsStone,
        () => (me.normal && me.expansion)
      ),
      _imbueObj(
        sdk.items.SwirlingCrystal,
        () => (!me.normal && me.charlvl < 66 && me.expansion)
      ),
      _imbueObj(
        sdk.items.DimensionalShard,
        () => (me.equipped.get(sdk.body.RightArm).tier < 777 && me.expansion)
      ),
      _imbueObj(
        sdk.items.Belt,
        () => (me.normal && (me.equipped.get(sdk.body.RightArm).tier > 777 || me.classic))
      ),
      _imbueObj(
        sdk.items.MeshBelt,
        () => (!me.normal
          && me.charlvl < 46
          && me.trueStr > 58
          && (me.equipped.get(sdk.body.RightArm).tier > 777 || me.classic)
        )
      ),
      _imbueObj(
        sdk.items.SpiderwebSash,
        () => (!me.normal && me.trueStr > 50 && (me.equipped.get(sdk.body.RightArm).tier > 777 || me.classic))
      ),
    ].filter((item) => item.condition());
  })();

  let imbueArr = SetUp.imbueItems();

  !me.smith && NTIP.buildList(imbueArr);

  switch (me.gametype) {
  case sdk.game.gametype.Classic:
    // Res shield
    if ((me.equipped.get(sdk.body.LeftArm).tier < 487
      && !me.equipped.get(sdk.body.RightArm).twoHanded)
      || (me.equipped.get(sdk.body.RightArm).tier < 487 && me.equipped.get(sdk.body.RightArm).twoHanded)) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/PDiamondShield.js");
    }

    break;
  case sdk.game.gametype.Expansion:
    NTIP.addLine("[name] >= VexRune && [name] <= ZodRune");
    const { basicSocketables, addSocketableObj } = require("../Utils/General");

    /* Crafting */
    if (me.equipped.get(sdk.body.Neck).tier < 100000) {
      Config.Recipes.push([Recipe.Caster.Amulet]);
    }

    {
      let maxedMage = me.getItemsEx()
        .filter(i => i.itemType === sdk.items.type.Gloves)
        .find(i => NTIP.GetTier(i) >= 110000);
      
      if (!maxedMage) {
        Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]);
        if (["Blova", "Lightning"].includes(SetUp.finalBuild)) {
          Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth, "magefist"]);
        }
      }
    }

    Config.socketables = Config.socketables.concat(basicSocketables.caster, basicSocketables.all);

    // FinalBuild specific setup
    switch (SetUp.finalBuild) {
    case "Blova":
    case "Lightning":
      // Infinity
      if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Infinity) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercInfinity.js");
      }

      // Spirit Shield
      if (LADDER_ENABLED && SetUp.currentBuild === SetUp.finalBuild
        && (me.equipped.get(sdk.body.LeftArm).tier < 1000
        || me.equipped.get(sdk.body.LeftArmSecondary).prefixnum !== sdk.locale.items.Spirit)) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritShield.js");
      }

      // Chains of Honor
      if (!me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/ChainsOfHonor.js");
      }

      // Heart of the Oak
      if (!me.checkItem({ name: sdk.locale.items.HeartoftheOak }).have) {
        includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/HeartOfTheOak.js");
      }

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
      Config.socketables.push(addSocketableObj(sdk.items.Shako,
        [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
        true, (item) => item.unique && !item.ethereal
      ));

      Check.itemSockables(sdk.items.Shako, "unique", "Harlequin Crest");

      break;
    case "Meteorb":
    case "Cold":
    case "Blizzballer":
      Config.socketables.push(addSocketableObj(sdk.items.DeathMask,
        [sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
        true, (item) => item.set && !item.ethereal
      ));
      Config.socketables.push(addSocketableObj(sdk.items.LacqueredPlate,
        [sdk.items.runes.Ber], [sdk.items.gems.Perfect.Ruby],
        true, (item) => item.set && !item.ethereal
      ));
      Config.socketables.push(addSocketableObj(sdk.items.SwirlingCrystal, [sdk.items.runes.Ist], [],
        false, (item) => item.set && !item.ethereal
      ));

      Check.itemSockables(sdk.items.LacqueredPlate, "set", "Tal Rasha's Guardianship");
      Check.itemSockables(sdk.items.DeathMask, "set", "Tal Rasha's Horadric Crest");

      break;
    default:
      break;
    }

    // Go ahead and keep two P-diamonds prior to finding a moser's unless already using a better shield
    if (!Check.haveItem("shield", "unique", "Moser's Blessed Circle")
      && !me.haveSome([
        { name: sdk.locale.items.Sanctuary },
        { name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Shield }
      ])) {
      NTIP.addLine("[name] == perfectdiamond # # [maxquantity] == 2");

      if (me.getOwned({ classid: sdk.items.gems.Perfect.Diamond }).length < 2) {
        Config.Recipes.push([Recipe.Gem, "flawlessdiamond"]);
      }
    }

    Check.itemSockables(sdk.items.RoundShield, "unique", "Moser's Blessed Circle");

    // Sanctuary
    if (!me.haveSome([
      { name: sdk.locale.items.Sanctuary },
      { name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Shield }
    ])
      && ["Blova", "Lightning"].indexOf(SetUp.currentBuild) === -1) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Sanctuary.js");
    }

    // Call to Arms
    if (!me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/CallToArms.js");
    }

    // Spirit Sword
    if (LADDER_ENABLED && me.equipped.get(sdk.body.RightArm).tier < 777) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/SpiritSword.js");
    }

    // Merc Insight
    if (LADDER_ENABLED && Item.getMercEquipped(sdk.body.RightArm).tier < 3600) {
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

    // Bone
    if (me.equipped.get(sdk.body.Armor).tier < 450) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/Bone.js");
    }

    // Merc Treachery
    if (Item.getMercEquipped(sdk.body.Armor).tier < 15000) {
      includeIfNotIncluded("SoloPlay/BuildFiles/Runewords/MercTreachery.js");
    }

    // Smoke
    if (me.equipped.get(sdk.body.Armor).tier < 300) {
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
