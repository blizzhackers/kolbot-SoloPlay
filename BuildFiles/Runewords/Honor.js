(function () {
  const Honor = [
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == ElRune # # [maxquantity] == 1",
    "[name] == IthRune # # [maxquantity] == 1",
    "[name] == TirRune # # [maxquantity] == 1",
    "[name] == SolRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(Honor);

  /** @type {GetOwnedSettings} */
  const wanted = {
    itemType: sdk.items.type.Sword,
    mode: sdk.items.mode.inStorage,
    sockets: 4,
    ethereal: false,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  // Cube to Amn rune
  if (!me.getItem(sdk.items.runes.Amn)) {
    Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
  }

  // Have Sol rune before looking for base
  if (me.getItem(sdk.items.runes.Sol)) {
    if (!me.getOwned(wanted).length) {
      if (me.accessToAct(5) && !me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.Completed)) {
        NTIP.addLine("((me.diff == 0 && [name] == flamberge) || (me.diff > 0 && [name] == zweihander) || (me.diff == 2 && [name] == colossussword)) && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [level] >= 41 # [sockets] == 0 # [maxquantity] == 1");
      } else {
        NTIP.addLine("([name] == flamberge || [name] == zweihander || [name] == dimensionalblade || [name] == phaseblade || [name] == colossussword) && [flag] != ethereal && [quality] == normal && [level] >= 41 # [sockets] == 0 # [maxquantity] == 1");
      }
    }

    NTIP.addLine("[type] == Sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 187 # [sockets] == 5 # [maxquantity] == 1");
  }

  Config.Runewords.push([Runeword.Honor, "dimensionalblade"]);
  Config.Runewords.push([Runeword.Honor, "flamberge"]);
  Config.Runewords.push([Runeword.Honor, "zweihander"]);
  Config.Runewords.push([Runeword.Honor, "phaseblade"]);
  Config.Runewords.push([Runeword.Honor, "colossussword"]);

  Config.Recipes.push([Recipe.Socket.Weapon, "flamberge"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "zweihander"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "dimensionalblade"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "phaseblade"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "colossussword"]);

  Config.KeepRunewords.push("[type] == sword # [enhanceddamage] >= 160 && [tohit] >= 250 && [itemallskills] >= 1");
})();
