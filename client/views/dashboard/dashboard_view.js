Template.dashboard.created = function(){
	_.each(this.data.fetch(), function(game){
		Meteor.subscribe('playersInGame', game._id)
	});
}

Template.dashboard.helpers({
	score: function(){
		playerScore = _.find(this.players, function(player){
			return player.id == Meteor.userId();
		}).score;

		return playerScore;
	},
	playerName: function(){
		player = Meteor.users.findOne(this.id);

		if (player)
			return player.profile.name;
	}
});

Template.dashboard.events({
	'click .reset-games-btn': function(){
		Meteor.call('resetGames', Meteor.userId(), function(error){
			if (error)
				throwError(error.reason, 'error')
			else 
				throwError("Games reset!", 'success')
		})
	}
});