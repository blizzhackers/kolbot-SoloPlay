/*
*	@filename	StorageOverrides.js
*	@author		theBGuy, isid0re (added sorting via packets)
*	@desc		adaptation of sorting code pull request to blizzhackers for Kolbot-SoloPlay
*				https://github.com/blizzhackers/kolbot/pull/211/commits/b3c6838f0b8873ac9f1e3ac5ef859a0c9d6ea098#diff-3d38e3e851d831e9c3793584659cb39bf05b86a0e177002276a9ed91fc19027e
*	@credits	esd1 (sort items author), McGod (original storage.js author), kolton (small kolbot related edits), AimtoKill (compatibility testing)
*/

!isIncluded("SoloPlay/Tools/Developer.js") && include("SoloPlay/Tools/Developer.js");

let Container = function (name, width, height, location) {
	this.name = name;
	this.width = width;
	this.height = height;
	this.location = location;
	this.buffer = [];
	this.itemList = [];
	this.openPositions = this.height * this.width;

	// Initalize the buffer array for use, set all as empty.
	for (let h = 0; h < this.height; h += 1) {
		this.buffer.push([]);

		for (let w = 0; w < this.width; w += 1) {
			this.buffer[h][w] = 0;
		}
	}

	this.Mark = function (item) {
		// Make sure it is in this container.
		if (item.location !== this.location || (item.mode !== sdk.itemmode.inStorage && item.mode !== sdk.itemmode.inBelt)) {
			return false;
		}

		// Mark item in buffer.
		for (let x = item.x; x < (item.x + item.sizex); x += 1) {
			for (let y = item.y; y < (item.y + item.sizey); y += 1) {
				this.buffer[y][x] = this.itemList.length + 1;
				this.openPositions -= 1;
			}
		}

		// Add item to list.
		this.itemList.push(copyUnit(item));

		return true;
	};

	this.IsLocked = function (item, baseRef) {
		let reference = baseRef.slice(0);

		// Make sure it is in this container.
		if (item.mode !== 0 || item.location !== this.location) return false;

		// Make sure the item is ours
		if (!item.getParent() || item.getParent().type !== me.type || item.getParent().gid !== me.gid) return false;

		//Insure valid reference.
		if (typeof (reference) !== "object" || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
			throw new Error("Storage.IsLocked: Invalid inventory reference");
		}

		try {
			// Check if the item lies in a locked spot.
			for (let h = item.y; h < (item.y + item.sizey); h += 1) {
				for (let w = item.x; w < (item.x + item.sizex); w += 1) {
					if (reference[h][w] === 0) return true;
				}
			}
		} catch (e2) {
			throw new Error("Storage.IsLocked error! Item info: " + item.name + " " + item.y + " " + item.sizey + " " + item.x + " " + item.sizex + " " + item.mode + " " + item.location);
		}

		return false;
	};

	this.Reset = function () {
		for (let h = 0; h < this.height; h += 1) {
			for (let w = 0; w < this.width; w += 1) {
				this.buffer[h][w] = 0;
			}
		}

		this.itemList = [];
		this.openPositions = this.height * this.width;

		return true;
	};

	this.cubeSpot = function (name) {
		if (name !== "Stash") return true;

		let cube = me.getItem(sdk.items.quest.Cube);

		if (!cube) return false;

		// Cube is in correct location
		if (cube && cube.isInStash && cube.x === 0 && cube.y === 0) return true;

		let makeCubeSpot = this.MakeSpot(cube, {x: 0, y: 0}, true); // NOTE: passing these in buffer order [h/x][w/y]

		if (makeCubeSpot) {
			// this item cannot be moved
			if (makeCubeSpot === -1) return false;

			// we couldnt move the item
			if (!this.MoveToSpot(cube, makeCubeSpot.y, makeCubeSpot.x)) return false;
		}

		return true;
	};

	this.CanFit = function (item) {
		return (!!this.FindSpot(item));
	};

	this.SortItems = function (itemIdsLeft, itemIdsRight) {
		Storage.Reload();

		this.cubeSpot(this.name);

		let nPos;

		for (let y = this.width - 1 ; y >= 0 ; y--) {
			for (let x = this.height - 1 ; x >= 0 ; x--) {
				delay(1);

				// nothing on this spot
				if (this.buffer[x][y] === 0) {
					continue;
				}

				let item = this.itemList[this.buffer[x][y] - 1];

				// dont touch the cube
				if (item.classid === sdk.items.quest.Cube && item.isInStash && item.x === 0 && item.y === 0) {
					continue;
				}

				let ix = item.y, iy = item.x; // x and y are backwards!

				// dont try to touch non-storage items | TODO: prevent non-storage items from getting this far
				if (this.location !== item.location) {
					D2Bot.printToConsole("StorageOverrides.js>SortItems WARNING: Detected a non-storage item in the list: " + item.name + " at " + ix + "," + iy, 6);
					continue;
				}

				// locked spot / item
				if (this.location === 3 && this.IsLocked(item, Config.Inventory)) {
					continue;
				}

				// not top left part of item
				if (ix < x || iy < y) {
					continue;
				}

				// dont try to touch non-items | TODO: prevent non-items from getting this far
				if (item.type !== 4) {
					D2Bot.printToConsole("StorageOverrides.js>SortItems WARNING: Detected a non-item in the list: " + item.name + " at " + ix + "," + iy, 6);
					continue;
				}

				// dont try to touch ground items | TODO: prevent ground items from getting this far
				if (item.mode === 3) {
					D2Bot.printToConsole("StorageOverrides.js>SortItems WARNING: Detected a ground item in the list: " + item.name + " at " + ix + "," + iy, 6);
					continue;
				}

				// always sort stash left-to-right
				if (this.location === 7) {
					nPos = this.FindSpot(item);
				} else if (this.location === 3 && ((!itemIdsLeft && !itemIdsRight) || !itemIdsLeft || itemIdsRight.indexOf(item.classid) > -1 || itemIdsLeft.indexOf(item.classid) === -1)) {
					// sort from right by default or if specified
					nPos = this.FindSpot(item, true, false, SetUp.sortSettings.ItemsSortedFromRightPriority);
				} else if (this.location === 3 && itemIdsRight.indexOf(item.classid) === -1 && itemIdsLeft.indexOf(item.classid) > -1) {
					// sort from left only if specified
					nPos = this.FindSpot(item, false, false, SetUp.sortSettings.ItemsSortedFromLeftPriority);
				}

				// skip if no better spot found
				if (!nPos || (nPos.x === ix && nPos.y === iy)) {
					continue;
				}

				// we couldnt move the item
				if (!this.MoveToSpot(item, nPos.y, nPos.x)) {
					continue;
				}

				// We moved an item so reload & restart
				Storage.Reload();
				y = this.width - 0;
				break; // Loop again from begin
			}
		}

		//this.Dump();

		return true;
	};

	this.FindSpot = function (item, reverseX, reverseY, priorityClassIds) {
		let makeSpot,
			xDir = 1, yDir = 1;

		// Make sure it's a valid item
		if (!item) return false;

		let startX = 0;
		let startY = 0;
		let endX = this.width - (item.sizex - 1);
		let endY = this.height - (item.sizey - 1);

		Storage.Reload();

		if (reverseX) { // right-to-left
			startX = endX - 1;
			endX = -1; // stops at 0
			xDir = -1;
		}

		if (reverseY) { // bottom-to-top
			startY = endY - 1;
			endY = -1; // stops at 0
			yDir = -1;
		}

		//Loop buffer looking for spot to place item.
		for (let y = startX; y !== endX; y += xDir) {
			Loop:
			for (let x = startY; x !== endY; x += yDir) {
				//Check if there is something in this spot.
				if (this.buffer[x][y] > 0) {

					// TODO: add makespot logic here. priorityClassIds should only be used when sorting -- in town, where it's safe!
					// TODO: collapse this down to just a MakeSpot(item, location) call, and have MakeSpot do the priority checks right at the top
					let bufferItemClass = this.itemList[this.buffer[x][y] - 1].classid;
					let bufferItemGfx = this.itemList[this.buffer[x][y] - 1].gfx;
					let bufferItemQuality = this.itemList[this.buffer[x][y] - 1].quality;

					if (SetUp.sortSettings.PrioritySorting && priorityClassIds && priorityClassIds.indexOf(item.classid) > -1
						&& !this.IsLocked(this.itemList[this.buffer[x][y] - 1], Config.Inventory) // don't try to make a spot by moving locked items! TODO: move this to the start of loop
						&& (priorityClassIds.indexOf(bufferItemClass) === -1
						|| priorityClassIds.indexOf(item.classid) < priorityClassIds.indexOf(bufferItemClass))) { // item in this spot needs to move!
						makeSpot = this.MakeSpot(item, {x: x, y: y}); // NOTE: passing these in buffer order [h/x][w/y]

						if (item.classid !== bufferItemClass // higher priority item
							|| (item.classid === bufferItemClass && item.quality > bufferItemQuality) // same class, higher quality item
							|| (item.classid === bufferItemClass && item.quality === bufferItemQuality && item.gfx > bufferItemGfx) // same quality, higher graphic item
							|| (Config.AutoEquip && item.classid === bufferItemClass && item.quality === bufferItemQuality && item.gfx === bufferItemGfx // same graphic, higher tier item
								&& NTIP.GetTier(item) > NTIP.GetTier(this.itemList[this.buffer[x][y] - 1]))) {
							makeSpot = this.MakeSpot(item, {x: x, y: y}); // NOTE: passing these in buffer order [h/x][w/y]

							if (makeSpot) {
								// makeSpot === -1 => this item cannot be moved
								return makeSpot === -1 ? false : makeSpot;
							}
						}
					}

					if (item.gid === undefined) return false;

					// ignore same gid
					if (item.gid !== this.itemList[this.buffer[x][y] - 1].gid) {
						continue;
					}
				}

				//Loop the item size to make sure we can fit it.
				for (let nx = 0; nx < item.sizey; nx += 1) {
					for (let ny = 0; ny < item.sizex; ny += 1) {
						if (this.buffer[x + nx][y + ny]) {
							// ignore same gid
							if (item.gid !== this.itemList[this.buffer[x + nx][y + ny] - 1].gid) {
								continue Loop;
							}
						}
					}
				}

				return ({x: x, y: y});
			}
		}

		return false;
	};

	this.MakeSpot = function (item, location, force) {
		let tmpLocation,
			itemsToMove = [],
			itemsMoved = [];
		// TODO: test the scenario where all possible items have been moved, but this item still can't be placed
		//		 e.g. if there are many LCs in an inventory and the spot for a GC can't be freed up without
		//			  moving other items that ARE NOT part of the position desired

		// Make sure it's a valid item and item is in a priority sorting list
		if (!item || !item.classid
			|| (SetUp.sortSettings.ItemsSortedFromRightPriority.indexOf(item.classid) === -1
			&& SetUp.sortSettings.ItemsSortedFromLeftPriority.indexOf(item.classid) === -1
			&& !force)) {
			return false; // only continue if the item is in the priority sort list
		}

		// Make sure the item could even fit at the desired location
		if (!location
			|| ((location.y + (item.sizex - 1)) > (this.width - 1))
			|| ((location.x + (item.sizey - 1)) > (this.height - 1))) {
			return false; // location invalid or item could not ever fit in the location
		}

		Storage.Reload();

		// Do not continue if the container doesn't have enough openPositions.
		// TODO: esd1 - this could be extended to use Stash for moving things if inventory is too tightly packed
		if (item.sizex * item.sizey > this.openPositions) return -1; // return a non-false answer to FindSpot so it doesn't keep looking

		let endy = location.y + (item.sizex - 1);
		let endx = location.x + (item.sizey - 1);

		// Collect a list of all the items in the way of using this position
		// item height
		for (let x = location.x; x <= endx; x += 1) {
			// item width
			for (let y = location.y; y <= endy; y += 1) {
				if (this.buffer[x][y] === 0 ) {
					continue; // nothing to move from this spot
				} else if (item.gid === this.itemList[this.buffer[x][y] - 1].gid) {
					continue; // ignore same gid
				} else {
					itemsToMove.push(copyUnit(this.itemList[this.buffer[x][y] - 1])); // track items that need to move
				}
			}
		}

		// Move any item(s) out of the way
		if (itemsToMove) {
			for (let i = 0; i < itemsToMove.length; i++) {
				let reverseX = !(SetUp.sortSettings.ItemsSortedFromRight.indexOf(item.classid) > -1);
				tmpLocation = this.FindSpot(itemsToMove[i], reverseX, false);
				// D2Bot.printToConsole(itemsToMove[i].name + " moving from " + itemsToMove[i].x + "," + itemsToMove[i].y + " to "  + tmpLocation.y + "," + tmpLocation.x, 6);

				if (this.MoveToSpot(itemsToMove[i], tmpLocation.y, tmpLocation.x)) {
					// D2Bot.printToConsole(itemsToMove[i].name + " moved to " + tmpLocation.y + "," + tmpLocation.x, 6);
					itemsMoved.push(copyUnit(itemsToMove[i]));
					Storage.Reload(); // success on this item, reload!
					delay(1); // give reload a moment of time to avoid moving the same item twice
				} else {
					D2Bot.printToConsole(itemsToMove[i].name + " failed to move to " + tmpLocation.y + "," + tmpLocation.x, 6);

					return false;
				}
			}
		}

		//D2Bot.printToConsole("MakeSpot success! " + item.name + " can now be placed at " + location.y + "," + location.x, 6);
		return ({x: location.x, y: location.y});
	};

	this.MoveToSpot = function (item, x, y) {
		// Cube -> Stash, must place item in inventory first
		if (item.location === 6 && this.location === 7 && !Storage.Inventory.MoveTo(item)) return false;

		// Can't deal with items on ground!
		if (item.mode === 3) return false;

		// Item already on the cursor.
		if (me.itemoncursor && item.mode !== 4) return false;

		//Make sure stash is open
		if (this.location === 7 && !Town.openStash()) return false;

		if (Packet.itemToCursor(item)) {
			for (let n = 0; n < 5; n += 1) {
				let cItem;

				switch (this.location) {
				case sdk.storage.Belt:
					cItem = getUnit(100);
					cItem !== null && sendPacket(1, 0x23, 4, cItem.gid, 4, y);

					break;
				case sdk.storage.Inventory:
					sendPacket(1, 0x18, 4, item.gid, 4, x, 4, y, 4, 0x00);

					break;
				case sdk.storage.Cube:
					cItem = getUnit(100);
					let cube = me.getItem(sdk.items.quest.Cube);
					cItem !== null && cube !== null && sendPacket(1, 0x2a, 4, cItem.gid, 4, cube.gid);

					break;
				case sdk.storage.Stash:
					sendPacket(1, 0x18, 4, item.gid, 4, x, 4, y, 4, 0x04);

					break;
				default:
					clickItemAndWait(0, x, y, this.location);

					break;
				}

				let nDelay = getTickCount();

				while ((getTickCount() - nDelay) < Math.max(1000, me.ping * 2 + 200)) {
					if (!me.itemoncursor) return true;

					delay(10 + me.ping);
				}
			}
		}

		return false;
	};

	this.MoveTo = function (item) {
		try {
			//Can we even fit it in here?
			let nPos = this.FindSpot(item);

			if (!nPos) return false;

			return this.MoveToSpot(item, nPos.y, nPos.x);
		} catch (e) {
			console.warn("Storage.Container.MoveTo caught error : " + e + " - " + e.toSource());

			return false;
		}
	};

	this.Dump = function () {
		if (this.UsedSpacePercent() > 60) {
			for (let x = 0; x < this.height; x += 1) {
				let string = "";

				for (let y = 0; y < this.width; y += 1) {
					string += (this.buffer[x][y] > 0) ? "ÿc1x" : "ÿc0o";
				}

				console.log(string);
			}
		}

		console.log("ÿc9SoloPlayÿc0: " + this.name + " has used " + this.UsedSpacePercent().toFixed(2) + "% of its total space");
	};

	this.UsedSpacePercent = function () {
		let usedSpace = 0,
			totalSpace = this.height * this.width;

		Storage.Reload();

		for (let x = 0; x < this.height; x += 1) {
			for (let y = 0; y < this.width; y += 1) {
				if (this.buffer[x][y] > 0) {
					usedSpace += 1;
				}
			}
		}

		return usedSpace * 100 / totalSpace;
	};

	this.Compare = function (baseRef) {
		Storage.Reload();

		try {
			let itemList = [];
			let reference = baseRef.slice(0, baseRef.length);

			// Insure valid reference.
			if (typeof (reference) !== "object" || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
				throw new Error("Unable to compare different containers.");
			}

			for (let h = 0; h < this.height; h += 1) {
				Loop:
				for (let w = 0; w < this.width; w += 1) {
					let item = this.itemList[this.buffer[h][w] - 1];

					if (!item) {
						continue;
					}

					for (let n = 0; n < itemList.length; n += 1) {
						if (itemList[n].gid === item.gid) {
							continue Loop;
						}
					}

					//Check if the buffers changed and the current buffer has an item there.
					if (this.buffer[h][w] > 0 && reference[h][w] > 0) {
						itemList.push(copyUnit(item));
					}
				}
			}

			return itemList;
		} catch (e) {
			return false;
		}
	};

	this.toSource = function () {
		return this.buffer.toSource();
	};
};

