/*
*	@filename	baal.js
*	@author		theBGuy
*	@credits 	sonic
*	@desc		clear throne and kill baal
*/

function baal () {
    Config.BossPriority = false;

    if (me.amazon) {
        var decoyTick = 0;
        var decoyDuration = (10 + me.getSkill(28, 1) * 5) * 1000;
    }

    let clearThrone = function () {
        let pos = [
            { x: 15097, y: 5054 }, { x: 15085, y: 5053 },
            { x: 15085, y: 5040 }, { x: 15098, y: 5040 },
            { x: 15099, y: 5022 }, { x: 15086, y: 5024 }
        ];
        return pos.forEach((node) => {
            Pather.moveTo(node.x, node.y);
            Attack.clear(30);
        })
    };

    let preattack = function () {
        switch (me.classid) {
            case 0: // Amazon
                if (me.getSkill(28, 1)) {    
                    let decoy = getUnit(1, 356);

                    if (!decoy || (getTickCount() - decoyTick >= decoyDuration)){
                        Skill.cast(28, 0, 15092, 5028);
                        decoyTick = getTickCount();
                    }
                }

                break;
            case 1:
                if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
                    if (me.getState(121)) {
                        delay(50);
                    } else {
                        Skill.cast(Config.AttackSkill[1], 0, 15093, 5024);
                    }
                }

                return true;
            case 3: // Paladin
                if (Config.AttackSkill[3] !== 112) {
                    return false;
                }

                if (getDistance(me, 15093, 5029) > 3) {
                    Pather.moveTo(15093, 5029);
                }

                if (Config.AttackSkill[4] > 0) {
                    Skill.setSkill(Config.AttackSkill[4], 0);
                }

                Skill.cast(Config.AttackSkill[3], 1);

                return true;
            case 5: // Druid
                if (Config.AttackSkill[3] === 245) {
                    Skill.cast(Config.AttackSkill[3], 0, 15093, 5029);

                    return true;
                }

                break;
            case 6:
                if (Config.UseTraps) {
                    let check = ClassAttack.checkTraps({x: 15093, y: 5029});

                    if (check) {
                        ClassAttack.placeTraps({x: 15093, y: 5029}, 5);

                        return true;
                    }
                }

                break;
        }

        return false;
    };

    let checkThrone = function () {
        let monster = getUnit(1);

        if (monster) {
            do {
                if (Attack.checkMonster(monster) && monster.y < 5080) {
                    switch (monster.classid) {
                        case 23:
                        case 62:
                            return 1;
                        case 105:
                        case 381:
                            return 2;
                        case 557:
                            return 3;
                        case 558:
                            return 4;
                        case 571:
                            return 5;
                        default:
                            Attack.getIntoPosition(monster, 10, 0x4);
                            Attack.clear(15);

                            return false;
                    }
                }
            } while (monster.getNext());
        }

        return false;
    };

    let clearWaves = function () {
        let boss;
        let tick = getTickCount();

        MainLoop:
            while (true) {
                //SetUp.walkToggle = true;

                if (!getUnit(1, 543)) {
                    break;
                }

                //me.runwalk = 0;

                Misc.townCheck();

                switch (checkThrone()) {
                    case 1:
                        Attack.clearClassids(23, 62);

                        tick = getTickCount();

                        break;
                    case 2:
                        boss = getUnit(1, "Achmel the Cursed");

                        if (boss && !Attack.canAttack(boss)) {
                            me.overhead("immune achmel");
                            return false;
                        }

                        Attack.clearClassids(105, 381);

                        tick = getTickCount();

                        break;
                    case 4:
                        Attack.clearClassids(558);

                        tick = getTickCount();

                        break;
                    case 3:
                        Attack.clearClassids(557);

                        tick = getTickCount();

                        break;
                    case 5:
                        boss = getUnit(1, "Lister the Tormentor");

                        if (boss && !Attack.canAttack(boss)) {
                            me.overhead("immune lister");
                            return false;
                        }

                        Attack.clearClassids(571);

                        break MainLoop;
                    default:
                        if (getTickCount() - tick < 7e3) {
                            if (me.getState(2)) {
                                Skill.setSkill(109, 0);
                            }
                        }

                        if (getTickCount() - tick > 20000) {
                            tick = getTickCount();
                            clearThrone();
                        }

                        if (!preattack()) {
                            delay(50);
                        }

                        break;
                }

                if (me.classid === 4 ? getDistance(me, 15112, 5062) : getDistance(me, 15116, 5026) > 3) {       // Thanks aim2kill
                    me.classid === 4 ? Pather.moveTo(15112, 5062) : Pather.moveTo(15116, 5026);
                }

                delay(10);
            }

        return true;
    };

    let unSafeCheck = function (soulAmount, totalAmount) {
        let soul = getUnit(1, 641);
        let count = 0;

        if (soul) {
            do {
                if (getDistance(me, soul) < 45) {
                    count += 1;
                }
            } while (soul.getNext());
        }

        if (count > soulAmount) {
            return true;
        }

        let monster = getUnit(1);

        if (monster) {
            do {
                if (!monster.getParent() && monster.classid != 641 && getDistance(me, monster) < 45) {
                    count += 1;
                }
            } while (monster.getNext());
        }

        return count > totalAmount;
    };

    Town.townTasks();
    print('ÿc8Kolbot-SoloPlayÿc0: starting baal');
    me.overhead("baal");

    if (!Pather.checkWP(129)) {
    	Pather.getWP(129, true);
    } else {
    	Pather.useWaypoint(129);
    }

    Precast.doPrecast(true);
    Pather.clearToExit(129, 130, true); 	//WS2 -> WS3
    Pather.clearToExit(130, 131, true); 	//WS3 -> Throne

    Pather.moveTo(15095, 5029, 5);
    Pather.moveTo(15113, 5040, 5);

    // souls hurt
    if (unSafeCheck(8, 20) && Check.Resistance().LR < 70 && me.nightmare) {
        return true;
    }

    Attack.clear(15);
    clearThrone();

    if (Check.Resistance().CR < 75 || Check.Resistance().PR < 75) {
        Town.doChores();
        Town.buyPots(10, "Thawing"); // thawing
        Town.drinkPots();
        Town.buyPots(10, "Antidote"); // antidote
        Town.drinkPots();
        Town.move("portalspot");
        Pather.usePortal(131, me.name);
    }

    if (!clearWaves()) {
        return true;
    }

    clearThrone(); // double check

    Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
    Pickit.pickItems();

    Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
    Pickit.pickItems();
    Pather.moveTo(15090, 5008);
    delay(2500 + me.ping);
    Precast.doPrecast(true);
    SetUp.walkToggle = false;

    while (getUnit(1, 543)) {
    	delay(500 + me.ping);
    }

    if (SetUp.finalBuild === "Bumper") {
    	return true;
    }

    let portal = getUnit(2, 563);

    if (portal) {
    	Pather.usePortal(null, null, portal);
    } else {
    	print("ÿc8Kolbot-SoloPlayÿc0: Couldn't access portal.");
    }

    Config.BossPriority = true;
    Pather.moveTo(15134, 5923);
    Attack.killTarget(544); // Baal	
    Pickit.pickItems();

    // Grab static gold
    NTIP.addLine("[name] == gold # [gold] >= 25");
    Pather.moveTo(15072, 5894);
    Pickit.pickItems();
    Pather.moveTo(15095, 5881);
    Pickit.pickItems();

    return true;
}
