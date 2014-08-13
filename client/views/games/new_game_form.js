Template.newGameForm.events({
	'submit form': function(event){
		event.preventDefault();

		var game = {
			name: $('.game-name-field').val(),
			isPublic: $('.is-public-field').prop('checked')
		}

		Meteor.call('createGame', game, function(error, id){
			if (error){
				//call custom throwError function
				throwError(error.reason, 'error');
			} else {
				Router.go('/');
			}
		});
	}
})