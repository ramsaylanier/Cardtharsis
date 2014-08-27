Template.gameView.rendered = function(){
	Meteor.subscribe('playersInGame', this.data._id);

	if (this.data.rounds)
		currentRound = this.data.rounds.length;
	else
		currentRound = 0;
}

Template.gameView.helpers({
	playerName: function(){
		return Meteor.users.findOne({_id: this.id}).profile.name;
	},
	playersLeft: function(){
		var playerCount = this.players.length;
		var playersLeft = 4 - playerCount;

		if (playersLeft <= 0)
			return "0 more players";
		else if (playersLeft == 1)
			return "1 more player";
		else 
			return playersLeft + " more players";
	},	
	startable: function(){
		var playerCount = this.players.length;
		var playersLeft = 4 - playerCount;

		if (playersLeft > 0)
			return 'disabled';
	},
	creator: function(){
		if (Meteor.userId() == this.creator)
			return true
	},
	cardCzar: function(){
		var currentCzar = _.find(this.players, function(player){
			return player.czar == true;
		});

		if (currentCzar && currentCzar.id == Meteor.userId())
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
	madeSelection: function(parent){
		if (parent.rounds){
			var currentRound = parent.rounds.length - 1;
			var players = parent.rounds[currentRound].players;
			var selected = _.pluck(players, 'player');

			if (_.contains(selected, this.id)){
				return 'has-selected'
			}
		}
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

		Meteor.call('startGame', gameId, function(error, id){
			if (error)
				throwError(error.reason, 'error')
		})
	},
	'click .end-game-btn': function(event, template){
		var gameId = template.data._id;

		Meteor.call('endGame', gameId, function(error){
			if (error)
				throwError(error.reason, 'error')
		})
	},
	'click .leave-game-btn': function(){

		Meteor.call('removeUserFromGame', this._id, Meteor.userId(), function(error, id){
			if (error)
				throwError(error.reason, 'error')
			else 
				Router.go('/');
		})

	},
	'click .player-card': function(event, template){
		var selection = this._id,
			game = template.data,
			currentRound = game.rounds.length - 1
			players = game.rounds[currentRound].players;

		// get list of users that have selected white cards already
		var selected = _.pluck(players, 'player');

		if (game.rounds[currentRound].ended){
			return
		} else {

			//check to see if current user is among those with selections
			if (_.contains(selected, Meteor.userId())){

				//update current users seleection
				_.map(players, function(player){
					if (player.player == Meteor.userId())
						player.selection = selection;
				})
			} else {

				//add current users selection
				players.push({
					player: Meteor.userId(),
					selection: selection
				})
			}

			Meteor.call('playerSelection', game._id, players, function(error, id){
				if (error)
					throwError(error.reason, 'error');
			});

			$('.player-card').removeClass('selected');
			$(event.target).addClass('selected');
		}
	}
})

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