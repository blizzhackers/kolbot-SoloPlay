(function () {
  const treach = [
    "[name] == ShaelRune # # [maxquantity] == 1",
    "[name] == ThulRune # # [maxquantity] == 1",
    "[name] == LemRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(treach);
  
  const MercTreachery = [
    "([name] == breastplate || [name] == mageplate || [name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
    "!me.normal && ([name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] == normal && [flag] == ethereal # [sockets] == 0 # [maxquantity] == 1",
  ];

  // Have Shael and Lem before looking for base
  if (me.getItem(sdk.items.runes.Shael) && me.getItem(sdk.items.runes.Lem)) {
    NTIP.buildList(MercTreachery);
  }

  Config.Recipes.push([Recipe.Socket.Armor, "hellforgeplate"]);
  Config.Recipes.push([Recipe.Socket.Armor, "krakenshell"]);
  Config.Recipes.push([Recipe.Socket.Armor, "archonplate"]);
  Config.Recipes.push([Recipe.Socket.Armor, "balrogskin"]);
  Config.Recipes.push([Recipe.Socket.Armor, "boneweave"]);
  Config.Recipes.push([Recipe.Socket.Armor, "greathauberk"]);
  Config.Recipes.push([Recipe.Socket.Armor, "loricatedmail"]);
  Config.Recipes.push([Recipe.Socket.Armor, "diamondmail"]);
  Config.Recipes.push([Recipe.Socket.Armor, "wirefleece"]);
  Config.Recipes.push([Recipe.Socket.Armor, "scarabhusk"]);
  Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide"]);
  Config.Recipes.push([Recipe.Socket.Armor, "duskshroud"]);

  Config.Runewords.push([Runeword.Treachery, "breastplate"]);
  Config.Runewords.push([Runeword.Treachery, "mageplate"]);
  Config.Runewords.push([Runeword.Treachery, "hellforgeplate"]);
  Config.Runewords.push([Runeword.Treachery, "krakenshell"]);
  Config.Runewords.push([Runeword.Treachery, "archonplate"]);
  Config.Runewords.push([Runeword.Treachery, "balrogskin"]);
  Config.Runewords.push([Runeword.Treachery, "boneweave"]);
  Config.Runewords.push([Runeword.Treachery, "greathauberk"]);
  Config.Runewords.push([Runeword.Treachery, "loricatedmail"]);
  Config.Runewords.push([Runeword.Treachery, "diamondmail"]);
  Config.Runewords.push([Runeword.Treachery, "wirefleece"]);
  Config.Runewords.push([Runeword.Treachery, "scarabhusk"]);
  Config.Runewords.push([Runeword.Treachery, "wyrmhide"]);
  Config.Runewords.push([Runeword.Treachery, "duskshroud"]);

  Config.KeepRunewords.push("[type] == armor # [ias] == 45 && [coldresist] == 30");
})();
