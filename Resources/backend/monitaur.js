var Monitaur = {};

Monitaur.init = function() {

  window.Site = Backbone.Model.extend({
    defaults: {
      url: "",
      interval: 10000
    }
  });

  window.SiteList = Backbone.Collection.extend({
    model: Site,
    localStorage: new Store("sites"),
    el: $("sites")
  });

  window.Sites = new SiteList;

  window.SiteView = Backbone.View.extend({

    tagName: "li",
    template: _.template($('#site-template').html()),
    events: {
      "click a.site-name" : "ping",
      "click a.site-name" : "showDetails",      
      "click .ping" : "ping",
      "hover a.site-name" : "hover"
    },
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.model.view = this;   
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setContent();
      this.ping();
      return this;
    },
    setContent: function() {
      var content = this.model.get('url');
      this.$('.site-name').text(content);

      // do the other ajax stuff here to fetch the data
    },
    show: function() {
      this.$('.site-details').toggle();
    },
    ping: function() {

      var result = "";

      var target = this;

      target.inprogress();

      $.getJSON(this.model.get('url'))
      .success(function(data) { 

        var items = [];

        $.each(data, function(key, val) {
          items.push('<li id="' + key + '">' + key + ' : ' + val + '</li>');
        });

        target.$('.site-details').html(""); // reset the content first

        target.up();

        $('<ul/>', {
          'class': 'site-sysinfo',
          html: items.join('')
        }).appendTo(target.$('.site-details'));
 
        
      })
      .error(function(data) { 
        //result = "<p class='errorLoading'>Error loading</p>";
        //target.$('.site-details').html(result);        
        target.$('.site-details').html("");
        target.down();   
      })
      .complete(function(data) { 
         
      });

    },
    showDetails: function() {
      if(this.$('.site-details').is(':visible') == true) {
        this.$('.site-details').hide();
      } else {
        this.$('.site-details').show();
      }
    },
    down: function() {
      this.$('.site-status-icon').html('<img src="images/red.png" />');
    },
    up: function() {
      this.$('.site-status-icon').html('<img src="images/green.png" />');
    },
    hover: function() {
 //     this.$('.site-status-icon').html('<img src="images/refresh.png" />');
    },
    inprogress: function() {
      this.$('.site-details').html('<center><img src="images/ajax-loader.gif" /></center>');
    }

  });

  window.AppView = Backbone.View.extend({
    el: $("#monitaurapp"),
    events: {
      "change #refresh_interval" : "restartTimer"
    },
    initialize: function() {
      _.bindAll(this, 'addOne', 'addAll', 'render');

      Sites.bind('add', this.addOne);
      Sites.bind('refresh', this.addAll);
      Sites.bind('all', this.render);

      Sites.fetch();
    },
    render: function() {
      this.$("#sites").html("");
      this.addAll();
      this.$("#last_update").html(Date.now().toString());
    },
    addOne: function(site) {
      var view = new SiteView({model:site});
      this.$("#sites").append(view.render().el);
    },
    addAll: function() {
      Sites.each(this.addOne);
      this.stopTimer();
      this.monitor();
    },
    showDetails: function() {

    },
    monitor : function() {
      interval = $('#refresh_interval').val();
      console.log("Monitor Starting/Restarting at: "+ interval);      
      var timer  = window.setInterval ("window.App.render();", interval);
      this.timer = timer;
    }, 
    stopTimer: function() {
      window.clearInterval(this.timer);
    },
    restartTimer: function() {
      this.stopTimer();
      this.monitor();
    }

  });

  window.App = new AppView;

} // end of init

Monitaur.showAddSite = function() {
  $('#add_site_form_container').slideDown();
};

Monitaur.cancelAddSite = function() {
  $('#add_site_form_container').slideUp();
};

Monitaur.createSite = function() {

  new_url = $('#create-url-input').val();
  Sites.create({
    url: new_url
  });

  $('#add_site_form_container').slideUp();
};

$(function() {
  Monitaur.init();
});


