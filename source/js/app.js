define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller', 'performance_chart'], function (news, shareTools, performanceChart) {

    
    
    return {
        init: function (storyPageUrl) {

//            news.pubsub.emit('istats', ['App initiated', true]);
//
//            shareTools.init('.main', storyPageUrl, 'Custom message');
//
//            news.setIframeHeight(9999);

//            news.hostPageSetup(function () {
//                // console.log('do something in the host page');
//            });
            var svgSupport = (!! document.createElementNS && !! document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) ? true : false;
            /**
             * only initialise if svgSupported and viewport width >= 976 wide*/
            if (news.$('body').width() >= 976 && svgSupport && news.$('.ns_7255__interactive')) {
                performanceChart.init();
            }

        }
    };

});