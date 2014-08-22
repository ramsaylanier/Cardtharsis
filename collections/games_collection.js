Games = new Meteor.Collection('games');


Meteor.methods({
	createGame: function(gameAttributes){
		var loggedInUser = this.userId;
		var deck = Cards.find().fetch();

		//shuffle deck
		deck = _.shuffle(deck);

		//sort so black cards are first
		deck = _.sortBy(deck, function(card){
			return card.Type;
		})

		var hand = Meteor.call('dealHand', deck)[0];
			deck = Meteor.call('dealHand', deck)[1];

		if (!gameAttributes.name){
			throw new Meteor.Error(422, 'Please enter a name for your game');
		}

		var game = _.extend(_.pick(gameAttributes, 'name', 'isPublic', 'creator'), {
			started: false,
			ended: false,
			gameDeck: deck,
			players: [{id: loggedInUser, czar:true, score: 0, hand: hand}],
			submitted: new Date().getTime(),
		});

		//create new game
		var gameId = Games.insert(game);

		//add game to creator's collection
		Meteor.users.update({_id: loggedInUser}, {$set: {game: gameId}});

		return gameId;
	},

	deleteGame: function(gameId, creator){
		if (this.userId == creator){
			Meteor.users.update({game: gameId}, {$set : {game: null}}, {multi: true});
			return Games.remove(gameId);
		} else {
			throw new Meteor.Error(422, "You aren't the games creator; therefore, you don't have access to delete this game.");
		}
	},

	addUserToGame: function(gameId, userId){
		if ( Meteor.users.findOne({_id: userId}).game )
			throw new Meteor.Error(422, 'You are already in a game.');
		else if (gameId && userId){

			var deck = Games.findOne(gameId).gameDeck;
			var hand = Meteor.call('dealHand', deck)[0];
			deck = Meteor.call('dealHand', deck)[1];

			Games.update({_id: gameId}, {$set: {gameDeck: deck}, $addToSet: { players: {id: userId, czar: false, score: 0, hand: hand}}});
			return Meteor.users.update({ _id: userId } , { $set: { game: gameId }} );
		}
	},
	removeUserFromGame: function(gameId, userId){
		if (gameId && userId){
			if (Games.findOne(gameId).ended)
				return Meteor.users.update({ _id: userId }, {$set: { game: null}} );
			else {
				Games.update({_id: gameId}, { $pull: { players: { id: userId}}});
				return Meteor.users.update({ _id: userId }, {$set: { game: null}} );
			}
		}
	},
	dealHand: function(deck){
		var hand = [];
		for (var i=0; i < 10; i++){
			hand.push(deck.pop());
		}

		return [hand, deck];
	},
	startGame: function(gameId){
		var loggedInUser = this.userId;

		if (loggedInUser = Games.findOne({_id: gameId}).creator){
			Games.update({_id: gameId}, {$set: {started: true}});
			Meteor.call('newRound', gameId, 1);
		}
	},
	endGame: function(gameId){
		var loggedInUser = this.userId;

		if (loggedInUser = Games.findOne({_id: gameId}).creator){
			Games.update({_id: gameId}, {$set: {started: false, ended: true}});
		}
	},
	newRound: function(gameId){
		var game = Games.findOne(gameId);
		var newRoundNumber = 1;

		//check to see if this is the first round
		if (game.rounds)
			newRoundNumber = game.rounds.length + 1;

		//pull the next black card from the front of the gameDeck
		var blackCard = game.gameDeck.shift();

		//push new empty round to Games collection
		Games.update({_id: game._id},	{	$set: {gameDeck: game.gameDeck},
											$push: {rounds: {blackCard: blackCard, ended: false, winner: null, round: newRoundNumber, players: []}}
										});

		Meteor.call('startRound', gameId, newRoundNumber);
	},
	startRound: function(gameId, round){
		var clock = 30;
		var interval = Meteor.setInterval(function () {
			if (!Games.findOne(gameId).rounds[round - 1].ended){
				clock -= 1;
				Games.update(gameId, {$set: {clock: clock}});

				// end of game
				if (clock === 0) {
					// stop the clock
					Meteor.clearInterval(interval);
					Games.update({_id: gameId, "rounds.round": round}, {$set: { "rounds.$.ended": true}});
				}
			}
		}, 1000);
	},
	playerSelection: function(gameId, players){
		var currentRound = Games.findOne(gameId).rounds.length;
		Games.update({_id: gameId, "rounds.round": currentRound}, {$set: {"rounds.$.players": players}});

		//check to see if all players have made selections
		if (Games.findOne(gameId).players.length - 1 == players.length){
			//end round if all players have selected
			Games.update({_id: gameId, "rounds.round": currentRound}, {$set: { clock: 0, "rounds.$.ended": true}});
		}
	},
	updateGameDeck: function(gameId, gameDeck){
		Games.update({_id: gameId}, {$set: {gameDeck: gameDeck}});
	},
	updatePlayersHand: function(gameId, players){
		Games.update({_id: gameId}, {$set: {players: players} });
	},
	updateRound: function(gameId, round){
		Games.update({_id: gameId, "rounds.round": round.round}, {$set: { "rounds.$": round }});
	},
	pickWinner: function(game, winner){
		var round = game.rounds.length;

		if (!game.rounds[round - 1].winner){
			Games.update({_id: game._id, "players.id": winner}, {$inc: {"players.$.score": 1 }});
			Games.update({_id: game._id, "rounds.round": round }, {$set: {"rounds.$.winner": winner}});
			Meteor.call('discard', game._id);
			Meteor.call('updateCzar', game._id);

			Meteor.setTimeout(function(){
				Meteor.call('newRound', game._id);
			}, 10000);
		}
	},
	discard: function(gameId){

		var game = Games.findOne(gameId);
		//loop through each player
		_.each(game.players, function(player){
			var playerId = player.id;

			//find the players card selection
			var selection = _.find(game.rounds[game.rounds.length - 1].players, function(element){
				return element.player == playerId;
			});

			//if it exists
			if (selection){
				var removedHand = _.find(player.hand, function(card){
					return card._id == selection.selection;
				})
				
				//remove the card from the hand
				player.hand = _.without(player.hand, removedHand);

				//add a new card from the end of the gameDeck
				var newCard = game.gameDeck.pop();

				//add new card to player's hand
				player.hand.push(newCard);
			}
		})
		Meteor.call('updateGameDeck', game._id, game.gameDeck);
		Meteor.call('updatePlayersHand', game._id, game.players);
	},
	updateCzar: function(gameId){
		var game = Games.findOne(gameId);
		_.find(game.players, function(player, index){
			if (player.czar == true){
				game.players[index].czar = false;

				if (!game.players[index + 1]){
					game.players[0].czar=true;
				} else {
					game.players[index + 1].czar=true;
				}

				return player.czar == false;
			} else 
				return player.czar == true;
		})

		Games.update({_id: gameId}, {$set: {players: game.players}});
	}
})