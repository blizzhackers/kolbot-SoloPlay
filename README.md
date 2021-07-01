![SoloLeveling](https://i.imgur.com/6UMDGFk.png)

## What is this?
This is my version of SoloLeveling forked from the master branch on 6/30/2021. Everything from then on is my code.

SoloLeveling is an automated leveling script for any Diablo 2 characters using Kolbot. The overall goal of the project is to be the easiest and fastest leveling script for any character class.

**NOTE:** This script is designed to be only run from [https://github.com/blizzhackers/kolbot](https://github.com/blizzhackers/kolbot). Most errors occur from using the wrong Kolbot repo installation. 

If you enjoy using SoloLeveling consider supporting me at [buymeacoffee.com/isid0re](https://www.buymeacoffee.com/isid0re).

## Features
- Operates in Hell difficulty within 24 hours
- Includes character build options for final respec
- Plays and finishes the game through Act 5 Hell
- Hires class/build specific mercenary
- Fully configured Autoequip for bot and mercenary
- Makes and equips CTA and spirit shield on swap

## Available Characters and Builds
| Amazon | Sorceress | Necromancer | Paladin | Barbarian | Druid | Assassin |
|:------:|:-------:|:-------:|:------:|:------:|:------:|:-----:|
| Javazon | Cold | Poison | Hammerdin| Currently N/A | Wind |Trapsin|
| Witchyzon | BlizzBaller |   Bone | Smiter| | Elemental |
| | Meteorb | Summon | |
| | Blova | |
| | Lightning | |

## Frequently Asked Questions
**Q: Why isn't the bot making the build I selected?**

**A:** The bot follows a set build progression. As it progresses, it will respecialize 2 times transitioning from a start build to a leveling build, ending at the selected finalbuild.

**Q: The bot has beaten diablo (classic) / baal, so why isn't moving on to the next difficulty?**

**A:** The bot will only progress once it has reached a minimum minimum character level (33 for normal and 65 for nightmare) and will not start the next difficulty with negative resistances. If the bot is more than 5 levels higher than the minimum character level and has not reached the required resistances, it will automatically move to the next difficulty.

**Q: How can I run more than one of the same class?**

**A:** Simply append a number after the class name. For example, if you want to run 5 sorceresses just name the profiles: `SCL-SORC-1`, `SCL-SORC-2`, `SCL-SORC-3`, `SCL-SORC-4`, `SCL-SORC-5`. Example Profile Names are listed at the bottom of the install guide.

**Q: HELP!!! There an error when starting the bot?**

**A:** There was a bad installation OR the profile settings are wrong. First verify that you using the kolbot version linked the install guide below. Next, confirm you have installed all the files into their proper locations (including overwriting the existing `_customconfig.js` and `default.dbj`). Finally, verify the profile name and infotag follow the format of the install guide's instructions.

## Install Guide
| Step | Instructions | |
|:------:|:-------|-------:|
| 1.| Download Kolbot here: [github.com/blizzhackers/kolbot](https://github.com/blizzhackers/kolbot). |![blizzhackers github](https://i.imgur.com/RksqKEA.jpg) |
| 2.| Click the green button to Download SoloLeveling. |![enter image description here](https://i.imgur.com/cNqZDbW.jpg) |
| 3.a| Copy and paste the following: `default.dbj`, `D2BotSoloLevelingEntry.dbj`, `D2BotSoloCleaner.dbj`, and the entire `\libs` folder into `\d2bs\kolbot`.| |
|3.b|A successful installation will show 2 new files in the folder and look similar to the second image|![extract into](https://i.imgur.com/5OxVVNH.jpg)| 4.| Select Add for new a Kolbot Profile. | ![Add-profile.jpg](https://imgur.com/tHs9ZoH.jpg)|
| 4.a| Select and Input a profile name. See the **Possible Profile Name Choices** below for a list of available options. | ![set profile name](https://imgur.com/B865nPU.jpg) |
| 4.b| ***Optional*** Input your account name. If no name than a random account is created. | |
| 4.c|***Optional*** Input your account password. If no name than a random password is created. | |
| 4.d|***Optional*** Input your character name. If no name than a random name is created. | ![enter character name](https://i.imgur.com/Casmjbc.jpg) |
|5.| Select Entry Script `D2BotSoloLevelingEntry.dbj`.| ![Select Entry Script](https://imgur.com/tZnH7kU.jpg)|
|6.| Input your Info Tag Information. See **Available Characters and Builds** for a a list of options. <br><br> Make sure the spelling matches the listed builds and there are no trailing spaces. | ![enter image description here](https://i.imgur.com/gmUQvbw.jpg)|
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
|BARB| Barbarian Class **NOT CURRENTLY AVAILABLE**|
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

## Discord
Join me on Discord. Link is here: https://discord.gg/q7tME8RAHh

## Support SoloLeveling
This is a hobby project that I'm doing in my spare time. So if you enjoy using SoloLeveling consider supporting me at [buymeacoffee.com/isid0re](https://www.buymeacoffee.com/isid0re).

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)

## Banner Image 
The banner for SoloLeveling was graciously provided by [Patricia Dias](https://www.behance.net/patricia_dias).
