makemeasandwich.js
==========================
This is a Node.js application that is capable of ordering a Jimmy John's sandwich via command line, bringing to life this legendary XKCD comic.

![](http://imgs.xkcd.com/comics/sandwich.png)

It does this through the combination of Node.js + PhantomJS along with some other command line prompt tools that makes ordering a sandwich even more freaky fast.

Article
---------------------------
To read more about this project and why I built it, go to <a href="http://travistidwell.com/blog/2013/09/01/sudo-make-me-a-sandwich">http://travistidwell.com/blog/2013/09/01/sudo-make-me-a-sandwich</a>

Installation
---------------------------
To install this application on your computer, you can simply use NPM to install it as a global command.

```
npm install -g makemeasandwich
```

Usage
---------------------------
To run this command, simply type it in your terminal.

```
makemeasandwich
```

Or, if you want to stay true to the comic...

```
sudo makemeasandwich
```

This will then walk you through the login process, as well as sandwich selection process, and even checkout... all through the command line.  You can also provide configurations to make each order super simple.  This is done via a JSON file that you can pass into the application using the ```o``` argument like so.

```
sudo makemeasandwich -o order.json
```

This order json file looks like the following...

```
{
  "email": "",
  "company": "AllPlayers.com",
  "address": "14665 Midway Road",
  "apt/suite": "220",
  "city": "Addison",
  "state": "Texas",
  "zip": "75001",
  "sandwich": "country club",
  "who": "Travis",
  "bread": "French Bread",
  "cut": true,
  "drink": "",
  "chips": "Regular Jimmy Chips",
  "cookie": "",
  "pickle": "",
  "Tomato": "NO",
  "tip": "2",
  "billing_address": "123 Main St.",
  "billing_city": "Carrollton",
  "billing_state": "Texas",
  "billing_zip": "75007"
}
```

If you'd like to save the order json for repeated use, simply add it to either `X:\mmas\config.json` in Windows (where X is your primary drive letter) or `/etc/mmas/config.json` in Linux/Mac. However, do note that using `-o order.json` will override the saved config.json.

Using the Makefile
------------------------------
If you navigate to the downloaded folder within your terminal, you can then use the ```Makefile``` to type the command as it is in the XKCD comic.

```
sudo make me a sandwich
```

Debugging & Troubleshooting
------------------------------
You can provide a debug argument which it will capture a screenshot within the "screenshots" folder for every step in the process.  This is a good way
for you to see what exactly the script is doing as it is doing it, as well as debug if any issues occur.

```
sudo makemeasandwich -o myorder.json --debug
```
