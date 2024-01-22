/**
*  @filename    assassin.TrapsinBuild.js
*  @author      theBGuy
*  @desc        Lightning trap based final build (11 fpa trap laying, 9 fps tele)
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.Traps,
      wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
      usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
      precastSkills: [sdk.skills.Fade, sdk.skills.ShadowMaster],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 156], ["dexterity", 79], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.MindBlast, 1],
        [sdk.skills.ShadowMaster, 1],
        [sdk.skills.Fade, 1],
        [sdk.skills.LightningSentry, 20],
        [sdk.skills.ShockWeb, 15],
        [sdk.skills.FireBlast, 14],
        [sdk.skills.DeathSentry, 15], // lvl 74 w/o quest skills pts
        [sdk.skills.ShockWeb, 16],
        [sdk.skills.FireBlast, 15],
        [sdk.skills.DeathSentry, 16],
        [sdk.skills.ShockWeb, 18],
        [sdk.skills.FireBlast, 16],
        [sdk.skills.DeathSentry, 17],
        [sdk.skills.ShockWeb, 20],
        [sdk.skills.FireBlast, 18],
        [sdk.skills.DeathSentry, 20],
        [sdk.skills.ShockWeb, 20],
        [sdk.skills.FireBlast, 20],
        [sdk.skills.ChargedBoltSentry, 20],
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
          max: 1,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
          }
        },

        LifeMana: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.MaxHp) === 20 && check.getStat(sdk.stats.MaxMana) === 17);
          }
        },

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Traps) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.UseTraps = true;
            Config.AttackSkill = [-1, sdk.skills.ShockWeb, sdk.skills.FireBlast, sdk.skills.ShockWeb, sdk.skills.FireBlast, -1, -1];
            Config.Traps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
            Config.BossTraps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry];
          }
        },
      },

      respec: function () {
        return (Attack.checkInfinity() || (me.data.merc.gear.includes(sdk.locale.items.Infinity) && !Misc.poll(() => me.getMerc(), 200, 50))) && me.checkItem({ name: sdk.locale.items.Enigma, itemtype: sdk.items.type.Armor }).have;
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.LightningSentry, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Final Weapon - Silence
      "[type] == sword && [flag] == runeword # [itemallskills] == 2 && [ias] == 20 && [fireresist] == 75 # [tier] == 200000",
      // Temporary Weapon - HotO
      "[type] == mace && [flag] == runeword # [itemallskills] == 3 # [tier] == 100000",
      // Helmet - Andy's
      "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [tier] == tierscore(item, 100000)",
      // Belt - Arach's
      "[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 100000)",
      // Boots - Waterwalks
      "[name] == sharkskinboots && [quality] == unique && [flag] != ethereal # [maxhp] >= 65 # [tier] == tierscore(item, 100000)",
      // Armor - Enigma
      "[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
      // Shield - Spirit
      "[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [tier] == tierscore(item, 110000)",
      // Gloves - Lava Gout
      "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [ias] == 20 # [tier] == tierscore(item, 100000)",
      // Amulet - Maras
      "[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == tierscore(item, 100000)",
      // Final Rings - SoJ & Perfect Raven Frost
      "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
      "[type] == ring	&& [quality] == unique # [dexterity] == 20 # [tier] == 110000",
      // Rings - Raven Frost
      "[type] == ring	&& [quality] == unique # [dexterity] >= 15 # [tier] == 100000",
      // Switch Final Weapon - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch Final Shield - Spirit
      "[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
      // Switch Temporary Shield - Any 1+ all skill
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
