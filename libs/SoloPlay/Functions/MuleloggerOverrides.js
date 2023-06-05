/**
*  @filename    MuleloggerOverrides.js
*  @author      theBGuy
*  @desc        modified Mulelogger to add tier values to item description and log equipped items
*
*/

includeIfNotIncluded("systems/mulelogger/MuleLogger.js");
includeIfNotIncluded("SoloPlay/Functions/NTIPOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");

// Added type parameter and logging tier value under picture on char viewer tab
MuleLogger.logItem = function (unit, logIlvl, type = "Player") {
  if (!isIncluded("core/misc.js")) {
    include("core/misc.js");
    include("core/util.js");
  }

  logIlvl === undefined && (logIlvl = this.LogItemLevel);

  let header = "";
  let name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();
  let desc = (Item.getItemDesc(unit, logIlvl) || "");
  let color = (unit.getColor() || -1);
  let code = Item.getItemCode(unit);

  if (AutoEquip.hasTier(unit)) {
    if (unit.mode === sdk.items.mode.inStorage && type === "Player") {
      if (unit.isCharm) {
        desc += ("\n\\xffc0Autoequip charm tier: " + NTIP.GetCharmTier(unit));
      } else {
        desc += ("\n\\xffc0Autoequip tier: " + NTIP.GetTier(unit));

        if (NTIP.GetSecondaryTier(unit) > 0) {
          desc += ("\n\\xffc0Autoequip Secondary tier: " + NTIP.GetSecondaryTier(unit));
        }
      }
    } else if (unit.mode === sdk.items.mode.inStorage && type === "Merc") {
      desc += ("\n\\xffc0Autoequip merctier: " + NTIP.GetMercTier(unit));
    }
  }

  let sock = unit.getItems();

  if (sock) {
    for (let i = 0; i < sock.length; i += 1) {
      if (sock[i].itemType === sdk.items.type.Jewel) {
        desc += "\n\n";
        desc += Item.getItemDesc(sock[i]);
      }
    }
  }

  desc += "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(sdk.items.flags.Ethereal) ? ":eth" : "");

  return {
    itemColor: color,
    image: code,
    title: name,
    description: desc,
    header: header,
    sockets: Item.getItemSockets(unit)
  };
};

MuleLogger.logEquippedItems = function () {
  while (!me.gameReady) {
    delay(100);
  }

  let folder, string, parsedItem;
  let realm = me.realm || "Single Player";
  let finalString = "";
  let items = me.getItemsEx()
    .filter(function (item) {
      return item.isEquipped || item.isEquippedCharm || (item.isInStorage && item.itemType === sdk.items.type.Rune);
    })
    .sort(function (a, b) {
      return b.itemType - a.itemType;
    });
  if (!items || !items.length) return;

  if (!FileTools.exists("mules/" + realm)) {
    folder = dopen("mules");
    folder.create(realm);
  }

  if (!FileTools.exists("mules/" + realm + "/" + "Kolbot-SoloPlay")) {
    folder = dopen("mules/" + realm);
    folder.create("Kolbot-SoloPlay");
  }

  if (!FileTools.exists("mules/" + realm + "/" + "Kolbot-SoloPlay/" + me.account)) {
    folder = dopen("mules/" + realm + "/Kolbot-SoloPlay");
    folder.create(me.account);
  }

  for (let item of items) {
    parsedItem = this.logItem(item, true, "Player");
    // Always put name on Char Viewer items
    !parsedItem.header && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
    // Remove itemtype_ prefix from the name
    parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);

    switch (item.mode) {
    case sdk.items.mode.inStorage:
      parsedItem.title += ((item.isInInventory && item.isEquippedCharm) ? " (equipped charm)" : " (in stash)");

      break;
    case sdk.items.mode.Equipped:
      parsedItem.title += (item.isOnSwap ? " (secondary equipped)" : " (equipped)");

      break;
    }

    string = JSON.stringify(parsedItem);
    finalString += (string + "\n");
  }

  if (Config.UseMerc) {
    let merc = me.getMercEx();

    if (merc) {
      items = merc.getItemsEx();

      for (let item of items) {
        parsedItem = this.logItem(item, true, "Merc");
        parsedItem.title += " (merc)";

        string = JSON.stringify(parsedItem);
        finalString += (string + "\n");
      }
    }

  }

  let charClass = ["amazon-", "sorceress-", "necromancer-", "paladin-", "barbarian-", "druid-", "assassin-"][me.classid];

  // hccl = hardcore classic ladder
  // scnl = softcore expan nonladder
  FileTools.writeText(
    "mules/" + realm
    + "/" + "Kolbot-SoloPlay/"
    + me.account + "/" + charClass + "-" + me.profile + "-" + me.name
    + "." + ( me.playertype ? "hc" : "sc" ) + (me.classic ? "c" : "" ) + ( me.ladder > 0 ? "l" : "nl" )
    + ".txt",
    finalString
  );
  console.log("Item logging done.");
};
