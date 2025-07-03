/**
*  @filename    druid.js
*  @author      theBGuy
*  @desc        Druid specifics
*
*/

const CharInfo = {
  respecOne: 26,
  respecTwo: 0,
  levelCap: (function() {
    const currentDiff = sdk.difficulty.nameOf(me.diff);
    const softcoreMode = {
      "Normal": 33,
      "Nightmare": 73,
      "Hell": 100,
    };
    const hardcoreMode = {
      "Normal": 36,
      "Nightmare": 73,
      "Hell": 100,
    };

    return me.softcore ? softcoreMode[currentDiff] : hardcoreMode[currentDiff];
  })(),

  getActiveBuild: function () {
    const nSkills = me.getStat(sdk.stats.NewSkills);
    const currLevel = me.charlvl;
    const justRepeced = (nSkills >= currLevel);

    switch (true) {
    case currLevel < this.respecOne && !me.checkSkill(sdk.skills.Tornado, sdk.skills.subindex.HardPoints):
      return "Start";
    case Check.finalBuild().respec() && justRepeced:
    case Check.finalBuild().active():
      return SetUp.finalBuild;
    default:
      return "Leveling";
    }
  },
};
