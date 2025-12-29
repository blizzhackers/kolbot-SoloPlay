/**
 *  @filename    CubingOverrides.js
 *  @author      theBGuy
 *  @desc        Cubing improvments
 *
 */

/** @typedef {import("../../systems/crafting/CraftingSystem")} */

includeIfNotIncluded("core/Cubing.js");

/** @this {import("../../core/Cubing")} */
Cubing.buildLists = function () {
  CraftingSystem.checkSubrecipes();
  SoloWants.checkSubrecipes();

  Cubing.validIngredients = [];
  Cubing.neededIngredients = [];

  /** @param {ItemUnit} item */
  const filterValidItems = function (item) {
    return item.mode === sdk.items.mode.inStorage || item.mode === sdk.items.mode.Equipped;
  };

  /**
   * @param {ItemUnit} a 
   * @param {ItemUnit} b 
   * @returns {number}
   */
  const sortByIlvl = function (a, b) {
    return b.ilvl - a.ilvl;
  };
  
  let items = me
    .getItemsEx()
    .filter(filterValidItems)
    .sort(sortByIlvl);
  
  /**
   * @param {ItemUnit} item
   * @param {*} recipe
   */
  const ingredientObj = (item, recipe) => ({
    classid: item.classid,
    type: item.itemType,
    quality: item.quality,
    ilvl: item.ilvl,
    gid: item.gid,
    recipe: recipe,
  });

  for (let i = 0; i < Cubing.recipes.length; i += 1) {
    const recipe = this.recipes[i];

    if (recipe.hasOwnProperty("condition") && typeof recipe.condition === "function") {
      if (!recipe.condition()) {
        console.debug("Skipping recipe " + recipe.Index + " due to condition cb");
        continue;
      }
    }

    if (recipe.hasOwnProperty("MaxQuantity") && typeof recipe.MaxQuantity === "number") {
      let itemClassid = recipe.KeyItem;
      let itemCount = me.getItemsEx(itemClassid).filter(function (item) {
        return item.isInStorage;
      }).length;

      if (itemCount >= recipe.MaxQuantity) {
        console.debug(
          "Skipping recipe due to item count exceeding MaxQuantity."
            + " Have: " + itemCount
            + ", Wanted: " + recipe.MaxQuantity
        );
        continue;
      }
    }

    // Set default Enabled property - true if recipe is always enabled, false otherwise
    Cubing.recipes[i].Enabled = Cubing.recipes[i].hasOwnProperty("AlwaysEnabled");

    IngredientLoop:
    for (let j = 0; j < Cubing.recipes[i].Ingredients.length; j += 1) {
      for (let k = 0; k < items.length; k += 1) {
        if (
          ((Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.includes(items[k].classid))
            || (Cubing.recipes[i].Ingredients[j] === "fgem"
              && [
                sdk.items.gems.Flawless.Amethyst,
                sdk.items.gems.Flawless.Topaz,
                sdk.items.gems.Flawed.Sapphire,
                sdk.items.gems.Flawless.Emerald,
                sdk.items.gems.Flawless.Ruby,
                sdk.items.gems.Flawless.Diamond,
                sdk.items.gems.Flawless.Skull,
              ].includes(items[k].classid))
            || (Cubing.recipes[i].Ingredients[j] === "cgem" && Cubing.chippedGems.includes(items[k].classid))
            || items[k].classid === Cubing.recipes[i].Ingredients[j])
          && Cubing.validItem(items[k], Cubing.recipes[i])
        ) {
          // push the item's info into the valid ingredients array. this will be used to find items when checking recipes
          Cubing.validIngredients.push(ingredientObj(items[k], Cubing.recipes[i]));

          // Remove from item list to prevent counting the same item more than once
          items.splice(k, 1);

          k -= 1;

          // Enable recipes for gem/jewel pickup
          // Enable rune recipe after 2 bases are found
          if (Cubing.recipes[i].Index !== Recipe.Rune || (Cubing.recipes[i].Index === Recipe.Rune && j >= 1)) {
            Cubing.recipes[i].Enabled = true;
          }

          continue IngredientLoop;
        }
      }

      // add the item to needed list - enable pickup
      Cubing.neededIngredients.push({ classid: Cubing.recipes[i].Ingredients[j], recipe: Cubing.recipes[i] });

      // skip flawless gems adding if we don't have the main item (Recipe.Gem and Recipe.Rune for el-ort are always enabled)
      if (!Cubing.recipes[i].Enabled) {
        break;
      }

      // if the recipe is enabled (we have the main item), add flawless gem recipes (if needed)

      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Amethyst) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Amethyst
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Amethyst) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [
            sdk.items.gems.Flawless.Amethyst,
            sdk.items.gems.Flawless.Amethyst,
            sdk.items.gems.Flawless.Amethyst,
          ],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Amethyst);
      }

      // Make flawless amethyst
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Amethyst) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Amethyst
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Amethyst) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Amethyst, sdk.items.gems.Normal.Amethyst, sdk.items.gems.Normal.Amethyst],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Amethyst);
      }

      // Make perf topaz
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Topaz) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Topaz
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Topaz) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawless.Topaz],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Topaz);
      }

      // Make flawless topaz
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Topaz) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Topaz
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Topaz) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Topaz, sdk.items.gems.Normal.Topaz, sdk.items.gems.Normal.Topaz],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Topaz);
      }

      // Make perf sapphire
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Sapphire) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Sapphire
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Sapphire) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [
            sdk.items.gems.Flawless.Sapphire,
            sdk.items.gems.Flawless.Sapphire,
            sdk.items.gems.Flawless.Sapphire,
          ],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Sapphire);
      }

      // Make flawless sapphire
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Sapphire) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Sapphire
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Sapphire) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Sapphire, sdk.items.gems.Normal.Sapphire, sdk.items.gems.Normal.Sapphire],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Sapphire);
      }

      // Make perf emerald
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Emerald) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Emerald
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Emerald) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [
            sdk.items.gems.Flawless.Emerald,
            sdk.items.gems.Flawless.Emerald,
            sdk.items.gems.Flawless.Emerald,
          ],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Emerald);
      }

      // Make flawless emerald
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Emerald) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Emerald
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Emerald) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Emerald, sdk.items.gems.Normal.Emerald, sdk.items.gems.Normal.Emerald],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Emerald);
      }

      // Make perf ruby
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Ruby) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Ruby
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Ruby) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Ruby],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Ruby);
      }

      // Make flawless ruby
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Ruby) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Ruby
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Ruby) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Ruby, sdk.items.gems.Normal.Ruby, sdk.items.gems.Normal.Ruby],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Ruby);
      }

      // Make perf diamond
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Diamond) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Diamond
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Diamond) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [
            sdk.items.gems.Flawless.Diamond,
            sdk.items.gems.Flawless.Diamond,
            sdk.items.gems.Flawless.Diamond,
          ],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Diamond);
      }

      // Make flawless diamond
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Diamond) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Diamond
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Diamond) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Diamond, sdk.items.gems.Normal.Diamond, sdk.items.gems.Normal.Diamond],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Diamond);
      }

      // Make perf skull
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Perfect.Skull) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Skull
          || (Cubing.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.indexOf(sdk.items.gems.Perfect.Skull) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Flawless.Skull, sdk.items.gems.Flawless.Skull, sdk.items.gems.Flawless.Skull],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Perfect.Skull);
      }

      // Make flawless skull
      if (
        Cubing.subRecipes.indexOf(sdk.items.gems.Flawless.Skull) === -1
        && (Cubing.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Skull
          || (Cubing.recipes[i].Ingredients[j] === "fgem" && Cubing.gemList.indexOf(sdk.items.gems.Flawless.Skull) > -1))
      ) {
        Cubing.recipes.push({
          Ingredients: [sdk.items.gems.Normal.Skull, sdk.items.gems.Normal.Skull, sdk.items.gems.Normal.Skull],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: Cubing.recipes[i].Index,
        });
        Cubing.subRecipes.push(sdk.items.gems.Flawless.Skull);
      }
    }
  }
};

