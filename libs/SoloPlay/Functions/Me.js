/**
*  @filename    Me.js
*  @author      theBGuy
*  @desc        collection of me functions and prototypes
*
*/

includeIfNotIncluded("core/Prototypes.js");

/**
 * @description me prototypes for soloplay with checks to ensure forwards compatibility
 */
if (!me.hasOwnProperty("maxNearMonsters")) {
  Object.defineProperty(me, "maxNearMonsters", {
    get: function () {
      return Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
    }
  });
}

if (!me.hasOwnProperty("dualWielding")) {
  Object.defineProperty(me, "dualWielding", {
    get: function () {
      // only classes that can duel wield
      if (!me.assassin && !me.barbarian) return false;
      let items = me.getItemsEx().filter((item) => item.isEquipped && item.isOnMain);
      return !!items.length && items.length >= 2 && items.every((item) => !item.isShield && !getBaseStat("items", item.classid, "block"));
    }
  });
}

if (!me.hasOwnProperty("realFR")) {
  Object.defineProperty(me, "realFR", {
    get: function () {
      return me.getStat(sdk.stats.FireResist);
    }
  });
}

if (!me.hasOwnProperty("realCR")) {
  Object.defineProperty(me, "realCR", {
    get: function () {
      return me.getStat(sdk.stats.ColdResist);
    }
  });
}

if (!me.hasOwnProperty("realLR")) {
  Object.defineProperty(me, "realLR", {
    get: function () {
      return me.getStat(sdk.stats.LightResist);
    }
  });
}

if (!me.hasOwnProperty("realPR")) {
  Object.defineProperty(me, "realPR", {
    get: function () {
      return me.getStat(sdk.stats.PoisonResist);
    }
  });
}

