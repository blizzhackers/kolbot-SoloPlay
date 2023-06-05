/**
*  @filename    DynamicTiers.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Dynamic tier calculators for Kolbot-SoloPlay
*
*/

/**
 * @todo Make a list of what stats can appear on the different quality items and adjust scoring to improve effiency of the checks
 * no point checking for stats that cannot ever exist. Also handle some of the misc stats that appear as they can be helpful.
 */

(function () {
  /**
   * @param {ItemUnit} item 
   */
  const sumElementalDmg = function (item) {
    if (!item) return 0;
    let fire = item.getStatEx(sdk.stats.FireMinDamage) + item.getStatEx(sdk.stats.FireMaxDamage);
    let light = item.getStatEx(sdk.stats.LightMinDamage) + item.getStatEx(sdk.stats.LightMaxDamage);
    let magic = item.getStatEx(sdk.stats.MagicMinDamage) + item.getStatEx(sdk.stats.MagicMaxDamage);
    let cold = item.getStatEx(sdk.stats.ColdMinDamage) + item.getStatEx(sdk.stats.ColdMaxDamage);
    let poison = (item.getStatEx(sdk.stats.PoisonMinDamage) * 125 / 256); // PSN damage adjusted for damage per frame (125/256)
    return (fire + light + magic + cold + poison);
  };

  /**
   * @param {ItemUnit} item 
   */
  const mercscore = function (item) {
    const mercWeights = {
      IAS: 3.5,
      MINDMG:	3, // min damage
      MAXDMG: 3, // max damage
      SECMINDMG: 3, // secondary min damage
      SECMAXDMG: 3, // secondary max damage
      ELEDMG: 2, // elemental damage
      AR: 0.1, // attack rating
      CB: 3, // crushing blow
      OW: 3, // open wounds
      LL: 8, //lifeleach
      // CTC on attack
      CTCOAAMP: 5,
      CTCOADECREP: 10,
      // CTC on striking
      CTCOSAMP: 3,
      CTCOSDECREP: 8,
      // regen
      HPREGEN: 2,
      FHR: 3, // faster hit recovery
      DEF: 0.05, // defense
      HP:	2,
      STR: 1.5,
      DEX: 1.5,
      ALL: 60, // + all skills
      FR: 2, // fire resist
      LR: 2, // lightning resist
      CR: 1.5, // cold resist
      PR: 1, // poison resist
      ABS: 2.7, // absorb damage (fire light magic cold)
      DR: 2, // Damage resist
      MR: 3, // Magic damage resist
    };

    let mercRating = 1;
    // start
    item.prefixnum === sdk.locale.items.Treachery && (mercRating += item.getStatEx(sdk.stats.SkillWhenStruck, 2) * 1000); // fade
    mercRating += item.getStatEx(sdk.stats.SkillOnAura, sdk.skills.Conviction) * 1000; // conviction aura
    mercRating += item.getStatEx(sdk.stats.SkillOnAura, sdk.skills.Meditation) * 100; // meditation aura
    mercRating += item.getStatEx(sdk.stats.AllSkills) * mercWeights.ALL; // add all skills
    mercRating += item.getStatEx(sdk.stats.IAS) * mercWeights.IAS; // add IAS
    mercRating += item.getStatEx(sdk.stats.ToHit) * mercWeights.AR; // add AR
    mercRating += item.getStatEx(sdk.stats.CrushingBlow) * mercWeights.CB; // add crushing blow
    mercRating += item.getStatEx(sdk.stats.OpenWounds) * mercWeights.OW; // add open wounds
    mercRating += item.getStatEx(sdk.stats.LifeLeech) * mercWeights.LL; // add LL
    mercRating += item.getStatEx(sdk.stats.HpRegen) * mercWeights.HPREGEN; // add hp regeneration
    mercRating += item.getStatEx(sdk.stats.FHR) * mercWeights.FHR; // add faster hit recovery
    mercRating += item.getStatEx(sdk.stats.Defense) * mercWeights.DEF; //	add Defense
    mercRating += item.getStatEx(sdk.stats.Strength) * mercWeights.STR; // add STR
    mercRating += item.getStatEx(sdk.stats.Dexterity) * mercWeights.DEX; // add DEX
    mercRating += item.getStatEx(sdk.stats.FireResist) * mercWeights.FR; // add FR
    mercRating += item.getStatEx(sdk.stats.ColdResist) * mercWeights.CR; // add CR
    mercRating += item.getStatEx(sdk.stats.LightResist) * mercWeights.LR; // add LR
    mercRating += item.getStatEx(sdk.stats.PoisonResist) * mercWeights.PR; // add PR
    mercRating += (item.getStatEx(sdk.stats.Vitality) + item.getStatEx(sdk.stats.MaxHp) + (item.getStatEx(sdk.stats.PerLevelHp) / 2048 * me.charlvl)) * mercWeights.HP; // add HP
    mercRating += sumElementalDmg(item) * mercWeights.ELEDMG; // add elemental damage
    mercRating += (item.getStatEx(sdk.stats.AbsorbFirePercent) + item.getStatEx(sdk.stats.AbsorbLightPercent) + item.getStatEx(sdk.stats.AbsorbMagicPercent) + item.getStatEx(sdk.stats.AbsorbColdPercent)) * mercWeights.ABS; // add absorb damage
    mercRating += item.getStatEx(sdk.stats.NormalDamageReduction) * mercWeights.DR; // add integer damage resist
    mercRating += item.getStatEx(sdk.stats.DamageResist) * mercWeights.DR * 2; // add damage resist %
    mercRating += item.getStatEx(sdk.stats.MagicDamageReduction) * mercWeights.MR; // add integer magic damage resist
    mercRating += item.getStatEx(sdk.stats.MagicResist) * mercWeights.MR * 2; // add magic damage resist %

    switch (me.data.merc.classid) {
    case sdk.mercs.Rogue:
    case sdk.mercs.IronWolf:
      mercRating += item.getStatEx(sdk.stats.MinDamage) * mercWeights.MINDMG; // add MIN damage
      mercRating += item.getStatEx(sdk.stats.MaxDamage) * mercWeights.MAXDMG; // add MAX damage

      break;
    case sdk.mercs.A5Barb:
      if ([item.getStatEx(sdk.stats.SecondaryMinDamage), item.getStatEx(sdk.stats.SecondaryMaxDamage)].includes(0)) {
        mercRating += item.getStatEx(sdk.stats.MinDamage) * mercWeights.MINDMG; // add MIN damage
        mercRating += item.getStatEx(sdk.stats.MaxDamage) * mercWeights.MAXDMG; // add MAX damage

        break;
      }
      // eslint-disable-next-line no-fallthrough
    case sdk.mercs.Guard:
    default:
      mercRating += item.getStatEx(sdk.stats.SecondaryMinDamage) * mercWeights.SECMINDMG;
      mercRating += item.getStatEx(sdk.stats.SecondaryMaxDamage) * mercWeights.SECMAXDMG;

      break;
    }

    if (!me.sorceress && !me.necromancer && !me.assassin) {
      mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 4238) * mercWeights.CTCOAAMP; // add CTC amplify damage on attack
      mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 4225) * mercWeights.CTCOAAMP; // add CTC amplify damage on attack (magic items)
      mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 5583) * mercWeights.CTCOADECREP; // add CTC decrepify on attack
      mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 5631) * mercWeights.CTCOADECREP; // add CTC decrepify on attack (magic items)
      mercRating += item.getStatEx(sdk.stats.SkillOnHit, 4238) * mercWeights.CTCOSAMP; // add CTC amplify damage on strikng
      mercRating += item.getStatEx(sdk.stats.SkillOnHit, 4225) * mercWeights.CTCOSAMP; // add CTC amplify damage on strikng (magic items)
      mercRating += item.getStatEx(sdk.stats.SkillOnHit, 5583) * mercWeights.CTCOSDECREP; // add CTC decrepify on strikng
      mercRating += item.getStatEx(sdk.stats.SkillOnHit, 5631) * mercWeights.CTCOSDECREP; // add CTC decrepify on strikng (magic items)
    }

    if (item.isBaseType && !item.isRuneword) {
      for (let runeword of Config.Runewords) {
        let [sockets, baseCID] = [runeword[0].sockets, runeword[1]];
        if (item.classid === baseCID && item.sockets === sockets && !item.getItemsEx().length) return -1;
      }
    }

    return mercRating;
  };

  /**
   * @param {ItemUnit} item
   * @param {number} [skillId]
   * @param {object} [buildInfo]
   */
  const chargeditemscore = function (item, skillId, buildInfo) {
    if (!item) return 0;

    let tier = 0;
    !buildInfo && (buildInfo = Check.currentBuild());

    /**
     * @constructor
     * @param {{ skill: number, level: number, charges: number, maxcharges: number}} obj 
     */
    function ChargedItem (obj = {}) {
      this.skill = obj.skill;
      this.level = obj.level;
      this.charges = obj.charges;
      this.maxcharges = obj.maxcharges;
    }
    const _chargedWeights = new Map([
      [sdk.skills.Teleport, (Pather.canTeleport() ? 0 : 5)],
      [sdk.skills.Enchant, (buildInfo.caster ? 0 : 10)],
      [sdk.skills.InnerSight, (me.amazon || buildInfo.caster ? 0 : 10)],
      [sdk.skills.SlowMissiles, (me.amazon ? 0 : 10)],
    ]);

    let stats = item.getStat(-2);
    let chargedItems = [];

    if (stats.hasOwnProperty(sdk.stats.ChargedSkill)) {
      if (stats[sdk.stats.ChargedSkill] instanceof Array) {
        for (let i = 0; i < stats[sdk.stats.ChargedSkill].length; i++) {
          if (stats[sdk.stats.ChargedSkill][i] !== undefined) {
            chargedItems.push(new ChargedItem(stats[sdk.stats.ChargedSkill][i]));
          }
        }
      } else {
        chargedItems.push(new ChargedItem(stats[sdk.stats.ChargedSkill]));
      }
    }

    chargedItems = chargedItems
      .filter((v, i, a) => a.findIndex(el => ["skill", "level"].every(k => el[k] === v[k])) === i);

    if (skillId > 0) {
      chargedItems
        .filter(check => check.skill === skillId)
        .forEach(el => tier += el.level * 5);
    } else {
      chargedItems.forEach(function (el) {
        if (el.skill === sdk.skills.Teleport) {
          tier += el.maxcharges * 2;
        } else if (_chargedWeights.has(el.skill)) {
          tier += el.level * _chargedWeights.get(el.skill);
        }
      });
    }

    return tier;
  };

  const _tierWeights = (function () {
    const hc = me.hardcore;
    const buildInfo = Check.currentBuild();
    /** @type {Map<number, number>} */
    const res = new Map([
      [sdk.stats.FireResist, hc ? 5 : 3],
      [sdk.stats.LightningResist, hc ? 5 : 3],
      [sdk.stats.ColdResist, hc ? 3 : 1.5],
      [sdk.stats.PoisonResist, hc ? 5 : 1],
      [sdk.stats.MaxFireResist, 5],
      [sdk.stats.MaxLightResist, 5],
      [sdk.stats.MaxColdResist, 3],
      [sdk.stats.MaxPoisonResist, 3],
      [sdk.stats.AbsorbFire, hc ? 2 : 1],
      [sdk.stats.AbsorbFirePercent, hc ? 3 : 1.5],
      [sdk.stats.AbsorbLight, hc ? 2 : 1],
      [sdk.stats.AbsorbLightPercent, hc ? 3 : 1.5],
      [sdk.stats.AbsorbCold, hc ? 1 : 0.5],
      [sdk.stats.AbsorbColdPercent, hc ? 1.5 : 0.75],
      [sdk.stats.AbsorbMagic, hc ? 2 : 1],
      [sdk.stats.AbsorbMagicPercent, hc ? 3 : 1.5],
      [sdk.stats.NormalDamageReduction, hc ? 1 : 0.5],
      [sdk.stats.MagicDamageReduction, hc ? 1 : 0.5],
      [sdk.stats.DamageResist, hc ? 5 : 2],
      [sdk.stats.MagicResist, hc ? 6 : 3],
    ]);
    /** @type {Map<number | string, number>} */
    const gen = new Map([
      [sdk.stats.CannotbeFrozen, buildInfo.caster ? 25 : 100],
      [sdk.stats.FRW, 1],
      [sdk.stats.FHR, 3],
      [sdk.stats.FBR, 1],
      [sdk.stats.ToBlock, 1],
      [sdk.stats.IAS, buildInfo.caster && !me.assassin ? 0 : 4],
      [sdk.stats.FCR, buildInfo.caster ? me.assassin ? 2 : 5 : 0.5],
      [sdk.stats.Defense, 0.05],
      [sdk.stats.MagicBonus, 1],
      [sdk.stats.GoldBonus, 0.5],
      [sdk.stats.Vitality, 1],
      [sdk.stats.MaxHp, 1],
      [sdk.stats.PerLevelHp, 1],
      [sdk.stats.HpRegen, 2],
      [sdk.stats.Energy, 1],
      [sdk.stats.MaxMana, 1],
      [sdk.stats.PerLevelMana, 1],
      [sdk.stats.ManaRecovery, buildInfo.caster ? 2.5 : 1],
      [sdk.stats.Strength, 1],
      [sdk.stats.Dexterity, me.amazon ? 3 : 1],
      [sdk.stats.ReplenishQuantity, me.amazon ? 50 : 0],
      [sdk.stats.ToHit, 0.2],
      [sdk.stats.CrushingBlow, 4],
      [sdk.stats.OpenWounds, 1],
      [sdk.stats.DeadlyStrike, 1.5],
      [sdk.stats.LifeLeech, 4],
      [sdk.stats.ManaLeech, 2],
      [sdk.stats.DemonDamagePercent, 0.5],
      [sdk.stats.UndeadDamagePercent, 0.5],
      [sdk.stats.ReplenishDurability, 15],
      [sdk.stats.IgnoreTargetDefense, 50],
      [sdk.stats.MinDamage, 3],
      [sdk.stats.MaxDamage, 3],
      [sdk.stats.SecondaryMinDamage, 2],
      [sdk.stats.SecondaryMaxDamage, 2],
    ]);
    /** @type {Map<number, number>} */
    const skill = new Map([
      [sdk.stats.AllSkills, 200],
      [sdk.stats.AddClassSkills, 175],
      [sdk.stats.AddSkillTab, 125],
    ]);
    /** @type {Map<number, number>} */
    const charms = new Map([
      [sdk.stats.AllSkills, 180],
      [sdk.stats.AddClassSkills, 175],
      [sdk.stats.AddSkillTab, 300],
      [sdk.stats.FireResist, 3],
      [sdk.stats.LightningResist, 5],
      [sdk.stats.ColdResist, 2],
      [sdk.stats.PoisonResist, 1],
      [sdk.stats.FRW, 1],
      [sdk.stats.FHR, (me.barbarian ? 4 : 2)],
      [sdk.stats.Defense, 0.05],
      [sdk.stats.MagicBonus, 2],
      [sdk.stats.GoldBonus, 0.5],
      [sdk.stats.MaxHp, 1.75],
      [sdk.stats.PerLevelHp, 1],
      [sdk.stats.HpRegen, 2],
      [sdk.stats.MaxMana, 1],
      [sdk.stats.PerLevelMana, 1],
      [sdk.stats.Strength, 1],
      [sdk.stats.Dexterity, me.amazon ? 3 : 1],
      [sdk.stats.Vitality, 1],
      [sdk.stats.Energy, 0.8],
    ]);

    /** @type {Map<number, number>} */
    const ctc = new Map([
      [sdk.stats.SkillWhenStruck, 2],
      [sdk.stats.SkillOnAttack, 2],
      [sdk.stats.SkillOnStrike, 1],
      [sdk.skills.Nova, 2],
      [sdk.skills.FrostNova, 4],
      [sdk.skills.IceBlast, 4],
      [sdk.skills.ChargedBolt, 4],
      [sdk.skills.StaticField, 5],
      [sdk.skills.GlacialSpike, 6],
      [sdk.skills.ChainLightning, 6],
      [sdk.skills.Blizzard, 4],
      [sdk.skills.FrozenOrb, 8],
      [sdk.skills.Hydra, 4],
      [sdk.skills.AmplifyDamage, 5],
      [sdk.skills.Decrepify, 10],
      [sdk.skills.LifeTap, 10],
      [sdk.skills.BoneArmor, 10],
      [sdk.skills.BoneSpear, 8],
      [sdk.skills.BoneSpirit, 8],
      [sdk.skills.PoisonNova, 10],
      [sdk.skills.Taunt, 5],
      [sdk.skills.Howl, 5],
      [sdk.skills.CycloneArmor, 10],
      [sdk.skills.Twister, 5],
      [sdk.skills.Fade, 10],
      [sdk.skills.Venom, 8],
    ]);

    return {
      res: res,
      gen: gen,
      skill: skill,
      charms: charms,
      ctc: ctc,
    };
  })();

  /**
   * @param {ItemUnit} item 
   * @param {number} [bodyloc] 
   * @todo Breakpoint scoring similar to how res is scored
   */
  const tierscore = function (item, tier, bodyloc) {
    if (item.questItem) return -1;
    const itembodyloc = Item.getBodyLoc(item);
    if (!itembodyloc.length) return -1;
    bodyloc = bodyloc || itembodyloc.last();

    if (item.isBaseType && !item.isRuneword && me.charlvl > 10) {
      for (let runeword of Config.Runewords) {
        let [sockets, baseCID] = [runeword[0].sockets, runeword[1]];
        if (item.classid === baseCID && item.sockets === sockets && !item.getItemsEx().length) return -1;
      }
    }

    const buildInfo = Check.currentBuild();
    const canTele = Pather.canTeleport();
    // const eqItem = me.equipped.get(bodyloc);
    const eqItem = me.getEquippedItem(bodyloc);

    const generalScore = function () {
      let generalRating = 0;

      // get item cbf stat from olditem equipped on body location
      if (!canTele && item.getStatEx(sdk.stats.CannotbeFrozen)) {
        // check if we have cbf but make sure its not from the item we are trying to un-equip
        if (!me.getStat(sdk.stats.CannotbeFrozen)) {
          // Cannot be frozen is very important for Melee chars
          generalRating += _tierWeights.gen.get(sdk.stats.CannotbeFrozen);
        }
      }

      // belt slots
      if (item.itemType === sdk.items.type.Belt) {
        const beltSizes = { lbl: 2, vbl: 2, mbl: 3, tbl: 3 };
        const beltSize = beltSizes[item.code] || 4;
        // if our current belt-size is better, don't down-grade even if the other stats on the new item are better, not worth the town visits
        generalRating += (Storage.BeltSize() > beltSize ? -50 : (beltSize * 4 * 2));
      }

      // pierce/mastery's not sure how I want to weight this so for now just its base value
      buildInfo.usefulStats.forEach(stat => generalRating += item.getStatEx(stat));

      // start generalRating
      !item.isRuneword && (generalRating += (item.sockets * 10)); // priortize sockets
      generalRating += ((item.getStatEx(sdk.stats.PerLevelHp) / 2048 * me.charlvl)) * _tierWeights.gen.get(sdk.stats.PerLevelHp);
      generalRating += ((item.getStatEx(sdk.stats.PerLevelMana) / 2048 * me.charlvl)) * _tierWeights.gen.get(sdk.stats.PerLevelMana);

      return [
        sdk.stats.FHR, sdk.stats.FRW, sdk.stats.FBR, sdk.stats.FCR, sdk.stats.ToBlock,
        sdk.stats.MagicBonus, sdk.stats.GoldBonus, sdk.stats.Defense, sdk.stats.ManaRecovery,
        sdk.stats.Strength, sdk.stats.Dexterity, sdk.stats.Vitality, sdk.stats.Energy,
        sdk.stats.MaxHp, sdk.stats.MaxMana, sdk.stats.ReplenishQuantity, sdk.stats.HpRegen,
      ].reduce((acc, stat) => acc + item.getStatEx(stat) * _tierWeights.gen.get(stat), generalRating);
    };

    const resistScore = function () {
      let resistRating = 0;
      
      // get new item stats
      let [newitemFR, newitemCR, newitemLR, newitemPR] = [
        item.getStatEx(sdk.stats.FireResist),
        item.getStatEx(sdk.stats.ColdResist),
        item.getStatEx(sdk.stats.LightResist),
        item.getStatEx(sdk.stats.PoisonResist)
      ];
      // only enter next block if we have a new item with resists
      if (newitemFR || newitemCR || newitemLR || newitemPR) {
        const maxRes = me.hell ? 80 : (80 + me.getResPenalty(me.diff + 1) - me.getResPenalty(me.diff));
        // get item resists stats from olditem equipped on body location
        let [olditemFR, olditemCR, olditemLR, olditemPR] = [0, 0, 0, 0];
        if (eqItem) {
          // equipped resists
          [olditemFR, olditemCR, olditemLR, olditemPR] = [
            eqItem.getStatEx(sdk.stats.FireResist), eqItem.getStatEx(sdk.stats.ColdResist),
            eqItem.getStatEx(sdk.stats.LightResist), eqItem.getStatEx(sdk.stats.PoisonResist)
          ];
        }
        // subtract olditem resists from current total resists
        const [baseFR, baseCR, baseLR, basePR] = [
          me.fireRes - olditemFR,
          me.coldRes - olditemCR,
          me.lightRes - olditemLR,
          me.poisonRes - olditemPR,
        ];
        // if baseRes < max resists give score value upto max resists reached
        const [FRlimit, CRlimit, LRlimit, PRlimit] = [
          Math.max(maxRes - baseFR, 0),
          Math.max(maxRes - baseCR, 0),
          Math.max(maxRes - baseLR, 0),
          Math.max(maxRes - basePR, 0)
        ];
        // newitemRes upto reslimit
        let [effectiveFR, effectiveCR, effectiveLR, effectivePR] = [
          Math.min(newitemFR, FRlimit),
          Math.min(newitemCR, CRlimit),
          Math.min(newitemLR, LRlimit),
          Math.min(newitemPR, PRlimit)
        ];
        // sum resistRatings
        resistRating += effectiveFR * _tierWeights.res.get(sdk.stats.FireResist);
        resistRating += effectiveCR * _tierWeights.res.get(sdk.stats.ColdResist);
        resistRating += effectiveLR * _tierWeights.res.get(sdk.stats.LightResist);
        resistRating += effectivePR * _tierWeights.res.get(sdk.stats.PoisonResist);
      }

      return ([
        sdk.stats.MaxFireResist, sdk.stats.MaxLightResist, sdk.stats.MaxColdResist, sdk.stats.MaxPoisonResist,
        sdk.stats.AbsorbFire, sdk.stats.AbsorbLight, sdk.stats.AbsorbMagic, sdk.stats.AbsorbCold,
        sdk.stats.AbsorbFirePercent, sdk.stats.AbsorbLightPercent, sdk.stats.AbsorbMagicPercent, sdk.stats.AbsorbColdPercent,
        sdk.stats.NormalDamageReduction, sdk.stats.DamageResist, sdk.stats.MagicDamageReduction, sdk.stats.MagicResist
      ].reduce((acc, stat) => acc + item.getStatEx(stat) * _tierWeights.res.get(stat), resistRating));
    };

    const buildScore = function () {
      // dirty fix maybe?
      if (me.barbarian && SetUp.currentBuild !== "Immortalwhirl" && item.strictlyTwoHanded) {
        return 0;
      }
      // Melee Specific
      if (!buildInfo.caster
        || Config.AttackSkill.includes(sdk.skills.Attack)
        || Config.LowManaSkill.includes(sdk.skills.Attack)
        || ([sdk.items.type.Bow, sdk.items.type.AmazonBow, sdk.items.type.Crossbow].includes(item.itemType) && CharData.skillData.bow.onSwitch)) {
        let meleeRating = 0;
        const eleDmgWeight = 0.5;
        const eleDmgModifer = [sdk.items.type.Ring, sdk.items.type.Amulet].includes(item.itemType) ? 2 : 1;

        meleeRating += ((item.getStatEx(sdk.stats.MaxDamage) + item.getStatEx(sdk.stats.MinDamage)) / 2) * 3;
        meleeRating += sumElementalDmg(item) * (eleDmgWeight / eleDmgModifer); // add elemental damage
        meleeRating += item.getStatEx(sdk.stats.SkillOnAura, sdk.skills.Sanctuary) * 25; // sanctuary aura

        [
          sdk.stats.ReplenishDurability, sdk.stats.IgnoreTargetDefense, sdk.stats.ToHit, sdk.stats.CrushingBlow,
          sdk.stats.OpenWounds, sdk.stats.DeadlyStrike, sdk.stats.LifeLeech, sdk.stats.ManaLeech,
          sdk.stats.DemonDamagePercent, sdk.stats.UndeadDamagePercent,
        ].reduce((acc, stat) => acc + item.getStatEx(stat) * _tierWeights.gen.get(stat), meleeRating);
        buildInfo.caster && (meleeRating /= 2);
        
        return meleeRating;
      }

      return 0;
    };

    const skillsScore = function () {
      let skillsRating = [
        [sdk.stats.AllSkills, -1], [sdk.stats.AddClassSkills, me.classid], [sdk.stats.AddSkillTab, buildInfo.tabSkills],
      ].reduce((acc, [stat, subId]) => acc + item.getStatEx(stat, subId) * _tierWeights.skill.get(stat), 0);
      (!buildInfo.caster && item.getItemType() === "Weapon") && (skillsRating /= 4);
      const _misc = { wanted: 40, useful: 35 };

      let selectedWeights = [_misc.wanted, _misc.useful];
      let selectedSkills = [buildInfo.wantedSkills, buildInfo.usefulSkills];

      for (let i = 0; i < selectedWeights.length; i++) {
        for (let j = 0; j < selectedSkills.length; j++) {
          for (let k = 0; k < selectedSkills[j].length; k++) {
            skillsRating += item.getStatEx(sdk.stats.SingleSkill, selectedSkills[j][k]) * selectedWeights[i];
          }
        }
      }

      // Spirit Fix for barb
      (item.prefixnum === sdk.locale.items.Spirit && !buildInfo.caster) && (skillsRating -= 400);

      return skillsRating;
    };

    const ctcScore = function () {
      // chance to cast doesn't exist in classic
      if (me.classic) return 0;

      let ctcRating = 0;
      let ctcItems = [];
      const stats = item.getStat(-2);
      const ctcSkillObj = (ctcType, skill, level) => ({ ctcType: ctcType, skill: skill, level: level });
      const meleeCheck = !buildInfo.caster;
      /**
       * @param {number} type 
       */
      const buildList = function (type) {
        let skill, level;
        if (stats.hasOwnProperty(type)) {
          if (stats[type] instanceof Array) {
            for (let i = 0; i < stats[type].length; i++) {
              if (stats[type][i] !== undefined) {
                ({ skill, level } = stats[type][i]);
                ctcItems.push(ctcSkillObj(type, skill, level));
              }
            }
          } else {
            ({ skill, level } = stats[type]);
            ctcItems.push(ctcSkillObj(type, skill, level));
          }
        }
      };

      buildList(sdk.stats.SkillWhenStruck);

      if (meleeCheck) {
        buildList(sdk.stats.SkillOnAttack);
        buildList(sdk.stats.SkillOnStrike);
      } else {
        _tierWeights.ctc.set(sdk.skills.Venom, 0);
        if (me.charlvl > 50) {
          _tierWeights.ctc.set(sdk.skills.ChargedBolt, 2);
        }
      }
      if (!ctcItems.length) return 0;

      ctcItems
        .filter((v, i, a) => a.findIndex(el => ["ctcType", "skill"].every(k => el[k] === v[k])) === i)
        .forEach(el => {
          if (!_tierWeights.ctc.has(el.skill)) return;
          ctcRating += (el.level * _tierWeights.ctc.get(el.skill) * _tierWeights.ctc.get(el.ctcType));
        });

      return ctcRating;
    };

    tier === undefined && (tier = 1); // set to 1 for native autoequip to use items.
    tier += generalScore();
    tier += resistScore();
    tier += buildScore();
    tier += skillsScore();
    tier += ctcScore();
    tier += chargeditemscore(item, -1, buildInfo);

    if (tier > 1 && tier < NTIP.MAX_TIER && NTIP.CheckItem(item, NTIP.FinalGear) === Pickit.Result.WANTED) {
      // console.debug(item.prettyPrint + "~~~" + tier);
      tier += NTIP.MAX_TIER;
    }

    return Math.max(1, tier);
  };

  /**
   * @param {ItemUnit} item 
   */
  const secondaryscore = function (item) {
    let tier = 0;

    Check.finalBuild().precastSkills
      .forEach(skill => tier += item.getStatEx(sdk.stats.SingleSkill, skill) * 50);

    tier += item.getStatEx(sdk.stats.FCR) * 5; // add FCR
    tier += item.getStatEx(sdk.stats.FHR) * 3; // add faster hit recovery

    return [
      [sdk.stats.AllSkills, -1],
      [sdk.stats.AddClassSkills, me.classid],
      [sdk.stats.AddSkillTab, Check.finalBuild().tabSkills],
    ].reduce((acc, [stat, subId]) => acc + item.getStatEx(stat, subId) * _tierWeights.skill.get(stat), tier);
  };

  /**
   * @param {ItemUnit} item 
   */
  const charmscore = function (item) {
    if (me.data.charmGids.includes(item.gid)) return 1000;
    // depending on invo space it might be worth it early on to keep 1 or 2 non-skiller grandcharms - @todo test that out
    if (!item.unique && item.classid === sdk.items.GrandCharm && !me.getSkillTabs().some(s => item.getStatEx(sdk.stats.AddSkillTab, s))) return -1;
    const buildInfo = Check.currentBuild();
  
    let charmRating = 1;

    // Gheeds, Torch, annhi - we know possible attributes so don't waste resources checking for all the others
    if (item.unique) {
      charmRating += item.getStatEx(sdk.stats.Strength); // handle +all atrributes
      charmRating += item.getStatEx(sdk.stats.AllRes);
      if (item.isAnni) {
        charmRating += item.getStatEx(sdk.stats.AllSkills) * _tierWeights.charms.get(sdk.stats.AllSkills);
        charmRating += item.getStatEx(sdk.stats.AddExperience);
      } else if (item.isGheeds) {
        charmRating += item.getStatEx(sdk.stats.GoldBonus);
        charmRating += item.getStatEx(sdk.stats.ReducedPrices) * 1.5;
        charmRating += item.getStatEx(sdk.stats.MagicBonus) * _tierWeights.charms.get(sdk.stats.MagicBonus);
      } else {
        charmRating += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * _tierWeights.charms.get(sdk.stats.AddClassSkills);
      }
    } else {
      charmRating += item.getStatEx(sdk.stats.AddSkillTab, buildInfo.tabSkills) * _tierWeights.charms.get(sdk.stats.AddSkillTab);
      charmRating += ((item.getStatEx(sdk.stats.PerLevelHp) / 2048 * me.charlvl)) * _tierWeights.charms.get(sdk.stats.PerLevelHp);
      charmRating += ((item.getStatEx(sdk.stats.PerLevelMana) / 2048 * me.charlvl)) * _tierWeights.charms.get(sdk.stats.PerLevelMana);

      if (!buildInfo.caster) {
        charmRating += item.getStatEx(sdk.stats.MinDamage) * 3; // add MIN damage
        charmRating += item.getStatEx(sdk.stats.MaxDamage) * 3; // add MAX damage
        charmRating += sumElementalDmg(item); // add elemental damage 
        charmRating += item.getStatEx(sdk.stats.ToHit) * 0.5; // add AR
      }

      return [
        sdk.stats.MaxHp, sdk.stats.MaxMana,
        sdk.stats.FireResist, sdk.stats.LightResist, sdk.stats.ColdResist, sdk.stats.PoisonResist,
        sdk.stats.FHR, sdk.stats.FRW, sdk.stats.MagicBonus, sdk.stats.GoldBonus, sdk.stats.Defense,
        sdk.stats.Strength, sdk.stats.Dexterity, sdk.stats.Vitality, sdk.stats.Energy,
      ].reduce((acc, stat) => acc + item.getStatEx(stat) * _tierWeights.charms.get(stat), charmRating);
    }
    return charmRating;
  };

  // export to global scope
  global.mercscore = mercscore;
  global.chargeditemscore = chargeditemscore;
  global.tierscore = tierscore;
  global.secondaryscore = secondaryscore;
  global.charmscore = charmscore;
})();
