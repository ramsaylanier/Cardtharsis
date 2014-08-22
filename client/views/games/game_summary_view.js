Template.gameSummary.helpers({
	winner: function(){
		var winner = _.max(this.players, function(player){
			return player.score;
		});

		if (winner.id)
			return Meteor.users.findOne({_id: winner.id}).profile.name;
	},
	playerName: function(){
		// return Meteor.users.find({_id: this.id}).profile.name;
	},
	selectionCard: function(){
		return Cards.findOne(this.selection).Card;
	}
})