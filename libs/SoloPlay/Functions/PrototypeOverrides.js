/**
*  @filename    PrototypeOverrides.js
*  @author      theBGuy
*  @credit      Jaenster
*  @desc        additions for improved Kolbot-SoloPlay functionality and code readability
*
*/

includeIfNotIncluded("core/Prototypes.js");
includeIfNotIncluded("SoloPlay/Functions/Me.js");
includeIfNotIncluded("SoloPlay/Functions/Polyfills.js");

/**
 * @description Unit prototypes for soloplay with checks to ensure forwards compatibility
 */
if (!Unit.prototype.hasOwnProperty("isCharm")) {
  Object.defineProperty(Unit.prototype, "isCharm", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return [sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(this.classid);
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isGem")) {
  Object.defineProperty(Unit.prototype, "isGem", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return (
        this.itemType >= sdk.items.type.Amethyst
        && this.itemType <= sdk.items.type.Skull
      );
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isInsertable")) {
  Object.defineProperty(Unit.prototype, "isInsertable", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return [sdk.items.type.Jewel, sdk.items.type.Rune].includes(this.itemType) || this.isGem;
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isRuneword")) {
  Object.defineProperty(Unit.prototype, "isRuneword", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return !!this.getFlag(sdk.items.flags.Runeword);
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isBroken")) {
  Object.defineProperty(Unit.prototype, "isBroken", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      if (this.getStat(sdk.stats.Indestructible)) return false;
      return !!this.getFlag(sdk.items.flags.Broken);
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isStunned")) {
  Object.defineProperty(Unit.prototype, "isStunned", {
    get: function () {
      return this.getState(sdk.states.Stunned);
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isUnderCoS")) {
  Object.defineProperty(Unit.prototype, "isUnderCoS", {
    get: function () {
      return this.getState(sdk.states.Cloaked);
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isUnderLowerRes")) {
  Object.defineProperty(Unit.prototype, "isUnderLowerRes", {
    get: function () {
      return this.getState(sdk.states.LowerResist);
    },
  });
}

if (!Unit.prototype.hasOwnProperty("isBaseType")) {
  Object.defineProperty(Unit.prototype, "isBaseType", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return [sdk.items.quality.Normal, sdk.items.quality.Superior].includes(this.quality)
        && !this.questItem && !this.isRuneword
        && getBaseStat("items", this.classid, "gemsockets") > 0
        && [sdk.items.type.Ring, sdk.items.type.Amulet].indexOf(this.itemType) === -1;
    }
  });
}

if (!Unit.prototype.hasOwnProperty("rawStrength")) {
  Object.defineProperty(Unit.prototype, "rawStrength", {
    get: function () {
      const lvl = this.getStat(sdk.stats.Level);
      const rawBonus = function (i) {
        return i.getStat(sdk.stats.Strength);
      };
      const perLvlBonus = function (i) {
        return lvl * i.getStat(sdk.stats.PerLevelStrength) / 8;
      };
      const bonus = ~~(this.getItemsEx()
        .filter((i) => i.isEquipped || i.isEquippedCharm)
        .map((i) => rawBonus(i) + perLvlBonus(i))
        .reduce((acc, v) => acc + v, 0));
      return this.getStat(sdk.stats.Strength) - bonus;
    },
  });
}

if (!Unit.prototype.hasOwnProperty("rawDexterity")) {
  Object.defineProperty(Unit.prototype, "rawDexterity", {
    get: function () {
      const lvl = this.getStat(sdk.stats.Level);
      const rawBonus = function (i) {
        return i.getStat(sdk.stats.Dexterity);
      };
      const perLvlBonus = function (i) {
        return lvl * i.getStat(sdk.stats.PerLevelDexterity) / 8;
      };
      const bonus = ~~(this.getItemsEx()
        .filter((i) => i.isEquipped || i.isEquippedCharm)
        .map((i) => rawBonus(i) + perLvlBonus(i))
        .reduce((acc, v) => acc + v, 0));
      return this.getStat(sdk.stats.Dexterity) - bonus;
    },
  });
}

if (!Unit.prototype.hasOwnProperty("upgradedStrReq")) {
  Object.defineProperty(Unit.prototype, "upgradedStrReq", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let code, id, baseReq, finalReq, ethereal = this.getFlag(sdk.items.flags.Ethereal);
      let reqModifier = this.getStat(sdk.stats.ReqPercent);

      switch (this.itemclass) {
      case sdk.items.class.Normal:
        code = getBaseStat("items", this.classid, "ubercode").trim();

        break;
      case sdk.items.class.Exceptional:
        code = getBaseStat("items", this.classid, "ultracode").trim();

        break;
      case sdk.items.class.Elite:
        return this.strreq;
      }

      id = NTIPAliasClassID[code];
      baseReq = getBaseStat("items", id, "reqstr");
      finalReq = baseReq + Math.floor(baseReq * reqModifier / 100);
      ethereal && (finalReq -= 10);
      return Math.max(finalReq, 0);
    }
  });
}

if (!Unit.prototype.hasOwnProperty("upgradedDexReq")) {
  Object.defineProperty(Unit.prototype, "upgradedDexReq", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let code, id, baseReq, finalReq, ethereal = this.getFlag(sdk.items.flags.Ethereal);
      let reqModifier = this.getStat(sdk.stats.ReqPercent);

      switch (this.itemclass) {
      case sdk.items.class.Normal:
        code = getBaseStat("items", this.classid, "ubercode").trim();

        break;
      case sdk.items.class.Exceptional:
        code = getBaseStat("items", this.classid, "ultracode").trim();

        break;
      case sdk.items.class.Elite:
        return this.dexreq;
      }

      id = NTIPAliasClassID[code];
      baseReq = getBaseStat("items", id, "reqdex");
      finalReq = baseReq + Math.floor(baseReq * reqModifier / 100);
      ethereal && (finalReq -= 10);
      return Math.max(finalReq, 0);
    }
  });
}

if (!Unit.prototype.hasOwnProperty("upgradedLvlReq")) {
  Object.defineProperty(Unit.prototype, "upgradedLvlReq", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let code, id;

      switch (this.itemclass) {
      case sdk.items.class.Normal:
        code = getBaseStat("items", this.classid, "ubercode").trim();

        break;
      case sdk.items.class.Exceptional:
        code = getBaseStat("items", this.classid, "ultracode").trim();

        break;
      case sdk.items.class.Elite:
        return this.lvlreq;
      }

      id = NTIPAliasClassID[code];
      return Math.max(getBaseStat("items", id, "levelreq"), 0);
    }
  });
}

if (!Unit.prototype.hasOwnProperty("allRes")) {
  Object.defineProperty(Unit.prototype, "allRes", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return 0;
      let fr = this.getStat(sdk.stats.FireResist);
      let cr = this.getStat(sdk.stats.ColdResist);
      let lr = this.getStat(sdk.stats.LightningResist);
      let pr = this.getStat(sdk.stats.PoisonResist);
      return (fr && cr && lr && pr) ? fr : 0;
    }
  });
}

if (!Unit.prototype.hasOwnProperty("prettyPrint")) {
  Object.defineProperty(Unit.prototype, "prettyPrint", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return this.name;
      return this.fname.split("\n").reverse().join(" ");
    }
  });
}

