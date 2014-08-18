Template.loginButtons.events({
	'click #login-buttons-logout': function(e){
		var currentUser = Meteor.userId();
		var userGame = Meteor.users.findOne(currentUser, {fields: {game: 1}});

		Meteor.call('removeUserFromGame', userGame.game, currentUser);
		Router.go('/');
	}
})