// Added try again to emptying cube if it fails it will clear inventory then organize it
Cubing.emptyCube = function () {
  const locToName = {};
  locToName[sdk.storage.Cube] = "Cube";
  locToName[sdk.storage.Inventory] = "Inventory";
  locToName[sdk.storage.Stash] = "Stash";
  /** @param {ItemUnit} item */
  const prettyPrint = function (item) {
    return item && "- " + item.prettyPrint + " Location: " + (locToName[item.location] || "") + "\n";
  };

  const cube = me.getItem(sdk.items.quest.Cube);
  if (!cube) return false;

  const items = me.findItems(-1, -1, sdk.storage.Cube);
  if (!items) return true;

  items.sort(function (a, b) {
    return b.sizex * b.sizey - a.sizex * a.sizey;
  });

  /** @type {ItemUnit[]} */
  const failedItems = [];
  let [invoSorted, stashSorted, failed] = [false, false, false];

  while (items.length) {
    const item = items[0];

    item.isInCube && !getUIFlag(sdk.uiflags.Cube) && Cubing.openCube();

    if (item.isInCube && Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) {
      // Move anything we can to the inventory first, so we don't have to open/close the cube
      items.push(item);
      items.shift();
      continue;
    }

    if (!invoSorted && !Storage.Inventory.CanFit(item)) {
      Town.clearInventory();
      me.sortInventory();
      invoSorted = true;
    }

    if (!stashSorted && !Storage.Stash.CanFit(item)) {
      Town.sortStash();
      stashSorted = true;
    }

    if (!Storage.Stash.MoveTo(item)) {
      failed = true;
      failedItems.push(item);
    }

    items.shift();
  }

  Cubing.closeCube();

  if (failed) {
    console.log("Failed to get all items from cube to stash. Items left: \n" + failedItems.map(prettyPrint).join(", "));
  }

  return !failed;
};

