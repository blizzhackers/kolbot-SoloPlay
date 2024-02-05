/**
*  @filename    Sorceress.BlovaBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blizzard + Nova based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.Cold,
      wantedskills: [sdk.skills.Blizzard, sdk.skills.Nova],
      usefulskills: [sdk.skills.LightningMastery, sdk.skills.ColdMastery, sdk.skills.GlacialSpike],
      precastSkills: [sdk.skills.FrozenArmor],
      usefulStats: [
        sdk.stats.PassiveColdPierce,
        sdk.stats.PassiveColdMastery,
        sdk.stats.PassiveLightningMastery,
        sdk.stats.PassiveLightningPierce
      ],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 156], ["dexterity", 35], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Warmth, 1],
        [sdk.skills.FrozenArmor, 1],
        [sdk.skills.Teleport, 1],
        [sdk.skills.Blizzard, 1],
        [sdk.skills.Nova, 20],
        [sdk.skills.LightningMastery, 20],
        [sdk.skills.Blizzard, 20],
        [sdk.skills.ColdMastery, 5],
        [sdk.skills.IceBlast, 20],
        [sdk.skills.GlacialSpike, 5],
        [sdk.skills.IceBolt, 14],
      ],

      charms: {
        ResLife: {
          max: 3,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MaxHp) === 20);
          }
        },

        ResMf: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MagicBonus) === 7);
          }
        },

        ResFHR: {
          max: 3,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
          }
        },

        SkillerLight: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Lightning) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },

        SkillerCold: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Cold) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Blizzard, sdk.skills.Nova, -1, sdk.skills.IceBlast];
            Config.LowManaSkill = [-1, -1];
            Config.SkipImmune = ["lightning and cold"];
            Config.HPBuffer = me.expansion ? 1 : 5;
            Config.MPBuffer = me.expansion ? 1 : 5;
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        } else {
          return (Attack.checkInfinity() || (me.data.merc.gear.includes(sdk.locale.items.Infinity) && !Misc.poll(() => me.getMerc(), 200, 50)));
        }
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Nova, sdk.skills.subindex.HardPoints) === 20 && me.getSkill(sdk.skills.Blizzard, sdk.skills.subindex.HardPoints) >= 1;
      },
    };
    
    // autoequip final gear
    let finalGear = [
      // Weapon - HotO
      "[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000",
      // Helmet - Griffons
      "[name] == diadem && [quality] == unique && [flag] != ethereal # [fcr] == 25 # [tier] == tierscore(item, 100000)",
      // Belt - Arach's
      "[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 100000)",
      // Final Boots - Sandstorm Treks
      "[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == tierscore(item, 100000)",
      // Boots - War Traveler
      "[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == tierscore(item, 5000)",
      // Armor - CoH
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
      // Shield - Spirit
      "[type] == shield # [fcr] >= 25 && [maxmana] >= 89 # [tier] == tierscore(item, 100000)",
      // Final Gloves - Perfect Upp'ed Magefist
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 && [defense] == 71 # [tier] == 110000",
      // Gloves - Upp'ed Magefist
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Gloves - Magefist
      "[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Amulet - Maras
      "[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == tierscore(item, 100000)",
      // Final Rings - SoJ & Perfect Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
      "[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 100000",
      // Ring - Bul-Kathos' Wedding Band
      "[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 90000",
      // Switch - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch Final Shield - Spirit
      "[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
      // Switch Temporary Shield - 1+ all skill
      "[type] == shield # [itemallskills] >= 1 # [secondarytier] == tierscore(item, 50000)",
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
