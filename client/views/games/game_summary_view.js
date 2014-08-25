Template.gameSummary.helpers({
	gameWinner: function(){
		var winner = _.max(this.players, function(player){
			return player.score;
		});

		if (winner.id)
			return Meteor.users.findOne({_id: winner.id}).profile.name;
	},
	playerName: function(){
		return Meteor.users.findOne({_id: this.id}).profile.name;
	},
	selectionCard: function(){
		return Cards.findOne(this.selection).Card;
	},
	winningCard: function(round){
		if (round.winner == this.player)
			return 'winner'
	},
	cardPlayer: function(){
		return Meteor.users.findOne(this.player).profile.name
	}
})