Template.lobbyGameView.events({
	'click .delete-btn': function(e, template){
		var gameId = template.data._id;

		Meteor.call('deleteGame', gameId, function(error, id){
			if (error){
				throwError(error.reason, 'error')
			} else {
				Router.go('/')
			}
		})
	},
	'click .join-game': function(e, template){
		var gameId = template.data._id;
		var currentUser = Meteor.userId();

		Meteor.call('addUserToGame', gameId, currentUser, function(error, id){
			if (error){
				throwError(error.reason, 'error')
			} else {
				throwError('Welcome to the game!', 'success')
			}
		})
	}
})