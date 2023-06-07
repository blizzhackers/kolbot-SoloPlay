/**
*  @filename    Mercenary.js
*  @author      theBGuy
*  @credit      jaenster
*  @desc        Mercenary functionality and Hiring
*
*/

const MercData = new function MercData () {
  /**
   * @constructor Merc
   * @param {number} classid 
   * @param {number} skill 
   * @param {number} act 
   * @param {number} [difficulty] 
   */
  function Merc (classid, skill, act, difficulty) {
    this.classid = classid;
    this.skill = skill;
    this.skillName = getSkillById(skill);
    this.act = act;
    this.difficulty = difficulty || sdk.difficulty.Normal;
  }

  // Act 1
  this[sdk.skills.FireArrow] = new Merc(sdk.mercs.Rogue, sdk.skills.FireArrow, 1);
  this[sdk.skills.ColdArrow] = new Merc(sdk.mercs.Rogue, sdk.skills.ColdArrow, 1);

  // Act 2
  this[sdk.skills.Prayer] = new Merc(sdk.mercs.Guard, sdk.skills.Prayer, 2, sdk.difficulty.Normal);
  this[sdk.skills.BlessedAim] = new Merc(sdk.mercs.Guard, sdk.skills.BlessedAim, 2, sdk.difficulty.Normal);
  this[sdk.skills.Defiance] = new Merc(sdk.mercs.Guard, sdk.skills.Defiance, 2, sdk.difficulty.Normal);

  this[sdk.skills.HolyFreeze] = new Merc(sdk.mercs.Guard, sdk.skills.HolyFreeze, 2, sdk.difficulty.Nightmare);
  this[sdk.skills.Might] = new Merc(sdk.mercs.Guard, sdk.skills.Might, 2, sdk.difficulty.Nightmare);
  this[sdk.skills.Thorns] = new Merc(sdk.mercs.Guard, sdk.skills.Thorns, 2, sdk.difficulty.Nightmare);

  // Act 3
  this[sdk.skills.IceBlast] = new Merc(sdk.mercs.IronWolf, sdk.skills.IceBlast, 3, sdk.difficulty.Normal);
  this[sdk.skills.FireBall] = new Merc(sdk.mercs.IronWolf, sdk.skills.FireBall, 3, sdk.difficulty.Normal);
  this[sdk.skills.Lightning] = new Merc(sdk.mercs.IronWolf, sdk.skills.Lightning, 3, sdk.difficulty.Normal);

  // Act 5
  this[sdk.skills.Bash] = new Merc(sdk.mercs.A5Barb, sdk.skills.Bash, 5, sdk.difficulty.Normal);

  /** @type {Map<number, Merc[]>} */
  this.actMap = new Map();
  this.actMap.set(sdk.mercs.Rogue, 1);
  this.actMap.set(1, [this[sdk.skills.FireArrow], this[sdk.skills.ColdArrow]]);

  this.actMap.set(sdk.mercs.Guard, 2);
  this.actMap.set(2, [
    this[sdk.skills.Prayer], this[sdk.skills.BlessedAim],
    this[sdk.skills.Defiance], this[sdk.skills.HolyFreeze],
    this[sdk.skills.Might], this[sdk.skills.Thorns]
  ]);

  this.actMap.set(sdk.mercs.IronWolf, 3);
  this.actMap.set(3, [this[sdk.skills.IceBlast], this[sdk.skills.FireBall], this[sdk.skills.Lightning]]);

  this.actMap.set(sdk.mercs.A5Barb, 5);
  this.actMap.set(5, [this[sdk.skills.Bash]]);

  this.findByName = function (name, act) {
    let merc = this.actMap.get(act)
      .find(m => m.skillName === name);
    return merc;
  };
};

