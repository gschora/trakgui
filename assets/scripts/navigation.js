$(function() {
    $('#navigation a').stop().animate({
        'marginLeft': '-85px'
    }, 1000);

    $('#navigation > li').hover(function() {
        $('a', $(this)).stop().animate({
            'marginLeft': '-2px'
        }, 200);
    }, function() {
        $('a', $(this)).stop().animate({
            'marginLeft': '-85px'
        }, 200);
    });

    $('#settings a').stop().animate({
        'marginLeft': '80px'
    }, 1000);
    $('#settings > li').hover(function() {
        $('a', $(this)).stop().animate({
            'marginLeft': '0px'
        }, 200);
    }, function() {
        $('a', $(this)).stop().animate({
            'marginLeft': '80px'
        }, 200);
    });
});
$(document).ready(function() {
    $('#social-network').find('img').css({
        'opacity': 0.6
    });

    $('#social-network').find('img').hover(function() {
        $(this).stop().animate({
            opacity: 1
        })
    }, function() {
        $(this).stop().animate({
            opacity: 0.6
        })
    })
});