if (!me.hasOwnProperty("FR")) {
  Object.defineProperty(me, "FR", {
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxFireResist), me.realFR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("CR")) {
  Object.defineProperty(me, "CR", {
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxColdResist), me.realCR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("LR")) {
  Object.defineProperty(me, "LR", {
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxLightResist), me.realLR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("PR")) {
  Object.defineProperty(me, "PR", {
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxPoisonResist), me.realPR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("className")) {
  Object.defineProperty(me, "className", {
    get: function () {
      return sdk.player.class.nameOf(me.classid);
    }
  });
}

/**
 * Soloplay specific but might as well keep with the format
 */
if (!me.hasOwnProperty("onFinalBuild")) {
  Object.defineProperty(me, "onFinalBuild", {
    get: function () {
      return me.data.currentBuild === me.data.finalBuild;
    }
  });
}

if (!me.hasOwnProperty("mercid")) {
  Object.defineProperty(me, "mercid", {
    get: function () {
      return me.data.merc.classid || (function () {
        let merc = me.getMercEx();
        if (!merc) return 0;
        me.data.merc.classid = merc.classid;
        return merc.classid;
      })();
    }
  });
}

if (!me.hasOwnProperty("trueStr")) {
  Object.defineProperty(me, "trueStr", {
    get: function () {
      return me.data.strength || (function () {
        let str = me.rawStrength;
        me.data.strength = str;
        return str;
      })();
    }
  });
}

if (!me.hasOwnProperty("trueDex")) {
  Object.defineProperty(me, "trueDex", {
    get: function () {
      return me.data.dexterity || (function () {
        let dex = me.rawDexterity;
        me.data.dexterity = dex;
        return dex;
      })();
    }
  });
}

if (!me.hasOwnProperty("finalBuild")) {
  let _finalBuild = null;

  Object.defineProperty(me, "finalBuild", {
    get: function () {
      if (_finalBuild) return _finalBuild;
      let className = me.className.toLowerCase();
      let build = (["Bumper", "Socketmule", "Imbuemule"].includes(SetUp.finalBuild)
        ? ["Javazon", "Cold", "Bone", "Hammerdin", "Whirlwind", "Wind", "Trapsin"][me.classid]
        : SetUp.finalBuild) + "Build";
      _finalBuild = require("../BuildFiles/" + className + "/" + className + "." + build);
      return _finalBuild;
    },
    set: function (v) {
      if (v.hasOwnProperty("AutoBuildTemplate")) {
        // Object.assign(this.finalBuild, v);
        _finalBuild = v;
      }
    },
  });
}

if (!me.hasOwnProperty("currentBuild")) {
  let _currentBuild = null;

  Object.defineProperty(me, "currentBuild", {
    get: function () {
      if (_currentBuild) return _currentBuild;
      let className = me.className.toLowerCase();
      let build = SetUp.currentBuild + "Build";
      _currentBuild = require("../BuildFiles/" + className + "/" + className + "." + build);
      return _currentBuild;
    },
    set: function (v) {
      if (v.hasOwnProperty("AutoBuildTemplate")) {
        // Object.assign(this.currentBuild, v);
        _currentBuild = v;
      }
    },
  });
}

if (!me.hasOwnProperty("data")) {
  let _data = null;

  Object.defineProperty(me, "data", {
    get: function () {
      if (_data) return _data;
      _data = CharData.getStats();
      // handle if it was an old data file
      if (!_data.hasOwnProperty("startTime")) {
        let oldData = copyObj(_data);
        _data = CharData.create();
        Object.assign(_data, oldData.me);
        Object.assign(_data.merc, oldData.merc);
        if (oldData.merc.hasOwnProperty("type")) {
          _data.merc.skillName = oldData.merc.type;
          _data.merc.skill = MercData.findByName(_data.merc.skillName, _data.merc.act).skill;
        }
      }
      return _data;
    },
    set: function (v) {
      if (v.hasOwnProperty("startTime")) {
        _data = v;
      }
    },
  });

  Object.defineProperty(me, "update", {
    value: function () {
      let obj = JSON.stringify(copyObj(me.data));
      let myThread = getScript(true).name;
      CharData.threads.forEach(function (script) {
        let curr = getScript(script);
        if (curr && myThread !== curr.name) {
          curr.send("data--" + obj);
        }
      });
    },
  });
}

if (!me.hasOwnProperty("equipped")) {
  me.equipped = (function () {
    const defaultsMap = new Map([
      ["gid", -1],
      ["classid", -1],
      ["name", ""],
      ["code", ""],
      ["fname", ""],
      ["quality", -1],
      ["ethereal", false],
      ["itemType", -1],
      ["strreq", -1],
      ["dexreq", -1],
      ["lvlreq", -1],
      ["sockets", -1],
      ["prefixnum", -1],
      ["suffixnum", -1],
    ]);

    /**
     * @constructor
     * @param {ItemUnit} item 
     */
    function EquippedItem (item) {
      /** @type {ItemUnit} */
      this._item = (item instanceof Unit)
        ? copyUnit(item)
        : null;
      this._gid = item ? item.gid : -1;
      this._bodylocation = item ? item.bodylocation : -1;

      return new Proxy(this, {
        get: function (target, prop) {
          if (prop in target) {
            return target[prop];
          }

          if (target._item && prop in target._item) {
            return target._item[prop];
          }

          return defaultsMap.get(prop);
        }
      });
    }

    Object.defineProperties(EquippedItem.prototype, {
      location: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? this._item.bodylocation : -1;
        },
      },
      durability: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? this._item.durabilityPercent : -1;
        },
      },
      tier: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? NTIP.GetTier(this._item) : -1;
        },
      },
      tierScore: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? tierscore(this._item, 1, this._bodylocation) : -1;
        },
      },
      secondaryTier: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? NTIP.GetSecondaryTier(this._item) : -1;
        },
      },
      socketed: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? this._item.getItemsEx().length > 0 : false;
        },
      },
    });

    EquippedItem.prototype.twoHandedCheck = function (strict = false) {
      return this._item
        ? strict
          ? this._item.strictlyTwoHanded
          : this._item.twoHanded
        : false;
    };

    EquippedItem.prototype.getStat = function (stat, subid) {
      return this._item ? this._item.getStat(stat, subid) : -1;
    };

    EquippedItem.prototype.getStatEx = function (stat, subid) {
      return this._item ? this._item.getStatEx(stat, subid) : -1;
    };

    /** @type {Map<number, EquippedItem>} */
    const bodyMap = new Map([
      [sdk.body.Head, new EquippedItem()],
      [sdk.body.Neck, new EquippedItem()],
      [sdk.body.Armor, new EquippedItem()],
      [sdk.body.RightArm, new EquippedItem()],
      [sdk.body.LeftArm, new EquippedItem()],
      [sdk.body.Gloves, new EquippedItem()],
      [sdk.body.RingRight, new EquippedItem()],
      [sdk.body.RingLeft, new EquippedItem()],
      [sdk.body.Belt, new EquippedItem()],
      [sdk.body.Feet, new EquippedItem()],
      [sdk.body.RightArmSecondary, new EquippedItem()],
      [sdk.body.LeftArmSecondary, new EquippedItem()],
    ]);

    // const _dummy = new EquippedItem();

    return {
      /**
       * @param {number} bodylocation 
       * @returns {EquippedItem}
       */
      get: function (bodylocation) {
        // if (!bodyMap.has(bodylocation)) return _dummy;
        let item = bodyMap.get(bodylocation);
        if (item._gid === -1
          || (item._gid !== item.gid
          || (item._bodylocation !== item.location && me.weaponswitch !== sdk.player.slot.Secondary))) {
          // item has changed - find the new item
          let newItem = me.getItemsEx()
            .filter((el) => el.isEquipped && el.bodylocation === bodylocation)
            .first();
          bodyMap.set(bodylocation, new EquippedItem(newItem));
        }
        return bodyMap.get(bodylocation);
      },
      /**
       * @param {number} bodylocation 
       * @returns {boolean}
       */
      has: function (bodylocation) {
        return bodyMap.has(bodylocation);
      },
      /**
       * @param {number} bodylocation 
       * @param {ItemUnit} item
       */
      set: function (bodylocation, item) {
        if (bodyMap.has(bodylocation) && item instanceof Unit) {
          bodyMap.set(bodylocation, new EquippedItem(item));
        }
      },
      /**
       * @description Initializes the equipped item map with the items currently equipped
       */
      init: function () {
        me.getItemsEx()
          .filter(item => item.isEquipped)
          .forEach(item => bodyMap.set(item.bodylocation, new EquippedItem(item)));
      },
    };
  })();
}

