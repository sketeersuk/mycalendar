CalEvent = new  Mongo.Collection('calevent');

if (Meteor.isClient) {
  Template.dialog.events({
    'click .closeDialog': function(event, template){
      Session.set('editing_event', null);
    },
    'click .updateTitle': function(evt, tmpt){
      var title = tmpt.find('#title').value;
      Meteor.call('updateTitle', Session.get('editing_event'), title);
      Session.set('editing_event', null);
    },
  });

  Template.main.helpers({
    editing_event: function(){
      return Session.get('editing_event');
    }
  });

  Template.dialog.helpers({
    title: function(){
      var ce = CalEvent.findOne({_id: Session.get("editing_event")})
      return ce.title;
    }
  });

  Template.main.rendered = function(){
    var calendar = $('#calendar').fullCalendar({
      dayClick: function(date, allDay, jsEvent, view){
        var calendarEvent  = {};
        calendarEvent.start = date;
        calendarEvent.end = date;
        calendarEvent.title = "New Event";
        calendarEvent.owner = Meteor.userId();
        Meteor.call('saveCalEvent', calendarEvent);
      },
      eventDrop: function(reqEvent){
          Meteor.call('moveEvent', reqEvent);
      },
      eventClick: function(calEvent, jsEvent, view){
        Session.set("editing_event", calEvent._id);
        $("#title").val(calEvent.title);
      },
      events:function(start, end, callback){
        var calEvents = CalEvent.find({owner: Meteor.userId()}, {reactive: false}).fetch();
        callback(calEvents);
      },
      eventColor: '#378006',
      editable:true,
      selectable:true
    }).data().fullCalendar;

    Deps.autorun(function(){
      CalEvent.find().fetch();
      if(calendar){
        calendar.refetchEvents();
      }
    })
  }

  // Accounts config
  Accounts.ui.config({
    requestPermissions: {},
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.methods({
      'saveCalEvent': function(ce){
        CalEvent.insert(ce);
      },
      'updateTitle': function(id, title){
        return CalEvent.update({_id:id}, {$set: {title:title}});
      },
      'moveEvent': function(reqEvent){
        return CalEvent.update({_id:reqEvent._id},{
          $set:{
            start:reqEvent.start,
            end:reqEvent.end
          }
        });
      },
    });
  });
}
