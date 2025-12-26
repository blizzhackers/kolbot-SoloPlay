(function () {
  const CoH = [
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == UmRune",
    "[name] == BerRune",
    "[name] == IstRune",
  ];
  NTIP.buildList(CoH);

  /** @type {GetOwnedSettings} */
  const wanted = {
    itemType: sdk.items.type.Armor,
    mode: sdk.items.mode.inStorage,
    sockets: 4,
    ethereal: false,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType
        && [sdk.items.ArchonPlate, sdk.items.DuskShroud, sdk.items.Wyrmhide].includes(item.classid);
    }
  };

  let _haveCoH = false;
  const haveCoH = function () {
    if (_haveCoH) {
      return true;
    }
    _haveCoH = me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have;
    return _haveCoH;
  };

  // Cube to Ber rune
  const needBer = function () {
    if (haveCoH()) {
      // If we have CoH, we do not need Ber rune
      return false;
    }
    return !me.getItem(sdk.items.runes.Ber);
  };
  if (!me.getItem(sdk.items.runes.Ber)) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have || ["Plaguewolf", "Wolf", "Uberconc"].includes(SetUp.finalBuild)) {
      Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needBer }]);
    }

    if (me.checkItem({ name: sdk.locale.items.Grief }).have || ["Uberconc"].indexOf(SetUp.finalBuild) === -1) {
      Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needBer }]);
    }

    Config.Recipes.push([Recipe.Rune, "Ber Rune", { condition: needBer }]);
  }

  // Cube to Um rune
  const needUm = function () {
    if (haveCoH()) {
      // If we have CoH, we do not need Um rune for this recipe
      return false;
    }
    return !me.getItem(sdk.items.runes.Um);
  };
  if (!me.getItem(sdk.items.runes.Um)) {
    Config.Recipes.push([Recipe.Rune, "Lem Rune", { condition: needUm }]);
    Config.Recipes.push([Recipe.Rune, "Pul Rune", { condition: needUm }]);
  }

  // Have Ber rune before looking for normal base
  if (me.getItem(sdk.items.runes.Ber)) {
    if (!me.getOwned(wanted).length) {
      NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 0 # [maxquantity] == 1");
    }

    NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
  } else {
    NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 4 # [maxquantity] == 1");
  }

  const needBase = function () {
    return !haveCoH() && !me.getOwned(wanted).length;
  };

  Config.Recipes.push([Recipe.Socket.Armor, "archonplate", { Ethereal: Roll.NonEth, condition: needBase }]);
  Config.Recipes.push([Recipe.Socket.Armor, "duskshroud", { Ethereal: Roll.NonEth, condition: needBase }]);
  Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide", { Ethereal: Roll.NonEth, condition: needBase }]);

  Config.Runewords.push([Runeword.ChainsofHonor, "archonplate", Roll.NonEth, 100]);
  Config.Runewords.push([Runeword.ChainsofHonor, "duskshroud", Roll.NonEth, 100]);
  Config.Runewords.push([Runeword.ChainsofHonor, "wyrmhide", Roll.NonEth, 100]);

  Config.KeepRunewords.push("[type] == armor # [fireresist] == 65 && [hpregen] == 7");
})();
