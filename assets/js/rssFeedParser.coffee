jQuery ($) ->
  $("#rss-feeds")
    .rss("https://github.com/jackokaiser.atom",
      {
        limit: 7,
        entryTemplate: '<li><div class="weak-p">{title}</div><div class="small-right">{formatedDate}</div></li>',
        effect: 'slideFastSynced',
        tokens: {
          formatedDate : (entry,tokens) ->
            idx = tokens.date.lastIndexOf(" ")
            substr = tokens.date.substring(0,idx)
            idx = substr.lastIndexOf(" ")
            return substr.substring(0,idx)
          }
      })
