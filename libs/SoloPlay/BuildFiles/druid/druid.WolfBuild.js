/**
*  @filename    druid.WolfBuild.js
*  @author      theBGuy
*  @desc        Fury wolf final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.ShapeShifting,
      wantedskills: [sdk.skills.Werewolf, sdk.skills.Lycanthropy, sdk.skills.Fury],
      usefulskills: [sdk.skills.HeartofWolverine, sdk.skills.Grizzly],
      precastSkills: [sdk.skills.Werewolf, sdk.skills.HeartofWolverine, sdk.skills.Grizzly],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 103], ["dexterity", 35], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Werewolf, 20, true],
        [sdk.skills.Lycanthropy, 20, true],
        [sdk.skills.Fury, 20, true],
        [sdk.skills.Grizzly, 1, false],
        [sdk.skills.HeartofWolverine, 20, true],
        [sdk.skills.FeralRage, 10, false],
        [sdk.skills.Grizzly, 15],
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

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.ShapeShifting) === 1
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
              sdk.skills.Fury, sdk.skills.FeralRage,
              sdk.skills.Fury, sdk.skills.FeralRage,
              sdk.skills.Rabies, -1
            ];
            Config.LowManaSkill = [0, 0];
            Config.Wereform = "Werewolf";
            Config.SummonAnimal = "Grizzly";
            Config.SummonSpirit = "Heart of Wolverine";
          }
        },
      },

      respec: function () {
        return (
          me.checkItem({ name: sdk.locale.items.Ribcracker, classid: sdk.items.Stalagmite }).have
          && me.checkItem({ name: sdk.locale.items.ChainsofHonor, }).have
        );
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Werewolf, sdk.skills.subindex.HardPoints) === 20;
      },
    };

    let finalGear = [ // autoequip final gear
      // Weapon - Upp'ed Ribcracker
      "[name] == stalagmite && [quality] == unique # [enhanceddamage] >= 300 && [ias] >= 50 # [tier] == 110000",
      // Helmet - Jalal's Mane
      "[name] == totemicmask && [quality] == unique # [druidskills] == 2 && [shapeshiftingskilltab] == 2 # [tier] == tierscore(item, 110000)",
      // Belt - Verdungo's
      "[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 110000)",
      // Armor - CoH
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000",
      // Gloves - Dracul's
      "[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 110000)",
      // Amulet - Maras
      "[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == tierscore(item, 110000)",
      // Final Rings - Perfect Wisp & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == tierscore(item, 110000)",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == tierscore(item, 110000)",
      // Rings - Wisp & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == tierscore(item, 110000)",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == tierscore(item, 110000)",
      // Merc Final Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
      // Merc Armor - Treachery
      "[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)",
      // Merc Final Helmet - Eth Andy's
      "[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
      // Merc Helmet - Andy's
      "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
      // Merc Weapon - Reaper's Toll
      "[name] == thresher && [quality] == unique # [enhanceddamage] >= 190 && [lifeleech] >= 11 # [merctier] == 100000 + mercscore(item)",
    ];

    NTIP.buildList(finalGear);
    NTIP.buildFinalGear(finalGear);

    return build;
  })();
})(module);
