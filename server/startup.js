Meteor.startup(function () {
    if(Cards.find().count() === 0){
        var whiteCards = Meteor.whiteCards();
        var blackCards = Meteor.blackCards();
        
        _.each(whiteCards, function(element, index){
        	return Cards.insert(element);
        });

        _.each(blackCards, function(element, index){
        	return Cards.insert(element);
        });
    }
});