if (!Unit.prototype.hasOwnProperty("quantityPercent")) {
  Object.defineProperty(Unit.prototype, "quantityPercent", {
    get: function () {
      if (this.type !== sdk.unittype.Item) return 0;
      let quantity = this.getStat(sdk.stats.Quantity);
      if (!quantity) return 0;
      let extraStack = this.getStat(sdk.stats.ExtraStack) || 0;
      return ((quantity * 100) / (getBaseStat("items", this.classid, "maxstack") + extraStack));
    }
  });
}

/**
 * @param {number} difficulty 
 */
Unit.prototype.getResPenalty = function (difficulty) {
  difficulty > 2 && (difficulty = sdk.difficulty.Hell);
  return me.gametype === sdk.game.gametype.Classic
    ? [0, 20, 50][difficulty]
    : [0, 40, 100][difficulty];
};

Unit.prototype.getItemType = function () {
  switch (this.itemType) {
  case sdk.items.type.Shield:
  case sdk.items.type.AuricShields:
  case sdk.items.type.VoodooHeads:
    return "Shield";
  case sdk.items.type.Armor:
    return "Armor";
  case sdk.items.type.Helm:
  case sdk.items.type.PrimalHelm:
  case sdk.items.type.Circlet:
  case sdk.items.type.Pelt:
    return "Helmet";
  case sdk.items.type.Scepter:
  case sdk.items.type.Wand:
  case sdk.items.type.Staff:
  case sdk.items.type.Bow:
  case sdk.items.type.Axe:
  case sdk.items.type.Club:
  case sdk.items.type.Sword:
  case sdk.items.type.Hammer:
  case sdk.items.type.Knife:
  case sdk.items.type.Spear:
  case sdk.items.type.Polearm:
  case sdk.items.type.Crossbow:
  case sdk.items.type.Mace:
  case sdk.items.type.ThrowingKnife:
  case sdk.items.type.ThrowingAxe:
  case sdk.items.type.Javelin:
  case sdk.items.type.Orb:
  case sdk.items.type.AmazonBow:
  case sdk.items.type.AmazonSpear:
  case sdk.items.type.AmazonJavelin:
  case sdk.items.type.MissilePotion:
  case sdk.items.type.HandtoHand:
  case sdk.items.type.AssassinClaw:
    return "Weapon";
  // currently only use this function for socket related things so might as well make non-socketable things return false
  // case sdk.items.type.BowQuiver:
  // case sdk.items.type.CrossbowQuiver:
  // 	//return "Quiver";
  // case sdk.items.type.Ring:
  // 	//return "Ring";
  // case sdk.items.type.Amulet:
  // 	//return "Amulet";
  // case sdk.items.type.Boots:
  // 	//return "Boots";
  // case sdk.items.type.Gloves:
  // 	//return "Gloves";
  // case sdk.items.type.Belt:
  // 	//return "Belt";
  // default:
  // 	return "";
  }

  return "";
};

