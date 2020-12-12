(function ($) {
	$.fn.replaceClass = function (pFromClass, pToClass) {
			return this.removeClass(pFromClass).addClass(pToClass);
	};
}(jQuery));

firebase.initializeApp({
apiKey: 'AIzaSyDbRSDD1ylCzBSk_hEFk2-sLrhJcIGNr1o',
authDomain: 'golf-game-8f06a.firebaseapp.com',
projectId: 'golf-game-8f06a'
});

var db = firebase.firestore();

// function addDeckDatabase(deck) {
// 	let deckObj = { 
// 			deck: deck
// 		};
// 		db.collection("DeckValues").doc("standardDeck").set(deckObj).then(function() {
// 			console.log("Document successfully written!");
// 		},
// 	);

// }

// global variables

var playersFinished = 0;
var inCaseCards = [];
var remainingCards; 
var topCard;
var holes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var currentHole = 1;
var startWith;
var d;

// elements hidden on page load
$('#restart').hide();
$('#pass').hide();
$('#deck').hide();
$('#byRound').hide();
$('#instruction').hide();


// classes
class Card {
	constructor(suit, rank, value) {
			this.suit = suit;
			this.rank = rank;
			this.value = value;
			this.hidden = false;
	}
}


class Deck {
	constructor() {
			this.cards = [];
			this.clicked = false;    
	}
										 
createDeck() {
		let suits = ['clubs', 'diamonds', 'hearts', 'spades'];
		let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
		let values = [-1, -2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 0];
		let joker = {
			suit: "Joker",
			rank: "Joker",
			value: -3
		}
		
		for (let i = 0; i < suits.length; i++) {
				for (let j = 0; j < ranks.length; j++) {
						this.cards.push({
							suit: suits[i],
							rank: ranks[j],
							value: values[j],
							hidden: false,
					});
				}
		}

		this.cards.push(
			{suit: "Joker",
			rank: "Joker",
			value: -3,
			hidden: false,
		}
		);

		this.cards.push(
			{suit: "Joker",
			rank: "Joker",
			value: -3,
			hidden: false,
		}
		);
		
		return this.cards;
}

	shuffleDeck() {
		 let location1, location2, tmp;
		 for (let i = 0; i < 1000; i++) {
				 location1 = Math.floor((Math.random() * this.cards.length));
				 location2 = Math.floor((Math.random() * this.cards.length));
				 tmp = this.cards[location1];
				 this.cards[location1] = this.cards[location2];
				 this.cards[location2] = tmp;
			}
	}
}


class Player {
	constructor(name, id) {
			this.playerName = name;
			this.playerID;
			this.playerCards = [];
			this.playerTurn = false;
			this.playerFinished = false;
			this.playerScore = [];
			this.playerTotal = 0;
			this.playerLastTurn = false;
	}
}


class Board {
	constructor() {
			this.cardsInMiddle = [];
			this.players = [];
	}
	start(playerOneName, playerTwoName, playerThreeName, playerFourName) {
			this.players.push(new Player(playerOneName));
			this.players[0].playerID = 0;
			this.players.push(new Player(playerTwoName));
			this.players[1].playerID = 1;
			this.players.push(new Player(playerThreeName));
			this.players[2].playerID = 2;
			this.players.push(new Player(playerFourName));
			this.players[3].playerID = 3;

			for(var i = 0; i < this.players.length; i++)
	{
		var player = document.createElement('div');
		player.className = 'player';
		player.id = this.players[i].playerName;
		document.body.appendChild(player);
		var name = document.createElement('div');
		name.innerHTML = this.players[i].playerName;
		name.className = 'name';
		player.prepend(name);

	}


	}
}


function determineSuit(card){

	var icon = '';
	if (card.suit == 'hearts')
	icon='&hearts;';
	else if (card.suit == 'spades')
	icon = '&spades;';
	else if (card.suit == 'diamonds')
	icon = '&diams;';
	else if (card.suit == 'clubs')
	icon = '&clubs;';
	else 
	icon = '&#9813;';

	return icon;

}


function discardPile(cards) {
	
	topCard = cards[0]; 

	var card = document.createElement("div");
	var value = document.createElement("div");
	var suit = document.createElement("div");
	card.addEventListener('click', function() {
		selectdiscardCard(this)
	});
	card.className = "discardCard";
	value.className = "discardValue";
	
	var icon = determineSuit(topCard);
	suit.innerHTML = icon;
	suit.className = topCard.suit + " discardSuit" ;

	value.innerHTML = topCard.rank;
	card.appendChild(value);
	card.appendChild(suit);

	topCard = card;

	document.getElementById('discardPile').prepend(card);

}

