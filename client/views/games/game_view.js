Template.gameView.helpers({
	playerName: function(){
		return Meteor.users.findOne({_id: this.id}).username;
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
		return this.gameDeck[0].Card
	},
	playersHand: function(){
		hand = _.find(this.players, function(player){
			return player.id == Meteor.userId();
		}).hand;

		return hand;
	}
})

Template.gameView.events({
	'click .start-game-btn': function(event, template){
		var gameId = template.data._id;

		Meteor.call('startGame', gameId, function(error, id){
			if (error)
				throwError(error.reason, 'error')
			else
				$('.start-game-btn').html("Game started")
		})

		Template.gameView.shuffleDeck(this);
		Template.gameView.deal(this);
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
		hand = _.sample(game.gameDeck, 10);
		player.hand = hand;
	})

	Meteor.call('updatePlayersHand', game._id, game.players )

}