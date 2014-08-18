Meteor.publish('publicGames', function(){
	return Games.find();
})

Meteor.publish('users', function(){
	return Meteor.users.find();
})

Meteor.publish('cards', function(){
	return Cards.find();
})