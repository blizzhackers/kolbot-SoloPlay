/**
*  @filename    amazon.FaithbowzonBuild.js
*  @author      isid0re, theBGuy
*  @desc        final build based off WitchWild String
*               uses Upp'd WitchWild String or Faith(final weapon)
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.BowandCrossbow,
      wantedskills: [sdk.skills.Strafe],
      usefulskills: [sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
      precastSkills: [sdk.skills.Valkyrie],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 103], ["dexterity", 152], ["vitality", 150], ["dexterity", "all"]
      ],
      skills: [
        [sdk.skills.Valkyrie, 1],
        [sdk.skills.Strafe, 20],
        [sdk.skills.Pierce, 19],
        [sdk.skills.Penetrate, 3],
        [sdk.skills.CriticalStrike, 19],
        [sdk.skills.Valkyrie, 20],
        [sdk.skills.Dodge, 4],
        [sdk.skills.Avoid, 4],
        [sdk.skills.Evade, 4],
        [sdk.skills.Dodge, 9],
        [sdk.skills.Evade, 9],

      ],

      charms: {
        ResLife: {
          max: 3,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.allRes === 5
              && check.getStat(sdk.stats.MaxHp) === 20
            );
          }
        },

        ResMf: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.allRes === 5
              && check.getStat(sdk.stats.MagicBonus) === 7
            );
          }
        },

        ResFHR: {
          max: 1,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.allRes === 5
              && check.getStat(sdk.stats.FHR) === 5
            );
          }
        },

        SkillerCrossbow: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.BowandCrossbow) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },

        SkillerPassive: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.PassiveandMagic) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.Strafe, -1, sdk.skills.Strafe, -1, sdk.skills.MagicArrow, -1];
            Config.LowManaSkill = [0, -1];
            Config.HPBuffer = 1;
            Config.MPBuffer = 1;
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return false;
        }
        return (
          me.checkItem({ name: sdk.locale.items.Faith }).have
          || me.checkItem({ name: sdk.locale.items.WitchwildString, classid: sdk.items.DiamondBow }).have
        );
      },

      active: function () {
        return this.respec() && me.checkSkill(sdk.skills.Strafe, sdk.skills.subindex.HardPoints);
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Final Weapon - Faith
      "([type] == amazonbow || [type] == bow) && [flag] == runeword # [fanaticismaura] >= 12 && [itemallskills] >= 1 # [tier] == tierscore(item, 100000)",
      // Weapon -  WitchWild String up'd
      "[name] == diamondbow && [quality] == unique # [fireresist] == 40 # [tier] == tierscore(item, 100000)",
      // Helmet - Vampz Gaze
      "[name] == grimhelm && [quality] == unique && [flag] != ethereal # [manaleech] >= 6 && [lifeleech] >= 6 && [damageresist] >= 15 # [tier] == tierscore(item, 100000)",
      // Boots - War Traveler
      "[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 35 # [tier] == tierscore(item, 100000)",
      // Belt - Nosferatu's Coil
      "[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] >= 5 # [tier] == tierscore(item, 100000)",
      // Armor - CoH
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
      // Gloves - Lava Gout
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 && [enhanceddefense] >= 150 # [tier] == tierscore(item, 3000)",
      // Final Amulet - Atma's Scarab
      "[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == 110000",
      // Amulet - Highlords
      "[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
      // Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
      // Rings - Raven Frost && Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
      // Switch Final Weapon - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch Temporary Weapon - Life Tap charged wand
      "[type] == wand && [quality] >= normal # [itemchargedskill] == 82 # [secondarytier] == 75000 + chargeditemscore(item, 82)",
      // Switch Shield - Any 1+ all skill
      "[type] == shield # [itemallskills] >= 1 # [secondarytier] == tierscore(item, 100000)",
      // Merc Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
      // Merc Final Helmet - Eth Andy's
      "[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
      // Merc Helmet - Andy's
      "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
    ];

    NTIP.buildList(finalGear);
    NTIP.buildFinalGear(finalGear);

    return build;
  })();
})(module);
