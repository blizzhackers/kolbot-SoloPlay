/**
*  @filename    druid.FirewolfBuild.js
*  @author      theBGuy
*  @desc        Fireclaw/Rabies wolf final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.ShapeShifting,
      wantedskills: [sdk.skills.Werewolf, sdk.skills.Lycanthropy, sdk.skills.FireClaws],
      usefulskills: [sdk.skills.HeartofWolverine, sdk.skills.Grizzly, sdk.skills.Rabies, sdk.skills.Volcano, sdk.skills.Fissure, sdk.skills.Firestorm],
      precastSkills: [sdk.skills.Werewolf, sdk.skills.HeartofWolverine, sdk.skills.Grizzly],
      usefulStats: [sdk.stats.PassiveFireMastery, sdk.stats.PassiveFirePierce, sdk.stats.PierceFire],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 156], ["dexterity", 136], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Werewolf, 1, false],
        [sdk.skills.Lycanthropy, 20, false],
        [sdk.skills.PoisonCreeper, 1, false],
        [sdk.skills.Grizzly, 1, false],
        [sdk.skills.HeartofWolverine, 1, false],
        [sdk.skills.Volcano, 1, false],
        [sdk.skills.Fury, 1, false],
        [sdk.skills.FireClaws, 20, false],
        [sdk.skills.Rabies, 20, false],
        [sdk.skills.Volcano, 20, false],
        [sdk.skills.HeartofWolverine, 20, false],
      ],

      charms: {
        ResMf: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MagicBonus) === 7);
          }
        },

        Poison: {
          max: 6,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && ((check.getStat(sdk.stats.PoisonLength) * check.getStat(sdk.stats.PoisonMaxDamage)) / 256) >= 141);
          }
        },

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.ShapeShifting) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            Config.AttackSkill = [
              sdk.skills.FeralRage,
              sdk.skills.FireClaws, sdk.skills.Rabies,
              sdk.skills.FireClaws, sdk.skills.Rabies,
              sdk.skills.Fury, sdk.skills.Rabies
            ];
            Config.LowManaSkill = [0, 0];
            Config.Wereform = "Werewolf";
            Config.SummonAnimal = "Grizzly";
            Config.SummonSpirit = "Heart of Wolverine";
          }
        },
      },

      respec: function () {
        return me.haveAll([{ name: sdk.locale.items.Ice }, { name: sdk.locale.items.ChainsofHonor }]);
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.FireClaws, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    let finalGear = [
      // Weapon - Ice
      "[name] == demoncrossbow && [flag] == runeword # [holyfreezeaura] == 18 # [tier] == 110000",
      // Helmet - Jalal's Mane
      "[name] == totemicmask && [quality] == unique # [druidskills] == 2 && [shapeshiftingskilltab] == 2 # [tier] == tierscore(item, 110000)",
      // Belt - Verdungo's
      "[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 110000)",
      // Armor - Chains of Honor
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000",
      // Gloves - Dracul's Grasp
      "[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 110000)",
      // Boots - Goblin Toes
      "[name] == lightplatedboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 50 # [tier] == tierscore(item, 100000)",
      // Amulet - Metalgrid
      "[type] == amulet && [quality] == unique # [tohit] >= 400 && [coldresist] >= 25 # [tier] == tierscore(item, 110000)",
      // Ring 1 - Ravenfrost
      "[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000",
      // Ring 2 - Carrion Wind
      "[name] == ring && [quality] == unique # [poisonresist] == 55 && [lifeleech] >= 6 # [tier] == tierscore(item, 110000)",
      // Merc
      // Final Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
      // Temporary Armor - Treachery
      "[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)",
      // Final Helm - Eth Andy's
      "[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
      // Temporary Helm - Andy's
      "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
      // Final Weapon - Infinity
      "[type] == polearm && [flag] == runeword # [convictionaura] >= 13 # [merctier] == 100000 + mercscore(item)",
      // Temporary Weapon - Reaper's Toll
      "[name] == thresher && [quality] == unique # [enhanceddamage] >= 190 && [lifeleech] >= 11 # [merctier] == 50000 + mercscore(item)",
    ];

    NTIP.buildList(finalGear);
    NTIP.buildFinalGear(finalGear);

    return build;
  })();
})(module);
