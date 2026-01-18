
1. Install Nodejs

For Windows go to https://nodejs.org. For Linux it's probably already installed
but if not use "sudo apt install nodejs". Nodejs is available for most platforms
including Mac and even a Raspberry Pi. Use an internet search to find out how to
install it on your platform.

2. Add Cwtch to your chess UI

This is a little bit different to other engines. Edit the cwtch.bat file contained
in the release to point at the Nodejs executable with cwtch.js as a parameter.
Full paths are recommended. For example:-

  "c:\program files\nodejs\node.exe" "c:\path\to\cwtch.js"

The " characters are needed for Windows if there are spaces in the pathnames; your
platform may be different.

Now use cwtch.bat as the engine target in the UI; similarly for Linux/Mac etc.

Note that if your chess UI allows parameters to the engine executable you can bypass
the batch file using Nodejs as the engine and cwtch.js as the parameter and again
full paths are recommended.

3. Notes

You can also use Cwtch from the command line by starting Nodejs with cwtch.js as a
parameter.

For example on Windows:-

  cd <path to cwtch.js>
  "c:\program files\nodejs\node.exe" cwtch.js

Then you can enter UCI commands. Use quit or q to exit. b displays the board. eval
shows a static evaluation. See the uciExec function for other command extensions,
including datagen.

If you are inclined you can build your own nets for Cwtch using the datagen command
and the trainer in the repo. Contact me for details.

Have fun!

Colin Jenkins
op12no2@gmail.com
07470 525348
https://github.com/op12no2/cwtch

