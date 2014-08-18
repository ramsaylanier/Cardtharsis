Games = new Meteor.Collection('games');


Meteor.methods({
	createGame: function(gameAttributes){
		var loggedInUser = this.userId;
		var deck = Cards.find().fetch();

		if (!gameAttributes.name){
			throw new Meteor.Error(422, 'Please enter a name for your game');
		}

		var game = _.extend(_.pick(gameAttributes, 'name', 'isPublic', 'creator'), {
			started: false,
			gameDeck: deck,
			players: [{id: loggedInUser, czar:true, score: 0}],
			submitted: new Date().getTime(),
		});

		//create new game
		var gameId = Games.insert(game);

		//add game to creator's collection
		Meteor.users.update({_id: loggedInUser}, {$set: {game: gameId}});

		return gameId;
	},

	deleteGame: function(gameId, creator){
		if (this.userId == creator){
			Meteor.users.update({game: gameId}, {$set : {game: null}}, {multi: true});
			return Games.remove(gameId);
		} else {
			throw new Meteor.Error(422, "You aren't the games creator; therefore, you don't have access to delete this game.");
		}
	},

	addUserToGame: function(gameId, userId){
		if ( Meteor.users.findOne({_id: userId}).game )
			throw new Meteor.Error(422, 'You are already in a game.');
		else if (gameId && userId){
			Games.update({_id: gameId}, { $addToSet: { players: {id: userId, czar: false, score: 0}}});
			return Meteor.users.update({ _id: userId } , { $set: { game: gameId }} );
		}
	},

	removeUserFromGame: function(gameId, userId){
		if (gameId && userId){
			Games.update({_id: gameId}, { $pull: { players: { id: userId}}});
			return Meteor.users.update({ _id: userId }, {$set: { game: null}} );
		}
	},

	startGame: function(gameId, userId){
		var loggedInUser = this.userId;

		if (loggedInUser = Games.findOne({_id: gameId}).creator){
			Games.update({_id: gameId}, {$set: {started: true}});
		}
	}
})