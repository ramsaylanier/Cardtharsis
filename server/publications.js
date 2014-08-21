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
	return Meteor.users.find({game: gameId}, {fields: {"profile.name": 1}});
})

Meteor.publish('cards', function(){
	return Cards.find();
})