let Storage = new function () {
	this.Init = function () {
		this.StashY = me.gametype === 0 ? 4 : Developer.plugyMode ? 10 : 8;
		this.Inventory = new Container("Inventory", 10, 4, 3);
		this.TradeScreen = new Container("Inventory", 10, 4, 5);
		this.Stash = new Container("Stash", (Developer.plugyMode ? 10 : 6), this.StashY, 7);
		this.Belt = new Container("Belt", 4 * this.BeltSize(), 1, 2);
		this.Cube = new Container("Horadric Cube", 3, 4, 6);
		this.InvRef = [];

		this.Reload();
	};

	this.BeltSize = function () {
		let item = me.getItem(-1, 1); // get equipped item

		// nothing equipped
		if (!item) return 1;

		do {
			// belt slot
			if (item.bodylocation === 8) {
				switch (item.code) {
				case "lbl": // sash
				case "vbl": // light belt
					return 2;
				case "mbl": // belt
				case "tbl": // heavy belt
					return 3;
				default: // everything else
					return 4;
				}
			}
		} while (item.getNext());

		return 1; // no belt
	};

	this.Reload = function () {
		this.Inventory.Reset();
		this.Stash.Reset();
		this.Belt.Reset();
		this.Cube.Reset();
		this.TradeScreen.Reset();

		let item = me.getItem();

		if (!item) return false;

		do {
			switch (item.location) {
			case 3:
				this.Inventory.Mark(item);

				break;
			case 5:
				this.TradeScreen.Mark(item);

				break;
			case 2:
				this.Belt.Mark(item);

				break;
			case 6:
				this.Cube.Mark(item);

				break;
			case 7:
				this.Stash.Mark(item);

				break;
			}
		} while (item.getNext());

		return true;
	};
};
