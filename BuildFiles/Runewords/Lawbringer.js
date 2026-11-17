(function () {
  const Lawbringer = [
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == LemRune",
    "[name] == KoRune",
  ];
  NTIP.buildList(Lawbringer);

  // Have Lem and Ko runes before looking for normal base
  if (me.getItem(sdk.items.runes.Lem) && me.getItem(sdk.items.runes.Ko)) {
    NTIP.addLine("[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 # [sockets] == 3");
    NTIP.addLine("([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == championsword || [name] == colossussword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3");
  } else {
    NTIP.addLine("([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == championsword || [name] == colossussword) && [flag] != ethereal && [quality] == superior # [enhanceddamage] >= 5 && [sockets] == 3");
  }

  Config.Runewords.push([Runeword.Lawbringer, "dimensionalblade"]);
  Config.Runewords.push([Runeword.Lawbringer, "battlesword"]);
  Config.Runewords.push([Runeword.Lawbringer, "runesword"]);
  Config.Runewords.push([Runeword.Lawbringer, "conquestsword"]);
  Config.Runewords.push([Runeword.Lawbringer, "crypticsword"]);
  Config.Runewords.push([Runeword.Lawbringer, "phaseblade"]);
  Config.Runewords.push([Runeword.Lawbringer, "espandon"]);
  Config.Runewords.push([Runeword.Lawbringer, "tusksword"]);
  Config.Runewords.push([Runeword.Lawbringer, "zweihander"]);
  Config.Runewords.push([Runeword.Lawbringer, "legendsword"]);
  Config.Runewords.push([Runeword.Lawbringer, "highlandblade"]);
  Config.Runewords.push([Runeword.Lawbringer, "balrogblade"]);
  Config.Runewords.push([Runeword.Lawbringer, "championsword"]);
  Config.Runewords.push([Runeword.Lawbringer, "colossussword"]);

  Config.KeepRunewords.push("[type] == sword # [sanctuaryaura] >= 16");
})();
