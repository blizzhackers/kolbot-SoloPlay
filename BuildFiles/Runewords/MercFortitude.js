(function () {
  const fort = [
    "[name] == ElRune # # [maxquantity] == 1",
    "[name] == SolRune # # [maxquantity] == 1",
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == LoRune",
    "([name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] == normal && [flag] == ethereal # [Defense] >= 1000 && [sockets] == 4 # [maxquantity] == 1",
    "([name] == hellforgeplate || [name] == krakenshell || [name] == archonplate || [name] == balrogskin || [name] == boneweave || [name] == greathauberk || [name] == loricatedmail || [name] == diamondmail || [name] == wirefleece || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [quality] == normal && [flag] == ethereal # [Defense] >= 700 && [sockets] == 0 # [maxquantity] == 1",
  ];

  if (["Zealer", "Smiter", "Frenzy", "Whirlwind", "Uberconc", "Wolf"].includes(SetUp.finalBuild)) {
  // Make Grief first, if using it for final build
    if (me.checkItem({ name: sdk.locale.items.Grief, itemtype: sdk.items.type.Sword }).have) {
      NTIP.buildList(fort);
    }
  } else if (["Blova", "Lightning"].includes(SetUp.currentBuild)) {
  // Make Chains of Honor first for Blova/Lightning, or already have ber so Lo isn't needed for cubing
    if (me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have || me.getItem(sdk.items.runes.Ber)) {
      NTIP.buildList(fort);
    }
  } else {
    NTIP.buildList(fort);
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

  Config.Runewords.push([Runeword.Fortitude, "hellforgeplate"]);
  Config.Runewords.push([Runeword.Fortitude, "krakenshell"]);
  Config.Runewords.push([Runeword.Fortitude, "archonplate"]);
  Config.Runewords.push([Runeword.Fortitude, "balrogskin"]);
  Config.Runewords.push([Runeword.Fortitude, "boneweave"]);
  Config.Runewords.push([Runeword.Fortitude, "greathauberk"]);
  Config.Runewords.push([Runeword.Fortitude, "loricatedmail"]);
  Config.Runewords.push([Runeword.Fortitude, "diamondmail"]);
  Config.Runewords.push([Runeword.Fortitude, "wirefleece"]);
  Config.Runewords.push([Runeword.Fortitude, "scarabhusk"]);
  Config.Runewords.push([Runeword.Fortitude, "wyrmhide"]);
  Config.Runewords.push([Runeword.Fortitude, "duskshroud"]);

  Config.KeepRunewords.push("[type] == armor # [enhanceddefense] >= 200 && [enhanceddamage] >= 300");
})();
