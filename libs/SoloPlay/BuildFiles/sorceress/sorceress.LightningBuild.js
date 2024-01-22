/**
*  @filename    Sorceress.LightningBuild.js
*  @author      theBGuy
*  @desc        Lightning based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.Lightning,
      wantedskills: [sdk.skills.ChainLightning, sdk.skills.Lightning],
      usefulskills: [sdk.skills.LightningMastery, sdk.skills.ChargedBolt, sdk.skills.Nova],
      precastSkills: [sdk.skills.FrozenArmor],
      usefulStats: [sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 156], ["dexterity", 35], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Warmth, 1],
        [sdk.skills.StaticField, 1],
        [sdk.skills.Teleport, 1],
        [sdk.skills.FrozenArmor, 1],
        [sdk.skills.ThunderStorm, 1],
        [sdk.skills.LightningMastery, 1],
        [sdk.skills.Lightning, 20],
        [sdk.skills.ChainLightning, 20],
        [sdk.skills.LightningMastery, 20], // lvl 69  w/o quest skill pts
        [sdk.skills.Nova, 20],
        [sdk.skills.ChargedBolt, 20],
      ],

      charms: {
        ResLife: {
          max: 3,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.allRes === 5 && check.getStat(sdk.stats.MaxHp) === 20);
          }
        },

        ResMf: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              & check.allRes === 5 && check.getStat(sdk.stats.MagicBonus) === 7);
          }
        },

        ResFHR: {
          max: 1,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
          }
        },

        LifeMana: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.getStat(sdk.stats.MaxHp) === 20 && check.getStat(sdk.stats.MaxMana) === 17);
          }
        },

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Lightning) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [
              -1,
              sdk.skills.Lightning, sdk.skills.ChainLightning,
              sdk.skills.ChainLightning, sdk.skills.Lightning,
              1, -1
            ];
            Config.LowManaSkill = [-1, -1];
            Config.SkipImmune = ["lightning"];
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        } else {
          return (Attack.checkInfinity()
            || (
              me.data.merc.gear.includes(sdk.locale.items.Infinity)
              && !Misc.poll(() => me.getMerc(), 200, 50)
            ));
        }
      },

      active: function () {
        return this.respec()
          && me.getSkill(sdk.skills.Lightning, sdk.skills.subindex.HardPoints) === 20
          && !me.checkSkill(sdk.skills.Blizzard, sdk.skills.subindex.HardPoints);
      },
    };
    
    // autoequip final gear
    let finalGear = [
      // Weapon -  HotO
      "[type] == mace && [flag] == runeword # [fcr] == 40 # [tier] == 100000",
      // Helmet - Harlequin's Crest
      "[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 # [tier] == tierscore(item, 100000)",
      // Belt - Arach's
      "[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 100000)",
      // Boots
      "[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == tierscore(item, 5000)", // War Traveler
      "[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == tierscore(item, 100000)", // Sandstorm Treks
      // Armor - CoH
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
      // Shield - Spirit
      "[type] == shield # [fcr] >= 25 && [maxmana] >= 89 # [tier] == tierscore(item, 100000)",
      // Final Gloves - Perfect 2x Upp'ed Magefist
      "[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",
      // Gloves - 2x Upp'ed Magefist
      "[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Gloves - Upp'ed Magefist
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Gloves - Magefist
      "[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      // Amulet - Maras
      "[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == tierscore(item, 100000)",
      // Final Rings - SoJ & Perfect Wisp
      "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
      "[name] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == tierscore(item, 110000)",
      // Rings - Wisp
      "[name] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == tierscore(item, 100000)",
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