/** @returns {boolean} */
me.canTpToTown = function () {
  // can't tp if dead - or not currently enabled to
  if (me.dead || SoloEvents.townChicken.disabled) return false;
  const myArea = me.area;
  let badAreas = [
    sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.KurastDocktown,
    sdk.areas.PandemoniumFortress, sdk.areas.Harrogath, sdk.areas.ArreatSummit, sdk.areas.UberTristram
  ];
  // can't tp from town or Uber Trist, and shouldn't tp from arreat summit
  if (badAreas.includes(myArea)) return false;
  // If we made it this far, we can only tp if we even have a tp
  return !!me.getTpTool();
};

me.getMercEx = function () {
  if (!Config.UseMerc || me.classic || me.mercrevivecost) return null;
  let merc = Misc.poll(() => me.getMerc(), 250, 50);

  return !!merc && !merc.dead ? merc : null;
};

me.getEquippedItem = function (bodyLoc) {
  if (!bodyLoc) return null;
  let equippedItem = me.getItemsEx().filter(i => i.isEquipped && i.bodylocation === bodyLoc);
  if (!equippedItem.length) return null;
  return equippedItem.first();
};

/**
 * @param {number} bodyLoc 
 */
me.getWeaponQuantityPercent = function (bodyLoc) {
  if (!bodyLoc) return 0;
  let weapon = me.getEquippedItem(bodyLoc);
  if (!weapon) return 0;
  return weapon.quantityPercent;
};

me.getSkillTabs = function (classid = me.classid) {
  return [
    [sdk.skills.tabs.BowandCrossbow, sdk.skills.tabs.PassiveandMagic, sdk.skills.tabs.JavelinandSpear],
    [sdk.skills.tabs.Fire, sdk.skills.tabs.Lightning, sdk.skills.tabs.Cold],
    [sdk.skills.tabs.Curses, sdk.skills.tabs.PoisonandBone, sdk.skills.tabs.NecroSummoning],
    [sdk.skills.tabs.PalaCombat, sdk.skills.tabs.Offensive, sdk.skills.tabs.Defensive],
    [sdk.skills.tabs.BarbCombat, sdk.skills.tabs.Masteries, sdk.skills.tabs.Warcries],
    [sdk.skills.tabs.DruidSummon, sdk.skills.tabs.ShapeShifting, sdk.skills.tabs.Elemental],
    [sdk.skills.tabs.Traps, sdk.skills.tabs.ShadowDisciplines, sdk.skills.tabs.MartialArts]
  ][classid];
};

