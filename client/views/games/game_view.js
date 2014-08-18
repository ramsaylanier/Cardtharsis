Template.gameView.helpers({
	players: function(template){
		return Meteor.users.find({game: this._id});
	},
	creator: function(){
		if (Meteor.userId() == this.creator)
			return true
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
	}
})