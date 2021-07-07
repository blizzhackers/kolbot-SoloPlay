/*
*	@filename	Quest.js
*	@author		isid0re, theBGuy
*	@desc		Miscellaneous quest tasks for leveling adapted from blizzhackers autosmurf
*	@credits	Dark-f, JeanMax for original functions
*/

var Quest = {
	preReqs: function () {
		if (Pather.accessToAct(2) && !me.staff && !me.horadricstaff) { // horadric staff
			if (!me.amulet) {
				if (!isIncluded("SoloLeveling/Scripts/amulet.js")) {
					include("SoloLeveling/Scripts/amulet.js");
				}

				for (let getAmmy = 0; getAmmy < 5; getAmmy++) {
					amulet();

					if (me.amulet) {
						break;
					}
				}
			}

			if (!me.shaft) {
				if (!isIncluded("SoloLeveling/Scripts/staff.js")) {
					include("SoloLeveling/Scripts/staff.js");
				}

				for (let getStaff = 0; getStaff < 5; getStaff++) {
					staff();

					if (me.shaft) {
						break;
					}
				}
			}
		}

		if (Pather.accessToAct(3) && !me.travincal && !me.khalimswill) { // khalim's will
			if (!me.eye) {
				if (!isIncluded("SoloLeveling/Scripts/eye.js")) {
					include("SoloLeveling/Scripts/eye.js");
				}

				for (let getEye = 0; getEye < 5; getEye++) {
					eye();

					if (me.eye) {
						break;
					}
				}
			}

			if (!me.heart) {
				if (!isIncluded("SoloLeveling/Scripts/heart.js")) {
					include("SoloLeveling/Scripts/heart.js");
				}

				for (let getHeart = 0; getHeart < 5; getHeart++) {
					heart();

					if (me.heart) {
						break;
					}
				}
			}

			if (!me.brain) {
				if (!isIncluded("SoloLeveling/Scripts/brain.js")) {
					include("SoloLeveling/Scripts/brain.js");
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

		if (!me.inTown) {
			Town.goToTown();
		}

		if (outcome === 91) {
			me.overhead('cubing staff');
		} else if (outcome === 174) {
			me.overhead('cubing flail');
		}

		Town.doChores();
		Town.openStash();

		if (me.findItems(-1, -1, 6)) {
			Cubing.emptyCube();
		}

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
		let orifice = getUnit(2, 152);
		let hstaff = me.staff;

		if (me.horadricstaff) {
			return true;
		}

		if (!orifice) {
			return false;
		}

		if (!hstaff) {
			Quest.cubeItems(91, 92, 521);
		}

		if (hstaff) {
			if (hstaff.location !== 3) {
				if (!me.inTown) {
					Town.goToTown();
				}

				if (Storage.Inventory.CanFit(hstaff)) {
					if (hstaff.location === 6) {
						Cubing.openCube();
					}

					Storage.Inventory.MoveTo(hstaff);
				} else {
					Town.clearJunk();
					Town.sortInventory();

					if (hstaff.location === 6) {
						Cubing.openCube();
					}

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

		hstaff.toCursor();
		submitItem();
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

		if (!tyrael) {
			return false;
		}

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

		if (!me.inTown) {
			Town.goToTown();
		}

		return true;
	},

	stashItem: function (classid) {
		if (!me.getItem(classid)) {
			return false;
		}

		if (!me.inTown) {
			Town.goToTown();
		}

		let questItem = me.getItem(classid);
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
		if (me.getItem(classid)) {
			return true;
		}

		if (chestID !== undefined) {
			let chest = getUnit(2, chestID);

			if (!chest) {
				return false;
			}

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
			Town.clearJunk();
			Town.sortInventory();
			Pickit.pickItem(questItem);
			Pickit.pickItems();
		}

		return me.getItem(classid);
	},

	equipItem: function (item, loc) {
		let newitem = me.getItem(item);
		me.cancel();

		if (newitem) {
			if (newitem.location === 7) {
				Town.move("stash");
				delay(250 + me.ping);
				Town.openStash();
				Storage.Inventory.MoveTo(newitem);
				me.cancel();
			}

			if (!Item.equip(newitem, loc)) {
				Pickit.pickItems();
				print("ÿc9SoloLevelingÿc0: failed to equip item.(Quest.equipItem)");
			}
		} else {
			print("ÿc9SoloLevelingÿc0: Lost item before trying to equip it. (Quest.equipItem)");
		}

		if (me.itemoncursor) {
			let olditem = getUnit(100);

			if (olditem) {
				if (Storage.Inventory.CanFit(olditem)) {
					print("ÿc9SoloLevelingÿc0: Keeping weapon");

					Storage.Inventory.MoveTo(olditem);
				} else {
					me.cancel();
					print("ÿc9SoloLevelingÿc0: No room to keep weapon");

					olditem.drop();
				}
			}
		}

		delay(750 + me.ping);

		return true;
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

	characterRespec: function () {// Akara reset for build change
		if (me.respec || SetUp.currentBuild === SetUp.finalBuild) {
			return true;
		}

		if (me.charlvl === SetUp.respecOne || me.charlvl === SetUp.respecTwo()) {
			Precast.doPrecast(true);
			Town.goToTown(1);
			me.overhead('time to respec');
			Town.npcInteract("akara");
			delay(10 + me.ping * 2);

			if (!Misc.useMenu(0x2ba0) || !Misc.useMenu(3401)) {
				return false;
			}

			DataFile.updateStats("currentBuild", SetUp.getBuild());

			delay(750 + me.ping * 2);
			Town.clearBelt();
			delay(250 + me.ping);
			let script = getScript("default.dbj");
			script.stop();
			load("default.dbj");
			Item.autoEquip();
		}

		return true;
	},

	//Credit dzik or laz unsure who for this
	useSocketQuest: function (item) {
		var larzuk, slot, invo, i, items;

		if (SetUp.finalBuild === "Socketmule") {
			print("ÿc9GuysSoloLevelingÿc0: Socketmules cannot use their socket quest");
			return false;
		}
			
		if (!item || item === undefined || item.mode === 3) { //No item
			print("ÿc9GuysSoloLevelingÿc0: No item");
			return false;
		}
			
		if (!me.getQuest(35, 1)) { //Quest not available
			print("ÿc9GuysSoloLevelingÿc0: Quest unavailable");
			return false;
		}
			
		if (item.getStat(194) > 0 || getBaseStat("items", item.classid, "gemsockets") === 0) { //Item can't be socketed
			print("ÿc9GuysSoloLevelingÿc0: Item cannot be socketed");
			return false;
		}
			
		if (!isIncluded("common/Storage.js")) {
			include("common/Storage.js");
		}
			
		if (!isIncluded("common/Town.js")) {
			include("common/Town.js");
		}
			
		if (!Storage.Inventory.CanFit(item)) { //No space to get the item back
			print("ÿc9GuysSoloLevelingÿc0: No space to get item back");
			return false;
		}
			
		if (me.act !== 5 || !me.inTown) {
			if (!Town.goToTown(5)) {
				print("ÿc9GuysSoloLevelingÿc0:Failed to go to act 5");
				return false;
			}
		}
			
		if (item.location === 7) {
			Town.openStash();

			if (!Storage.Inventory.MoveTo(item)) {
				print("ÿc9GuysSoloLevelingÿc0: Failed to move item from stash to inventory");
				return false;
			}

			me.cancel;
		}
			
		invo = me.findItems(-1, 0, 3);
		slot = item.bodylocation;
			
		for (i = 0; i < invo.length; i++) { //Take note of all the items in the invo minus the item to socket
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
			print("ÿc9GuysSoloLevelingÿc0: Couldn't find larzuk");
			return false;
		}			

		Town.npcInteract("larzuk");
		delay(10 + me.ping * 2);

		if (!Misc.useMenu(0x58DC)) {
			return false;
		}

		if (!item.toCursor()) {
			print("ÿc9GuysSoloLevelingÿc0: Couldn't get item");
			return false;
		}
			
		//sendPacket(1, 0x38, 4, 0x00, 4, larzuk.gid, 4, item.gid);
		submitItem();
		delay(500 + me.ping);
		sendPacket(1, 0x40);
			
		item = false; //Delete item reference, it's not longer valid anyway
		items = me.findItems(-1, 0, 3);
			
		for (i = 0; i < items.length; i++) {
			if (invo.indexOf(items[i].x + "/" + items[i].y) === -1) {
				item = items[i];
			}
		}
			
		if (!item || item.getStat(194) === 0) {
			if (me.itemoncursor) {
				Storage.Stash.MoveTo(item);
			}

			print("Failed to socket item");
			return false;
		}

		let diffSting = ['Normal', 'Nightmare', 'Hell'][me.diff];	
		Misc.logItem("Used my " + diffSting + " socket quest on : ", item);

		if (!slot && item.location !== 7) {	
			if (Storage.Stash.CanFit(item)) { //move item back to stash
				Town.move('stash');
				Storage.Stash.MoveTo(item);
				me.cancel;
			}
		}

		if (slot) {
			Item.equip(item, slot);
		}
		
		return true;
	},

	//Credit whoever did useSocketQuest, I modified that to come up with this
	useImbueQuest: function (item) {
		var charsi, slot, invo, i, items;
			
		if (!item || item === undefined || item.mode === 3) { //No item
			print("ÿc9GuysSoloLevelingÿc0: No item");
			return false;
		}
			
		if (!Misc.checkQuest(3, 1)) { //Quest not available
			print("ÿc9GuysSoloLevelingÿc0: Quest not done yet");
			return false;
		}
			
		if (item.getStat(194) > 0 || item.quality > 3) { //Item can't be imbued
			print("ÿc9GuysSoloLevelingÿc0:Item cannot be imbued");
			return false;
		}
			
		if (!isIncluded("common/Storage.js")) {
			include("common/Storage.js");
		}
			
		if (!isIncluded("common/Town.js")) {
			include("common/Town.js");
		}
			
		if (!Storage.Inventory.CanFit(item)) { //No space to get the item back
			print("ÿc9GuysSoloLevelingÿc0: No space to get item back");
			return false;
		}
			
		if (me.act !== 1 || !me.inTown) {
			if (!Town.goToTown(1)) {
				print("ÿc9GuysSoloLevelingÿc0: Failed to go to act 1");
				return false;
			}
		}
			
		if (item.location === 7) {
			Town.openStash();

			if (!Storage.Inventory.MoveTo(item)) {
				print("ÿc9GuysSoloLevelingÿc0: Failed to move item from stash to inventory");
				return false;
			}
		}
			
		invo = me.findItems(-1, 0, 3);
		slot = item.bodylocation;
			
		for (i = 0; i < invo.length; i++) { //Take note of all the items in the invo minus the item to imbue
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
			print("ÿc9GuysSoloLevelingÿc0: Couldn't find charsi");
			return false;
		}

		Town.npcInteract("charsi");
		delay(10 + me.ping * 2);

		if (!Misc.useMenu(4017)) {
			return false;
		}

		if (!item.toCursor()) {
			print("ÿc9GuysSoloLevelingÿc0: Couldn't get item");
			return false;
		}
		
		submitItem();
		//sendPacket(1, 0x38, 4, 0x00, 4, charsi.gid, 4, item.gid);
		delay(500 + me.ping);
		sendPacket(1, 0x40);
			
		item = false; //Delete item reference, it's not longer valid anyway
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

		let diffSting = ['Normal', 'Nightmare', 'Hell'][me.diff];	
		Misc.logItem("Used my " + diffSting + " imbue quest on : ", item);

		if (!slot && item.location !== 7) {	
			if (Storage.Stash.CanFit(item)) { //move item back to stash
				Town.move('stash');
				Storage.Stash.MoveTo(item);
				me.cancel;
			}
		}

		if (slot) {
			Item.equip(item, slot);
		}
		
		return true;
	},
};
