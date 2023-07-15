(function () {
  if (!me.checkItem({ name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Sword }).have
    && !me.hell) {
    const SpiritSword = [
      "[name] == TalRune # # [maxquantity] == 1",
      "[name] == ThulRune # # [maxquantity] == 1",
      "[name] == OrtRune # # [maxquantity] == 1",
      "[name] == AmnRune # # [maxquantity] == 1",
    ];
    NTIP.buildList(SpiritSword);

    // Cube to Amn Rune
    if (!me.getItem(sdk.items.runes.Amn)) {
      Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
      Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
    }

    if (!me.barbarian) {
      NTIP.addLine("([name] == broadsword || [name] == crystalsword) && [flag] != ethereal && [quality] == normal && [level] >= 26 && [level] <= 40 # ([sockets] == 0 || [sockets] == 4) # [maxquantity] == 1");
    } else {
    // Have Thul and Amn before looking for base
      if (me.getItem(sdk.items.runes.Thul) && me.getItem(sdk.items.runes.Amn)) {
        NTIP.addLine("([name] == broadsword || [name] == crystalsword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
      }
    }
  
    Config.Recipes.push([Recipe.Socket.Weapon, "crystalsword", Roll.NonEth]);
    Config.Recipes.push([Recipe.Socket.Weapon, "broadsword", Roll.NonEth]);
  } else {
    if (!me.barbarian) {
      NTIP.addLine("([name] == broadsword || [name] == crystalsword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
    } else {
      !me.getItem(sdk.items.runes.Amn) && Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
      // Have Thul and Amn before looking for base
      if (me.getItem(sdk.items.runes.Thul) && me.getItem(sdk.items.runes.Amn)) {
        NTIP.addLine("([name] == broadsword || [name] == crystalsword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
      }
    }
  }

  Config.Runewords.push([Runeword.Spirit, "crystalsword"]);
  Config.Runewords.push([Runeword.Spirit, "broadsword"]);

  Config.KeepRunewords.push("[type] == sword # [fcr] >= 25 && [maxmana] >= 89");
})();
