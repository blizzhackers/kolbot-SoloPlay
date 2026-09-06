(function (module, require) {
  const MonsterData = (function () {
    const LocaleStringName = require("./LocaleStringID").LocaleStringName;
    const MONSTER_INDEX_COUNT = 770;
    /** @type {Map<number, MonsterObj>} */
    const _monsterData = new Map();

    /**
     * @constructor
     * @param {number} index 
     */
    function MonsterObj (index) {
      /** @type {number} */
      this.ClassID = index;
      /** @type {number} */
      this.Type = getBaseStat("monstats", index, "MonType");
      /** @type {number} */
      this.Level = getBaseStat("monstats", index, "Level"); // normal only, nm/hell are determined by area's LevelEx
      this.Ranged = getBaseStat("monstats", index, "RangedType");
      this.Rarity = getBaseStat("monstats", index, "Rarity");
      this.Threat = getBaseStat("monstats", index, "threat");
      this.PetIgnore = getBaseStat("monstats", index, "petignore");
      this.Align = getBaseStat("monstats", index, "Align");
      this.Melee = getBaseStat("monstats", index, "isMelee");
      this.NPC = getBaseStat("monstats", index, "npc");
      this.Demon = getBaseStat("monstats", index, "demon");
      this.Flying = getBaseStat("monstats", index, "flying");
      this.Boss = getBaseStat("monstats", index, "boss");
      this.ActBoss = getBaseStat("monstats", index, "primeevil");
      this.Killable = getBaseStat("monstats", index, "killable");
      this.Convertable = getBaseStat("monstats", index, "switchai");
      this.NeverCount = getBaseStat("monstats", index, "neverCount");
      this.DeathDamage = getBaseStat("monstats", index, "deathDmg");
      this.Regeneration = getBaseStat("monstats", index, "DamageRegen");
      /** @type {string} */
      this.LocaleString = getLocaleString(getBaseStat("monstats", index, "NameStr"));
      /** @type {string} */
      this.InternalName = LocaleStringName[getBaseStat("monstats", index, "NameStr")];
      this.ExperienceModifier = getBaseStat("monstats", index, ["Exp", "Exp(N)", "Exp(H)"][me.diff]);
      this.Undead = (getBaseStat("monstats", index, "hUndead") && 2) | (getBaseStat("monstats", index, "lUndead") && 1);
      this.Drain = getBaseStat("monstats", index, ["Drain", "Drain(N)", "Drain(H)"][me.diff]);
      this.Block = getBaseStat("monstats", index, ["ToBlock", "ToBlock(N)", "ToBlock(H)"][me.diff]);
      this.Physical = getBaseStat("monstats", index, ["ResDm", "ResDm(N)", "ResDm(H)"][me.diff]);
      this.Magic = getBaseStat("monstats", index, ["ResMa", "ResMa(N)", "ResMa(H)"][me.diff]);
      this.Fire = getBaseStat("monstats", index, ["ResFi", "ResFi(N)", "ResFi(H)"][me.diff]);
      this.Lightning = getBaseStat("monstats", index, ["ResLi", "ResLi(N)", "ResLi(H)"][me.diff]);
      this.Cold = getBaseStat("monstats", index, ["ResCo", "ResCo(N)", "ResCo(H)"][me.diff]);
      this.Poison = getBaseStat("monstats", index, ["ResPo", "ResPo(N)", "ResPo(H)"][me.diff]);
      this.Minions = ([
        getBaseStat("monstats", index, "minion1"), getBaseStat("monstats", index, "minion2")
      ].filter(mon => mon !== 65535));
      this.MinionCount = ({
        Min: getBaseStat("monstats", index, "minion1"),
        Max: getBaseStat("monstats", index, "minion2")
      });
      this.GroupCount = ({
        Min: getBaseStat("monstats", index, "MinGrp"),
        Max: getBaseStat("monstats", index, "MaxGrp")
      });
      this.Velocity = getBaseStat("monstats", index, "Velocity");
      this.Run = getBaseStat("monstats", index, "Run");
      this.SizeX = getBaseStat("monstats", index, "SizeX");
      this.SizeY = getBaseStat("monstats", index, "SizeY");
      this.Attack1MinDmg = getBaseStat("monstats", index, ["A1MinD", "A1MinD(N)", "A1MinD(H)"][me.diff]);
      this.Attack1MaxDmg = getBaseStat("monstats", index, ["A1MaxD", "A1MaxD(N)", "A1MaxD(H)"][me.diff]);
      this.Attack2MinDmg = getBaseStat("monstats", index, ["A2MinD", "A2MinD(N)", "A2MinD(H)"][me.diff]);
      this.Attack2MaxDmg = getBaseStat("monstats", index, ["A2MaxD", "A2MaxD(N)", "A2MaxD(H)"][me.diff]);
      this.Skill1MinDmg = getBaseStat("monstats", index, ["S1MinD", "S1MinD(N)", "S1MinD(H)"][me.diff]);
      this.Skill1MaxDmg = getBaseStat("monstats", index, ["S1MaxD", "S1MaxD(N)", "S1MaxD(H)"][me.diff]);
      this.MinHp = getBaseStat("monstats", index, "minHP");
      this.MaxHp = getBaseStat("monstats", index, "maxHP");
    }

    for (let i = 0; i < MONSTER_INDEX_COUNT; i++) {
      _monsterData.set(i, new MonsterObj(i));
    }

    return {
      /** @param {number} classid */
      has: function (classid) {
        return _monsterData.has(classid);
      },

      /** @param {number} classid */
      get: function (classid) {
        return _monsterData.get(classid);
      },

      /** @param {string} whatToFind */
      findByName: function (whatToFind) {
        let matches = [];
        for (let [, mon] of _monsterData) {
          let _diffcount = Math.min(
            whatToFind.diffCount(mon.LocaleString),
            whatToFind.diffCount(mon.InternalName)
          );
          if (_diffcount === 0) {
            return mon;
          }
          matches.push([_diffcount, mon]);
        }
        return matches
          .sort(function (a, b) {
            return a[0] - b[0];
          }).first()[1];

      },
    };
  })();
  module.exports = MonsterData;
})(module, require);
