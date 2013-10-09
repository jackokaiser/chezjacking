col1 = $('#col1')
col2 = $('#col2')
col3 = $('#col3')
col4 = $('#col4')
board = $('#board')
lastCol = col4

sortActToColumns = () ->
    acts = $('.act')
    nActs = acts.length
    for i in [0..nActs-1] by 1
        colNb = i % 4
        # get acts in reverse order
        item = acts.slice(nActs-i-1,nActs-i)
        if colNb is 0
            item.appendTo(col1)
        else if colNb is 1
            item.appendTo(col2)
        else if colNb is 2
            item.appendTo(col3)
        else if colNb is 3
            item.appendTo(col4)


sortActToColumns();