// @todo better determination of what actually constitutes being in danger
// need check for ranged mobs so we can stick and move to avoid missiles
me.inDanger = function (checkLoc, range) {
  let count = 0;
  const _this = typeof checkLoc !== "undefined" && checkLoc.hasOwnProperty("x")
    ? checkLoc
    : me;
  range === undefined && (range = 10);
  let nearUnits = getUnits(sdk.unittype.Monster)
    .filter(function (mon) {
      return mon && mon.attackable && getDistance(_this, mon) < 10;
    });
  nearUnits.forEach(function (u) {
    return u.isSpecial
      ? [sdk.states.Fanaticism, sdk.states.Conviction].some(state => u.getState(state))
        ? (count += 3)
        : (count += 2)
      : (count += 1);
  });
  if (count > me.maxNearMonsters) return true;
  let dangerClose = nearUnits
    .find(function (mon) {
      return [
        sdk.enchant.ManaBurn, sdk.enchant.LightningEnchanted, sdk.enchant.FireEnchanted
      ].some(chant => mon.getEnchant(chant));
    });
  return dangerClose;
};

/**
 * @param {number} skillId 
 * @param {number} subId 
 * @returns boolean
 * @description small function to force boolean return value when checking if we have a skill
 */
me.checkSkill = (skillId = 0, subId = 0) => !!me.getSkill(skillId, subId);

me.cleanUpInvoPotions = function (beltSize) {
  beltSize === undefined && (beltSize = Storage.BeltSize());
  const beltMax = (beltSize * 4);
  /**
   * belt 4x4 locations
   * 12 13 14 15
   * 8  9  10 11
   * 4  5  6  7
   * 0  1  2  3
   */
  const beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];
  // check if we have empty belt slots
  let needCleanup = Storage.Belt.checkColumns(beltSize).some(slot => slot > 0);

  if (needCleanup) {
    const potsInInventory = me.getItemsEx()
      .filter((p) => p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion].includes(p.itemType))
      .sort((a, b) => a.itemType - b.itemType);

    potsInInventory.length > 0 && console.debug("We have potions in our invo, put them in belt before we perform townchicken check");
    // Start interating over all the pots we have in our inventory
    beltSize > 1 && potsInInventory.forEach(function (p) {
      let moved = false;
      // get free space in each slot of our belt
      let freeSpace = Storage.Belt.checkColumns(beltSize);
      for (let i = 0; i < 4 && !moved; i += 1) {
        // checking that current potion matches what we want in our belt
        if (freeSpace[i] > 0 && p.code && p.code.startsWith(Config.BeltColumn[i])) {
          // Pick up the potion and put it in belt if the column is empty, and we don't have any other columns empty
          // prevents shift-clicking potion into wrong column
          if (freeSpace[i] === beltSize || freeSpace.some((spot) => spot === beltSize)) {
            let x = freeSpace[i] === beltSize ? i : (beltCapRef[i] - (freeSpace[i] * 4));
            Packet.placeInBelt(p, x);
          } else {
            clickItemAndWait(sdk.clicktypes.click.item.ShiftLeft, p.x, p.y, p.location);
          }
          Misc.poll(() => !me.itemoncursor, 300, 30);
          moved = Storage.Belt.checkColumns(beltSize)[i] === freeSpace[i] - 1;
        }
        Cubing.cursorCheck();
      }
    });
  }

  return true;
};

me.cleanUpScrolls = function (tome, scrollId) {
  if (!tome || !scrollId) return 0;

  let cleanedUp = 0;
  let myScrolls = me.getItemsEx()
    .filter(el => el.isInInventory && el.classid === scrollId);
  
  if (myScrolls.length) {
    try {
      // If we are at an npc already, open the window otherwise moving potions around fails
      if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
        console.info(null, "Opening npc menu to clean up scrolls");
        Misc.useMenu(sdk.menu.Trade) || me.cancelUIFlags();
      }

      myScrolls.forEach(el => {
        if (tome && tome.getStat(sdk.stats.Quantity) < 20) {
          let currQuantity = tome.getStat(sdk.stats.Quantity);
          if (el.toCursor()) {
            new PacketBuilder().byte(sdk.packets.send.ScrollToMe).dword(el.gid).dword(tome.gid).send();
            Misc.poll(() => !me.itemoncursor, 100, 25);

            if (tome.getStat(sdk.stats.Quantity) > currQuantity) {
              console.info(null, "Placed scroll in tome");
              cleanedUp++;
            }
          } else {
            console.warn("failed to place scroll in tome");
          }
        }
      });
    } catch (e) {
      console.error(e);
      me.cancelUIFlags();
    }
  }

  return cleanedUp;
};

