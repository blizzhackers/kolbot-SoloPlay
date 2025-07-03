/**
*  @filename    druid.PlaguewolfBuild.js
*  @author      theBGuy
*  @desc        Rabies/Fury wolf final build
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
      usefulStats: [sdk.stats.PassivePoisonMastery, sdk.stats.PassivePoisonPierce, sdk.stats.PiercePois],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 156], ["dexterity", 136], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Werewolf, 20, false],
        [sdk.skills.Lycanthropy, 20, false],
        [sdk.skills.PoisonCreeper, 1, false],
        [sdk.skills.Grizzly, 1, false],
        [sdk.skills.Rabies, 20, false],
        [sdk.skills.Fury, 20, false],
        [sdk.skills.HeartofWolverine, 20, false],
        [sdk.skills.PoisonCreeper, 20, false],
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
            Config.AttackSkill = [sdk.skills.FeralRage, sdk.skills.Fury, sdk.skills.Rabies, sdk.skills.Fury, sdk.skills.Rabies, sdk.skills.Rabies, -1];
            Config.LowManaSkill = [0, 0];
            Config.Wereform = "Werewolf";
            Config.SummonAnimal = "Grizzly";
            Config.SummonSpirit = "Heart of Wolverine";
          }
        },
      },

      respec: function () {
        return me.haveAll([{ name: sdk.locale.items.Grief }, { name: sdk.locale.items.ChainsofHonor }]);
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Rabies, sdk.skills.subindex.HardPoints) === 20;
      },
    };

    let finalGear = [ // autoequip final gear
      // Weapon - Grief
      "[type] == sword && [flag] == runeword # [ias] >= 30 && [itemdeadlystrike] == 20 && [passivepoispierce] >= 20 # [tier] == 110000",
      // Shield - Stormshield
      "[name] == monarch && [quality] == unique # [damageresist] >= 35 # [tier] == 110000",
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
      "[type] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
      // Rings - Wisp & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
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
