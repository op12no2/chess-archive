
Lozza v2.5 Licenced under GPL v3

1. Install Nodejs

For Windows go to https://nodejs.org. For Linux use "sudo apt install nodejs".
Nodejs is available for most platforms including Mac and even a Raspberry Pi.
Use an internet search to find out how to install it on your platform.

2. Add Lozza to your chess UI

This is a little bit different to other engines. Edit the lozza.bat
file contained in the release to point at the Nodejs executable with lozza.js as a parameter.
Full paths are recommended. For example:-

  "c:\program files\nodejs\node.exe" "c:\path\to\lozza.js"

The " characters are needed for Windows if there are spaces in the pathnames; your platform
may be different.

Now use lozza.bat as the engine target in the UI; similarly for Linux/Mac etc.

Note that if your chess UI allows parameters to the engine executable you can bypass the batch file
using Nodejs as the engine and lozza.js as the parameter and again full paths are recommended.

3. Notes

You can also use Lozza from the command line by starting Nodejs with lozza.js as a parameter.

For example on Windows:-

  cd <path to lozza.js>
  "c:\program files\nodejs\node.exe" lozza.js

Then you can enter UCI commands. Use quit or q to exit. b displays the board. eval shows a
static evaluation. See https://op12no2.github.io/lozza-ui/consolehelp.htm for other command
extensions.

Play Lozza online at https://op12no2.github.io/lozza-ui, where there are also analysis, mate
trainer and console UIs.

Have fun!

Colin Jenkins
op12no2@gmail.com
https://github.com/op12no2/lozza