/** @param {ItemUnit} unit */
Cubing.checkItem = function (unit) {
  if (!Config.Cubing || !unit) return false;

  for (let i = 0; i < Cubing.validIngredients.length; i++) {
    // not the same item but the same type of item
    if (
      unit.mode !== sdk.items.mode.Equipped
      && unit.gid !== Cubing.validIngredients[i].gid
      && unit.classid === Cubing.validIngredients[i].classid
      && unit.quality === Cubing.validIngredients[i].quality
    ) {
      // item is better than the one we currently have, so add it to validIngredient array and remove old item
      if (unit.ilvl > Cubing.validIngredients[i].ilvl && Cubing.validItem(unit, Cubing.validIngredients[i].recipe)) {
        Cubing.validIngredients.push({
          classid: unit.classid,
          quality: unit.quality,
          ilvl: unit.ilvl,
          gid: unit.gid,
          recipe: Cubing.validIngredients[i].recipe,
        });
        Cubing.validIngredients.splice(i, 1);
        return true;
      }
    }
    // its an item meant for socketing so lets be sure we have the best base
    if (
      Cubing.validIngredients[i].recipe.Index >= Recipe.Socket.Shield
      && Cubing.validIngredients[i].recipe.Index <= Recipe.Socket.Helm
    ) {
      // not the same item but the same type of item
      if (
        !unit.isEquipped
        && unit.gid !== Cubing.validIngredients[i].gid
        && unit.itemType === Cubing.validIngredients[i].type
        && unit.quality === Cubing.validIngredients[i].quality
      ) {
        // console.debug(Cubing.validIngredients[i], "\n//~~~~//\n", unit, "\n//~~~~~/\n", Item.betterThanStashed(unit, true));
        // item is better than the one we currently have, so add it to validIngredient array and remove old item
        if (Item.betterThanStashed(unit, true) && Cubing.validItem(unit, Cubing.validIngredients[i].recipe)) {
          Cubing.validIngredients.push({
            classid: unit.classid,
            type: unit.itemType,
            quality: unit.quality,
            ilvl: unit.ilvl,
            gid: unit.gid,
            recipe: Cubing.validIngredients[i].recipe,
          });
          Cubing.validIngredients.splice(i, 1);
          return true;
        }
      }
    }
  }

  if (Cubing.keepItem(unit)) {
    return true;
  }

  for (let el of Cubing.neededIngredients) {
    if (unit.classid === el.classid && Cubing.validItem(unit, el.recipe)) {
      return true;
    }
  }

  return false;
};