function updateInstructions () {

var count = 0;
var p;


gameBoard.players.forEach(function(player) {
	if (player.playerTurn) {
		p = player.playerName;
	}

	player.playerCards.forEach(function(card) {
		if (card.hidden) {
			count++;
		}
	});
});

if (playersFinished === 4 && currentHole === 10) {
	$('#deck').hide();
	$('#new').show(); 
	var best = Math.min(gameBoard.players[0].playerTotal, gameBoard.players[1].playerTotal, gameBoard.players[2].playerTotal, gameBoard.players[3].playerTotal);
	gameBoard.players.forEach(function(player) { 
		if (player.playerTotal === best) {
			$('#instruction').html('Game Over!!! </br>' + player.playerName + ' is the winner!');
		}
	});
		scoreBoard();
	} else if (playersFinished === 4) {
		$('#deck').hide();
	$('#restart').show();
	playersFinished = 0;
	// var b =(currentHole-1)
	$('#instruction').html(`Hole: ` + currentHole + `</br>Complete`)
	currentHole++;
	scoreBoard();
} else if (count <=16){
	$('#instruction').html('Hole: ' + currentHole + `</br>It's ` + p +`'s turn`)
} else {
	$('#instruction').html('Flip 2 of your cards!')
}


}


function scoreBoard () {

$('#columns>th').remove();
$('#rows>td').remove();
$('#holes>tr').remove();
$('#players>.p').remove();

gameBoard.players.forEach(function(player) {
$('#columns').append(`<th>` + player.playerName + `</th>`)
$('#players').append(`<th class="p">` + player.playerName + `</th>`)
$('#rows').append(
		`<td>` + player.playerTotal + `</td>`)
});

holes.forEach(function(hole) {
	$('#holes').append(`<tr id="` + hole + `"><th scope="row">` + hole + `</th></tr>`)
	gameBoard.players.forEach(function(player) {
		var z = document.createElement('td')
		if (player.playerScore[hole-1] === undefined) {
			z.innerHTML = '-'
		} else {
		z.innerHTML = player.playerScore[hole-1];
		}
		document.getElementById(hole).appendChild(z);
	});
});



}


function findScore(player, cards) {
var score = 0
var column1 = 0;
var column2 = 0;
var column3 = 0;


function columns (column, a, b) {
	var columnScore;

	if (a.rank === b.rank) {
		columnScore = 0
	} else {
		columnScore = a.value + b.value
	}
	return columnScore
}

 column1 = columns(column1, cards[0], cards[3])
 column2 = columns(column2, cards[1], cards[4])
 column3 = columns(column3, cards[2], cards[5])

cards.forEach(function(card) {
	score = column1+column2+column3;
	return score
})

player.playerScore.push(score);
player.playerTotal = player.playerScore.reduce(function(a, b) {
		return a + b;
	});

}


function checkForFinished() {


gameBoard.players.forEach(function(player) {

	if (player.playerFinished) {
	} else {
		player.playerLastTurn = true;
	}
});

}


function deal(cards, players) {

d = new Deck();
let deck = d.createDeck();
console.log(deck);
addDeckDatabase(deck);
d.shuffleDeck();
console.log('This is at the end');

playersFinished = 0; 

gameBoard.players.forEach(function(player) {
	player.playerFinished = false;
	player.playerLastTurn = false;
	player.playerTurn = false;
});

players[0].playerCards = d.cards.slice(0, 6);
remainingCards = d.cards.slice(6, 52);
players[1].playerCards = remainingCards.slice(0, 6);
remainingCards = remainingCards.slice(6, 46);
players[2].playerCards = remainingCards.slice(0, 6);
remainingCards = remainingCards.slice(6, 40);
players[3].playerCards = remainingCards.slice(0, 6);
remainingCards = remainingCards.slice(6, 34);
discardPile(remainingCards);
$('#instruction').html('Flip 2 of your cards!');   

for(var i = 0; i < players.length; i++)
{

	for(var j = 0; j < cards[i].playerCards.length; j++)
	{
		cards[i].playerCards[j].hidden = true;

		var card = document.createElement("div");
		var value = document.createElement("div");
		var suit = document.createElement("div");

		card.className = "card";
		card.classList.add(players[i].playerName);
		card.classList.add("back");
		card.id = j;
		value.innerHTML = cards[i].playerCards[j].rank;
		value.className = "value";
		value.classList.add("hidden");				
		var icon = determineSuit(cards[i].playerCards[j]);
		suit.innerHTML = icon;
		suit.className = "suit " + cards[i].playerCards[j].suit;
		suit.classList.add("hidden");
		card.appendChild(value);
		card.appendChild(suit);
		card.addEventListener('click', function() {
				selectCard(this, topCard, value.innerHTML, this.suit)
		});

		
		document.getElementById(players[i].playerName).appendChild(card);
		
	}

}


}





