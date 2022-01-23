/*
*	@filename	Quest.js
*	@author		isid0re, theBGuy
*	@desc		Miscellaneous quest tasks for leveling adapted from blizzhackers autosmurf
*	@credits	Dark-f, JeanMax for original functions
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
		if (me.getItem(outcome) || outcome === 91 && me.horadricstaff || outcome === 174 && me.travincal) {
			return true;
		}

		!me.inTown && Town.goToTown();
		outcome === 91 ? me.overhead('cubing staff') : outcome === 174 ? me.overhead('cubing flail') : me.overhead('cubing ' + outcome);

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

		return me.getItem(outcome);
	},

	placeStaff: function () {
		let tick = getTickCount();
		let orifice = Misc.poll(function () { return getUnit(sdk.unittype.Object, sdk.units.HoradricStaffHolder); });
		let hstaff = me.getItem(sdk.items.quest.HoradricStaff);

		if (me.horadricstaff) return true;
		if (!orifice) return false;

		if (!hstaff) {
			hstaff = Quest.cubeItems(sdk.items.quest.HoradricStaff, sdk.items.quest.ShaftoftheHoradricStaff, sdk.items.quest.ViperAmulet);
		}

		if (hstaff) {
			if (hstaff.location !== sdk.storage.Inventory) {
				!me.inTown && Town.goToTown();

				if (Storage.Inventory.CanFit(hstaff)) {
					hstaff.isInCube && Cubing.openCube();
					Storage.Inventory.MoveTo(hstaff);

				} else {
					Town.clearJunk();
					Town.sortInventory();
					hstaff.isInCube && Cubing.openCube();
					Storage.Inventory.MoveTo(hstaff);
				}

				me.cancel();
				Pather.usePortal(null, me.name);
			}
		}

		Pather.moveToPreset(me.area, 2, 152);
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
		let item = (me.getItems() || []).filter(function (el) { return el.isInInventory; }).first();
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

		let tyrael = getUnit(1, NPC.Tyrael);

		if (!tyrael) return false;

		for (let talk = 0; talk < 3; talk += 1) {
			if (getDistance(me, tyrael) > 3) {
				Pather.moveToUnit(tyrael);
			}

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
		Town.move("stash");
		Town.openStash();

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
			let chest = getUnit(2, chestID);
			if (!chest) return false;
			Misc.openChest(chest);

		}

		let questItem;
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			questItem = getUnit(4, classid);

			if (questItem) {
				break;
			}

			delay(100 + me.ping);
		}

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
				print("ÿc8Kolbot-SoloPlayÿc0: failed to equip " + classid + " .(Quest.equipItem)");
			}
		} else {
			print("ÿc8Kolbot-SoloPlayÿc0: Lost " + classid + " before trying to equip it. (Quest.equipItem)");
			return false;
		}

		if (me.itemoncursor) {
			let olditem = getUnit(100);

			if (olditem) {
				if (Storage.Inventory.CanFit(olditem)) {
					print("ÿc8Kolbot-SoloPlayÿc0: Keeping weapon");

					Storage.Inventory.MoveTo(olditem);
				} else {
					me.cancel();
					print("ÿc8Kolbot-SoloPlayÿc0: No room to keep weapon");

					olditem.drop();
				}
			}
		}

		me.cancelUIFlags();

		return questItem.bodylocation === loc;
	},

	smashSomething: function (smashable) {
		let something, tool;

		switch (smashable) {
		case 404:
			something = getUnit(2, 404);
			tool = 174;

			break;
		case 376:
			something = getUnit(2, 376);
			tool = 90;

			break;
		}

		if (Item.getEquippedItem(4).classid !== tool) {
			return false;
		}

		while (me.getItem(tool)) {
			Pather.moveToUnit(something, 0, 0, Config.ClearType, false);
			Skill.cast(0, 0, something);
			something.interact();

			delay(750 + me.ping);
		}

		return !me.getItem(tool);
	},

	// Akara reset for build change
	characterRespec: function () {
		if (me.respec || SetUp.currentBuild === SetUp.finalBuild) return true;

		if ((me.charlvl >= Config.respecOne && SetUp.currentBuild === "Start") || (Config.respecOneB > 0 && me.charlvl === Config.respecOneB) || me.charlvl === SetUp.respecTwo()) {
			if (!me.den) {
				print("ÿc8Kolbot-SoloPlayÿc0: time to respec, but den is incomplete");
				me.overhead('time to respec, but den is incomplete');
				return false;
			}

			let preSkillAmount = me.getStat(sdk.stats.NewSkills);
			let preStatAmount = me.getStat(sdk.stats.StatPts);
			Precast.doPrecast(true);
			Town.goToTown(1);
			myPrint("time to respec");
			Town.npcInteract("akara");
			delay(10 + me.ping * 2);

			if (!Misc.useMenu(0x2ba0) || !Misc.useMenu(3401)) return false;

			sendPacket(1, 0x40);
			delay(10 + me.ping * 2);

			if (me.respec || (me.getStat(sdk.stats.NewSkills) > preSkillAmount && me.getStat(sdk.stats.StatPts) > preStatAmount)) {
				myData.me.currentBuild = SetUp.getBuild();
				myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].respecUsed = true;
				SoloData.updateData("me", myData);
				delay(750 + me.ping * 2);
				Town.clearBelt();
				myPrint("respec done, restarting");
				delay(1000 + me.ping);
				scriptBroadcast("quit");
			}
		}

		return true;
	},

	// Credit dzik or laz unsure who for this
	useSocketQuest: function (item = undefined) {
		let larzuk, slot, invo, i, items;

		//print("ÿc8Kolbot-SoloPlayÿc0: Socketmules cannot use their socket quest");
		if (SetUp.finalBuild === "Socketmule") return false;
		
		// No item, or item is on the ground
		if (!item || item.mode === 3) {
			print("ÿc8Kolbot-SoloPlayÿc0: No item");
			return false;
		}
		
		// Socket Quest unavailable
		if (!me.getQuest(35, 1)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Quest unavailable");
			return false;
		}
		
		// Item can't be socketed
		if (item.getStat(194) > 0 || getBaseStat("items", item.classid, "gemsockets") === 0) {
			print("ÿc8Kolbot-SoloPlayÿc0: Item cannot be socketed");
			return false;
		}
		
		// No space to get the item back
		if (!Storage.Inventory.CanFit(item)) {
			print("ÿc8Kolbot-SoloPlayÿc0: (useSocketQuest) No space to get item back");
			return false;
		}
			
		if (me.act !== 5 || !me.inTown) {
			if (!Town.goToTown(5)) {
				print("ÿc8Kolbot-SoloPlayÿc0:Failed to go to act 5");
				return false;
			}
		}
			
		if (item.isInStash) {
			Town.openStash();

			if (!Storage.Inventory.MoveTo(item)) {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to move item from stash to inventory");
				return false;
			}

			me.cancel();
		}
			
		invo = me.findItems(-1, 0, 3);
		slot = item.bodylocation;
		
		// Take note of all the items in the invo minus the item to socket
		for (i = 0; i < invo.length; i++) {
			if (item.gid !== invo[i].gid) {
				invo[i] = invo[i].x + "/" + invo[i].y;
			}
		}
			
		for (i = 0; i < 3; i++) {
			larzuk = getUnit(1, "Larzuk");
				
			if (larzuk) {
				break;
			} else {
				Town.move("stash");
			}
		}
			
		if (!larzuk) {
			print("ÿc8Kolbot-SoloPlayÿc0: Couldn't find larzuk");
			return false;
		}

		Town.npcInteract("larzuk");
		delay(10 + me.ping * 2);

		if (!Misc.useMenu(0x58DC)) return false;

		if (!getUIFlag(sdk.uiflags.SubmitItem)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to open SubmitItem screen");
			return false;
		}

		if (!item.toCursor()) {
			print("ÿc8Kolbot-SoloPlayÿc0: Couldn't get item");
			return false;
		}
		
		submitItem();
		delay(500 + me.ping);
		sendPacket(1, 0x40);
			
		item = false; // Delete item reference, it's not longer valid anyway
		items = me.findItems(-1, 0, 3);
			
		for (i = 0; i < items.length; i++) {
			if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
				item = items[i];
			}
		}
			
		if (!item || item.getStat(194) === 0) {
			me.itemoncursor && Storage.Stash.MoveTo(item);
			print("Failed to socket item");

			return false;
		}

		Misc.logItem("Used my " + sdk.difficulty.nameOf(me.diff) + " socket quest on : ", item);
		D2Bot.printToConsole("Kolbot-SoloPlay :: Used my " + sdk.difficulty.nameOf(me.diff) + " socket quest on : " + item.name, 6);
		SoloData.updateData(sdk.difficulty.nameOf(me.diff), "socketUsed", true);
		myData[sdk.difficulty.nameOf(me.diff).toLowerCase()]["socketUsed"] = true;
		updateMyData();

		if (!slot && item.location !== 7) {
			// Move item back to stash
			if (Storage.Stash.CanFit(item)) {
				Town.move('stash');
				Storage.Stash.MoveTo(item);
				me.cancel();
			}
		}

		slot && Item.equip(item, slot);
		
		return true;
	},

	// Credit whoever did useSocketQuest, I modified that to come up with this
	useImbueQuest: function (item = undefined) {
		let charsi, slot, invo, i, items;
		
		// No item, or item is on the ground
		if (!item || item.mode === 3) {
			print("ÿc8Kolbot-SoloPlayÿc0: No item");
			return false;
		}
		
		// Imbue not available
		if (!Misc.checkQuest(3, 1)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Quest not done yet");
			return false;
		}
		
		// Item can't be imbued
		if (item.getStat(194) > 0 || item.quality > 3) {
			print("ÿc8Kolbot-SoloPlayÿc0:Item cannot be imbued");
			return false;
		}
		
		// No space to get the item back	
		if (!Storage.Inventory.CanFit(item)) {
			print("ÿc8Kolbot-SoloPlayÿc0: (useImbueQuest) No space to get item back");
			return false;
		}
			
		if (me.act !== 1 || !me.inTown) {
			if (!Town.goToTown(1)) {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to go to act 1");
				return false;
			}
		}
			
		if (item.isInStash) {
			Town.openStash();

			if (!Storage.Inventory.MoveTo(item)) {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to move item from stash to inventory");
				return false;
			}
		}
			
		invo = me.findItems(-1, 0, 3);
		slot = item.bodylocation;
		
		// Take note of all the items in the invo minus the item to imbue
		for (i = 0; i < invo.length; i++) {
			if (item.gid !== invo[i].gid) {
				invo[i] = invo[i].x + "/" + invo[i].y;
			}
		}
			
		for (i = 0; i < 3; i++) {
			charsi = getUnit(1, NPC.Charsi);
				
			if (charsi) {
				break;
			} else {
				Town.move("stash");
			}
		}
			
		if (!charsi) {
			print("ÿc8Kolbot-SoloPlayÿc0: Couldn't find charsi");
			return false;
		}

		Town.npcInteract("charsi");
		delay(10 + me.ping * 2);

		if (!Misc.useMenu(0x0FB1)) return false;

		if (!getUIFlag(sdk.uiflags.SubmitItem)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to open SubmitItem screen");
			return false;
		}

		if (!item.toCursor()) {
			print("ÿc8Kolbot-SoloPlayÿc0: Couldn't get item");
			return false;
		}
		
		submitItem();
		delay(500 + me.ping);
		sendPacket(1, 0x40);
			
		item = false; // Delete item reference, it's not longer valid anyway
		items = me.findItems(-1, 0, 3);
			
		for (i = 0; i < items.length; i++) {
			if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
				item = items[i];
			}
		}
			
		if (!item || item.quality !== 6) {
			print("Failed to imbue item");
			return false;
		}

		Misc.logItem("Used my " + sdk.difficulty.nameOf(me.diff) + " imbue quest on : ", item);
		D2Bot.printToConsole("Kolbot-SoloPlay :: Used my " + sdk.difficulty.nameOf(me.diff) + " imbue quest on : " + item.name, 6);
		SoloData.updateData(sdk.difficulty.nameOf(me.diff), "imbueUsed", true);
		myData[sdk.difficulty.nameOf(me.diff).toLowerCase()]["imbueUsed"] = true;
		updateMyData();

		if (!slot && item.location !== 7) {
			// Move item back to stash
			if (Storage.Stash.CanFit(item)) {
				Town.move('stash');
				Storage.Stash.MoveTo(item);
				me.cancel();
			}
		}

		slot && Item.equip(item, slot);
		
		return true;
	},
};
