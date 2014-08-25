Template.dashboard.helpers({
	game: function(){
		console.log(this);
	}
})

Template.dashboard.event({
	'click .reset-games.btn': function(){
		Meteor.call('resetGames', Meteor.userId(), function(error){
			if (error)
				throwError(error.reason, 'success')
		})
	}
})