Unit.prototype.castChargedSkillEx = function (...args) {
  let skillId, x, y, unit;

  switch (args.length) {
  case 0: // item.castChargedSkill()
    break;
  case 1:
    if (args[0] instanceof Unit) { // hellfire.castChargedSkill(monster);
      unit = args[0];
    } else {
      skillId = args[0];
    }

    break;
  case 2:
    if (typeof args[0] === "number") {
      if (args[1] instanceof Unit) { // me.castChargedSkill(skillId,unit)
        [skillId, unit] = [...args];
      } else if (typeof args[1] === "number") { // item.castChargedSkill(x,y)
        [x, y] = [...args];
      }
    } else {
      throw new Error(" invalid arguments, expected (skillId, unit) or (x, y)");
    }

    break;
  case 3:
    // If all arguments are numbers
    if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number") {
      [skillId, x, y] = [...args];
    }

    break;
  default:
    throw new Error("invalid arguments, expected 'me' object or 'item' unit");
  }

  // Charged skills can only be casted on x, y coordinates
  unit && ([x, y] = [unit.x, unit.y]);

  if (this !== me && this.type !== sdk.unittype.Item) {
    if (Developer.debugging.skills) {
      console.debug(
        "ÿc9CastChargedSkillÿc0 :: Wierd Error, invalid arguments, expected 'me' object or 'item' unit" + " unit type : " + this.type
      );
    }
    return false;
  }

  // Called the function the unit, me.
  if (this === me) {
    if (!skillId) throw Error("Must supply skillId on me.castChargedSkill");

    let chargedItems = [];

    CharData.skillData.chargedSkills
      .forEach(function (chargeSkill) {
        if (chargeSkill.skill !== skillId) return;
        console.debug(chargeSkill);
        let item = me.getItem(-1, sdk.items.mode.Equipped, chargeSkill.gid);
        !!item && chargedItems.push({
          charge: chargeSkill.skill,
          level: chargeSkill.level,
          item: item
        });
      });

    if (chargedItems.length === 0) {
      console.log("ÿc9CastChargedSkillÿc0 :: Don't have the charged skill (" + skillId + "), or not enough charges");
      return false;
    }

    /** @type {ItemUnit} */
    let chargedItem = chargedItems
      .sort(function (a, b) {
        return b.charge.level - a.charge.level;
      })
      .first().item;

    // Check if item with charges is equipped on the switch spot
    me.weaponswitch === 0 && chargedItem.isOnSwap && me.switchWeapons(1);

    return chargedItem.castChargedSkillEx.apply(chargedItem, args);
  } else if (this.type === sdk.unittype.Item) {
    let charge = this.getStat(-2)[sdk.stats.ChargedSkill]; // WARNING. Somehow this gives duplicates

    if (!charge) {
      console.warn("ÿc9CastChargedSkillÿc0 :: No charged skill on this item");
      return false;
    }

    if (skillId) {
      if (charge instanceof Array) {
        // Filter out all other charged skills
        charge = charge
          .filter(function (item) {
            return (item && item.skill === skillId) && !!item.charges;
          })
          .first();
      } else {
        if (charge.skill !== skillId || !charge.charges) {
          console.warn("No charges matching skillId");
          charge = false;
        }
      }
    } else if (charge.length > 1) {
      throw new Error("multiple charges on this item without a given skillId");
    }

    if (charge) {
      const usePacket = ([
        sdk.skills.Teleport, sdk.skills.Valkyrie, sdk.skills.Decoy,
        sdk.skills.RaiseSkeleton, sdk.skills.ClayGolem,
        sdk.skills.RaiseSkeletalMage, sdk.skills.BloodGolem,
        sdk.skills.IronGolem, sdk.skills.Revive,
        sdk.skills.Werewolf, sdk.skills.Werebear,
        sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.PoisonCreeper,
        sdk.skills.SummonDireWolf, sdk.skills.Grizzly,
        sdk.skills.HeartofWolverine, sdk.skills.SpiritofBarbs,
        sdk.skills.ShadowMaster, sdk.skills.ShadowWarrior
      ].indexOf(skillId) === -1);

      if (!usePacket) {
        return Skill.cast(skillId, sdk.skills.hand.Right, x || me.x, y || me.y, this); // Non packet casting
      }

      // Packet casting
      // Setting skill on hand
      new PacketBuilder()
        .byte(sdk.packets.send.SelectSkill)
        .word(charge.skill)
        .byte(0x00)
        .byte(0x00)
        .dword(this.gid)
        .send();
      // console.log("Set charge skill " + charge.skill + " on hand");
      // No need for a delay, since its TCP, the server recv's the next statement always after the send cast skill packet

      // Cast the skill
      new PacketBuilder()
        .byte(sdk.packets.send.RightSkillOnLocation)
        .word(x || me.x)
        .word(y || me.y)
        .send();
      console.log("Cast charge skill " + charge.skill);
      // The result of "successfully" casted is different, so we cant wait for it here. We have to assume it worked

      return true;
    }
  }

  return false;
};

