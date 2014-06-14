# Some helpers for our page
class TrivialPageScope
    constructor : () ->
    addProperty : (key,value) ->
        @[key] = value
        return @

TrivialPageScope::env = 'dev'


class StandardPageScope extends TrivialPageScope
    constructor : (@title, @subtitle) ->
        super()

newsletterMonths = [
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
  "april",
  "may"
  ]

# /*
#  * our routes
#  */
exports.routes =
    contact : (req, res) -> res.render('contact',
            new StandardPageScope 'Contact','Get in touch'),
    about : (req, res) -> res.render('about',
            new StandardPageScope 'About','Who am I?'),
    home : (req, res) -> res.render('home',
            new StandardPageScope 'Jacques KAISER','Welcome to my personal website'
            ),
    projects : (req, res) -> res.render('projects',
            new StandardPageScope 'Projects', "Here you'll find some of my web projects"
            ),
    work : (req, res) -> res.render('work',
            new StandardPageScope 'Work experiences', 'My work experiences along with references'
            ),
    australia : (req, res) -> res.render('australia',
            new StandardPageScope 'Australian Trip', '2013 - Current'),
    australiaMonth : (req, res, next) ->
        if req.params.month in newsletterMonths
            res.render('australiaDiary/'+req.params.month,
                new StandardPageScope 'Australia - '+req.params.month.capitalize(), '')
        else
            console.log('There is no such month')
            # call the next middleware to handle the 404
            next()
    raytracer : (req, res) -> res.render('raytracer',
            (new StandardPageScope '- A basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',false)
            ),
    raytracerEmbed : (req, res) -> res.render('raytracer',
            (new StandardPageScope '- A basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',true)
            ),
    raymarcher : (req, res) -> res.render('raymarcher',
            (new StandardPageScope '- A basic sphere marcher','MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',false)
            ),
    raymarcherEmbed : (req, res) -> res.render('raymarcher',
            (new StandardPageScope '- A basic sphere marcher','MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',true)
            ),
    news : (req, res) -> res.render('news',
            (new StandardPageScope 'News', 'The blog part').addProperty('posts',posts)
            ),
    # todo : error console for teaser
    teaser : (req, res) -> res.render('teaser')
    setEnvironment : (env) ->
        TrivialPageScope::env = env
