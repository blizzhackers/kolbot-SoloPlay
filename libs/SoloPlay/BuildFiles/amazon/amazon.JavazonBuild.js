/**
*  @filename    amazon.JavazonBuild.js
*  @author      theBGuy
*  @desc        Javelin Lightning based final build (pure lightning for expansion) (light/poision for classic)
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.JavelinandSpear,
      wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
      usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
      precastSkills: [sdk.skills.Valkyrie],
      usefulStats: [sdk.stats.PierceLtng, sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [],
      skills: [],

      charms: {
        ResLife: {
          max: 5,
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
          max: 1,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
          }
        },

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.JavelinandSpear) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },
      
      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.ChargedStrike, -1, sdk.skills.LightningStrike, -1, -1, -1];
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            Config.HPBuffer = me.expansion ? 2 : 4;
            Config.MPBuffer = me.expansion ? 4 : 6;
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
        return this.respec() && (me.expansion ? me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) > 1 && me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) < 5 : me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) === 20);
      },
    };

    build.stats = me.classic
      ? [
        ["dexterity", 65], ["strength", 75], ["vitality", "all"]
      ]
      : [
        ["strength", 34], ["vitality", 30], ["dexterity", 47],
        ["vitality", 45], ["strength", 47], ["dexterity", 65],
        ["vitality", 65], ["strength", 53], ["dexterity", 118],
        ["vitality", 100], ["strength", 118], ["dexterity", 151],
        ["strength", 156], ["vitality", "all"],
      ];
    
    build.skills = me.classic
      ? [
        [sdk.skills.Valkyrie, 1],
        [sdk.skills.LightningFury, 1],
        [sdk.skills.LightningStrike, 1],
        [sdk.skills.Pierce, 1],
        [sdk.skills.PlagueJavelin, 20],
        [sdk.skills.ChargedStrike, 10],
        [sdk.skills.LightningStrike, 10],
        [sdk.skills.Decoy, 5],
        [sdk.skills.LightningStrike, 17],
        [sdk.skills.ChargedStrike, 15],
        [sdk.skills.LightningStrike, 20, false],
        [sdk.skills.ChargedStrike, 20, false],
        [sdk.skills.PoisonJavelin, 20, false],
        [sdk.skills.Valkyrie, 12, false],
        [sdk.skills.LightningFury, 20, false],
      ]
      : [
        [sdk.skills.Valkyrie, 1],
        [sdk.skills.Pierce, 1],
        [sdk.skills.LightningStrike, 20],
        [sdk.skills.ChargedStrike, 20],
        [sdk.skills.LightningFury, 20],
        [sdk.skills.Decoy, 5, false],
        [sdk.skills.Valkyrie, 17, false],
        [sdk.skills.PowerStrike, 20, false],
        [sdk.skills.Pierce, 5, false],
      ];

    me.classic && build.usefulStats.push(sdk.stats.PassivePoisonMastery, sdk.stats.PassivePoisonPierce, sdk.stats.PiercePois);
    
    let finalGear = me.classic
      ? [
        // Helm - Tarnhelm
        "[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == tierscore(item, 100000)",
        // Armor - Twitchthroe
        "[name] == studdedleather && [quality] == unique # [ias] == 20 && [fhr] == 20 # [tier] == 100000",
        // Belt - Death's Guard Sash
        "[name] == sash && [quality] == set # [itemcannotbefrozen] == 1 # [tier] == 100000",
        // Gloves - Death's Hand Leather Gloves
        "[name] == leathergloves && [quality] == set # [poisonresist] >= 50 # [tier] == 100000",
        // Rings - SoJ
        "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
      ] : [
        // Weapon - Titan's Revenge
        "[name] == ceremonialjavelin && [quality] == unique # [itemchargedskill] >= 0 # [tier] == tierscore(item, 100000)",
        // Helmet - Harlequin's Crest
        "[name] == shako && [quality] == unique && [flag] != ethereal # [itemallskills] == 2 # [tier] == tierscore(item, 100000)",
        // Boots - Sandstorm Treks
        "[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == tierscore(item, 100000)",
        // Belt - Thundergod's Vigor
        "[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
        // Armor - CoH
        "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000",
        // Shield - Spirit
        "[type] == shield # [fcr] >= 25 && [maxmana] >= 89 # [tier] == tierscore(item, 110000)",
        // Amulet - Highlords
        "[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 110000",
        // Final Rings - Perfect Raven Frost & Wisp
        "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
        "[type] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == 110000",
        // Rings - Raven Frost & Wisp
        "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
        "[type] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 100000",
        // Switch - CTA
        "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
        // Switch - Spirit
        "[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
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
