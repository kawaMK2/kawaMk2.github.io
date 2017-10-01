$(function () {

    var win = $(window);
    var sections = $('.golden-section');
    var spiral = $('.golden-spiral');
    var active = $('.active');

    var width;
    var height;
    var smallScreen;
    var landscape;
    var goldenAspect = 0.618033;
    var axis = 0.7237;
    var spiralOrigin;

    var rotation = 0;
    var sectionCount = sections.length;
    var currentSection = 0;
    var touchStartX = 0;
    var touchStartY = 0;
    var moved = 0;
    var animRAF;
    var scrollTimeout;

    var rotateRight = 1;

    var userAgent = window.navigator.userAgent.toLowerCase(),
        firefox = userAgent.indexOf('firefox') != -1 || userAgent.indexOf('mozilla') == -1,
        ios = /iphone|ipod|ipad/.test(userAgent),
        safari = (userAgent.indexOf('safari') != -1 && userAgent.indexOf('chrome') == -1) || ios,
        linux = userAgent.indexOf('linux') != -1,
        windows = userAgent.indexOf('windows') != -1;

    resizeHandler();

    win.on('resize', resizeHandler);
    win.on('scroll', function (e) {
        e.preventDefault();     // スクロールイベントはキャンセル
    });

    win.on('wheel', function (e) {
        var deltaY = -e.originalEvent.deltaY;
        if (windows || linux) {
            deltaY = e.deltaY * 5;
        }
        moved = -deltaY || 0;
        rotation += moved/-10;
        rotation = trimRotation();
        e.preventDefault();
        startScrollTimeout();
        cancelAnimationFrame(animRAF);
        scrollHandler();
    });

    win.on('touchstart', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        moved = 0;
        touchStartX = touch.pageX;
        touchStartY = touch.pageY;
        cancelAnimationFrame(animRAF);
    });

    win.on('touchmove', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        moved = ((touchStartY - touch.pageY) + (touchStartX - touch.pageX)) * 3;
        touchStartX = touch.pageX;
        touchStartY = touch.pageY;
        rotation += moved/-10;
        rotation = trimRotation();
        startScrollTimeout();
        cancelAnimationFrame(animRAF);
        scrollHandler();
    });

    win.on('touchend', function () {
        animateScroll();
    });

    win.on('keydown', function (e) {
        if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
            cancelAnimationFrame(animRAF);
            animateScroll((currentSection + 1) * -90, rotation);
        } else if (e.keyCode === 37 || e.keyCode === 38) {
            cancelAnimationFrame(animRAF);
            animateScroll((currentSection - 1) * -90, rotation);
        }
        scrollHandler();
    });

    sections.on('click', function () {
        cancelAnimationFrame(animRAF);
        animateScroll($(this).index() * -90, rotation);
    });

    active.hover(function () {
        active.css({
            'border-radius': '0%'
        })
    });



    function scrollHandler() {
        requestAnimationFrame(function () {
            var scale = Math.pow(goldenAspect, rotation/90);
            currentSection = Math.min(sectionCount + 2, Math.max(-sectionCount, Math.floor((rotation-30)/-90)));
            currentSection = Math.max(0, Math.min(currentSection, sectionCount-1));
            spiral.css({
                transform: 'rotate(' + -rotateRight*rotation + 'deg) scale(' + scale + ')'
                // transform: 'rotate(' + rotation + 'deg)'
            });
            sections.removeClass('active');
            sections.eq(currentSection).addClass('active');
            // sections.eq(currentSection).hover(function () {
            //     sections.eq(currentSection).css({
            //         'border-radius': '0%'
            //     })
            // });
        })
    }

    function animateScroll(targetR, startR, speed) {
        var mySpeed = speed || .2;
        if (((targetR || Math.abs(targetR) === 0) && Math.abs(targetR - rotation) > .1) || Math.abs(moved) > 1) {
            if (targetR || Math.abs(targetR) === 0) {
                rotation += mySpeed * (targetR - rotation);
            } else {
                moved *= .98;
                rotation += moved / -10;
            }
            rotation = trimRotation();
            scrollHandler();
            animRAF = requestAnimationFrame(function () {
                animateScroll(targetR, startR, speed)
            });
        } else if (targetR || Math.abs(targetR) === 0) {
            cancelAnimationFrame(animRAF);
            rotation = targetR;
            rotation = trimRotation();
            scrollHandler();
        }
    }

    function buildSpiral() {
        var w, h;
        if (smallScreen && !landscape) {
            spiralOrigin = Math.floor(width * (axis)) + 'px ' + Math.floor((width / goldenAspect) * axis) + 'px';
            w = width;
            h = width;
            rotateRight = 1;
        } else {
            // spiralOrigin = Math.floor(width * axis) + 'px ' + Math.floor(width * (1-goldenAspect) * (axis)) + 'px';
            spiralOrigin = Math.floor(width * axis) + 'px ' + Math.floor(width * goldenAspect * axis) +'px';
            w = width * goldenAspect;
            h = w;
            rotateRight = -1;
        }

        var translate = '';
        if (safari || firefox) {
            translate = 'translate3d(0,0,0)'
        }

        spiral.css({
            transformOrigin: spiralOrigin,
            backfaceVisibility: 'hidden'
        });
        sections.each(function (i) {
            var myRotation = Math.floor(90*i);
            $(this).css({
                width: w,
                height: h,
                transformOrigin: spiralOrigin,
                backfaceVisibility: 'hidden',
                // backgroundColor: 'rgb(' + Math.floor(255-i*(255/sectionCount)) + ',50,50)',
                transform: 'rotate(' + -rotateRight*myRotation + 'deg) scale(' + Math.pow(goldenAspect, i) + ') ' + translate
                // transform: 'rotate(' + myRotation + 'deg)'
            });
        });
        scrollHandler();
    }

    function resizeHandler() {
        width = window.innerWidth;
        height = window.innerHeight;
        smallScreen = width < 960;
        landscape = height < width;
        if (landscape) {
            rotateRight = -1;
        }
        buildSpiral();
    }

    function trimRotation() {   // -1500 < rotation < 500
        return Math.max(-1500, Math.min(rotation, 500))
    }

    function startScrollTimeout() {
        clearTimeout(scrollTimeout);
        if (currentSection > -1 && currentSection < sectionCount) {
            scrollTimeout = setTimeout(function () {
                cancelAnimationFrame(animRAF);
                animateScroll(currentSection * -90, rotation, .15);
            }, 100);
        }
    }

});