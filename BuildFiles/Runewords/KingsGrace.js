(function () {
  const KingsGrace = [
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == RalRune # # [maxquantity] == 1",
    "[name] == ThulRune # # [maxquantity] == 1",
    "[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 # [sockets] == 3 # [maxquantity] == 1",
    "([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == colossussword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(KingsGrace);

  Config.Runewords.push([Runeword.KingsGrace, "broadsword"]);
  Config.Runewords.push([Runeword.KingsGrace, "longsword"]);
  Config.Runewords.push([Runeword.KingsGrace, "warsword"]);
  Config.Runewords.push([Runeword.KingsGrace, "giantsword"]);
  Config.Runewords.push([Runeword.KingsGrace, "flamberge"]);
  Config.Runewords.push([Runeword.KingsGrace, "dimensionalblade"]);
  Config.Runewords.push([Runeword.KingsGrace, "battlesword"]);
  Config.Runewords.push([Runeword.KingsGrace, "runesword"]);
  Config.Runewords.push([Runeword.KingsGrace, "ancientsword"]);
  Config.Runewords.push([Runeword.KingsGrace, "espandon"]);
  Config.Runewords.push([Runeword.KingsGrace, "tusksword"]);
  Config.Runewords.push([Runeword.KingsGrace, "zweihander"]);
  Config.Runewords.push([Runeword.KingsGrace, "legendsword"]);
  Config.Runewords.push([Runeword.KingsGrace, "highlandblade"]);
  Config.Runewords.push([Runeword.KingsGrace, "balrogblade"]);
  Config.Runewords.push([Runeword.KingsGrace, "colossussword"]);

  Config.KeepRunewords.push("[type] == sword # [enhanceddamage] >= 100 && [lifeleech] >= 7");
})();
