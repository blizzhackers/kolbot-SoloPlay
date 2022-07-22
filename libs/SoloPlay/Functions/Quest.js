/**
*  @filename    Quest.js
*  @author      theBGuy
*  @credit      Dark-f, JeanMax, https://github.com/SetupSonic/clean-sonic/blob/master/libs/sonic/common/Quest.js
*  @desc        Miscellaneous quest tasks for leveling
*
*/

const Quest = {
	preReqs: function () {
		// horadric staff
		if (Pather.accessToAct(2) && !me.staff && !me.horadricstaff) {
			if (!me.amulet) {
				if (!isIncluded("SoloPlay/Scripts/amulet.js")) {
					include("SoloPlay/Scripts/amulet.js");
				}

				for (let getAmmy = 0; getAmmy < 5; getAmmy++) {
					amulet();

					if (me.amulet) {
						break;
					}
				}
			}

			if (!me.shaft) {
				if (!isIncluded("SoloPlay/Scripts/staff.js")) {
					include("SoloPlay/Scripts/staff.js");
				}

				for (let getStaff = 0; getStaff < 5; getStaff++) {
					staff();

					if (me.shaft) {
						break;
					}
				}
			}
		}

		if (Pather.accessToAct(3) && !me.travincal && !me.khalimswill) {
			if (!me.eye) {
				if (!isIncluded("SoloPlay/Scripts/eye.js")) {
					include("SoloPlay/Scripts/eye.js");
				}

				for (let getEye = 0; getEye < 5; getEye++) {
					eye();

					if (me.eye) {
						break;
					}
				}
			}

			if (!me.heart) {
				if (!isIncluded("SoloPlay/Scripts/heart.js")) {
					include("SoloPlay/Scripts/heart.js");
				}

				for (let getHeart = 0; getHeart < 5; getHeart++) {
					heart();

					if (me.heart) {
						break;
					}
				}
			}

			if (!me.brain) {
				if (!isIncluded("SoloPlay/Scripts/brain.js")) {
					include("SoloPlay/Scripts/brain.js");
				}

				for (let getBrain = 0; getBrain < 5; getBrain++) {
					brain();

					if (me.brain) {
						break;
					}
				}
			}
		}
	},

	cubeItems: function (outcome, ...classids) {
		if (me.getItem(outcome)
			|| outcome === 91 && me.horadricstaff
			|| outcome === 174 && me.travincal) {
			return true;
		}

		!me.inTown && Town.goToTown();
		outcome === 91 ? me.overhead("cubing staff") : outcome === 174 ? me.overhead("cubing flail") : me.overhead("cubing " + outcome);

		Town.doChores();
		Town.openStash();
		me.findItems(-1, -1, sdk.storage.Cube) && Cubing.emptyCube();

		let cubingItem;

		for (let classid of classids) {
			cubingItem = me.getItem(classid);

			if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
				return false;
			}
		}

		while (!Cubing.openCube()) {
			delay(1 + me.ping * 2);
			Packet.flash(me.gid);
		}

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
		let orifice = Misc.poll(() => Game.getObject(sdk.units.HoradricStaffHolder));
		if (!orifice) return false;
		
		let hstaff = (me.getItem(sdk.items.quest.HoradricStaff) || Quest.cubeItems(sdk.items.quest.HoradricStaff, sdk.items.quest.ShaftoftheHoradricStaff, sdk.items.quest.ViperAmulet));

		if (hstaff) {
			if (hstaff.location !== sdk.storage.Inventory) {
				!me.inTown && Town.goToTown();

				if (!Storage.Inventory.CanFit(hstaff)) {
					Town.clearJunk();
					Town.sortInventory();
				}

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

		clickItemAndWait(0, hstaff);
		submitItem();
		delay(750 + me.ping);

		// Clear cursor of staff - credit @Jaenster
		let item = me.getItemsEx().filter((el) => el.isInInventory).first();
		let _b = [item.x, item.y, item.location], x = _b[0], y = _b[1], loc = _b[2];
		clickItemAndWait(0, item);
		clickItemAndWait(0, x, y, loc);
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
		if (!me.getItem(classid)) return false;
		let questItem = me.getItem(classid);

		!me.inTown && Town.goToTown();
		Town.openStash();

		if (!Storage.Stash.CanFit(questItem)) {
			Town.sortStash(true);

			if (!Storage.Stash.CanFit(questItem)) return false;
		}

		while (questItem.location !== 7) {
			Storage.Stash.MoveTo(questItem);
			delay(1 + me.ping);

			questItem = me.getItem(classid);
		}

		return true;
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
			me.duelWielding && Item.removeItem(5);
			
			if (!Item.equip(questItem, loc)) {
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
		let tool;

		switch (classid) {
		case 404:
			tool = sdk.items.quest.KhalimsWill;

			break;
		case 376:
			tool = sdk.items.quest.HellForgeHammer;

			break;
		}

		let smashable = Game.getObject(classid);

		if (Item.getEquippedItem(4).classid !== tool || !me.getItem(tool)) return false;
		if (!smashable) return false;
		let tick = getTickCount();
		let questTool = me.getItem(tool);

		while (me.getItem(tool)) {
			smashable.distance > 4 && Pather.moveToEx(smashable.x, smashable.y, {clearSettings: {allowClearing: false}});
			Skill.cast(0, sdk.skills.hand.Right, smashable);
			smashable.interact();

			if (getTickCount() - tick > 30 * 1000) {
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

	npcAction: function (npcName, action) {
		if (!npcName || !action) return false;
		!Array.isArray(action) && (action = [action]);

		!me.inTown && Town.goToTown();
		npcName = npcName[0].toUpperCase() + npcName.substring(1).toLowerCase();
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
		case me.charlvl >= Config.respecOne && SetUp.currentBuild === "Start":
		case Config.respecOneB > 0 && me.charlvl >= Config.respecOneB && SetUp.currentBuild === "Stepping":
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
					npc && sendPacket(1, 0x38, 4, 0, 4, npc.gid, 4, 0);
				} else {
					this.npcAction("akara", [sdk.menu.Respec, sdk.menu.Ok]);
				}

				Misc.checkQuest(41, 0);
				delay(10 + me.ping * 2);

				if (me.respec || (me.getStat(sdk.stats.NewSkills) > preSkillAmount && me.getStat(sdk.stats.StatPts) > preStatAmount)) {
					myData.me.currentBuild = SetUp.getBuild();
					myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].respecUsed = true;
					CharData.updateData("me", myData);
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
			if (!item || item.mode === 3) throw new Error("Couldn't find item");
			if (!me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete)) throw new Error("Quest unavailable");
			if (item.sockets > 0 || getBaseStat("items", item.classid, "gemsockets") === 0) throw new Error("Item cannot be socketed");
			if (!Storage.Inventory.CanFit(item)) throw new Error("(useSocketQuest) No space to get item back");
			if (me.act !== 5 || !me.inTown) {
				if (!Town.goToTown(5)) throw new Error("Failed to go to act 5");
			}

			if (item.isInStash && (!Town.openStash() || !Storage.Inventory.MoveTo(item))) {
				throw new Error("Failed to move item from stash to inventory");
			}

			let invo = me.findItems(-1, 0, 3);
			let slot = item.bodylocation;
			
			// Take note of all the items in the invo minus the item to socket
			for (let i = 0; i < invo.length; i++) {
				if (item.gid !== invo[i].gid) {
					invo[i] = invo[i].x + "/" + invo[i].y;
				}
			}

			if (!this.npcAction("larzuk", 0x58DC)) throw new Error("Failed to interact with Lazruk");
			if (!getUIFlag(sdk.uiflags.SubmitItem)) throw new Error("Failed to open SubmitItem screen");
			if (!item.toCursor()) throw new Error("Couldn't get item");

			submitItem();
			delay(500 + me.ping);
			Packet.questRefresh();

			item = false; // Delete item reference, it's not longer valid anyway
			let items = me.findItems(-1, 0, 3);
				
			for (let i = 0; i < items.length; i++) {
				if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
					item = items[i];
				}
			}

			if (!item || item.sockets === 0) {
				me.itemoncursor && Storage.Stash.MoveTo(item);
				throw new Error("Failed to socket item");
			}

			Misc.logItem("Used my " + sdk.difficulty.nameOf(me.diff) + " socket quest on : ", item);
			D2Bot.printToConsole("Kolbot-SoloPlay :: Used my " + sdk.difficulty.nameOf(me.diff) + " socket quest on : " + item.name, 6);
			CharData.updateData(sdk.difficulty.nameOf(me.diff), "socketUsed", true);
			myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].socketUsed = true;
			updateMyData();

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
			if (!item || item.mode === 3) throw new Error("Couldn't find item");
			if (!Misc.checkQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete)) throw new Error("Quest unavailable");
			if (item.sockets > 0 || item.quality > 3) throw new Error("Item cannot be imbued");
			if (!Storage.Inventory.CanFit(item)) throw new Error("(useImbueQuest) No space to get item back");
			if (me.act !== 1 || !me.inTown) {
				if (!Town.goToTown(1)) throw new Error("Failed to go to act 1");
			}

			if (item.isInStash && (!Town.openStash() || !Storage.Inventory.MoveTo(item))) {
				throw new Error("Failed to move item from stash to inventory");
			}

			let invo = me.findItems(-1, 0, 3);
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
			let items = me.findItems(-1, 0, 3);
				
			for (let i = 0; i < items.length; i++) {
				if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
					item = items[i];
				}
			}

			if (!item || item.quality !== 6) {
				me.itemoncursor && Storage.Stash.MoveTo(item);
				throw new Error("Failed to imbue item");
			}

			Misc.logItem("Used my " + sdk.difficulty.nameOf(me.diff) + " imbue quest on : ", item);
			D2Bot.printToConsole("Kolbot-SoloPlay :: Used my " + sdk.difficulty.nameOf(me.diff) + " imbue quest on : " + item.name, 6);
			CharData.updateData(sdk.difficulty.nameOf(me.diff), "imbueUsed", true);
			myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].imbueUsed = true;
			updateMyData();

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
};
