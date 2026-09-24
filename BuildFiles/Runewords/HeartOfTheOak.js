(function () {
  const HotO = [
    "[name] == ThulRune # # [maxquantity] == 1",
    "[name] == PulRune",
    "[name] == KoRune # # [maxquantity] == 1",
    "[name] == VexRune",
  ];
  NTIP.buildList(HotO);

  /** @type {GetOwnedSettings} */
  const wanted = {
    itemType: sdk.items.type.Mace,
    mode: sdk.items.mode.inStorage,
    sockets: 4,
    ethereal: false,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  let _haveHotO = false;
  const haveHotO = function () {
    if (_haveHotO) {
      return true;
    }
    _haveHotO = me.checkItem({ name: sdk.locale.items.HeartoftheOak }).have;
    return _haveHotO;
  };

  // Have Vex rune before looking for base
  if (me.getItem(sdk.items.runes.Vex)) {
    NTIP.addLine("([name] == flail || [name] == knout) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");

    // Have Vex rune but do not have a base yet
    if (!me.getOwned(wanted).length) {
      NTIP.addLine("([name] == flail || [name] == knout) && [flag] != ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
      Config.Recipes.push([Recipe.Socket.Weapon, "flail"]);
      Config.Recipes.push([Recipe.Socket.Weapon, "knout"]);
    }
  }

  // Cube to Vex rune
  const needVex = function () {
    if (haveHotO()) {
      // If we have Heart of the Oak, we do not need Vex rune
      return false;
    }
    return !me.getItem(sdk.items.runes.Vex);
  };
  if (needVex()) {
    Config.Recipes.push([Recipe.Rune, "Pul Rune", { condition: needVex }]);
    Config.Recipes.push([Recipe.Rune, "Um Rune", { condition: needVex }]);
    Config.Recipes.push([Recipe.Rune, "Mal Rune", { condition: needVex }]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needVex }]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needVex }]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needVex }]);
  }

  Config.Runewords.push([Runeword.HeartoftheOak, "knout", Roll.NonEth, 99]);
  Config.Runewords.push([Runeword.HeartoftheOak, "flail", Roll.NonEth, 99]);
  Config.KeepRunewords.push("[type] == mace # [itemallskills] == 3");
})();