Unit.prototype.castSwitchChargedSkill = function (...args) {
  let skillId, x, y, unit;

  switch (args.length) {
  case 0: // item.castChargedSkill()
  case 1: // hellfire.castChargedSkill(monster);
    break;
  case 2:
    if (typeof args[0] === "number") {
      if (args[1] instanceof Unit) {
        // me.castChargedSkill(skillId, unit)
        [skillId, unit] = [...args];
      } else if (typeof args[1] === "number") {
        // item.castChargedSkill(x, y)
        [x, y] = [...args];
      }
    } else {
      throw new Error(" invalid arguments, expected (skillId, unit) or (x, y)");
    }

    break;
  case 3: // If all arguments are numbers
    if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number") {
      [skillId, x, y] = [...args];
    }

    break;
  default:
    throw new Error("invalid arguments, expected 'me' object");
  }

  if (this !== me) throw Error("invalid arguments, expected 'me' object");

  // Charged skills can only be casted on x, y coordinates
  unit && ([x, y] = [unit.x, unit.y]);

  if (x === undefined || y === undefined) return false;

  // Called the function the unit, me.
  if (this === me) {
    if (!skillId) throw Error("Must supply skillId on me.castChargedSkill");

    /** @type {{ charge: number, level: number, item: ItemUnit }[]} */
    let chargedItems = [];

    CharData.skillData.chargedSkillsOnSwitch.forEach(function (chargeSkill) {
      if (chargeSkill.skill === skillId) {
        console.debug(chargeSkill);
        let item = me.getItem(-1, sdk.items.mode.Equipped, chargeSkill.gid);
        !!item && chargedItems.push({
          charge: chargeSkill.skill,
          level: chargeSkill.level,
          item: item
        });
      }
    });

    if (chargedItems.length === 0) {
      console.log("ÿc9SwitchCastChargedSkillÿc0 :: Don't have the charged skill (" + skillId + "), or not enough charges");
      return false;
    }

    me.weaponswitch === 0 && me.switchWeapons(1);

    let chargedItem = chargedItems
      .sort(function (a, b) {
        return b.charge.level - a.charge.level;
      })
      .first().item;
    return chargedItem.castChargedSkillEx.apply(chargedItem, args);
  }

  return false;
};

