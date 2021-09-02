![extract into](https://i.imgur.com/TcRmoRm.png)

## What is this?
Kolbot-SoloPlay is an hands-off autoplay script to take any charcter diablo 2 character class from 1-99 using Kolbot. It will level towards an end-game build that you choose. See ```Brief History``` for more info. 

If you are enjoying my version consider supporting me at https://www.buymeacoffee.com/theBGuy

## Statistics (will become filled out as data becomes available)
| Level | Amazon | Sorceress | Necromancer | Paladin | Barbarian | Druid | Assassin |
|:------:|:------:|:-------:|:-------:|:------:|:------:|:------:|:-----:|
| 1-70 | 22h | 17h | 24h | 23h | 38h | 19h | 22h |
| 1-80 |  | 26h |  | 32h | 82h | 34h |  |
| 1-90 |  |  |  |  |  |  |  |

**NOTE:** This script is designed to be only run from [https://github.com/blizzhackers/kolbot](https://github.com/blizzhackers/kolbot). Most errors occur from using the wrong Kolbot repo installation. 

## Features
- Operates in Hell difficulty within 24 hours (the exception is the barbarian class that takes 48)
- Includes character build options for final respec
- Plays and finishes the game through Act 5 Hell
- Hires class/build specific mercenary
- Fully configured Autoequip for bot and mercenary
- Makes and equips CTA and spirit shield on swap
- Uses and dynamically equips charms
- Add socketables to end game gear (for example Perfect Diamonds to Moser's Blessed Shield or Um rune to Shako)

## Available Characters and Builds
| Amazon | Sorceress | Necromancer | Paladin | Barbarian | Druid | Assassin |
|:------:|:-------:|:-------:|:------:|:------:|:------:|:-----:|
| Javazon | Cold | Poison | Hammerdin| Whirlwind | Wind |Trapsin|
| Witchyzon | BlizzBaller |   Bone | Smiter| Immortalwhirl | Elemental |
| | Meteorb | Summon | Auradin | Frenzy | Plaguewolf |
| | Blova | | Zealer | Uberconc | Wolf |
| | Lightning | | | Singer |

## New modes
- Two new modes are available: **Bumper** and **Socketmule**. Enter either of these into your D2Bot# profile info tag to make. The bot will then stop after shenk quest for Socketmule and after it hits level 40 for a Bumper.
- **Note: These options only work in expansion.**

| Mode | Example |
|:------:|:-------:|
| Bumper | ![image](https://user-images.githubusercontent.com/60308670/131758626-46b8e886-726d-4751-bc33-aa750e2c5b0e.png) |
| Socketmule | ![image](https://user-images.githubusercontent.com/60308670/131758691-5fce3c06-05a0-4058-8abb-8d81d6d538a9.png) |

## Frequently Asked Questions
**Q: Why isn't the bot making the build I selected?**

**A:** The bot follows a set build progression. As it progresses, it will respecialize 2 times transitioning from a start build to a leveling build, ending at the selected finalbuild.

**Q: When will the bot change to the final build I selected?**

**A:** In classic the bot will switch to the final build based on level. In expansion it transitions to the final build when final gear requirements are met.

**Q: The bot has beaten diablo (classic) / baal, so why isn't moving on to the next difficulty?**

**A:** The bot will only progress once it has reached a minimum minimum character level (33 for normal and 65 for nightmare) and will not start the next difficulty with negative resistances. If the bot is more than 5 levels higher than the minimum character level and has not reached the required resistances, it will automatically move to the next difficulty.

**Q: How can I run more than one of the same class?**

**A:** Simply append a number after the class name. For example, if you want to run 5 sorceresses just name the profiles: `SCL-SORC-1`, `SCL-SORC-2`, `SCL-SORC-3`, `SCL-SORC-4`, `SCL-SORC-5`. Example Profile Names are listed at the bottom of the install guide.

**Q: HELP!!! There an error when starting the bot?**

**A:** There was a bad installation OR the profile settings are wrong. First verify that you using the kolbot version linked the install guide below. Next, confirm you have installed all the files into their proper locations (including overwriting the existing `_customconfig.js` and `default.dbj`). Finally, verify the profile name and infotag follow the format of the install guide's instructions.

**Q: What is a Bumper?**

**A:** A Bumper is a level 40 character that has not done baal quest in normal and is used to "bump" low level characters to hell difficulty where they can power level following chaos runs. 

## Really Dumb Frequently Asked Questions
**Q: Can I make my solo bots work together?**

**A:** NO. It is SOLO not team, not group, but SoloPlay

## Install Guide
| Step | Instructions | |
|:------:|:-------|-------:|
| 1.| Download Kolbot here: [github.com/blizzhackers/kolbot](https://github.com/blizzhackers/kolbot). |![blizzhackers github](https://i.imgur.com/RksqKEA.jpg) |
| 2.| Click the green button to Download SoloPlay. |![enter image description here](https://i.imgur.com/cNqZDbW.jpg) |
| 3.a| Copy and paste the following: `default.dbj`, `D2BotSoloPlay.dbj`, `D2BotSoloCleaner.dbj`, and the entire `\libs` folder into `\d2bs\kolbot`.| |
|3.b|A successful installation will show 2 new files in the folder and look similar to the second image|![image](https://user-images.githubusercontent.com/60308670/131760184-ba777302-908e-4247-b9b7-1c9331028b2c.png)| 4.| Select Add for new a Kolbot Profile. | ![Add-profile.jpg](https://imgur.com/tHs9ZoH.jpg)|
| 4.a| Select and Input a profile name. See the **Possible Profile Name Choices** below for a list of available options. | ![extract into](https://i.imgur.com/2YcGKVH.png) |
| 4.b| ***Optional*** Input your account name. If no name than a random account is created. | |
| 4.c|***Optional*** Input your account password. If no name than a random password is created. | |
| 4.d|***Optional*** Input your character name. If no name than a random name is created. | ![enter character name](https://i.imgur.com/0jxaS8j.png) |
|5.| Select Entry Script `D2BotSoloPlay.dbj`.| ![Select Entry Script](https://i.imgur.com/f0vTLqC.png)|
|6.| Input your Info Tag Information. See **Available Characters and Builds** or **New modes** for a a list of options. <br><br> Make sure the spelling matches the listed builds and there are no trailing spaces. | ![enter image description here](https://i.imgur.com/zVzOBQ7.png)|
|7.|Ensure your Game Path, Key List, Realm, Mode are all set on the settings you want to use then click Apply.||
|8.|Run the Bot.||
|9.|Enjoy!||

## Possible Profile Names 
| Prefix | Description|
|:----|:--|
|HCCNL| Hardcore Classic NonLadder|
|HCCL| Hardcore Classic Ladder|
|HCNL| Hardcore Expansion NonLadder|
|HCL| Hardcore Expansion Ladder|
|SCCNL| Softcore Classic NonLadder|
|SCCL| Softcore Classic Ladder|
|SCNL| Softcore Expansion NonLadder|
|SCL| Softcore Expansion Ladder|

| Suffix | Description|
|:----|:--|
|ZON| Amazon Class|
|SORC| Sorceress Class|
|NECRO| Necromancer Class|
|PAL| Paladin Class|
|BARB| Barbarian Class
|DRU| Druid Class|
|SIN| Assassin Class|

#### Example Profile Names
- **SCL-PAL** would make a softcore expansion ladder paladin
- **HCL-SIN** would make a hardcore expansion ladder assassin
- **SCNL-SORC** would make a softcore expansion nonladder sorceress
- **HCNL-DRU** would make a hardcore expansion nonladder druid
- **SCCL-NECRO** would make a softcore classic ladder necromancer
- **HCCL-NECRO** would make a hardcore classic ladder necromancer
- **SCCNL-PAL** would make a softcore classic nonladder paladin
- **HCCNL-SORC** would make a hardcore classic nonladder sorceress

## Extras
- Navigate to libs\SoloPlay\Tools\Developer.js for extra options
- Developer.js includes options such as:
  - logging equipped items
  - Turning on/off the overlay
  - Options to fillAccount for Socketmule/Bumper
  - showing or hiding casting animations

## D2BotSoloCleaner
- The purpose of this entryscript is to delete old characters and optional related files.
- Extra Features
   - DataCleaner to delete old files associated with running SoloPlay 
   - SaveFiles to save important files to SoloPlay/Data/ for performance review
   - single player option
   - **Note:** DataCleaner and SaveFiles can both be used for cleaning/saving files without having to delete associated characters

## Discord
**Big shout-out to Xcon for setting up this discord channel**
- If you have any questions please join me on my discord
https://discord.gg/5pjTC2zH6N

![image](https://user-images.githubusercontent.com/60308670/131765716-16be931a-3499-4508-9c4f-f280d2e5d68f.png)

## Brief History
SoloLeveling was created by isid0re, he wanted the ability to level a smiter easily somthing that Sonic, AutoPlay, and AutoSorc weren't able to do. He started off SoloLeveling by modding Questing.js, then started having to add new functions for pathing, ntip, ect. Almost from the beginning, Isid0re and I were bouncing ideas off each other. At that time I was working on a separate project, but we discussed ideas that helped both of our projects. I officially joined in around 4 months or so after the Github repo went public and was actively involved in the project until 6/30/2021. I contributed updates including but not limited to: item based respec, the overlay, logging equipped items, showing tier values on items, bug fixes, sorting, D2BotSoloCleaner, performance tracking, ect. Due to some personal conflicts between isid0re and myself, I decided to create GuysSoloLeveling to have all of my ideas in one place. On 6/30/2021 I created this repo and on 7/13/2021 I made it public. On 9/1/2021, I changed the name to Kolbot-SoloPlay after some major changes in structure.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)
