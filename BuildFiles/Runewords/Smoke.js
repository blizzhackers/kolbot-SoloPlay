(function () {
  if (!me.checkItem({ name: sdk.locale.items.Smoke }).have && !me.hell) {
    // Cube to Lum Rune
    const needLum = function () {
      return !me.getItem(sdk.items.runes.Lum);
    };
    Config.Recipes.push([Recipe.Rune, "Io Rune", { condition: needLum }]);

    const smokeRunes = [
      "[name] == NefRune # # [maxquantity] == 1",
      "[name] == LumRune # # [maxquantity] == 1",
    ];
    NTIP.buildList(smokeRunes);
  }

  // Have Lum rune before looking for base
  if (me.getItem(sdk.items.runes.Lum)) {
    NTIP.addLine(
      // nip
      "[name] in (demonhidearmor, duskshroud, ghostarmor, lightplate, mageplate, serpentskinarmor, trellisedarmor, wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 && [maxdurability] == 0 # [mq] == 1"
    );
  }

  Config.Runewords.push([Runeword.Smoke, "demonhidearmor"]);
  Config.Runewords.push([Runeword.Smoke, "duskshroud"]);
  Config.Runewords.push([Runeword.Smoke, "ghostarmor"]);
  Config.Runewords.push([Runeword.Smoke, "lightplate"]);
  Config.Runewords.push([Runeword.Smoke, "mageplate"]);
  Config.Runewords.push([Runeword.Smoke, "serpentskinarmor"]);
  Config.Runewords.push([Runeword.Smoke, "trellisedarmor"]);
  Config.Runewords.push([Runeword.Smoke, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [fireresist] == 50");
})();