Unit.prototype.getStatEx = function (id, subid) {
  let i, temp, rval, regex;

  switch (id) {
  case sdk.stats.AllRes: //calculates all res, doesnt exists trough
  { // Block scope due to the variable declaration
    // Get all res
    let allres = [
      this.getStatEx(sdk.stats.FireResist),
      this.getStatEx(sdk.stats.ColdResist),
      this.getStatEx(sdk.stats.LightningResist),
      this.getStatEx(sdk.stats.PoisonResist)
    ];

    // What is the minimum of the 4?
    let min = Math.min.apply(null, allres);

    // Cap all res to the minimum amount of res
    allres = allres.map(res => res > min ? min : res);

    // Get it in local variables, its more easy to read
    let [fire, cold, light, psn] = allres;

    return fire === cold && cold === light && light === psn ? min : 0;
  }
  case sdk.stats.MaxMana:
    rval = this.getStat(sdk.stats.MaxMana);

    if (rval > 446) {
      return rval - 16777216; // Fix for negative values (Gull knife)
    }

    return rval;
  case sdk.stats.ToBlock:
    switch (this.classid) {
    case sdk.items.Buckler:
      return this.getStat(sdk.stats.ToBlock);
    case sdk.items.PreservedHead:
    case sdk.items.MummifiedTrophy:
    case sdk.items.MinionSkull:
      return this.getStat(sdk.stats.ToBlock) - 3;
    case sdk.items.SmallShield:
    case sdk.items.ZombieHead:
    case sdk.items.FetishTrophy:
    case sdk.items.HellspawnSkull:
      return this.getStat(sdk.stats.ToBlock) - 5;
    case sdk.items.KiteShield:
    case sdk.items.UnravellerHead:
    case sdk.items.SextonTrophy:
    case sdk.items.OverseerSkull:
      return this.getStat(sdk.stats.ToBlock) - 8;
    case sdk.items.SpikedShield:
    case sdk.items.Defender:
    case sdk.items.GargoyleHead:
    case sdk.items.CantorTrophy:
    case sdk.items.SuccubusSkull:
    case sdk.items.Targe:
    case sdk.items.AkaranTarge:
      return this.getStat(sdk.stats.ToBlock) - 10;
    case sdk.items.LargeShield:
    case sdk.items.RoundShield:
    case sdk.items.DemonHead:
    case sdk.items.HierophantTrophy:
    case sdk.items.BloodlordSkull:
      return this.getStat(sdk.stats.ToBlock) - 12;
    case sdk.items.Scutum:
      return this.getStat(sdk.stats.ToBlock) - 14;
    case sdk.items.Rondache:
    case sdk.items.AkaranRondache:
      return this.getStat(sdk.stats.ToBlock) - 15;
    case sdk.items.GothicShield:
    case sdk.items.AncientShield:
      return this.getStat(sdk.stats.ToBlock) - 16;
    case sdk.items.BarbedShield:
      return this.getStat(sdk.stats.ToBlock) - 17;
    case sdk.items.DragonShield:
      return this.getStat(sdk.stats.ToBlock) - 18;
    case sdk.items.VortexShield:
      return this.getStat(sdk.stats.ToBlock) - 19;
    case sdk.items.BoneShield:
    case sdk.items.GrimShield:
    case sdk.items.Luna:
    case sdk.items.BladeBarrier:
    case sdk.items.TrollNest:
    case sdk.items.HeraldicShield:
    case sdk.items.ProtectorShield:
      return this.getStat(sdk.stats.ToBlock) - 20;
    case sdk.items.Heater:
    case sdk.items.Monarch:
    case sdk.items.AerinShield:
    case sdk.items.GildedShield:
    case sdk.items.ZakarumShield:
      return this.getStat(sdk.stats.ToBlock) - 22;
    case sdk.items.TowerShield:
    case sdk.items.Pavise:
    case sdk.items.Hyperion:
    case sdk.items.Aegis:
    case sdk.items.Ward:
      return this.getStat(sdk.stats.ToBlock) - 24;
    case sdk.items.CrownShield:
    case sdk.items.RoyalShield:
    case sdk.items.KurastShield:
      return this.getStat(sdk.stats.ToBlock) - 25;
    case sdk.items.SacredRondache:
      return this.getStat(sdk.stats.ToBlock) - 28;
    case sdk.items.SacredTarge:
      return this.getStat(sdk.stats.ToBlock) - 30;
    }

    break;
  case sdk.stats.MinDamage:
  case sdk.stats.MaxDamage:
    if (subid === 1) {
      temp = this.getStat(-1);
      rval = 0;

      for (i = 0; i < temp.length; i += 1) {
        switch (temp[i][0]) {
        case id: // plus one handed dmg
        case id + 2: // plus two handed dmg
          // There are 2 occurrences of min/max if the item has +damage. Total damage is the sum of both.
          // First occurrence is +damage, second is base item damage.

          if (rval) { // First occurence stored, return if the second one exists
            return rval;
          }

          if (this.getStat(temp[i][0]) > 0 && this.getStat(temp[i][0]) > temp[i][2]) {
            rval = temp[i][2]; // Store the potential +dmg value
          }

          break;
        }
      }

      return 0;
    }

    break;
  case sdk.stats.Defense:
    if (subid === 0) {
      if ([0, 1].indexOf(this.mode) < 0) {
        break;
      }

      switch (this.itemType) {
      case sdk.items.type.Jewel:
      case sdk.items.type.SmallCharm:
      case sdk.items.type.LargeCharm:
      case sdk.items.type.GrandCharm:
        // defense is the same as plusdefense for these items
        return this.getStat(sdk.stats.Defense);
      }

      !this.desc && (this.desc = this.description);

      if (this.desc) {
        temp = this.desc.split("\n");
        regex = new RegExp("\\+\\d+ " + getLocaleString(sdk.locale.text.Defense).replace(/^\s+|\s+$/g, ""));

        for (let i = 0; i < temp.length; i += 1) {
          if (temp[i].match(regex, "i")) {
            return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
          }
        }
      }

      return 0;
    }

    break;
  case sdk.stats.PoisonMinDamage:
    if (subid === 1) {
      return Math.round(this.getStat(sdk.stats.PoisonMinDamage) * this.getStat(sdk.stats.PoisonLength) / 256);
    }

    break;
  case sdk.stats.AddClassSkills:
    if (subid === undefined) {
      for (let i = 0; i < 7; i += 1) {
        let cSkill = this.getStat(sdk.stats.AddClassSkills, i);
        if (cSkill) return cSkill;
      }

      return 0;
    }

    break;
  case sdk.stats.AddSkillTab:
    if (subid === undefined) {
      temp = Object.values(sdk.skills.tabs);

      for (let i = 0; i < temp.length; i += 1) {
        let sTab = this.getStat(sdk.stats.AddSkillTab, temp[i]);
        if (sTab) return sTab;
      }

      return 0;
    }

    break;
  case sdk.stats.SkillOnAttack:
  case sdk.stats.SkillOnKill:
  case sdk.stats.SkillOnDeath:
  case sdk.stats.SkillOnStrike:
  case sdk.stats.SkillOnLevelUp:
  case sdk.stats.SkillWhenStruck:
  case sdk.stats.ChargedSkill:
    if (subid === 1) {
      temp = this.getStat(-2);

      if (temp.hasOwnProperty(id)) {
        if (temp[id] instanceof Array) {
          for (i = 0; i < temp[id].length; i += 1) {
            // fix reference to undefined property temp[id][i].skill.
            if (temp[id][i] !== undefined && temp[id][i].skill !== undefined) {
              return temp[id][i].skill;
            }
          }
        } else {
          return temp[id].skill;
        }
      }

      return 0;
    }

    if (subid === 2) {
      temp = this.getStat(-2);

      if (temp.hasOwnProperty(id)) {
        if (temp[id] instanceof Array) {
          for (i = 0; i < temp[id].length; i += 1) {
            if (temp[id][i] !== undefined) {
              return temp[id][i].level;
            }
          }
        } else {
          return temp[id].level;
        }
      }

      return 0;
    }

    break;
  case sdk.stats.PerLevelHp: // (for example Fortitude with hp per lvl can be defined now with 1.5)
    return this.getStat(sdk.stats.PerLevelHp) / 2048;
  }

  if (this.getFlag(sdk.items.flags.Runeword)) {
    switch (id) {
    case sdk.stats.ArmorPercent:
      if ([0, 1].indexOf(this.mode) < 0) {
        break;
      }

      this.desc === undefined && (this.desc = this.description);

      if (this.desc) {
        temp = !!this.desc ? this.desc.split("\n") : "";

        for (let i = 0; i < temp.length; i += 1) {
          if (temp[i].match(getLocaleString(sdk.locale.text.EnhancedDefense).replace(/^\s+|\s+$/g, ""), "i")) {
            return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
          }
        }
      }

      return 0;
    case sdk.stats.EnhancedDamage:
      if ([0, 1].indexOf(this.mode) < 0) {
        break;
      }

      this.desc === undefined && (this.desc = this.description);

      if (this.desc) {
        temp = !!this.desc ? this.desc.split("\n") : "";

        for (let i = 0; i < temp.length; i += 1) {
          if (temp[i].match(getLocaleString(sdk.locale.text.EnhancedDamage).replace(/^\s+|\s+$/g, ""), "i")) {
            return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
          }
        }
      }

      return 0;
    }
  }

  if (subid === undefined) {
    return this.getStat(id);
  }

  return this.getStat(id, subid);
};

