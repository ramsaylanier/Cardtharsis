Meteor.publish('publicGames', function(){
	return Games.find();
})

Meteor.publish('currentGame', function(gameId){
	return Games.find(gameId);
})

Meteor.publish('currentUser', function(){
	return Meteor.users.find(this.userId);
})

Meteor.publish('playersInGame', function(gameId){
	var game = Games.findOne(gameId),
		players = _.pluck(game.players, 'id');

	return Meteor.users.find({_id: {$in: players}}, {fields: {"profile.name": 1}});
})

Meteor.publish('cards', function(){
	return Cards.find();
})

Meteor.publish('userGames', function(){
	userGames = Meteor.users.findOne(this.userId).games;
	console.log(userGames);
	return Games.find({_id: {$in: userGames}});
})