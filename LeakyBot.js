//LeakyBot.js
// first go in javascript. Ugh, javascript.
// javascript is the slacker-stoner of the dev world.
// it'll do whatever, just not in a robust way.
// 
// next version will be in rust; a proper language. 
// client config stored in config.json of the same folder as this file.
// LICENSE: MIT

// NOTE: No Premature Optimizations abbv as NPO in comments that will need later fixing
// 		 but are just prototype patterns. 

// who am i
const leaky_bot_version = "LeakyBot 0.0.2k -- more command build-outs" // lol, i really should add these to git commit. 
const id = "BOT: "

// don't tell the squirrels, morty. 
const config = require('./config.json'); //secret squirrel, your config stuff goes here. 

// ** MAKE SURE THESE EXIST ON CRATES.IO FOR RUST ** //
// That would be awkward. 
const tmi = require('tmi.js');
const fs = require('fs');
const https = require('https'); // i forgot why, lol., oh yeah. query steam for games list...

// ____________ DATA STORE ____________
// for data storage we are gonna go with a no-sql solution, just because
// twitch hasn't settled on an api yet and sql doesn't
// handle changes to it's data structure well
// where as no-sql don't care. 
//
// ** NPO **
// might do flat json files in ram w/ caching scheme
// for starters use flat json on fs, till the pattern is solid. 
// then worry bout performance. 
// does node even do redis?
// for that matter are there rust bindings for redis?
// I don't wanna hammer my poor fs trying to be ACID for this
//
// Heck do I even care about being acid for a chat bot? 
// dunno, could be pretty annoying not to be. 
// and other chatbots are ACID because they ARE using sqlite3
// check npm for other no-sql options. 
// const db = require('no-sql'); // no idea if this exists, it's a place holder.

const cv = config.cvinfo; // break this out because I'm lazy

const client = new tmi.client(config.client_options); // create a new client w/ options

// handle steam-games list caching here. 
var steam_games = new Set(); //global list of games. 
var _steam_data = "";
https.get(config.steam_url, (response) => { // async I think. it was 2am when I read the docs...
	//debug
	console.log('statusCode: ', response.statusCode);
	console.log('headers: ', response.headers);
	
	// gather all of our data
	response.on('data', (d) => {
		_steam_data += d;
	});
	
	//parse and export when done. 
	response.on('end', () => {
		// build our list from our data stream
		var data = JSON.parse(_steam_data); // we failed here, find out why. 
		// debug
		//console.log("_steam_data", _steam_data);
		//console.log("");
		//console.log("data is of type"+data);
		//console.log("JSON parsed data: ", data);
		for (var item of data.response.games) { // uh, it's here now dumbass...
			steam_games.add(item);
		}
		// NPO: filter it really quick, merge this above as conditional of above statemet; after pattern test
		for (var filter_item of config.game_filter) {
			if(steam_games.has(filter_item)) {
				steam_games.delete(filter_item);
			}
		}
	});
}).on('error', (e) => {
	console.log('HTTPS Get Error: ', e);
});

// register event handlers
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

//connect
client.connect();

function onConnectedHandler(addr, port) {
	console.log(`Connected to: ${addr}:${port}`);
	client.say(config.client_options.channels[0], id+"Starting: "+leaky_bot_version); // lol, I hope I remember how to use json in the last 2 ming.
}


/*  			**** HELPER FUNCTIONS **** 		     			*/
/****************************************************************/

// i should actually add some functions here, maybe. 

//return a random number between 1 - max  (inclusive)
function randInt(max) {
	return Math.floor(Math.random() * max)+1;
}

// TODO: put us in to a db for long term storage, (or load them, cache style) 

let swear_jar = new Set();
let spam_jar = new Set();
const swears_regex = new RegExp(config.swear_words.join("|")); // this is a good regex. moved to config.json
const url_regex = new RegExp("[a-zA-Z\\d]+://"); // TODO: make this better
// grab string that begin with - or !  (not grreat, but it's a place to start witht he new command parser
// gonna be a lot of regex here, better move them to config.json
const command_regex = new RegExp("^!.*"); 
const token_regex = new RegExp("\\S+", 'g'); // don't forget to escape escape'd chars in string builds of regex.

