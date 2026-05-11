/**
*  @filename    ItemUtils.js
*  @author      theBGuy
*  @desc        Item related utils, socketing/imbuing ect
*
*/

(function (module) {
  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  const unsocketItem = function (item) {
    if (me.classic || !me.getItem(sdk.items.quest.Cube) || !item) return false;
    // Item doesn't have anything socketed
    if (item.getItemsEx().length === 0) return true;

    let hel = me.getItem(sdk.items.runes.Hel, sdk.items.mode.inStorage);
    if (!hel) return false;

    let scroll = Runewords.getScroll();
    let bodyLoc;
    let { classid, quality } = item;
    item.isEquipped && (bodyLoc = item.bodylocation);

    // failed to get scroll or open stash most likely means we're stuck somewhere in town, so it's better to return false
    if (!scroll || !Town.openStash() || !Cubing.emptyCube()) return false;

    try {
    // failed to move any of the items to the cube
      if (!Storage.Cube.MoveTo(item)
      || !Storage.Cube.MoveTo(hel)
      || !Storage.Cube.MoveTo(scroll)) {
        throw new Error("Failed to move items to cube");
      }

      // probably only happens on server crash
      if (!Cubing.openCube()) throw "Failed to open cube";

      myPrint("ÿc4Removing sockets from: ÿc0" + item.prettyPrint);
      transmute();
      delay(500);
      // unsocketing an item causes loss of reference, so re-find our item
      item = me.findItem(classid, -1, sdk.storage.Cube);
      !!item && bodyLoc && item.equip(bodyLoc);

      // can't pull the item out = no space = fail
      if (!Cubing.emptyCube()) throw "Failed to empty cube";
    } catch (e) {
      console.debug(e);
    } finally {
    // lost the item, so relocate it
      !item && (item = me.findItem(classid, -1, -1, quality));
      // In case error was thrown before hitting above re-equip statement
      bodyLoc && !item.isEquipped && item.equip(bodyLoc);
      // No bodyloc so move back to stash
      !bodyLoc && !item.isInStash && Storage.Stash.MoveTo(item);
      getUIFlag(sdk.uiflags.Cube) && me.cancel();
    }

    return item.getItemsEx().length === 0;
  };

  const checkItemsForSocketing = function () {
    if (me.classic || !me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete)) return false;

    let items = me.getItemsEx()
      .filter(function (item) {
        return item.sockets === 0 && getBaseStat("items", item.classid, "gemsockets") > 0;
      })
      .sort(function (a, b) {
        return NTIP.GetTier(b) - NTIP.GetTier(a);
      });

    for (let item of items) {
      let curr = Config.socketables.find(({ classid }) => item.classid === classid);
      if (curr && curr.condition(item) && curr.useSocketQuest) {
        return item;
      }
    }

    return false;
  };

  const checkItemsForImbueing = function () {
    if (!me.getQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete)) return false;

    let items = me.getItemsEx()
      .filter(function (item) {
        return item.sockets === 0 && (item.normal || item.superior);
      });

    for (let item of items) {
      if (Config.imbueables
        .some(imbueable => imbueable.name === item.classid && Item.canEquip(item))) {
        return item;
      }
    }

    return false;
  };

  /**
   * @param {ItemUnit} item 
   * @param {ItemUnit[]} runes 
   * @returns {boolean}
   */
  const addSocketablesToItem = function (item, runes = []) {
    if (!item || item.sockets === 0) return false;
  
    let preSockets = item.getItemsEx().length;
    if (preSockets === item.sockets) {
      return false;
    }
    let original = preSockets;
    let bodyLoc;

    if (item.isEquipped) {
      bodyLoc = item.bodylocation;

      if (!Storage.Inventory.CanFit(item)) {
        me.sortInventory();

        if (!Storage.Inventory.CanFit(item) && !Storage.Inventory.MoveTo(item)) {
          console.log("ÿc8AddSocketableToItemÿc0 :: No space to get item back");
          return false;
        }
      } else {
        if (!Storage.Inventory.MoveTo(item)) return false;
      }
    }

    if (!Town.openStash()) return false;

    for (let rune of runes) {
      if (!rune.toCursor()) return false;

      for (let i = 0; i < 3; i += 1) {
        new PacketBuilder()
          .byte(sdk.packets.send.InsertSocketItem)
          .dword(rune.gid)
          .dword(item.gid)
          .send();
      
        let tick = getTickCount();

        while (getTickCount() - tick < 2000) {
          if (!me.itemoncursor) {
            delay(300);

            break;
          }

          delay(10);
        }

        if (item.getItemsEx().length > preSockets) {
          D2Bot.printToConsole("Added socketable: " + rune.fname + " to " + item.fname, sdk.colors.D2Bot.Gold);
          Item.logItem("Added " + rune.name + " to: ", item, null, true);
          preSockets++;
        }
      }
    }

    bodyLoc && Item.equip(item, bodyLoc);

    return item.getItemsEx().length > original;
  };

  /**
   * @param {ItemUnit} item 
   * @param {{ classid: number, socketWith: number[], temp: number[], useSocketQuest: boolean, condition: Function }} [itemInfo] 
   * @returns {boolean}
   */
  const getSocketables = function (item, itemInfo) {
    if (!item) return false;
    itemInfo === undefined && (itemInfo = {});

    let itemtype, gemType, runeType;
    let [multiple, temp] = [[], []];
    let itemSocketInfo = item.getItemsEx();
    let preSockets = itemSocketInfo.length;
    let allowTemp = (itemInfo.hasOwnProperty("temp") && itemInfo.temp.length > 0
    && (preSockets === 0 || preSockets > 0 && itemSocketInfo.some(el => !itemInfo.socketWith.includes(el.classid))));
    let sockets = item.sockets;
    let openSockets = sockets - preSockets;
    let { classid, quality } = item;
    let socketables = me.getItemsEx()
      .filter(function (item) {
        return item.isInsertable;
      });

    if (!socketables || (!allowTemp && openSockets === 0)) return false;

    function highestGemAvailable (gem, checkList = []) {
      if (!gem) return false;

      // filter out all items that aren't the gem type we are looking for
      // then sort the highest classid (better gems first)
      let myItems = me.getItemsEx()
        .filter(function (item) {
          return item.itemType === gem.itemType;
        })
        .sort(function (a, b) {
          return b.classid - a.classid;
        });

      for (let item of myItems) {
        if (!checkList.includes(item)) return true;
      }

      return false;
    }

    if (!itemInfo.hasOwnProperty("socketWith")
    || (itemInfo.hasOwnProperty("socketWith") && itemInfo.socketWith.length === 0)) {
      itemtype = item.getItemType();
      if (!itemtype) return false;
      gemType = ["Helmet", "Armor"].includes(itemtype)
        ? "Ruby" : itemtype === "Shield"
          ? "Diamond" : itemtype === "Weapon" && !Check.currentBuild().caster
            ? "Skull" : "";

      // Tir rune in normal, Io rune otherwise and Shael's if assassin
      !gemType && (runeType = me.normal ? "Tir" : me.assassin ? "Shael" : "Io");

    // TODO: Use Jewels
    // would need to score them and way to compare to runes/gems by what itemtype we are looking at
    // then keep upgrading until we actually are ready to insert in the item
    }

    for (let i = 0; i < socketables.length; i++) {
      if (itemInfo.hasOwnProperty("socketWith") && itemInfo.socketWith.length > 0) {
      // In case we are trying to use different runes, check if item already has current rune inserted
      // or if its already in the muliple list. If it is, remove that socketables classid from the list of wanted classids
        if (itemInfo.socketWith.length > 1
        && (itemSocketInfo.some(el => el.classid === socketables[i].classid) || multiple.some(el => el.classid === socketables[i].classid))) {
          itemInfo.socketWith.remove(socketables[i].classid);
        }

        if (itemInfo.socketWith.includes(socketables[i].classid) && !multiple.includes(socketables[i])) {
          if (multiple.length < sockets) {
            multiple.push(socketables[i]);
          }
        }

        if (allowTemp && itemInfo.temp.includes(socketables[i].classid) && !temp.includes(socketables[i])) {
          if (temp.length < sockets) {
            temp.push(socketables[i]);
          }
        }
      } else {
      // If itemtype was matched with a gemType
        if (gemType) {
        // current item matches wanted gemType
          if (socketables[i].itemType === sdk.items.type[gemType]) {
          // is the highest gem of that type
            if (highestGemAvailable(socketables[i], multiple)) {
              if (multiple.length < sockets) {
                multiple.push(socketables[i]);
              }
            }
          }
        } else if (runeType) {
          if (socketables[i].classid === sdk.items.runes[runeType] && !multiple.includes(socketables[i])) {
            if (multiple.length < sockets) {
              multiple.push(socketables[i]);
            }
          }
        }
      }

      if (multiple.length === sockets) {
        break;
      }
    }

    if (allowTemp) {
    // we have all our wanted socketables
      if (multiple.length === sockets) {
      // Failed to remove temp socketables
        if (!unsocketItem(item)) return false;
        // relocate our item as unsocketing it causes loss of reference
        item = me.findItem(classid, -1, -1, quality);
        openSockets = sockets;
      } else {
        if (temp.length > 0) {
        // use temp socketables
          multiple = temp.slice(0);
        } else if (item.getItemsEx().some((el) => itemInfo.temp.includes(el.classid))) {
          return false;
        }
      }
    }
  
    if (multiple.length > 0) {
      multiple.length > openSockets && (multiple.length = openSockets);
      if (openSockets === 0) return false;
      // check to ensure I am a high enough level to use wanted socketables
      for (let i = 0; i < multiple.length; i++) {
        if (me.charlvl < multiple[i].lvlreq) {
          console.log("ÿc8Kolbot-SoloPlayÿc0: Not high enough level for " + multiple[i].fname);
          return false;
        }
      }

      if (addSocketablesToItem(item, multiple)) {
        delay(250 + me.ping);
      } else {
        console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to add socketable to " + item.fname);
      }

      return item.getItemsEx().length === sockets || item.getItemsEx().length > preSockets;
    }

    return false;
  };

  const checkSocketables = function () {
    let items = me.getItemsEx()
      .filter(function (item) {
        return item.sockets > 0 && AutoEquip.hasTier(item)
        && (item.quality >= sdk.items.quality.Magic
        || ((item.normal || item.superior) && item.isEquipped));
      })
      .sort(function (a, b) {
        return NTIP.GetTier(b) - NTIP.GetTier(a);
      });

    if (!items) return;

    for (let item of items) {
      let sockets = item.sockets;

      switch (item.quality) {
      case sdk.items.quality.Normal:
      case sdk.items.quality.Superior:
      case sdk.items.quality.Magic:
      case sdk.items.quality.Rare:
      case sdk.items.quality.Crafted:
      // no need to check anything else if already socketed
        if (item.getItemsEx().length === sockets) {
          continue;
        }
        // Any magic, rare, or crafted item with open sockets
        if (item.isEquipped && [sdk.body.Head, sdk.body.Armor, sdk.body.RightArm, sdk.body.LeftArm].includes(item.bodylocation)) {
          getSocketables(item);
        }

        break;
      case sdk.items.quality.Set:
      case sdk.items.quality.Unique:
        {
          let curr = Config.socketables.find(({ classid }) => item.classid === classid);

          // item is already socketed and we don't use temp socketables on this item
          if ((!curr || (curr && !curr.temp)) && item.getItemsEx().length === sockets) {
            continue;
          }

          if (curr && curr.condition(item)) {
            getSocketables(item, curr);
          } else if (item.isEquipped) {
            getSocketables(item);
          }
        }

        break;
      default:
        break;
      }
    }
  };

  module.exports = {
    unsocketItem: unsocketItem,
    checkItemsForSocketing: checkItemsForSocketing,
    checkItemsForImbueing: checkItemsForImbueing,
    addSocketablesToItem: addSocketablesToItem,
    getSocketables: getSocketables,
    checkSocketables: checkSocketables,
  };
})(module);