/**
 * @description Returns boolean if we have all the runes given by itemInfo array
 * @param {number[]} itemInfo - Array of rune classids
 * @returns Boolean
 */
Unit.prototype.haveRunes = function (itemInfo = []) {
  if (this === undefined || this.type > 1) return false;
  if (!Array.isArray(itemInfo) || typeof itemInfo[0] !== "number") return false;
  let itemList = this.getItemsEx().filter(i => i.isInStorage && i.itemType === sdk.items.type.Rune);
  if (!itemList.length || itemList.length < itemInfo.length) return false;
  let checkedGids = [];

  for (let i = 0; i < itemInfo.length; i++) {
    let rCheck = itemInfo[i];
    
    if (!itemList.some(i => {
      if (i.classid === rCheck && checkedGids.indexOf(i.gid) === -1) {
        checkedGids.push(i.gid);
        return true;
      }
      return false;
    })) {
      return false;
    }
  }

  return true;
};

Unit.prototype.getMobs = function ({ range, coll, type }) {
  if (this === undefined) return [];
  const _this = this;
  return getUnits(sdk.unittype.Monster)
    .filter(function (mon) {
      return mon.attackable && getDistance(_this, mon) < range
        && (!type || ((type & mon.spectype)))
        && (!coll || !checkCollision(_this, mon, coll));
    });
};
