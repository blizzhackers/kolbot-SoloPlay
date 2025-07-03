/**
*  @filename    Sorceress.BlizzballerBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blizzard + Fireball based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.Cold,
      wantedskills: [sdk.skills.Blizzard, sdk.skills.FireBall, sdk.skills.ColdMastery],
      usefulskills: [sdk.skills.GlacialSpike, sdk.skills.Meteor, sdk.skills.FireMastery, sdk.skills.StaticField],
      precastSkills: [sdk.skills.FrozenArmor],
      usefulStats: [
        sdk.stats.PassiveColdPierce,
        sdk.stats.PassiveColdMastery,
        sdk.stats.PassiveFireMastery,
        sdk.stats.PassiveFirePierce
      ],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["energy", 50], ["strength", 48], ["vitality", 165],
        ["strength", 61], ["vitality", 252], ["strength", 127],
        ["dexterity", "block"], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Warmth, 1],
        [sdk.skills.FrozenArmor, 1],
        [sdk.skills.StaticField, 1],
        [sdk.skills.Teleport, 1],
        [sdk.skills.Meteor, 1],
        [sdk.skills.FireMastery, 1, false],
        [sdk.skills.ColdMastery, 1, false],
        [sdk.skills.FireBall, 20],
        [sdk.skills.Blizzard, 20],
        [sdk.skills.GlacialSpike, 20], // lvl 75 w/o quest skills pts
        [sdk.skills.Meteor, 20],
        [sdk.skills.ColdMastery, 5],
        [sdk.skills.FireBolt, 20],
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
          max: 3,
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

        SkillerFire: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Fire) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },

        SkillerCold: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Cold) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [
              -1,
              sdk.skills.Blizzard, sdk.skills.FireBall,
              sdk.skills.Blizzard, sdk.skills.FireBall,
              sdk.skills.Meteor, sdk.skills.GlacialSpike
            ];
            Config.LowManaSkill = [-1, -1];
            Config.SkipImmune = ["fire and cold"];
            Config.HPBuffer = me.expansion ? 1 : 5;
            Config.MPBuffer = me.expansion ? 1 : 5;
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        } else {
          return me.haveAll([
            { name: sdk.locale.items.TalRashasBelt, quality: sdk.items.quality.Set },
            { name: sdk.locale.items.TalRashasAmulet, quality: sdk.items.quality.Set },
            { name: sdk.locale.items.TalRashasArmor, quality: sdk.items.quality.Set },
            { name: sdk.locale.items.TalRashasOrb, quality: sdk.items.quality.Set },
            { name: sdk.locale.items.TalRashasHelmet, quality: sdk.items.quality.Set },
          ]);
        }
      },

      active: function () {
        return (
          this.respec()
          && me.getSkill(sdk.skills.FireBall, sdk.skills.subindex.HardPoints) === 20
          && me.getSkill(sdk.skills.Blizzard, sdk.skills.subindex.HardPoints) === 20
        );
      },
    };

    // autoequip final gear
    let finalGear = [
      // Weapon - Tals Orb
      "[name] == swirlingcrystal && [quality] == set && [flag] != ethereal # [skilllightningmastery]+[skillfiremastery]+[skillcoldmastery] >= 3 # [tier] == tierscore(item, 100000)",
      // Helmet - Tals Mask
      "[name] == deathmask && [quality] == set && [flag] != ethereal # [coldresist]+[lightresist]+[fireresist]+[poisonresist] >= 60 # [tier] == tierscore(item, 100000)",
      // Belt - Tals Belt
      "[name] == meshbelt && [quality] == set && [flag] != ethereal # [itemmagicbonus] >= 10 # [tier] == tierscore(item, 100000)",
      // Final Boots - Sandstorm Treks
      "[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == tierscore(item, 100000)",
      // Boots - War Traveler
      "[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == tierscore(item, 5000)",
      // Armor - Tals Armor
      "[name] == lacqueredplate && [quality] == set # [coldresist] >= 1 # [tier] == 100000",
      // Final Shield - Sanctuary
      "[name] == hyperion && [flag] == runeword # [fhr] >= 20 && [enhanceddefense] >= 130 && [fireresist] >= 50 # [tier] == 100000",
      // Shield - Mosers
      "[name] == roundshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 180 # [tier] == tierscore(item, 50000)",
      // Final Gloves - Perfect Upp'ed Magefist
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 && [defense] == 71 # [tier] == 110000",
      // Gloves - Upp'ed Magefist
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Gloves - Magefist
      "[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Amulet - Tals Ammy
      "[name] == amulet && [quality] == set # [lightresist] == 33 # [tier] == 100000",
      // Final Rings - Perfect Raven Frost & Nagelring
      "[type] == ring && [quality] == unique # [dexterity] == 20 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [itemmagicbonus] == 30 # [tier] == 100000",
      // Rings - Raven Frost
      "[type] == ring && [quality] == unique # [dexterity] >= 15 # [tier] == 90000",
      // Switch - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch Shield - 1+ all skill
      "[type] == shield # [itemallskills] >= 1 # [secondarytier] == tierscore(item, 100000)",
      // Merc Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
      // Merc Final Helmet - Eth Andy's
      "[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
      // Merc Helmet - Andy's
      "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
    ];
    
    NTIP.buildList(finalGear);
    NTIP.buildFinalGear(finalGear);

    return build;
  })();
})(module);
