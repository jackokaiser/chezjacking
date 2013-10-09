sortActToColumns = () ->
    col1 = []
    col2 = []
    col3 = []
    col4 = []

    $('.act').each( (idx,act) ->
        colNb = idx % 4
        if colNb is 0
            col1.push(act)
        else if colNb is 1
            col2.push(act)
        else if colNb is 2
            col3.push(act)
        else if colNb is 3
            col4.push(act)
        );
    col1.appendTo($('#col1'))
    col2.appendTo($('#col2'))
    col3.appendTo($('#col3'))
    col4.appendTo($('#col4'))

sortActToColumns();