/**
 * @param {ItemUnit} unit
 * @param {recipeObj} recipe
 */
Cubing.validItem = function (unit, recipe) {
  // Excluded items
  // Don't use items in locked inventory space
  if (unit.isInInventory && Storage.Inventory.IsLocked(unit, Config.Inventory)) return false;
  // Don't use items that are wanted by other systems
  if (Runewords.validGids.includes(unit.gid) || CraftingSystem.validGids.includes(unit.gid)) {
    return false;
  }

  // Gems and runes
  if (
    (unit.itemType >= sdk.items.type.Amethyst && unit.itemType <= sdk.items.type.Skull)
    || unit.itemType === sdk.items.type.Rune
  ) {
    if (!recipe.Enabled && recipe.Ingredients[0] !== unit.classid && recipe.Ingredients[1] !== unit.classid) {
      return false;
    }

    return true;
  }

  // Token
  if (recipe.Index === Recipe.Token) return true;

  // START
  let valid = true;
  const ntipResult = NTIP.CheckItem(unit);
  const ntipNoTierResult = NTIP.CheckItem(unit, NTIP.CheckList);

  if (
    recipe.Index === Recipe.Unique.Weapon.ToExceptional
      || recipe.Index === Recipe.Unique.Armor.ToExceptional
      || recipe.Index === Recipe.Rare.Weapon.ToExceptional
      || recipe.Index === Recipe.Rare.Armor.ToExceptional
  ) {
    // make sure the item class is correct
    if (unit.itemclass !== sdk.items.class.Normal) {
      return false;
    }
  }

  if (
    recipe.Index === Recipe.Unique.Weapon.ToElite
      || recipe.Index === Recipe.Unique.Armor.ToElite
      || recipe.Index === Recipe.Rare.Weapon.ToElite
      || recipe.Index === Recipe.Rare.Armor.ToElite
  ) {
    // make sure the item class is correct
    if (unit.itemclass !== sdk.items.class.Exceptional) {
      return false;
    }
  }

  if (recipe.Index >= Recipe.HitPower.Helm && recipe.Index <= Recipe.Safety.Weapon) {
    if (Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) < recipe.Level) {
      if (me.charlvl < 50) {
        // set it equal to ilvl 31 where 60% chance of 2 affixes and 20% chance each of 3 or 4 affixes
        recipe.Level = 31;
      } else if (me.charlvl > 50 && me.charlvl < 70) {
        // set it equal to ilvl 51 where 80% chance of 3 affixes and 20% chance of 4 affixes
        recipe.Level = 51;
      } else if (me.charlvl > 70 && me.charlvl < 93) {
        // set it equal to ilvl 71 where 100% chance of 4 affixes
        recipe.Level = 71;
      }
    }
    // Junk jewels (NOT matching a pickit entry)
    if (unit.itemType === sdk.items.type.Jewel) {
      if (recipe.Enabled && ntipResult === Pickit.Result.UNWANTED) return true;
      // Main item, NOT matching a pickit entry
    } else if (
      unit.magic
      && Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) >= recipe.Level
      && ntipNoTierResult === Pickit.Result.UNWANTED
    ) {
      return true;
    }

    return false;
  } else if (recipe.Index >= Recipe.Unique.Weapon.ToExceptional && recipe.Index <= Recipe.Unique.Armor.ToElite) {
    // If item is equipped, ensure we can use the upgraded version
    if (unit.isEquipped) {
      if (me.charlvl < unit.upgradedLvlReq || me.trueStr < unit.upgradedStrReq || me.trueDex < unit.upgradedDexReq) {
        return false;
      }
    }

    // Unique item matching pickit entry
    if (unit.unique && ntipResult === Pickit.Result.WANTED) {
      // check items name (prevents upgrading lavagout when we want to be upgrading magefist for the second time)
      if (recipe.Name !== undefined) {
        valid = !!unit.fname.toLowerCase().includes(recipe.Name.toLowerCase());
        if (valid) {
          // check to see if we are using this already and if so compare base stats to see if this one would be better
          // ignore things that get re-rolled like defense or min/max dmg just focus on base stats like enhanced defense/damage
          let equipped = me
            .getItemsEx(-1, sdk.storage.Equipped)
            .find((item) => item.fname.toLowerCase().includes(recipe.Name.toLowerCase()));
          if (equipped) {
            switch (recipe.Name.toLowerCase()) {
            case "magefist":
              // compare enhanced defense - keep "equal to" because base defense gets re-rolled so it might turn out better
              valid = unit.getStat(sdk.stats.ArmorPercent) >= equipped.getStat(sdk.stats.ArmorPercent);
              break;
            }
          }
        }
      }
      switch (recipe.Ethereal) {
      case Roll.All:
      case undefined:
        return valid && ntipResult === Pickit.Result.WANTED;
      case Roll.Eth:
        return valid && unit.ethereal && ntipResult === Pickit.Result.WANTED;
      case Roll.NonEth:
        return valid && !unit.ethereal && ntipResult === Pickit.Result.WANTED;
      }
    }

    return false;
  } else if (recipe.Index >= Recipe.Rare.Weapon.ToExceptional && recipe.Index <= Recipe.Rare.Armor.ToElite) {
    // If item is equipped, ensure we can use the upgraded version
    if (unit.isEquipped) {
      if (me.charlvl < unit.upgradedLvlReq || me.trueStr < unit.upgradedStrReq || me.trueDex < unit.upgradedDexReq) {
        return false;
      }
    }
    // Rare item matching pickit entry
    if (unit.rare && ntipResult === Pickit.Result.WANTED) {
      switch (recipe.Ethereal) {
      case Roll.All:
      case undefined:
        return ntipResult === Pickit.Result.WANTED;
      case Roll.Eth:
        return unit.ethereal && ntipResult === Pickit.Result.WANTED;
      case Roll.NonEth:
        return !unit.ethereal && ntipResult === Pickit.Result.WANTED;
      }
    }

    return false;
  } else if (recipe.Index >= Recipe.Socket.Shield && recipe.Index <= Recipe.Socket.Helm) {
    // Normal item matching pickit entry, no sockets
    if (unit.normal && unit.sockets === 0) {
      if (
        Pickit.Result.WANTED === ntipResult
        && [
          sdk.items.type.Wand,
          sdk.items.type.VoodooHeads,
          sdk.items.type.AuricShields,
          sdk.items.type.PrimalHelm,
          sdk.items.type.Pelt,
        ].includes(unit.itemType)
      ) {
        if (!Item.betterThanStashed(unit) || !Item.betterBaseThanWearing(unit)) return false;
      }
      switch (recipe.Ethereal) {
      case Roll.All:
      case undefined:
        return ntipResult === Pickit.Result.WANTED;
      case Roll.Eth:
        return unit.ethereal && ntipResult === Pickit.Result.WANTED;
      case Roll.NonEth:
        return !unit.ethereal && ntipResult === Pickit.Result.WANTED;
      }
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.Magic) {
    if (unit.magic && unit.ilvl >= recipe.Level) {
      if (ntipResult === Pickit.Result.UNWANTED) return true;
      // should allow for charms that aren't immeaditly wanted by equip and not nip wanted
      if (unit.isCharm && !CharmEquip.check(unit) && ntipNoTierResult === Pickit.Result.UNWANTED) return true;
      return true;
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.Charm) {
    if (
      unit.isCharm
      && unit.magic
      && (ntipResult === Pickit.Result.UNWANTED
        || (!CharmEquip.check(unit) && ntipNoTierResult === Pickit.Result.UNWANTED))
    ) {
      switch (unit.itemType) {
      case sdk.items.type.SmallCharm:
        if (unit.ilvl >= recipe.Level[unit.code].ilvl) {
          return true;
        }
        break;
      case sdk.items.type.LargeCharm:
        if (unit.ilvl >= recipe.Level.cm2.ilvl) {
          return true;
        }
        break;
      case sdk.items.type.GrandCharm:
        if (unit.ilvl >= recipe.Level.cm2.ilvl) {
          return true;
        }
        break;
      }
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.Rare) {
    if (unit.rare && ntipResult === Pickit.Result.UNWANTED) {
      return true;
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.HighRare) {
    if (recipe.Ingredients[0] === unit.classid && unit.rare && ntipResult === Pickit.Result.UNWANTED) {
      recipe.Enabled = true;

      return true;
    }

    if (
      recipe.Enabled
      && recipe.Ingredients[2] === unit.classid
      && unit.itemType === sdk.items.type.Ring
      && unit.getStat(sdk.stats.MaxManaPercent)
      && !Storage.Inventory.IsLocked(unit, Config.Inventory)
    ) {
      return true;
    }

    return false;
  } else if (recipe.Index === Recipe.LowToNorm.Armor || recipe.Index === Recipe.LowToNorm.Weapon) {
    if (unit.lowquality && ntipResult === Pickit.Result.UNWANTED) {
      return true;
    }
  }

  return false;
};

Cubing.doCubing = function () {
  if (!Config.Cubing || !me.getItem(sdk.items.quest.Cube)) return false;

  let wasEquipped = false;

  Cubing.update();
  // Randomize the recipe array to prevent recipe blocking (multiple caster items etc.)
  let tempArray = Cubing.recipes.slice().shuffle();

  for (let i = 0; i < tempArray.length; i++) {
    let string = "Transmuting: ";
    let items = Cubing.checkRecipe(tempArray[i]);

    if (items) {
      // If cube isn't open, attempt to open stash (the function returns true if stash is already open)
      if ((!getUIFlag(sdk.uiflags.Cube) && !Town.openStash()) || !Cubing.emptyCube()) return false;

      Cubing.cursorCheck();

      i = -1;

      let itemsToCubeCount = items.length;

      while (items.length) {
        string += items[0].name.trim() + (items.length > 1 ? " + " : "");
        items[0].isEquipped && (wasEquipped = true);
        if (!Storage.Cube.MoveTo(items[0])) return false;
        items.shift();
      }

      const itemsInCube = me.getItemsEx().filter(function (el) {
        return el.isInCube;
      });
      if (itemsInCube.length !== itemsToCubeCount) {
        console.warn("Failed to move all necesary items to cube");
        itemsInCube.forEach(function (item) {
          if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) return;
          if (Storage.Stash.CanFit(item) && Storage.Stash.MoveTo(item)) return;
        });
        return false;
      }
      
      if (!Cubing.openCube()) {
        return false;
      }

      transmute();
      delay(700 + me.ping);
      console.log("ÿc4Cubing: " + string);
      Config.ShowCubingInfo && D2Bot.printToConsole(string, sdk.colors.D2Bot.Green);

      Cubing.update();

      let cubedItems = me.findItems(-1, -1, sdk.storage.Cube);

      // check if cubing was successful
      if (cubedItems.length === itemsToCubeCount) {
        console.warn("Cubing failed, items remain in cube.");
        if (!Cubing.emptyCube()) {
          break;
        }
        continue;
      }

      if (cubedItems) {
        for (let item of cubedItems) {
          let result = Pickit.checkItem(item);

          switch (result.result) {
          case Pickit.Result.UNWANTED:
            // keep if item is worth selling
            if (
              item.getItemCost(sdk.items.cost.ToSell) / (item.sizex * item.sizey)
                >= (me.normal ? 50 : me.nightmare ? 500 : 1000)
            ) {
              if (Storage.Inventory.CanFit(item)) {
                Storage.Inventory.MoveTo(item);
              } else {
                Item.logger("Dropped", item, "doCubing");
                item.drop();
              }
            }

            Settings.debugging.crafting && Item.logItem("Crafted but didn't want", item);

            break;
          case Pickit.Result.WANTED:
          case Pickit.Result.SOLOWANTS:
            Item.logger("Cubing Kept", item);
            Item.logItem("Cubing Kept", item, result.line);

            break;
          case Pickit.Result.CRAFTING: // Crafting System
            CraftingSystem.update(item);

            break;
          case Pickit.Result.SOLOSYSTEM: // SoloWants System
            SoloWants.update(item);

            break;
          }
        }
      }

      if (!Cubing.emptyCube()) {
        break;
      }
    }
  }

  if (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
    delay(1000);

    while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
      me.cancel();
      delay(300);
    }
  }

  wasEquipped && Item.autoEquip();

  return true;
};
