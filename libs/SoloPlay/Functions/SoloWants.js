/**
*  @filename    SoloWants.js
*  @author      theBGuy
*  @desc        SoloWants system for Kolbot-SoloPlay, handles inserting socketables
*
*/

const SoloWants = {
  needList: [],
  validGids: [],

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  checkItem: function (item) {
    if (!item) return false;
    if (this.validGids.includes(item.gid)) return true;
    let i = 0;
    for (let el of this.needList) {
      if (item.isInsertable) {
        if (el.needed.includes(item.classid)) {
          this.validGids.push(item.gid);
          this.needList[i].needed.splice(this.needList[i].needed.indexOf(item.classid), 1);
          if (this.needList[i].needed.length === 0) {
            // no more needed items so remove from list
            this.needList.splice(i, 1);
          }
          return true;
        }
      }
      i++; // keep track of index
    }

    return false;
  },

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  keepItem: function (item) {
    if (!item) return false;
    return this.validGids.includes(item.gid);
  },

  buildList: function () {
    let myItems = me.getItemsEx()
      .filter(function (item) {
        if (item.isRuneword || item.questItem) return false;
        return item.quality >= sdk.items.quality.Normal && (item.sockets > 0 || getBaseStat("items", item.classid, "gemsockets") > 0);
      });
    myItems
      .filter(item => item.isEquipped)
      .forEach(item => SoloWants.addToList(item));
    myItems
      .filter(item => item.isInStorage && item.quality >= sdk.items.quality.Magic && item.getItemType() && AutoEquip.wanted(item))
      .forEach(item => SoloWants.addToList(item));
    
    return myItems.forEach(item => SoloWants.checkItem(item));
  },

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  addToList: function (item) {
    if (!item || me.classic || item.isRuneword) return false;
    if (SoloWants.needList.some(check => item.classid === check.classid)) return false;
    let hasWantedItems;
    let list = [];
    let socketedWith = item.getItemsEx();
    let numSockets = item.sockets;
    let curr = Config.socketables.find(({ classid }) => item.classid === classid);

    if (curr && curr.socketWith.length > 0) {
      hasWantedItems = socketedWith.some(el => curr.socketWith.includes(el.classid));
      if (hasWantedItems && socketedWith.length === numSockets) {
        return true; // this item is full
      }

      if (curr.socketWith.includes(sdk.items.runes.Hel)) {
        let merc = me.getMerc();
        switch (true) {
        case Item.autoEquipCheck(item, true) && me.trueStr >= item.strreq && me.trueDex >= item.dexreq:
        case Item.autoEquipCheckMerc(item, true) && !!merc && merc.rawStrength >= item.strreq && merc.rawDexterity >= item.dexreq:
          curr.socketWith.splice(curr.socketWith.indexOf(sdk.items.runes.Hel), 1);
          break;
        }
      }

      if (curr.socketWith.length > 1 && hasWantedItems) {
        // handle different wanted socketables, if we already have a wanted socketable inserted then remove it from the check list
        socketedWith.forEach(function (socketed) {
          if (curr.socketWith.length > 1 && curr.socketWith.includes(socketed.classid)) {
            curr.socketWith.splice(curr.socketWith.indexOf(socketed.classid), 1);
          }
        });
      }

      // add the wanted items to the list
      for (let i = 0; i < numSockets - (hasWantedItems ? socketedWith.length : 0); i++) {
        // handle different wanted socketables
        curr.socketWith.length === numSockets
          ? list.push(curr.socketWith[i])
          : list.push(curr.socketWith[0]);
      }

      // currently no sockets but we might use our socket quest on it
      numSockets === 0 && curr.useSocketQuest && list.push(curr.socketWith[0]);

      // if temp socketables are used for this item and its not already socketed with wanted items add the temp items too
      if (!hasWantedItems && !!curr.temp && !!curr.temp.length > 0) {
        for (let i = 0; i < numSockets - socketedWith.length; i++) {
          list.push(curr.temp[0]);
        }
        // Make sure we keep a hel rune so we can unsocket temp socketables if needed
        if (!SoloWants.needList.some(check => sdk.items.runes.Hel === check.classid)) {
          let hel = me.getItemsEx(sdk.items.runes.Hel, sdk.items.mode.inStorage);
          // we don't have any hel runes and its not already in our needList
          if ((!hel || hel.length === 0)) {
            SoloWants.needList.push({ classid: sdk.items.runes.Hel, needed: [sdk.items.runes.Hel] });
          } else if (!hel.some(check => SoloWants.validGids.includes(check.gid))) {
            SoloWants.needList.push({ classid: sdk.items.runes.Hel, needed: [sdk.items.runes.Hel] });
          }
        }
      }
    } else {
      let itemtype = item.getItemType();
      if (!itemtype) return false;
      let gemType = ["Helmet", "Armor"].includes(itemtype)
        ? "Ruby" : itemtype === "Shield"
          ? "Diamond" : itemtype === "Weapon" && !Check.currentBuild().caster
            ? "Skull" : "";
      let runeType;

      // Tir rune in normal, Io rune otherwise and Shael's if assassin TODO: use jewels too
      !gemType && (runeType = me.normal ? "Tir" : me.assassin ? "Shael" : "Io");

      hasWantedItems = socketedWith.some(el => gemType ? el.itemType === sdk.items.type[gemType] : el.classid === sdk.items.runes[runeType]);
      if (hasWantedItems && socketedWith.length === numSockets) {
        return true; // this item is full
      }

      for (let i = 0; i < numSockets - socketedWith.length; i++) {
        list.push(gemType ? sdk.items.gems.Perfect[gemType] : sdk.items.runes[runeType]);
      }
    }

    // add to our needList so we pick the items
    return list.length > 0 ? this.needList.push({ classid: item.classid, needed: list }) : false;
  },

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  update: function (item) {
    if (!item) return false;
    if (this.validGids.includes(item.gid)) return true; // already in the list
    let i = 0;
    for (let el of this.needList) {
      if (!me.getItem(el.classid)) {
        // We no longer have the item we wanted socketables for
        this.needList.splice(i, 1);
        continue;
      }
      if (item.isInsertable) {
        if (el.needed.includes(item.classid)) {
          this.validGids.push(item.gid);
          this.needList[i].needed.splice(this.needList[i].needed.indexOf(item.classid), 1);
          if (this.needList[i].needed.length === 0) {
            // no more needed items so remove from list
            this.needList.splice(i, 1);
          }
          return true;
        }
      }
      i++; // keep track of index
    }

    return false;
  },

  ensureList: function () {
    let i = 0;
    for (let el of this.needList) {
      if (!me.getItem(el.classid)) {
        // We no longer have the item we wanted socketables for
        this.needList.splice(i, 1);
        continue;
      }
      i++; // keep track of index
    }
  },

  // Cube ingredients
  checkSubrecipes: function () {
    for (let el of this.needList) {
      for (let i = 0; i < el.needed.length; i++) {
        switch (true) {
        case [
          sdk.items.gems.Perfect.Ruby, sdk.items.gems.Perfect.Sapphire, sdk.items.gems.Perfect.Topaz, sdk.items.gems.Perfect.Emerald,
          sdk.items.gems.Perfect.Amethyst, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Skull].includes(el.needed[i]):
          if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
            Cubing.subRecipes.push(el.needed[i]);
            Cubing.recipes.push({
              Ingredients: [el.needed[i] - 1, el.needed[i] - 1, el.needed[i] - 1],
              Index: 0,
              AlwaysEnabled: true,
              MainRecipe: "Crafting"
            });
          }

          break;
        case el.needed[i] >= sdk.items.runes.El && el.needed[i] <= sdk.items.runes.Ort:
          if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
            Cubing.subRecipes.push(el.needed[i]);
            Cubing.recipes.push({
              Ingredients: [el.needed[i] - 1, el.needed[i] - 1, el.needed[i] - 1],
              Index: Recipe.Rune,
              AlwaysEnabled: true,
              MainRecipe: "Crafting"
            });
          }

          break;
        // case el.needed[i] >= sdk.items.runes.Thul && el.needed[i] <= sdk.items.runes.Lem:
        // // gems repeat so should be able to math this out chipped (TASRED) -> repeat flawed (TASRED)
        // 	if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
        // 		Cubing.subRecipes.push(el.needed[i]);
        // 		Cubing.recipes.push({
        // 			Ingredients: [el.needed[i] - 1, el.needed[i] - 1, el.needed[i] - 1],
        // 			Index: Recipe.Rune,
        // 			AlwaysEnabled: true,
        // 			MainRecipe: "Crafting"
        // 		});
        // 	}

        // 	break;
        // case el.needed[i] >= sdk.items.runes.Mal && el.needed[i] <= sdk.items.runes.Zod:
        // // gems repeat so should be able to math this out Base (TASRED) -> repeat Flawless (TASRE) (stops at Emerald)
        // 	if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
        // 		Cubing.subRecipes.push(el.needed[i]);
        // 		Cubing.recipes.push({
        // 			Ingredients: [el.needed[i] - 1, el.needed[i] - 1],
        // 			Index: Recipe.Rune,
        // 			AlwaysEnabled: true,
        // 			MainRecipe: "Crafting"
        // 		});
        // 	}

        // 	break;
        }
      }
    }

    return true;
  },
};
