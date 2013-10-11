col1 = $('#col1')
col2 = $('#col2')
col3 = $('#col3')
col4 = $('#col4')
board = $('#board')
lastCol = col4

seededRandom = (i) ->
    x = Math.sin(i) * 10000
    return x - Math.floor(x)

# generate dark color in hsl coordinate
# return a string
colorGenerator = (i) ->
    k = 3*i+1
    hue = Math.floor(seededRandom(k)*360)
    # ensure minimum saturation
    sat = Math.floor(seededRandom(k+1)*60)+30
    # ensure bright color
    lum = Math.floor(seededRandom(k+2)*50) + 45
    return 'hsl('+hue+','+sat+'%,'+lum+'%)'

sortActToColumns = () ->
    acts = $('.act')
    nActs = acts.length
    for i in [0..nActs-1] by 1
        colNb = i % 4
        # get acts in reverse order
        item = acts.slice(nActs-i-1,nActs-i)
        item.css('background-color',colorGenerator(nActs-1 - i));
        if colNb is 0
            item.appendTo(col1)
        else if colNb is 1
            item.appendTo(col2)
        else if colNb is 2
            item.appendTo(col3)
        else if colNb is 3
            item.appendTo(col4)


sortActToColumns();
