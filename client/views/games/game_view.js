Template.gameView.rendered = function(){
	if (this.data.rounds)
		currentRound = this.data.rounds.length;
	else
		currentRound = 0;

	console.log(currentRound);
}

Template.gameView.helpers({
	playerName: function(){
		Meteor.subscribe('playersInGame', this._id);
		return Meteor.users.findOne({_id: this.id}).profile.name;
	},
	creator: function(){
		if (Meteor.userId() == this.creator)
			return true
	},
	cardCzar: function(){
		var currentCzar = _.find(this.players, function(player){
			return player.czar == true;
		});

		if (currentCzar.id == Meteor.userId())
			return true
	},
	blackCard: function(){
		if (this.rounds){
			var currentRound = this.rounds.length - 1;
			var blackCard = this.rounds[currentRound].blackCard;
			return blackCard.Card;
		}
	},
	playersHand: function(){
		hand = _.find(this.players, function(player){
			return player.id == Meteor.userId();
		}).hand;

		return hand;
	},
	roundOver: function(){
		if (this.rounds){
			var currentRound = this.rounds.length - 1;

			if (this.rounds[currentRound].ended)
				return true
		}
	},
	winner: function(){
		if (this.rounds){
			var currentRound = this.rounds.length - 1;
			var winner = this.rounds[currentRound].winner;
			if (winner)
				return Meteor.users.findOne(winner).username
		}
	}
})

Template.gameView.events({
	'click .start-game-btn': function(event, template){
		var gameId = template.data._id;

		Template.gameView.shuffleDeck(this);
		Template.gameView.deal(this);

		Meteor.call('startGame', gameId, function(error, id){
			if (error)
				throwError(error.reason, 'error')
			else
				$('.start-game-btn').html("Game started")
		})
	},
	'click .player-card': function(event, template){
		var game = template.data;

		var selection = this._id;
		var round = game.rounds[game.rounds.length - 1];
		var gameId = game._id;

		//get list of users that have selected white cards already
		var selected = _.pluck(round.players, 'player');

		if (round.ended){
			return
		}

		//check to see if current user is among those with selections
		if (_.contains(selected, Meteor.userId())){

			//update current users seleection
			_.map(round.players, function(player){
				if (player.player == Meteor.userId())
					player.selection = selection;
			})
		} else {

			//add current users selection
			round.players.push({
				player: Meteor.userId(),
				selection: selection
			})
		}

		$('.player-card').removeClass('selected');
		$(event.target).addClass('selected');

		Meteor.call('updateRound', gameId, round, function(error, id){
			if (error)
				throwError(error.reason, 'error')
		});
	}
})

Template.gameView.shuffleDeck = function(game){

	//shuffle gameDeck
	game.gameDeck = _.shuffle(game.gameDeck);

	//sort so black cards are first
	game.gameDeck = _.sortBy(game.gameDeck, function(card){
		return card.Type;
	})

	//update game Deck
	Meteor.call('updateGameDeck', game._id, game.gameDeck, function(error, id){
		if (error)
			throwError(error.reason, 'error');
	});
}

Template.gameView.deal = function(game){
	_.each(game.players, function(player, index){
		hand = _.sample(_.where(game.gameDeck, {Type: "white"}), 10);
		player.hand = hand;

		//discard each card from main gameDeck
		_.each(player.hand, function(card){
			game.gameDeck = _.without(game.gameDeck, card)
		})
	})

	Meteor.call('updatePlayersHand', game._id, game.players );
	Meteor.call('updateGameDeck', game._id, game.gameDeck);

}


Template.playerSubmissions.helpers({
	submissions: function(){
		var currentRound = this.rounds.length - 1;
		return(this.rounds[currentRound].players);
	},
	card: function(){
		return Cards.findOne({_id: this.selection}).Card;
	},
	winningCard: function(game){
		
		currentRound = game.rounds.length - 1;
		winner = game.rounds[currentRound].winner;

		if (this.player == winner)
			return 'winner';
	}
})

Template.playerSubmissions.events({
	'click .submitted-card': function(e, template){
		var game = template.data;
		var czar = _.find(game.players, function(player){
			return player.czar == true
		}).id;

		var winner = this.player;

		if (Meteor.userId() == czar){
			Meteor.call('pickWinner', game, winner, function(error, id){
				if (error)
					throwError(error.reason, 'error');
			})
		}
	}
})