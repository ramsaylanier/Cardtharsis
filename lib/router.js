Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	waitOn: function(){
		return Meteor.subscribe('currentUser');
	}
});

//clears all Errors from the view before being routed
Router.onBeforeAction('loading');
Router.onBeforeAction(function(){
	clearErrors(); 
});

Router.map(function(){

	this.route('lobby', {
		path: '/',
		waitOn: function(){
			return Meteor.subscribe('publicGames');
		}
	});

	this.route('gameView', {
		path: '/games/:_id',
		waitOn: function(){
			return [
				Meteor.subscribe('currentGame', this.params._id),
				Meteor.subscribe('playersInGame', this.params._id)
			]
		},
		data: function(){
			return Games.findOne(this.params._id)
		}
	});
});