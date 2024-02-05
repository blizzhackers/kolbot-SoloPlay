/**
*  @filename    Init.js
*  @author      theBGuy
*  @desc        Initialization process for main soloplay thread
*
*/

(function () {
  // Only load this in global scope
  if (getScript(true).name.toLowerCase() === "libs\\soloplay\\soloplay.js") {
    myPrint("start setup");
    const { nipItems, impossibleClassicBuilds, impossibleNonLadderBuilds } = require("../Utils/General");
    NTIP.buildList(nipItems.Quest, nipItems.General);

    try {
      if (impossibleClassicBuilds.includes(SetUp.finalBuild) && me.classic) {
        throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down");
      }

      if (impossibleNonLadderBuilds.includes(SetUp.finalBuild) && !Developer.addLadderRW) {
        throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in non-ladder as they require ladder runewords. Change the info tag or remake as an ladder character...Shutting down");
      }
    } catch (e) {
      D2Bot.printToConsole(e, sdk.colors.D2Bot.Red);
      FileTools.remove("data/" + me.profile + ".json");
      FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
      D2Bot.stop();
    }

    if (me.charlvl === 1) {
      let buckler = me.getItem(sdk.items.Buckler);
      !!buckler && buckler.isEquipped && buckler.drop();
    }

    Town.heal() && me.cancelUIFlags();
    Check.checkSpecialCase();

    // check if any of our currently equipped items are no longer usable - can happen after respec
    me.getItemsEx()
      .filter(item => item.isEquipped)
      .forEach(function (item) {
        if (me.getStat(sdk.stats.Strength) < item.strreq
          || me.getStat(sdk.stats.Dexterity) < item.dexreq
          || item.ethereal && item.isBroken) {
          myPrint("No longer able to use: " + item.fname);
          Item.removeItem(null, item);
        } else if (sdk.quest.items.includes(item.classid)) {
          myPrint("Removing Quest Item: " + item.fname);
          Item.removeItem(null, item);
        } else if (me.charlvl >= 16 && item.isOnSwap
          && [
            sdk.items.type.AmazonBow, sdk.items.type.Bow,
            sdk.items.type.Crossbow, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver
          ].includes(item.itemType)) {
          myPrint("Removing old swap Item: " + item.fname);
          try {
            me.switchWeapons(sdk.player.slot.Secondary);
            item.drop();
            CharData.skillData.bow.resetBowData();
          } finally {
            me.switchWeapons(sdk.player.slot.Main);
          }
        }
      });
    
    me.getItemsEx()
      .filter(item => item.isInInventory && sdk.quest.items.includes(item.classid))
      .forEach(item => {
        Quest.stashItem(item);
      });
    
    me.cancelUIFlags();
    // initialize final charms if we have any
    CharmEquip.init();
  }
  return true;
})();
