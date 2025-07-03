/**
*  @filename    amazon.FrostmaidenBuild.js
*  @author      theBGuy
*  @desc        Bowazon Cold/Strafe based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.BowandCrossbow,
      wantedskills: [sdk.skills.Strafe, sdk.skills.FreezingArrow, sdk.skills.ExplodingArrow],
      usefulskills: [
        sdk.skills.Penetrate,
        sdk.skills.Valkyrie,
        sdk.skills.Pierce,
        sdk.skills.IceArrow,
        sdk.skills.ColdArrow
      ],
      precastSkills: [sdk.skills.Valkyrie],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 156], ["dexterity", 152], ["vitality", 150], ["dexterity", "all"]
      ],
      skills: [
        [sdk.skills.Valkyrie, 1],
        [sdk.skills.Strafe, 1],
        [sdk.skills.Pierce, 1],
        [sdk.skills.FreezingArrow, 20],
        [sdk.skills.IceArrow, 20],
        [sdk.skills.ColdArrow, 20],
        [sdk.skills.Strafe, 20],
        [sdk.skills.Valkyrie, 20],
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
            Config.AttackSkill = [
              -1,
              sdk.skills.FreezingArrow, -1,
              sdk.skills.FreezingArrow, -1,
              sdk.skills.Strafe, -1
            ];
            Config.LowManaSkill = [0, -1];
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return false;
        }
        return me.haveAll([
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm },
          { name: sdk.locale.items.Brand },
          { name: sdk.locale.items.ChainsofHonor }
        ]);
      },

      active: function () {
        return this.respec() && me.checkSkill(sdk.skills.FreezingArrow, sdk.skills.subindex.HardPoints);
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Weapon - Brand
      "[name] == grandmatronbow && [flag] == runeword # [enhanceddamage] >= 260 && [itemknockback] == 1 && [itemdeadlystrike] == 20 # [tier] == tierscore(item, 100000)",
      // Helmet - Dream
      "[type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
      // Boots - War Traveler
      "[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000",
      // Belt - Nosferatu's Coil
      "[name] == sharkskinbelt && [quality] == unique && [flag] != ethereal # [dexterity] == 15 # [tier] == tierscore(item, 100000)",
      // Armor - Chains of Honor
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 # [tier] == 100000",
      // Amulet - Highlords
      "[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 110000",
      // Rings - Ravenfrost & Carrion Wind
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[name] == ring && [quality] == unique # [poisonresist] == 55 && [lifeleech] >= 6 # [tier] == 110000",
      // Switch - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch Temporary Weapon - Life Tap charged wand
      "[type] == wand && [quality] >= normal # [itemchargedskill] == 82 # [secondarytier] == 75000 + chargeditemscore(item, 82)",
      // Switch Shield - Any 1+ all skill
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