me.needPotions = function () {
  // we aren't using MinColumn if none of the values are set
  if (!Config.MinColumn.some(el => el > 0)) return false;
  // no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
  if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
  
  // Start
  if (me.charlvl > 2 && me.gold > 1000) {
    let pots = { hp: [], mp: [], };
    const beltSize = Storage.BeltSize();
    
    // only run this bit if we aren't wearing a belt for now
    beltSize === 1 && me.cleanUpInvoPotions(beltSize);
    // now check what's in our belt
    me.getItemsEx(-1, sdk.items.mode.inBelt)
      .filter(p => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType) && p.x < 4)
      .forEach(p => {
        if (p.itemType === sdk.items.type.HealingPotion) {
          pots.hp.push(copyUnit(p));
        } else if (p.itemType === sdk.items.type.ManaPotion) {
          pots.mp.push(copyUnit(p));
        }
      });

    // quick check
    if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
      || (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
      return true;
    }

    // should we check the actual amount in the column?
    // For now just keeping the way it was and checking if a column is empty
    for (let i = 0; i < 4; i += 1) {
      if (Config.MinColumn[i] <= 0) {
        continue;
      }

      switch (Config.BeltColumn[i]) {
      case "hp":
        if (!pots.hp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs hp pots");
          return true;
        }
        break;
      case "mp":
        if (!pots.mp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs mp pots");
          return true;
        }
        break;
      }
    }
  }

  return false;
};

me.clearBelt = function () {
  let item = me.getItem(-1, sdk.items.mode.inBelt);
  let clearList = [];

  if (item) {
    do {
      switch (item.itemType) {
      case sdk.items.type.HealingPotion:
        if (Config.BeltColumn[item.x % 4] !== "hp") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.ManaPotion:
        if (Config.BeltColumn[item.x % 4] !== "mp") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.RejuvPotion:
        if (Config.BeltColumn[item.x % 4] !== "rv") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.StaminaPotion:
      case sdk.items.type.AntidotePotion:
      case sdk.items.type.ThawingPotion:
        clearList.push(copyUnit(item));
      }
    } while (item.getNext());

    while (clearList.length > 0) {
      let pot = clearList.shift();
      (Storage.Inventory.CanFit(pot) && Storage.Inventory.MoveTo(pot)) || pot.interact();
      delay(200);
    }
  }

  return true;
};

me.getIdTool = function () {
  let items = me.getItemsEx()
    .filter((i) => i.isInInventory && [sdk.items.ScrollofIdentify, sdk.items.TomeofIdentify].includes(i.classid));
  let scroll = items.find((i) => i.isInInventory && i.classid === sdk.items.ScrollofIdentify);
  if (scroll) return scroll;
  let tome = items.find((i) => i.isInInventory && i.classid === sdk.items.TomeofIdentify);
  if (tome && tome.getStat(sdk.stats.Quantity) > 0) return tome;

  return null;
};

me.getTpTool = function () {
  let items = me.getItemsEx(-1, sdk.items.mode.inStorage)
    .filter((i) => i.isInInventory && [sdk.items.ScrollofTownPortal, sdk.items.TomeofTownPortal].includes(i.classid));
  if (!items.length) return null;
  let tome = items.find((i) => i.classid === sdk.items.TomeofTownPortal && i.getStat(sdk.stats.Quantity) > 0);
  if (tome) return tome;
  let scroll = items.find((i) => i.classid === sdk.items.ScrollofTownPortal);
  if (scroll) return scroll;
  return null;
};

me.getUnids = function () {
  let list = [];
  let item = me.getItem(-1, sdk.items.mode.inStorage);

  if (!item) return [];

  do {
    if (item.isInInventory && !item.identified) {
      list.push(copyUnit(item));
    }
  } while (item.getNext());

  return list;
};

me.fieldID = function () {
  let list = me.getUnids();
  if (!list) return false;

  while (list.length > 0) {
    let idTool = me.getIdTool();
    if (!idTool) return false;

    let item = list.shift();
    let result = Pickit.checkItem(item);
    // Force ID for unid items matching autoEquip/cubing criteria
    Town.needForceID(item) && (result.result = -1);

    // unid item that should be identified
    if (result.result === Pickit.Result.UNID) {
      Town.identifyItem(item, idTool, Config.FieldID.PacketID);
      delay(50);
      result = Pickit.checkItem(item);
    }
    Town.itemResult(item, result, "Field", false);
  }

  delay(200);
  me.cancel();

  return true;
};

me.getWeaponQuantity = function (weaponLoc = sdk.body.RightArm) {
  let currItem = me.getItemsEx(-1, sdk.items.mode.Equipped).filter(i => i.bodylocation === weaponLoc).first();
  return !!currItem ? currItem.getStat(sdk.stats.Quantity) : 0;
};

