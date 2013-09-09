// Generated by CoffeeScript 1.6.3
(function() {
  jQuery(function($) {
    return $("#rss-feeds").rss("https://github.com/jackokaiser.atom", {
      limit: 10,
      entryTemplate: '<li><div class="weak-p">{title}</div><div class="small-right">{formatedDate}</div></li>',
      effect: 'slideSynced',
      tokens: {
        formatedDate: function(entry, tokens) {
          var idx, substr;
          idx = tokens.date.lastIndexOf(" ");
          substr = tokens.date.substring(0, idx);
          idx = substr.lastIndexOf(" ");
          return substr.substring(0, idx);
        }
      }
    });
  });

}).call(this);