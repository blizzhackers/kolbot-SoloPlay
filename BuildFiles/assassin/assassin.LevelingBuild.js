/**
*  @filename    assassin.LevelingBuild.js
*  @author      theBGuy
*  @desc        lightning trap build for after respecOne
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.Traps,
      wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
      usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 47], ["dexterity", 46], ["vitality", 166],
        ["strength", 61], ["vitality", 241], ["strength", 79],
        ["dexterity", 79], ["strength", 156], ["vitality", "all"]
      ],
      skills: [
        // Skills points at respec 33
        [sdk.skills.Fade, 1],               // points left 30
        [sdk.skills.ShadowMaster, 1],       // points left 25
        [sdk.skills.MindBlast, 1],          // points left 20
        [sdk.skills.DeathSentry, 1],        // points left 19
        [sdk.skills.LightningSentry, 7],    // points left 13
        [sdk.skills.FireBlast, 6],          // points left 8
        [sdk.skills.ShockWeb, 8],           // points left 1
        [sdk.skills.WakeofFire, 1],         // points left 0
        [sdk.skills.LightningSentry, 20, false],
        [sdk.skills.DeathSentry, 10],
        [sdk.skills.ShockWeb, 9],
        [sdk.skills.FireBlast, 8],
        [sdk.skills.DeathSentry, 12],
        [sdk.skills.ShockWeb, 11],
        [sdk.skills.FireBlast, 11],
        [sdk.skills.DeathSentry, 13],
        [sdk.skills.ShockWeb, 13],
        [sdk.skills.FireBlast, 12],
        [sdk.skills.DeathSentry, 14],
        [sdk.skills.ShockWeb, 15],
        [sdk.skills.FireBlast, 14],
        [sdk.skills.DeathSentry, 15],
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

      active: function () {
        return (me.charlvl > CharInfo.respecOne && me.charlvl > CharInfo.respecTwo && me.getSkill(sdk.skills.LightningSentry, sdk.skills.subindex.HardPoints) === 20 && !Check.finalBuild().active());
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.ShockWeb, sdk.skills.FireBlast, sdk.skills.ShockWeb, sdk.skills.FireBlast, -1, -1];
            Config.LowManaSkill = [-1, -1];
            Config.UseTraps = true;
            Config.UseFade = true;
            Config.Traps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
            Config.BossTraps = [sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry, sdk.skills.LightningSentry];
            Config.TownHP = me.hardcore ? 0 : 35;
            Config.BeltColumn = ["hp", "hp", "mp", "mp"];
            Config.HPBuffer = 2;
            Config.MPBuffer = me.charlvl < 80 ? 6 : 2;
            Config.DodgeHP = 75;
            SetUp.belt();
          }
        }
      },
    };
    
    return build;
  })();
})(module);
