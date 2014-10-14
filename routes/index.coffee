# Some helpers for our page
class TrivialPageScope
    constructor : () ->
    addProperty : (key,value) ->
        @[key] = value
        return @

TrivialPageScope::env = 'dev'


class StandardPageScope extends TrivialPageScope
    constructor : (@title, @subtitle, pageTitle) ->
        @pageTitle = @title + " - " + pageTitle + " - Jacques KAISER - Chez Jacking"
        super()

newsletterMonths = [
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august"
  ]

# /*
#  * our routes
#  */
exports.routes =
    contact : (req, res) -> res.render('contact',
            new StandardPageScope 'Contact','Get in touch', 'Get in touch with Jacques KAISER, resumé, CV, email adress, location'),
    about : (req, res) -> res.render('about',
            new StandardPageScope 'About','Who am I?', 'Know me better, description of myself'),
    home : (req, res) -> res.render('home',
            new StandardPageScope 'Jacques KAISER','Welcome to my personal website', 'Personal website and blog, Web Developer, Computer Graphics'
            ),
    projects : (req, res) -> res.render('projects',
            new StandardPageScope 'Projects', "Here you'll find some of my web projects", 'My computer projects, web applications, WebGL'
            ),
    work : (req, res) -> res.render('work',
            new StandardPageScope 'Work experiences', 'My work experiences along with references', 'Previous roles in startup and labs as a Developer'
            ),
    australia : (req, res) -> res.render('australia',
            new StandardPageScope 'Australian Trip', '2013 - 2014', 'Diary of my trip to Australia from 2013 to 2014'),
    australiaMonth : (req, res, next) ->
        if req.params.month in newsletterMonths
            res.render('australiaDiary/'+req.params.month,
                new StandardPageScope 'Australia - '+req.params.month.capitalize(), '', 'Australian Diary for the month of '+req.params.month.capitalize())
        else
            console.log('There is no such month')
            # call the next middleware to handle the 404
            next()
    raytracer : (req, res) -> res.render('raytracer',
            (new StandardPageScope 'Basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
              'Simple sphere raytracer demo with Three.js and WebGL'
              ).addProperty('embed',false)
            ),
    raytracerEmbed : (req, res) -> res.render('raytracer',
            (new StandardPageScope 'Basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
              'Simple sphere raytracer demo with Three.js and WebGL'
              ).addProperty('embed',true)
            ),
    raymarcher : (req, res) -> res.render('raymarcher',
            (new StandardPageScope 'Basic sphere marcher','MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
              'Simple sphere raymarcher demo with Three.js and WebGL'
              ).addProperty('embed',false)
            ),
    raymarcherEmbed : (req, res) -> res.render('raymarcher',
            (new StandardPageScope 'Basic sphere marcher','MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
              'Simple sphere raymarcher demo with Three.js and WebGL'
              ).addProperty('embed',true)
            ),
    # news : (req, res) -> res.render('news',
    #         (new StandardPageScope 'News', 'The blog part', 'Some news').addProperty('posts',posts)
    #         ),
    # todo : error console for teaser
    teaser : (req, res) -> res.render('teaser')
    setEnvironment : (env) ->
        TrivialPageScope::env = env
