/**
*  @filename    barbarian.ImmortalwhirlBuild.js
*  @author      theBGuy
*  @desc        Immortal King Whirlwind based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.BarbCombat,
      wantedskills: [sdk.skills.Bash, sdk.skills.Whirlwind],
      usefulskills: [sdk.skills.Howl, sdk.skills.Shout],
      precastSkills: [sdk.skills.BattleOrders, sdk.skills.WarCry], // Battle orders, War Cry
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 232], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.MaceMastery, 20],
        [sdk.skills.Whirlwind, 20],
        [sdk.skills.Shout, 20],
        [sdk.skills.BattleCry, 1],
        [sdk.skills.BattleCommand, 1],
        [sdk.skills.NaturalResistance, 1],
        [sdk.skills.IncreasedSpeed, 1],
        [sdk.skills.BattleOrders, 20],
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
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Masteries) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [sdk.skills.BattleCry, sdk.skills.Whirlwind, -1, sdk.skills.Whirlwind, -1];
            Config.LowManaSkill = [0, -1];
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            Config.MPBuffer = 2;
            Config.HPBuffer = 2;
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return false;
        }
        return me.haveAll([
          { name: sdk.locale.items.ImmortalKingsMaul, quality: sdk.items.quality.Set },
          { name: sdk.locale.items.ImmortalKingsBoots, quality: sdk.items.quality.Set },
          { name: sdk.locale.items.ImmortalKingsGloves, quality: sdk.items.quality.Set },
          { name: sdk.locale.items.ImmortalKingsBelt, quality: sdk.items.quality.Set },
          { name: sdk.locale.items.ImmortalKingsArmor, quality: sdk.items.quality.Set },
          { name: sdk.locale.items.ImmortalKingsHelmet, quality: sdk.items.quality.Set },
        ]);
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.MaceMastery, sdk.skills.subindex.HardPoints) === 20;
      },
    };

    let finalGear = [ // autoequip final gear
      // Weapon - IK Maul
      "[name] == ogremaul && [quality] == set # [enhanceddamage] >= 200 && [ias] >= 40 # [tier] == 110000",
      // Helmet - IK Helm
      "[name] == avengerguard && [quality] == set && [flag] != ethereal # [warcriesskilltab] == 2 # [tier] == 110000",
      // Belt - IK Belt
      "[name] == warbelt && [quality] == set && [flag] != ethereal # [strength] >= 25 && [fireresist] >= 28 # [tier] == 110000",
      // Boots - IK Boots
      "[name] == warboots && [quality] == set && [flag] != ethereal # [frw] >= 40 && [tohit] >= 110 # [tier] == 110000",
      // Armor - IK Armor
      "[name] == sacredarmor && [quality] == set && [flag] != ethereal # [barbcombatskilltab] == 2 # [tier] == 110000",
      // Gloves - IK Gauntlets
      "[name] == wargauntlets && [quality] == set && [flag] != ethereal # [strength] >= 20 && [dexterity] >= 20 # [tier] == 110000",
      // Amulet - Metalgrid
      "[type] == amulet && [quality] == unique # [defense] >= 300 # [tier] == tierscore(item, 110000)",
      // Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
      // Rings - Raven Frost && Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
      // Switch - BO sticks
      "[type] >= 1 && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
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
