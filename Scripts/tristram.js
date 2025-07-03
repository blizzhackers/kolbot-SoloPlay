/**
*  @filename    tristram.js
*  @author      theBGuy
*  @credit      sonic, autosmurf
*  @desc        rescue cain and leveling
*
*/

function tristram () {
  let spots = [
    [25176, 5128], [25175, 5145], [25171, 5159], [25166, 5178],
    [25173, 5192], [25153, 5198], [25136, 5189], [25127, 5167],
    [25120, 5148], [25101, 5136], [25119, 5106], [25121, 5080],
    [25119, 5061], [4933, 4363]
  ];

  Town.doChores(false, { fullChores: true });
  myPrint("starting tristram");

  // Tristram portal hasn't been opened
  if (!Misc.checkQuest(sdk.quest.id.TheSearchForCain, 4)) {
    const getScroll = () => {
      if (me.getItem(sdk.quest.item.ScrollofInifuss) || me.getItem(sdk.quest.item.KeytotheCairnStones)) return true;
      Precast.doPrecast(true);
      if (!Pather.moveToPreset(sdk.areas.DarkWood, sdk.unittype.Object, sdk.quest.chest.InifussTree, 5, 5)) {
        console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Tree of Inifuss");
        return false;
      }

      Quest.collectItem(sdk.quest.item.ScrollofInifuss, sdk.quest.chest.InifussTree);
      Pickit.pickItems();
      return (me.getItem(sdk.quest.item.ScrollofInifuss || me.getItem(sdk.quest.item.KeytotheCairnStones)));
    };
    // missing scroll and key
    if (!me.getItem(sdk.items.quest.ScrollofInifuss) && !me.getItem(sdk.items.quest.KeytotheCairnStones)) {
      if (!Pather.checkWP(sdk.areas.BlackMarsh, true)) {
        Pather.useWaypoint(sdk.areas.DarkWood);
        getScroll();
        Pather.getWP(sdk.areas.BlackMarsh);
      } else {
        Pather.useWaypoint(sdk.areas.DarkWood);
        getScroll();
      }
    }

    if (me.getItem(sdk.items.quest.ScrollofInifuss)) {
      !me.inTown && Town.goToTown();
      Town.npcInteract("akara");
    }
  }

  Pather.checkWP(sdk.areas.StonyField, true)
    ? Pather.useWaypoint(sdk.areas.StonyField)
    : Pather.getWP(sdk.areas.StonyField);
  Precast.doPrecast(true);
  Pather.moveToPresetMonster(sdk.areas.StonyField, sdk.monsters.preset.Rakanishu, { callback: () => {
    let rak = Game.getMonster(getLocaleString(sdk.locale.monsters.Rakanishu));
    return rak && (rak.dead || rak.distance < 20);
  }, offX: 10, offY: 10 });
  Attack.killTarget(getLocaleString(sdk.locale.monsters.Rakanishu));
  Pather.moveToPreset(sdk.areas.StonyField, sdk.unittype.Object, sdk.quest.chest.StoneAlpha, null, null, true);

  if (!Misc.checkQuest(sdk.quest.id.TheSearchForCain, 4) && me.getItem(sdk.items.quest.KeytotheCairnStones)) {
    try {
      /**
       * @todo I know there is a way to read the correct stone order from the packet response, need to figure that out
       */
      include("core/Common/Cain.js");
      
      const stoneIds = [
        sdk.quest.chest.StoneAlpha, sdk.quest.chest.StoneBeta, sdk.quest.chest.StoneGamma,
        sdk.quest.chest.StoneDelta, sdk.quest.chest.StoneLambda
      ];
      const getStones = () => getUnits(sdk.unittype.Object).filter(s => stoneIds.includes(s.classid) && !s.mode);
      let stones = getStones();
      let sTick = getTickCount();
      let retry = true;

      while (stones.some((stone) => !stone.mode)) {
        for (let i = 0; i < stones.length; i++) {
          let stone = stones[i];

          if (Common.Cain.activateStone(stone)) {
            stones.splice(i, 1);
            i--;
          }

          if (getTickCount() - sTick < Time.minutes(2)) {
            if (retry) {
              stones = getStones();
              sTick = getTickCount();
            } else {
              return false;
            }
          }
          Attack.securePosition(me.x, me.y, 10, 0);
          delay(10);
        }
      }

      let tick = getTickCount();
      // wait up to two minutes
      while (getTickCount() - tick < 60 * 1000 * 2) {
        if (Pather.usePortal(sdk.areas.Tristram)) {
          break;
        }
        Attack.securePosition(me.x, me.y, 10, 1000);
      }
    } catch (err) {
      console.error(err);
      Pather.usePortal(sdk.areas.Tristram);
    }
  } else {
    Pather.usePortal(sdk.areas.Tristram);
  }

  if (me.inArea(sdk.areas.Tristram)) {
    if (!me.tristram) {
      let clearCoords = [
        { "x": 25166, "y": 5108, "radius": 10 },
        { "x": 25164, "y": 5115, "radius": 10 },
        { "x": 25163, "y": 5121, "radius": 10 },
        { "x": 25158, "y": 5126, "radius": 10 },
        { "x": 25151, "y": 5125, "radius": 10 },
        { "x": 25145, "y": 5129, "radius": 10 },
        { "x": 25142, "y": 5135, "radius": 10 }
      ];
      Attack.clearCoordList(clearCoords);

      let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

      if (gibbet && !gibbet.mode) {
        Pather.moveTo(gibbet.x, gibbet.y);
        Misc.openChest(gibbet);
      }

      Town.npcInteract("akara");
      Pather.usePortal(sdk.areas.Tristram, me.name);
    }

    Attack.clearLocations(spots);
  }

  if (me.cain) {
    delete Common.Cain;
  }

  return true;
}
