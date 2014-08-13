Games = new Meteor.Collection('games');


Meteor.methods({
	createGame: function(gameAttributes){
		var loggedInUser = this.userId;

		if (!gameAttributes.name){
			throw new Meteor.Error(422, 'Please enter a name for your game')
		}

		var game = _.extend(_.pick(gameAttributes, 'name', 'isPublic', {
			submitted: new Date().getTime(),
			creator: loggedInUser
		}))

		var gameId = Games.insert(game);

		return gameId;
	},

	deleteGame: function(gameId){
		return Games.remove(gameId);
	},

	addUserToGame: function(gameId, userId){
		return Meteor.users.update({ _id: userId } , { $set: { game: gameId }} );
	}
})