me.getItemsForRepair = function (repairPercent, chargedItems) {
  const lowLevelCheck = me.charlvl < 5;
  // lower the required percent as we are a low level
  (lowLevelCheck && repairPercent > 30) && (repairPercent = 15);
  let itemList = [];
  let item = me.getItem(-1, sdk.items.mode.Equipped);

  if (item) {
    do {
      if (lowLevelCheck && !item.isOnMain && !item.isOnSwap) continue;
      // Skip ethereal items
      if (!item.ethereal) {
        // Skip indestructible items
        if (!item.getStat(sdk.stats.Indestructible)) {
          switch (item.itemType) {
          // Quantity check
          case sdk.items.type.ThrowingKnife:
          case sdk.items.type.ThrowingAxe:
          case sdk.items.type.Javelin:
          case sdk.items.type.AmazonJavelin:
            let quantity = item.getStat(sdk.stats.Quantity);

            // Stat 254 = increased stack size
            if (typeof quantity === "number" && quantity * 100 / (getBaseStat("items", item.classid, "maxstack") + item.getStat(sdk.stats.ExtraStack)) <= repairPercent) {
              itemList.push(copyUnit(item));
            }

            break;
          default:
            // Durability check
            if (item.durabilityPercent <= repairPercent) {
              itemList.push(copyUnit(item));
            }

            break;
          }
        }

        if (chargedItems) {
          // Charged item check
          let charge = item.getStat(-2)[sdk.stats.ChargedSkill];

          if (typeof (charge) === "object") {
            if (charge instanceof Array) {
              for (let i = 0; i < charge.length; i += 1) {
                if (charge[i] !== undefined && charge[i].hasOwnProperty("charges") && charge[i].charges * 100 / charge[i].maxcharges <= repairPercent) {
                  itemList.push(copyUnit(item));
                }
              }
            } else if (charge.charges * 100 / charge.maxcharges <= repairPercent) {
              itemList.push(copyUnit(item));
            }
          }
        }
      }
    } while (item.getNext());
  }

  return itemList;
};

me.needRepair = function () {
  let repairAction = [];
  let bowCheck = Attack.usingBow();
  let switchBowCheck = CharData.skillData.bow.onSwitch;
  let canAfford = me.gold >= me.getRepairCost();
  !bowCheck && switchBowCheck && (bowCheck = (() => {
    switch (CharData.skillData.bow.bowType) {
    case sdk.items.type.Bow:
    case sdk.items.type.AmazonBow:
      return "bow";
    case sdk.items.type.Crossbow:
      return "crossbow";
    default:
      return "";
    }
  })());

  if (bowCheck) {
    let [quiver, inventoryQuiver] = (() => {
      switch (bowCheck) {
      case "crossbow":
        return [me.getItem("cqv", sdk.items.mode.Equipped), me.getItem("cqv", sdk.items.mode.inStorage)];
      case "bow":
      default:
        return [me.getItem("aqv", sdk.items.mode.Equipped), me.getItem("aqv", sdk.items.mode.inStorage)];
      }
    })();

    // Out of arrows/bolts
    if (!quiver) {
      inventoryQuiver ? switchBowCheck ? Item.secondaryEquip(inventoryQuiver, sdk.body.LeftArmSecondary) : Item.equip(inventoryQuiver, 5) : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
    } else {
      let quantity = quiver.getStat(sdk.stats.Quantity);

      if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
        inventoryQuiver ? switchBowCheck ? Item.secondaryEquip(inventoryQuiver, sdk.body.LeftArmSecondary) : Item.equip(inventoryQuiver, 5) : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
      }
    }
  }

  // Repair durability/quantity/charges
  if (canAfford && this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
    repairAction.push("repair");
  }

  return repairAction;
};

me.needMerc = function () {
  if (me.classic || !Config.UseMerc || me.gold < me.mercrevivecost || me.mercrevivecost === 0) return false;

  Misc.poll(() => me.gameReady, 1000, 100);
  // me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
  for (let i = 0; i < 3; i += 1) {
    let merc = me.getMercEx();
    if (!!merc && !merc.dead) return false;

    delay(100);
  }

  // In case we never had a merc and Config.UseMerc is still set to true for some odd reason
  return true;
};

me.sortInventory = function () {
  return Storage.Inventory.SortItems(
    SetUp.sortSettings.ItemsSortedFromLeft,
    SetUp.sortSettings.ItemsSortedFromRight
  );
};