function onMessageHandler(ch, user, msg, self) {

	function _say(m) {
		client.say(ch, id+m);
	}

	const uid = user['user-id'];

	// TODO: turn this into a command regex matching, parse with iterator rather than switch-case
	// avoid the switch-case fallthrough bug (wish javascript had match), the world needs rustyscript.
	// FIXME: NO, REALLY do the above. this is getting silly now...

	// TODO: Pobably also clean this up into more organized files and objects and such...
	// This is pretty ugly atm.

	if(self) // ignore self
		return;

	// hey! we should parse with regex here.
	// ok, how bout now.
	// here we are looking for strings that start with our command prefix
	if(command_regex.test(msg)) {
		//debug
		//console.log(command_regex.exec(msg));
		
		// let's plug it in and see what smokes...
		// fuck yeah, this works, time to tokenize this string
		
		let command_tokens = msg.match(token_regex); // fun fact no shadowing of 'let' delcared vars in javascript.
		//debug
		console.log("Command found, tokens are: ");
		console.log(command_tokens);
		
		let cmd = command_tokens[0].substr(1); // do we pop off here or just index from 1?, also ignore the first char.
		
		// now that the tokenizer is working we can move to parsing the command strings
		// we shold also handle quoated strings in the wild from the user. 
		// that's gonna be a tommorw program, I don't think my keyboard is going to take well to drool...
		
		// ok, now we should use our switch case to check for our built-in commands
		// so we can do !new_command !command command string later on. 
		// so new command should be built in I guess. 
		// wish for match statement...wait does javascript have a match? lol, nope.
		// utilze the power of regular expressions! (the poor man's AI).
		
		// About SWITCH: 
		// I know it's in "The Bad Parts", but here i'm taking the Asmiov approach to code
		// If it looks good it runs good.  (It's in the foundation series)
		// switch case and match statements are very visually appealing. 
		// I grok the fall-through bug, but I think it's ok if you are aware. 
		// Javascript looks and acts more and more like rust every iteration.
		// they shoud add a match statement. 
		// If javascript had a match statement, imho, it would become more powerful than python. 
		// And I love python. 
		
		let rx = {
				version: /^(v|ver|version)$/,
				games: /^(g|games)$/,
				bark: /^(woof|bark)$/,
				
		} // we can iterate over this, so maybe no switch... switches, like match, are very visually satisfying 
		
		switch (true) {
			// check for version
			case rx.version.test(cmd): // good enough for now. matesh fixed the !verp issue with pedantics. 
				_say("yar!");
				break;
			case rx.games.test(cmd):
				if(!command_tokens[1]) { // check for emtpy !games call
					_say("!games will produce a list of my steam games, playable upon request.");
					_say("Over 300 Steam games and counting! GOG & DRM free comming soon!");
					_say("Usage: !games search_string");
					_say("search_string is a regex so ^a will return all games that start with a (case insensitive)");
				}
				else if(command_tokens[1] === "All") {
					_say("DEBUG: Dumping all to consle...");
					console.log("Game", steam_games);
					var i = 0;
					for(var game in steam_games) {
						console.log("SPAM!");
						i++;
						console.log(i,"Game: ",game.name);
					}
				}
				else {
					console.log("Search term is: ", command_tokens[1]);
					// we need to join all tokens greater than one into a string, for now single string matching.
					let gSearch = new RegExp(command_tokens[1], 'i'); //build our regex from user input. lol indexing.
					var game_list = new Array();
					// lol, nope. have to iterate through this list and match agaisnt name
					// duh.
					for(var game in steam_games) {
						console.log("Searching...");
						if(gSearch.test(game.name)) {
							console.log("MATCH: ", game.name);
							game_list.push(game.name); // build an array of game names that match our filter. 
						}
					}
					if(game_list.length > 99) {
						//debug
						console.log("length= "+game_list.length);
						_say("TOO BIG TO FAIL! Please refine your search or proivde 1.5 trillion US dollars.");
					}
					else if(game_list.length < 1) { 
						console.log("Nothing Found");
						_say("Nothing Found");
					}
					else {
						_say("List: "); // debug
						for (var item of game_list) { //ffs javascript pick one! 'of' or 'in', call it green-eggs-and-spam for all i care; we all get how algebraic sets work.
							_say(item);
						}
					}
				}
				
				break;
			// hard coded for testing.
			case /^command/.test(cmd):
				switch(command_tokens[1]) {
					case "regex":
						_say("Built in command regular expressions are:");
						for(let item in rx) {
							_say(item+"="+rx[item]);
						}
						break;
					case "more-to-follow":
						_say("!command only does regex right now...");
						break;
					default:
						_say("Usage: !command option");
						_say("Options: regex, more-to-follow");
						break;
				}
				break;
			default:
				break;
		}
	}
	
	//strip whitepace for switch-case statement. 
	// lol what was misa thinkins!
	// posix options should be used to provide inline command options to the !commands
	// !games -n   could show just Steam app_id or something...
	// !games alone should just give a help for itself, acutally to prevent channel spam.
	// unless /msg the bot?, what does tiwch call it? /whisper i think. Then we could spam away. with a return message
	// 
	// that will simplify (already simple) the regex for command ident, and allow for deeper parsing.
	// we could possibly do away with the need for quoted strings from the user. 
	// oh, and sanitize user input, too, lol. 
	// can't have any Little Bobby Tables running about. 
	
	const cmd = msg.trim().toLowerCase(); // remove whitespace & lowercase -- bad, just BAD. 
	switch (cmd) {
		case '--bark':
		case '--woof':
		case '!bark':
		case '!woof':
			_say(`@${user['display-name']} OhMyDog BARK!`);
			break;
		// too robust, maybe?  maybe not worth ai filtering. 
		case '--covid':
		case '--covid19':
		case '#covid19':
		case '#covid':
		case '#covid-19':
		case '!covid19':
		case '#coronavirus':
			_say("CDC "+cv.cdc);
			_say("WHO: "+cv.who);
			_say("King Co WA: "+cv.kcwa);
			_say("Univ of WA: "+cv.uw);
			break;
		case '!dice':
		case '--dice':
		case '-d':
			_say("Roll a die!");
			_say("Choices are: !d6, 8, 12, 20, 100");
			_say("You can also flip a !coin");
			break;
		// TODO: build out a regex for dynamic dice rolls (also dynamic commands, see above)
		case '--d6':
		case '!d6':			
			_say(randInt(6));
			break;
		case '--d8':
		case '!d8':
			_say(randInt(8));
			break;
		case '--d12':
		case '!d12':
			_say(randInt(12));
			break;
		case '--d20':
		case '!d20':
			_say(randInt(20));
			break;
		case '--d100':
		case '!d100':
			_say(randInt(100));
			break;
		case '--coin':
		case '!coin':
			let c = "heads";
			if(randInt(2) === 2) c = "tails";
			_say(c);
			console.log(c);
			break;
		case '--sorry':
		case '!sorry':
			if(swear_jar.has(uid)) {
				_say("Apology accepted");
				swear_jar.delete(uid);
			}
			else {
				_say("What are you Canadian or something?");
			}
			break;
		case '--swear':
		case '!swear':
			if(!swear_jar.has(uid)) {
				_say("Adding you to the swear jar...");
				swear_jar.add(uid);
			}
			else {
				_say("You're an animal");
			}
			break;
		case '--help':
		case '-h':
		case '!help':
		case 'help':
			_say("LeakyBot commands: !woof, !bark, !covid19, !d6, !coin, !sorry, !swear, !swearwords, !version, !help");
			_say("Posix style commands allowed too.");
			break;
		case '--swearwords':
		case '!swearwords':
			_say(`${swear_words.join(', ')}`);
			_say('NOTE: these are regular expressions.')
			break;
		case 'version':
		case '--version':
		case '-v':
		case '!version':
			_say(leaky_bot_version);
			break;
/*	BROKEN BROKEN BROKEN BROKEN BROKEN BROKEN BROKEN BROKEN BROKEN 
		/// this is just borked every whay till someday. 
		case '-g':
		case '--games':
		case '!games':
			
			_say("Debug: Everything works...");
			_say("Except javascript! WTF scoping rules.");
			_say("I'm becoming Rustacean!");
			// This is fucking stupid to put here but javascript 
			// has fucked up scoping rules 
			// how the fuck this language made it fucking anywhere is beyond me!
			// FML I'll be glad when it's dead, like perl. 
			// (no perl, a name change won't change the pice of shit you are)
			// WTF Javascript, you  make my code look ugly! :cry:
			let request = https.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=4423571AA8B229B507AE19398E377C01&steamid=76561198018988335&include_appinfo=true&include_played_free_games=true&format=json", function (response) {
				let data = '', json_data;
				let _games = new Array();
				let steam_games = new Set();
				response.on('data', function(stream) {
					data += stream;
				});
				response.on('end', function() {
					json_data = JSON.parse(data);
					for (const game of json_data.response.games) {
						//debug
						//console.log(game.name);
						_games.push(game.name);
					}
					_games.sort();
					for(const game of _games) {
						steam_games.add(game);
					}
					for (const i of config.game_filter) {
						steam_games.delete(i); //remove naughties from the list
					}
					//console.log(steam_games);
					_say("Leaky's Steam Games!");
					for (let game of steam_games) {
						console.log(game);
						_say(game);
					}

				});
			});
			request.on('error', function(e) {
				console.log(e.message);
			});
			break;
*/
		default:
			// check for swearing
			//regex.test is *way* more intuitve than string.matchall
			if(swears_regex.test(msg)) {
				console.log("Swear");
				if(!swear_jar.has(uid)) {
					_say(`${user['username']}(${user['user-id']}):`);
					_say("Adding you to the swear jar...");
					swear_jar.add(uid);
				}
				else {
					_say("You're an animal");
					//TODO: handle promise
					client.timeout(ch, user['username'], 300, "Swearing")
					.catch((err) => {
						console.log(err);
						switch (err) {
							case 'bad_timeout_broadcaster':
								_say("No timeouts for the Supreme Chihuahua!");
								break;
							default:
								_say("Unknow error");
								break;
						}
					});
				}
			}
			// check for spam (urls);
			if (url_regex.test(msg)) {
				console.log("SPAM");
				if(!spam_jar.has(uid)) {
					// _say(`${user['username']}(${user['user-id']}):`);
					_say('No spam please.');
					spam_jar.add(uid);
				}
				else {
					_say("NO SPAM");
					//TODO: handle promise
					client.timeout(ch, user['username'], 300, "SPAM")
					.catch((err) => {
						console.log(err);
						switch (err) {
							case 'bad_timeout_broadcaster':
								_say("No timeouts for the Supreme Chihuahua!");
								break;
							default:
								_say("Unknow error");
								break;
						}
					});
				}
				console.log(url_regex.exec(msg));
			}
			console.log(`${user['username']}(${user['user-id']}): ${msg}`);
			break;
	}
}


