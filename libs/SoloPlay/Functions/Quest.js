/**
*  @filename    Quest.js
*  @author      theBGuy
*  @credit      Dark-f, JeanMax, https://github.com/SetupSonic/clean-sonic/blob/master/libs/sonic/core/Quest.js
*  @desc        Miscellaneous quest tasks for leveling
*
*/

const Quest = {
  preReqs: function () {
    /**
     * @param {string} task 
     * @param {function(): boolean} req 
     * @returns {boolean}
     */
    const getReq = function (task, req = () => true) {
      for (let i = 0; i < 5 && !req(); i++) {
        Loader.runScript(task);
      }
      return req();
    };

    if (me.accessToAct(2)) {
      !me.cube && getReq("cube", () => me.cube);

      if (!me.staff && !me.horadricstaff) {
        !me.amulet && getReq("amulet", () => me.amulet);
        !me.shaft && getReq("staff", () => me.shaft);
      }
    }

    if (me.accessToAct(3) && !me.travincal && !me.khalimswill) {
      !me.eye && getReq("eye", () => me.eye);
      !me.heart && getReq("heart", () => me.heart);
      !me.brain && getReq("brain", () => me.brain);
    }
  },

  cubeItems: function (outcome, ...classids) {
    if (me.getItem(outcome)
      || outcome === sdk.quest.item.HoradricStaff && me.horadricstaff
      || outcome === sdk.quest.item.KhalimsWill && me.travincal) {
      return true;
    }

    !me.inTown && Town.goToTown();
    outcome === sdk.quest.item.HoradricStaff
      ? me.overhead("cubing staff")
      : outcome === sdk.quest.item.KhalimsWill
        ? me.overhead("cubing flail")
        : me.overhead("cubing " + outcome);

    Town.doChores();
    Town.openStash();
    Cubing.emptyCube();

    for (let classid of classids) {
      let cubingItem = me.getItem(classid);

      if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
        return false;
      }
    }

    Misc.poll(() => Cubing.openCube(), 5000, 1000);

    let wantedItem;
    let tick = getTickCount();

    while (getTickCount() - tick < 5000) {
      if (Cubing.openCube()) {
        transmute();
        delay(750 + me.ping);

        wantedItem = me.getItem(outcome);

        if (wantedItem) {
          Storage.Inventory.MoveTo(wantedItem);
          me.cancel();

          break;
        }
      }
    }

    me.cancel();

    outcome === sdk.items.quest.HoradricStaff && Town.npcInteract("cain");

    return me.getItem(outcome);
  },

  placeStaff: function () {
    if (me.horadricstaff) return true;

    let tick = getTickCount();
    let orifice = Misc.poll(() => Game.getObject(sdk.objects.HoradricStaffHolder));
    if (!orifice) return false;
    
    let hstaff = (
      me.getItem(sdk.items.quest.HoradricStaff)
      || Quest.cubeItems(
        sdk.items.quest.HoradricStaff,
        sdk.items.quest.ShaftoftheHoradricStaff,
        sdk.items.quest.ViperAmulet
      )
    );

    if (hstaff) {
      if (hstaff.location !== sdk.storage.Inventory) {
        !me.inTown && Town.goToTown();

        if (!Storage.Inventory.CanFit(hstaff)) {
          Town.clearJunk();
          me.sortInventory();
        }

        hstaff.isInStash && Town.openStash();
        hstaff.isInCube && Cubing.openCube();
        Storage.Inventory.MoveTo(hstaff);
        me.cancelUIFlags();
        Town.move("portalspot") && Pather.usePortal(null, me.name);
      }
    }

    Pather.moveToPreset(me.area, sdk.unittype.Object, 152);
    Misc.openChest(orifice);

    if (!hstaff) {
      if (getTickCount() - tick < 500) {
        delay(500 + me.ping);
      }

      return false;
    }

    clickItemAndWait(sdk.clicktypes.click.item.Left, hstaff);
    submitItem();
    delay(750 + me.ping);

    // Clear cursor of staff - credit @Jaenster
    let item = me.getItemsEx().filter((el) => el.isInInventory).first();
    let _b = [item.x, item.y, item.location], x = _b[0], y = _b[1], loc = _b[2];
    clickItemAndWait(sdk.clicktypes.click.item.Left, item);
    clickItemAndWait(sdk.clicktypes.click.item.Left, x, y, loc);
    delay(750 + me.ping);

    return true;
  },

  tyraelTomb: function () {
    Pather.moveTo(22629, 15714);
    Pather.moveTo(22609, 15707);
    Pather.moveTo(22579, 15704);
    Pather.moveTo(22577, 15649, 10);
    Pather.moveTo(22577, 15609, 10);

    let tyrael = Game.getNPC(NPC.Tyrael);
    if (!tyrael) return false;

    for (let talk = 0; talk < 3; talk += 1) {
      tyrael.distance > 3 && Pather.moveToUnit(tyrael);

      tyrael.interact();
      delay(1000 + me.ping);
      me.cancel();

      if (Pather.getPortal(null)) {
        me.cancel();
        break;
      }
    }

    !me.inTown && Town.goToTown();

    return true;
  },

  stashItem: function (classid) {
    let questItem = typeof classid === "object" ? classid : me.getItem(classid);
    if (!questItem) return false;
    myPrint("Stashing: " + questItem.fname.split("\n").reverse().join(" "));

    !me.inTown && Town.goToTown();
    Town.openStash();

    if (!Storage.Stash.CanFit(questItem)) {
      Town.sortStash(true);

      if (!Storage.Stash.CanFit(questItem)) return false;
    }

    Storage.Stash.MoveTo(questItem);

    return questItem.isInStash;
  },

  collectItem: function (classid, chestID) {
    if (me.getItem(classid)) return true;

    if (chestID !== undefined) {
      let chest = Game.getObject(chestID);
      if (!chest || !Misc.openChest(chest)) return false;
    }

    let questItem = Misc.poll(() => Game.getItem(classid), 3000, 100 + me.ping);

    if (Storage.Inventory.CanFit(questItem)) {
      Pickit.pickItem(questItem);
    } else {
      Town.visitTown();
      Pickit.pickItem(questItem);
      Pickit.pickItems();
    }

    return me.getItem(classid);
  },

  equipItem: function (classid, loc) {
    let questItem = me.getItem(classid);
    !getUIFlag(sdk.uiflags.Stash) && me.cancel();

    if (questItem) {
      me.dualWielding && Item.removeItem(sdk.body.LeftArm);
      if (questItem.isInStash && !Town.openStash()) {
        console.log("ÿc8Kolbot-SoloPlayÿc0: failed to open stash. (Quest.equipItem)");
        Item.autoEquip();
        return false;
      }
      
      if (!questItem.equip(loc)) {
        Pickit.pickItems();
        console.log("ÿc8Kolbot-SoloPlayÿc0: failed to equip " + classid + " .(Quest.equipItem)");
      }
    } else {
      console.log("ÿc8Kolbot-SoloPlayÿc0: Lost " + classid + " before trying to equip it. (Quest.equipItem)");
      return false;
    }

    if (me.itemoncursor) {
      let olditem = Game.getCursorUnit();

      if (olditem) {
        if (Storage.Inventory.CanFit(olditem)) {
          console.log("ÿc8Kolbot-SoloPlayÿc0: Keeping weapon");

          Storage.Inventory.MoveTo(olditem);
        } else {
          me.cancel();
          console.log("ÿc8Kolbot-SoloPlayÿc0: No room to keep weapon");

          olditem.drop();
        }
      }
    }

    me.cancelUIFlags();

    return questItem.bodylocation === loc;
  },

  smashSomething: function (classid) {
    let tool = classid === sdk.objects.CompellingOrb
      ? sdk.items.quest.KhalimsWill
      : classid === sdk.quest.chest.HellForge
        ? sdk.items.quest.HellForgeHammer
        : null;
    let smashable = Game.getObject(classid);

    if (me.equipped.get(sdk.body.RightArm).classid !== tool || !me.getItem(tool)) return false;
    if (!smashable) return false;
    let tick = getTickCount();
    let questTool = me.getItem(tool);

    while (me.getItem(tool)) {
      smashable.distance > 4 && Pather.moveToEx(smashable.x, smashable.y, { clearSettings: { allowClearing: false } });
      Skill.cast(sdk.skills.Attack, sdk.skills.hand.Right, smashable);
      smashable.interact();

      if (getTickCount() - tick > Time.seconds(30)) {
        console.warn("Timed out trying to smash quest object");
        
        return false;
      }

      if (!questTool.isEquipped) {
        break;
      }

      delay(750 + me.ping);
    }

    return !me.getItem(tool);
  },

  /**
   * @param {string} npcName 
   * @param {number | number[]} action 
   * @returns {boolean}
   */
  npcAction: function (npcName, action) {
    if (!npcName || !action) return false;
    !Array.isArray(action) && (action = [action]);

    !me.inTown && Town.goToTown();
    npcName = npcName.capitalize(true);
    Town.move(NPC[npcName]);
    let npc = Misc.poll(() => Game.getNPC(NPC[npcName]));

    Packet.flash(me.gid);
    delay(1 + me.ping * 2);

    if (npc && npc.openMenu()) {
      action.forEach(menuOption => Misc.useMenu(menuOption) && delay(100 + me.ping));
      return true;
    }

    return false;
  },

  // Akara reset for build change
  characterRespec: function () {
    if (me.respec || SetUp.currentBuild === SetUp.finalBuild) return;

    switch (true) {
    case me.charlvl >= CharInfo.respecOne && SetUp.currentBuild === "Start":
    case CharInfo.respecTwo > 0 && me.charlvl >= CharInfo.respecTwo && SetUp.currentBuild === "Stepping":
    case me.charlvl === SetUp.finalRespec() && SetUp.currentBuild === "Leveling":
      if (!me.den) {
        myPrint("time to respec, but den is incomplete");
        return;
      }

      let preSkillAmount = me.getStat(sdk.stats.NewSkills);
      let preStatAmount = me.getStat(sdk.stats.StatPts);
      let npc;

      Town.goToTown(1);
      myPrint("time to respec");

      for (let i = 0; i < 2; i++) {
        // attempt packet respec on first try
        if (i === 0) {
          npc = Town.npcInteract("akara");
          me.cancelUIFlags();
          delay(100 + me.ping);
          npc && sendPacket(1, sdk.packets.send.EntityAction, 4, 0, 4, npc.gid, 4, 0);
        } else {
          this.npcAction("akara", [sdk.menu.Respec, sdk.menu.Ok]);
        }

        Misc.checkQuest(sdk.quest.id.Respec, sdk.quest.states.Completed);
        delay(10 + me.ping * 2);

        if (me.respec || (me.getStat(sdk.stats.NewSkills) > preSkillAmount
          && me.getStat(sdk.stats.StatPts) > preStatAmount)) {
          me.data.currentBuild = CharInfo.getActiveBuild();
          me.data[sdk.difficulty.nameOf(me.diff).toLowerCase()].respecUsed = true;
          CharData.updateData("me", me.data);
          delay(750 + me.ping * 2);
          Town.clearBelt();
          myPrint("respec done, restarting");
          delay(1000 + me.ping);
          scriptBroadcast("quit");
        }
      }

      break;
    }
  },

  // Credit dzik or laz unsure who for this
  useSocketQuest: function (item = undefined) {
    if (SetUp.finalBuild === "Socketmule") return false;

    try {
      if (!item || item.mode === sdk.items.mode.onGround) throw new Error("Couldn't find item");
      if (!me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete)) throw new Error("Quest unavailable");
      if (item.sockets > 0 || getBaseStat("items", item.classid, "gemsockets") === 0) throw new Error("Item cannot be socketed");
      if (!Storage.Inventory.CanFit(item)) throw new Error("(useSocketQuest) No space to get item back");
      if (me.act !== 5 || !me.inTown) {
        if (!Town.goToTown(5)) throw new Error("Failed to go to act 5");
      }

      if (item.isInStash && (!Town.openStash() || !Storage.Inventory.MoveTo(item))) {
        throw new Error("Failed to move item from stash to inventory");
      }

      let invo = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);
      let slot = item.bodylocation;
      
      // Take note of all the items in the invo minus the item to socket
      for (let i = 0; i < invo.length; i++) {
        if (item.gid !== invo[i].gid) {
          invo[i] = invo[i].x + "/" + invo[i].y;
        }
      }

      if (!this.npcAction("larzuk", sdk.menu.AddSockets)) throw new Error("Failed to interact with Lazruk");
      if (!getUIFlag(sdk.uiflags.SubmitItem)) throw new Error("Failed to open SubmitItem screen");
      if (!item.toCursor()) throw new Error("Couldn't get item");

      submitItem();
      delay(500 + me.ping);
      Packet.questRefresh();

      item = false; // Delete item reference, it's not longer valid anyway
      let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);
        
      for (let i = 0; i < items.length; i++) {
        if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
          item = items[i];
        }
      }

      if (!item || item.sockets === 0) {
        me.itemoncursor && Storage.Stash.MoveTo(item);
        throw new Error("Failed to socket item");
      }

      Item.logItem("Used my " + sdk.difficulty.nameOf(me.diff) + " socket quest on : ", item, null, true);
      D2Bot.printToConsole("Kolbot-SoloPlay :: Used my " + sdk.difficulty.nameOf(me.diff) + " socket quest on : " + item.name, sdk.colors.D2Bot.Gold);
      CharData.updateData(sdk.difficulty.nameOf(me.diff), "socketUsed", true);
      me.data[sdk.difficulty.nameOf(me.diff).toLowerCase()].socketUsed = true;
      me.update();

      if (!slot && !item.isInStash) {
        // Move item back to stash
        if (Storage.Stash.CanFit(item)) {
          Town.move("stash");
          Storage.Stash.MoveTo(item);
          me.cancel();
        }
      }

      slot && Item.equip(item, slot);
    } catch (e) {
      myPrint(e);
      me.itemoncursor && Storage.Inventory.MoveTo(Game.getCursorUnit());
      me.cancelUIFlags();

      return false;
    }

    return true;
  },

  // Credit whoever did useSocketQuest, I modified that to come up with this
  useImbueQuest: function (item = undefined) {
    if (SetUp.finalBuild === "Imbuemule") return false;

    try {
      if (!item || item.mode === sdk.items.mode.onGround) throw new Error("Couldn't find item");
      if (!Misc.checkQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete)) throw new Error("Quest unavailable");
      if (item.sockets > 0 || item.quality > sdk.items.quality.Superior) throw new Error("Item cannot be imbued");
      if (!Storage.Inventory.CanFit(item)) throw new Error("(useImbueQuest) No space to get item back");
      if (me.act !== 1 || !me.inTown) {
        if (!Town.goToTown(1)) throw new Error("Failed to go to act 1");
      }

      if (item.isInStash && (!Town.openStash() || !Storage.Inventory.MoveTo(item))) {
        throw new Error("Failed to move item from stash to inventory");
      }

      let invo = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);
      let slot = item.bodylocation;
      
      // Take note of all the items in the invo minus the item to socket
      for (let i = 0; i < invo.length; i++) {
        if (item.gid !== invo[i].gid) {
          invo[i] = invo[i].x + "/" + invo[i].y;
        }
      }

      if (!this.npcAction("charsi", sdk.menu.Imbue)) throw new Error("Failed to interact with Charsi");
      if (!getUIFlag(sdk.uiflags.SubmitItem)) throw new Error("Failed to open SubmitItem screen");
      if (!item.toCursor()) throw new Error("Couldn't get item");

      submitItem();
      delay(500 + me.ping);
      Packet.questRefresh();

      item = false; // Delete item reference, it's not longer valid anyway
      let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);
        
      for (let i = 0; i < items.length; i++) {
        if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
          item = items[i];
        }
      }

      if (!item || !item.rare) {
        me.itemoncursor && Storage.Stash.MoveTo(item);
        throw new Error("Failed to imbue item");
      }

      Item.logItem("Used my " + sdk.difficulty.nameOf(me.diff) + " imbue quest on : ", item, null, true);
      D2Bot.printToConsole("Kolbot-SoloPlay :: Used my " + sdk.difficulty.nameOf(me.diff) + " imbue quest on : " + item.name, sdk.colors.D2Bot.Gold);
      CharData.updateData(sdk.difficulty.nameOf(me.diff), "imbueUsed", true);
      me.data[sdk.difficulty.nameOf(me.diff).toLowerCase()].imbueUsed = true;
      me.update();

      if (!slot && !item.isInStash) {
        // Move item back to stash
        if (Storage.Stash.CanFit(item)) {
          Town.move("stash");
          Storage.Stash.MoveTo(item);
          me.cancel();
        }
      }

      slot && Item.equip(item, slot);
    } catch (e) {
      myPrint(e);
      me.itemoncursor && Storage.Inventory.MoveTo(Game.getCursorUnit());
      me.cancelUIFlags();

      return false;
    }
    
    return true;
  },

  unfinishedQuests: function () {
    const highestAct = me.highestAct;
    // Act 1
    // Tools of the trade
    let malus = me.getItem(sdk.items.quest.HoradricMalus);
    !!malus && Town.goToTown(1) && Town.npcInteract("charsi");

    let imbueItem = Misc.checkItemsForImbueing();
    (imbueItem) && Quest.useImbueQuest(imbueItem) && Item.autoEquip();

    // Drop wirts leg at startup
    let leg = me.getItem(sdk.items.quest.WirtsLeg);
    if (leg) {
      !me.inTown && Town.goToTown();
      leg.isInStash && Town.openStash() && Storage.Inventory.MoveTo(leg) && delay(300);
      getUIFlag(sdk.uiflags.Stash) && me.cancel();
      leg.drop();
    }

    // Act 2
    if (highestAct >= 2) {
      // Radament skill book
      let book = me.getItem(sdk.quest.item.BookofSkill);
      if (book) {
        book.isInStash && Town.openStash() && delay(300);
        Misc.poll(() => {
          book.use();
          if (me.getStat(sdk.stats.NewSkills) > 0) {
            console.log("ÿc8Kolbot-SoloPlayÿc0: used Radament skill book");
            AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
            return true;
          }
          return false;
        }, 1000, 100);
      }
    }

    // Act 3
    if (highestAct >= 3) {
      // Figurine -> Golden Bird
      if (me.getItem(sdk.items.quest.AJadeFigurine)) {
        myPrint("starting jade figurine");
        Town.goToTown(3) && Town.npcInteract("meshif");
      }

      // Golden Bird -> Ashes
      (me.getItem(sdk.items.quest.TheGoldenBird)) && Town.goToTown(3) && Town.npcInteract("alkor");

      // Potion of life
      let pol = me.getItem(sdk.items.quest.PotofLife);
      if (pol) {
        pol.isInStash && Town.openStash() && delay(300);
        pol.use() && console.log("ÿc8Kolbot-SoloPlayÿc0: used potion of life");
      }

      // LamEssen's Tome
      let tome = me.getItem(sdk.items.quest.LamEsensTome);
      if (tome) {
        !me.inTown && Town.goToTown(3);
        tome.isInStash && Town.openStash() && Storage.Inventory.MoveTo(tome) && delay(300);
        Town.npcInteract("alkor") && delay(300);
        me.getStat(sdk.stats.StatPts) > 0 && AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
        console.log("ÿc8Kolbot-SoloPlayÿc0: LamEssen Tome completed");
      }

      // Free Lam Essen quest
      if (me.accessToAct(3) && !me.getQuest(sdk.quest.id.LamEsensTome, sdk.quest.states.Completed)) {
        !me.inArea(sdk.areas.KurastDocktown) && Town.goToTown(3);
        Town.move("alkor");
        let unit = getUnit(1, "alkor");
        if (unit) {
          sendPacket(1, sdk.packets.send.QuestMessage, 4, unit.gid, 4, 564);
          delay((me.ping || 0) * 2 + 200);
          unit.openMenu();
          me.cancel();
          me.cancel();
        }
      }

      // Remove Khalim's Will if quest not completed and restarting run.
      let kw = me.getItem(sdk.items.quest.KhalimsWill);
      if (kw) {
        if (me.equipped.get(sdk.body.RightArm).classid === sdk.items.quest.KhalimsWill) {
          Town.clearInventory();
          delay(500);
          Quest.stashItem(sdk.items.quest.KhalimsWill);
          console.log("ÿc8Kolbot-SoloPlayÿc0: removed khalims will");
          Item.autoEquip();
        }
      }

      // Killed council but haven't talked to cain
      if (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed) && Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, 4)) {
        me.overhead("Finishing Travincal by talking to cain");
        Town.goToTown(3) && Town.npcInteract("cain") && delay(300);
        me.cancel();
      }
    }

    // Act 4
    if (highestAct >= 4) {
      // Drop hellforge hammer and soulstone at startup
      let hammer = me.getItem(sdk.items.quest.HellForgeHammer);
      if (hammer) {
        !me.inTown && Town.goToTown();
        hammer.isInStash && Town.openStash() && Storage.Inventory.MoveTo(hammer) && delay(300);
        getUIFlag(sdk.uiflags.Stash) && me.cancel();
        hammer.drop();
      }

      let soulstone = me.getItem(sdk.items.quest.MephistosSoulstone);
      if (soulstone) {
        !me.inTown && Town.goToTown();
        soulstone.isInStash && Town.openStash() && Storage.Inventory.MoveTo(soulstone) && delay(300);
        getUIFlag(sdk.uiflags.Stash) && me.cancel();
        soulstone.drop();
      }
    }

    // Act 5
    if (highestAct === 5) {
      let socketItem = Misc.checkItemsForSocketing();
      !!socketItem && Quest.useSocketQuest(socketItem);

      // Scroll of resistance
      let sor = me.getItem(sdk.items.quest.ScrollofResistance);
      if (sor) {
        sor.isInStash && Town.openStash() && delay(300);
        sor.use() && console.log("ÿc8Kolbot-SoloPlayÿc0: used scroll of resistance");
      }

      if (Misc.checkQuest(sdk.quest.id.PrisonofIce, 7/** Used the scroll */)
        && !Misc.checkQuest(sdk.quest.id.PrisonofIce, sdk.quest.states.Completed)) {
        // never talked to anya after drinking potion, lets do that
        Town.npcInteract("anya");
      }
    }

    Misc.checkSocketables();
    
    Town.heal();
    me.cancelUIFlags();
    
    return true;
  },
};
