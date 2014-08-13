Template.gameView.helpers({
	players: function(template){
		return Meteor.users.find({game: this._id});
	}
})