const Mercenary = {
  minCost: -1,
  timeout: 0,

  /**
   * only a2 mercs for now, need to test others to see if ModifierListSkill returns their skill
   * @param {MercUnit} merc 
   * @returns {string}
   */
  getMercSkill: function (merc) {
    !merc && (merc = Misc.poll(function () {
      return me.getMerc();
    }, 1000, 50));
    if (!merc) return false;
    let mercSkill = (function () {
      switch (merc.classid) {
      case sdk.mercs.Rogue:
        return [
          sdk.skills.FireArrow,
          sdk.skills.ColdArrow
        ].find(s => merc.getSkill(s, sdk.skills.subindex.HardPoints));
      case sdk.mercs.Guard:
        let checkStat = merc.getStat(sdk.stats.ModifierListSkill);
        // if ([sdk.skills.Meditation, sdk.skills.Conviction, sdk.skills.Concentration, sdk.skills.HolyFire].includes(checkStat)) {
        // 	return [sdk.skills.Prayer, sdk.skills.BlessedAim, sdk.skills.Defiance].find(s => merc.getSkill(s, sdk.skills.subindex.HardPoints));
        // }
        if (![
          sdk.skills.Prayer, sdk.skills.BlessedAim,
          sdk.skills.Defiance, sdk.skills.HolyFreeze,
          sdk.skills.Might, sdk.skills.Thorns
        ].includes(checkStat)) {
          // check items for aura granting one then subtract it's skillId
          merc.getItemsEx().forEach(function (item) {
            if (!item.unique && !item.runeword) return false;
            switch (true) {
            case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.Meditation)):
              return (checkStat -= sdk.skills.Meditation);
            case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.Conviction)):
              return (checkStat -= sdk.skills.Conviction);
            case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.Concentration)):
              return (checkStat -= sdk.skills.Concentration);
            case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.HolyFreeze)):
              return (checkStat -= sdk.skills.HolyFreeze);
            case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.HolyFire)):
              return (checkStat -= sdk.skills.HolyFire);
            case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.HolyShock)):
              return (checkStat -= sdk.skills.HolyShock);
            }
            return true;
          });
        }
        return checkStat >= sdk.skills.Might ? checkStat : 0;
      case sdk.mercs.IronWolf:
        return [
          sdk.skills.IceBlast,
          sdk.skills.FireBall,
          sdk.skills.Lightning
        ].find(s => merc.getSkill(s, sdk.skills.subindex.HardPoints));
      case sdk.mercs.A5Barb:
        return sdk.skills.Bash;
      default:
        return 0;
      }
    })();

    return mercSkill ? getSkillById(mercSkill) : "";
  },

  /**
   * @param {MercUnit} merc 
   * @returns {number}
   */
  getMercDifficulty: function (merc) {
    !merc && (merc = Misc.poll(function () {
      return me.getMerc();
    }, 1000, 50));
    if (!merc) return false;
    if (merc.classid !== sdk.mercs.Guard) return sdk.difficulty.Normal;

    let mercSkill = merc.getStat(sdk.stats.ModifierListSkill);

    switch (mercSkill) {
    case sdk.skills.Thorns:
    case sdk.skills.HolyFreeze:
    case sdk.skills.Might:
      return sdk.difficulty.Nightmare;
    default:
      return sdk.difficulty.Normal;
    }
  },

  /**
   * @param {MercUnit} merc 
   * @returns {number}
   */
  getMercAct: function (merc) {
    !merc && (merc = Misc.poll(function () {
      return me.getMerc();
    }, 1000, 50));
    if (!merc) return 0;
    return MercData.actMap.get(merc.classid) || 0;
  },

  /**
   * @param {MercUnit} merc 
   */
  getMercInfo: function (merc) {
    !merc && (merc = Misc.poll(function () {
      return me.getMerc();
    }, 1000, 50));
    if (!merc) return { classid: 0, act: 0, difficulty: 0, type: "" };
    return {
      classid: merc.classid,
      act: this.getMercAct(merc),
      difficulty: this.getMercDifficulty(merc),
      skillName: this.getMercSkill(merc)
    };
  },

  /**
   * 
   * @param {{ classid: number, act: number, skill: number, skillName: string, difficulty: number }} wanted 
   * @param {MercUnit} merc 
   * @returns {boolean}
   */
  checkMercSkill: function (wanted, merc) {
    merc = !!merc ? merc : me.getMerc();
    if (!merc) return false;
    let mercSkill = merc.getStat(sdk.stats.ModifierListSkill);

    if (merc.classid === sdk.mercs.Guard) {
      return mercSkill === wanted.skill;
    } else {
      return merc.getSkill(wanted.skill, sdk.skills.subindex.HardPoints) > 0;
    }
  },

  // only supports act 2 mercs for now
  hireMerc: function () {
    if (me.classic) return true;
    if (Mercenary.timeout && getTickCount() < Mercenary.timeout) return true;
    let _a;
    let { wantedMerc } = Check.finalBuild();
    let mercAct = (!me.accessToAct(2) && me.normal ? 1 : wantedMerc.act);
    let tmpAuraName = "Defiance";
    let currMerc = me.data.merc;

    // don't hire if using correct a1 merc, or passed merc hire difficulty
    // we've already gotten the correct a1 merc or haven't yet completed Bloodraven
    // we are not in the correct difficulty to hire our wanted merc
    // we don't have access to the act of our wanted merc
    // we've already hired our wanted merc
    // we aren't in our wanted mercs difficulty but we have already hired the correct temp a2 merc
    // we've gone back a difficulty - (with using the data file it shouldn't get here but still handle it just in case)
    // we don't have enough spare gold to buy a1 merc
    // we don't have enough gold to hire our wanted merc
    switch (true) {
    case mercAct === 1 && (currMerc.skillName === "Cold Arrow" || !Misc.checkQuest(sdk.quest.id.SistersBurialGrounds, sdk.quest.states.Completed)):
    case currMerc.skillName === wantedMerc.skillName:
    case me.diff > wantedMerc.difficulty:
    case me.diff === wantedMerc.difficulty && !me.accessToAct(wantedMerc.act):
    case me.diff !== wantedMerc.difficulty && currMerc.skillName === "Defiance":
    case (me.charlvl > CharInfo.levelCap + 10 && Mercenary.checkMercSkill(wantedMerc)):
    case me.gold < Math.round((((me.charlvl - 1) * (me.charlvl - 1)) / 2) * 7.5):
    case this.minCost > 0 && me.gold < this.minCost:
      return true;
    }
    
    // lets check what our current actually merc is
    /** @type {MercUnit} */
    let checkMyMerc = Misc.poll(function () {
      return me.getMerc();
    }, 50, 500);

    const wantedSkill = (mercAct === 1
      ? "Fire Arrow" === wantedMerc.skillName
        ? wantedMerc.skillName
        : "Cold Arrow"
      : me.normal
        ? tmpAuraName
        : wantedMerc.skillName
    );

    if (checkMyMerc && Mercenary.checkMercSkill(wantedMerc, checkMyMerc)) {
      // we have our wanted merc, data file was probably erased so lets re-update it
      me.data.merc.act = Mercenary.getMercAct(checkMyMerc);
      me.data.merc.classid = checkMyMerc.classid;
      me.data.merc.difficulty = Mercenary.getMercDifficulty(checkMyMerc);
      me.data.merc.skillName = wantedMerc.skillName;
      me.data.merc.skill = MercData.findByName(me.data.merc.skillName, me.act).skill;
      CharData.updateData("merc", me.data) && me.update();

      return true;
    } else if (!!checkMyMerc && checkMyMerc.classid === sdk.mercs.Guard) {
      let checkSkill = checkMyMerc.getStat(sdk.stats.ModifierListSkill);
      // aura isn't active so we can't check it
      if (!checkSkill) return true;
      // or we might have multiple aura's going
      if ([sdk.skills.Meditation, sdk.skills.Conviction, sdk.skills.Concentration].includes(checkSkill)) return true;
      if (checkSkill > sdk.skills.Conviction) return true;
    }

    let MercLib_1 = require("../Modules/MercLib");
    try {
      Town.goToTown(mercAct);
      myPrint("ÿc9Mercenaryÿc0 :: getting merc");
      Town.move(Town.tasks.get(me.act).Merc);
      me.sortInventory();
      Item.removeItemsMerc(); // strip temp merc gear
      delay(500 + me.ping);
      
      addEventListener("gamepacket", MercLib_1.mercPacket);
      Town.initNPC("Merc", "getMerc");

      delay(500);

      if (!MercLib_1.default.length) throw new Error("No mercs found");

      let wantedMerc = MercLib_1.default
        .filter(function (merc) {
          return merc.skills
            .some(function (skill) {
              return (skill === null || skill === void 0 ? void 0 : skill.name) === wantedSkill;
            });
        })
        .sort(function (a, b) {
          return b.level - a.level;
        })
        .first();
      if (!wantedMerc) throw new Error("No merc found with skill " + wantedSkill);
      if (wantedMerc.cost > me.gold) {
        Mercenary.minCost = wantedMerc.cost;
        throw new Error("Too expensive " + wantedMerc.cost);
      }

      let oldGid_1 = (_a = me.getMercEx()) === null || _a === void 0 ? void 0 : _a.gid;
      console.log("ÿc9Mercenaryÿc0 :: Found a merc to hire " + JSON.stringify(wantedMerc));

      (wantedMerc === null || wantedMerc === void 0)
        ? void 0
        : wantedMerc.hire();
      let newMerc = Misc.poll(function () {
        let merc = me.getMerc();
        if (!merc) return false;
        if (oldGid_1 && oldGid_1 === merc.gid) return false;
        return merc;
      });
      
      console.log("Hired a merc?");
      if (newMerc) {
        console.log("Yep");
        me.data.merc.act = me.act;
        me.data.merc.classid = newMerc.classid;
        me.data.merc.difficulty = me.diff;
        me.data.merc.skillName = wantedMerc.skills.find(sk => sk.name === wantedSkill).name;
        me.data.merc.skill = MercData.findByName(me.data.merc.skillName, me.act).skill;
        CharData.updateData("merc", me.data) && me.update();
        console.log("ÿc9Mercenaryÿc0 :: " + me.data.merc.skillName + " merc hired.");
      }
      me.cancelUIFlags();
      while (getInteractedNPC()) {
        delay(me.ping || 5);
        me.cancel();
      }
    } catch (e) {
      console.error(e);
      Mercenary.timeout = getTickCount() + Time.minutes(3);
    } finally {
      removeEventListener("gamepacket", MercLib_1.mercPacket);
    }

    Item.autoEquipMerc();
    Pickit.pickItems(); // safetycheck for merc items on ground
    Item.autoEquipMerc();

    return true;
  },
};