function selectCard(card, card2, value, suit) {


if (card2.classList.contains('selected')) {


	gameBoard.players.forEach(function(player) {

	if ((card.classList.contains(player.playerName)) && player.playerTurn == true) {


		var answer = confirm('Do you want to switch?');
			if (answer) {

				var ct = 0;

				$(card2).removeClass('selected');

				$('#pass').hide();

				d.clicked = false;
			

				var hold = player.playerCards[card.id];
				var hold2 = remainingCards[0];
				
				player.playerCards[card.id] = hold2;
				remainingCards[0] = hold;

				$(card).children('.value').html(hold2.rank);
				$(card).children('.suit').replaceClass(hold.suit,hold2.suit);
				$(card).children('.value').removeClass('hidden');
			$(card).children('.suit').removeClass('hidden');
			$(card).removeClass('back');
			var icon = determineSuit(hold2)
			$(card).children('.suit').html(icon);

				$(card2).children('.discardValue').html(hold.rank);
				$(card2).children('.discardSuit').replaceClass(hold2.suit,hold.suit);
				var icon = determineSuit(hold);
			$(card2).children('.discardSuit').html(icon);

				
				player.playerCards[card.id].hidden = false;

				player.playerTurn = false;

				if (player.playerID < 3) {
					gameBoard.players[player.playerID + 1].playerTurn = true;
				} else {
					 gameBoard.players[0].playerTurn = true;
				}

				if (player.playerLastTurn) {

					player.playerFinished = true;
					var get = document.getElementById(player.playerName);
					$(get).children().removeClass("back");
					$(get).children().children().removeClass("hidden");
					findScore(player, player.playerCards);
					playersFinished++;
				}

				updateInstructions();

				player.playerCards.forEach(function(card) {
					if (card.hidden === true) {
						ct++;
					} 
				})

				if (ct === 0) {
					player.playerFinished = true;
					playersFinished++;
					checkForFinished();
					findScore(player, player.playerCards)
				}

			}
		}

	 });


} else if (card.classList.contains('back')) {

	var count = 0;


	gameBoard.players.forEach(function(player) {
		if ((card.classList.contains(player.playerName))) {
		
			player.playerCards.forEach(function(card) {
				if (card.hidden) {
					count++;
				}
			});


		}

		if (count >= 5) {
		player.playerCards[card.id].hidden = false;
		$(card).removeClass('back');
		$(card).children('.value').removeClass('hidden');
		$(card).children('.suit').removeClass('hidden');
		count = 0;




		var ct = 0;

		gameBoard.players.forEach(function(player) {
			player.playerCards.forEach(function(card) {
				if (card.hidden) {
					ct++;
				}
			});
		});


		if (ct === 16) {
			if (startWith === undefined || startWith === 3) {
				gameBoard.players[0].playerTurn = true;
				startWith = 0;
			} else if (startWith < 3) {
				startWith++;
				gameBoard.players[startWith].playerTurn = true;
			}
		}

		updateInstructions();



	} else {
	}

	});



	}
}



function selectdiscardCard(card) {

var count = 0;

gameBoard.players.forEach(function(player) {
	player.playerCards.forEach(function(card) {
		if (card.hidden) {
			count++;
		}
	});
});

if (card.classList.contains('selected') && count <=16) {
	$(card).removeClass('selected');
	} else if (count <=16){
	$(card).addClass('selected');	
	}
}


function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
	}
	return a;
}




$('#deck').click(function() {

if (remainingCards.length === 1) {
	var deck = remainingCards.concat(inCaseCards);
	remainingCards = deck;
	shuffle(remainingCards);

}

gameBoard.players.forEach(function(player) {
	if (player.playerTurn && d.clicked === false) {
		d.clicked = true;
		$('.discardCard').remove();
		inCaseCards.push(remainingCards[0]);
		remainingCards.shift();
		discardPile(remainingCards);
		$('#pass').show();
	} else {
	}

});

});

$('#pass').click(function() {

$('#pass').hide();
d.clicked = false;

var p;

gameBoard.players.forEach(function(player) {
	if (player.playerTurn) {
		p = player;
	}
});

if (p.playerLastTurn) {

	p.playerFinished = true;
	var get = document.getElementById(p.playerName);
	$(get).children().removeClass("back");
	$(get).children().children().removeClass("hidden");
	findScore(p, p.playerCards);
	playersFinished++;
}

p.playerTurn = false;

if (p.playerID < 3) {
	gameBoard.players[p.playerID + 1].playerTurn = true;
} else {
	 gameBoard.players[0].playerTurn = true;
}

updateInstructions(); 
});


$('#restart').click(function() {
$('#deck').show();
$('#restart').hide();  
$('div.card').remove();
$('div.discardCard').remove();
deal(gameBoard.players, gameBoard.players);

});


$('#new').click(function() {
gameBoard.start('Mario', 'Luigi', 'Pikachu', 'Yoshi');
scoreBoard();
$('#pass').hide();
$('.logo').hide();
$('#deck').show();
$('#byRound').show();
$('#new').hide();  
$('div.card').remove();
$('div.discardCard').remove();
$('#instruction').show();
deal(gameBoard.players, gameBoard.players)
gameBoard.players.forEach(function(player) {
	player.playerTotal = 0;
	player.playerScore = [];
});   
scoreBoard();
currentHole = 1;
});


var gameBoard = new Board();






