var ns_7255_svg = (!! document.createElementNS && !! document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect) ? true : false;
define(["lib/news_special/bootstrap", "istats", (ns_7255_svg) ? "lib/vendors/d3" : "", "dataset"],  function (news, istats, d3, dataset) {
    var chart,
        canvas,
        canvasContainer = ".ns_7255__chart",
        canvasWidth,
        canvasHeight = 168,
        heightScale,
        chartLabelsWidth = 50,
        chartBarWidth,
        leftMostBarOffsetLeft,
        padding = {top: 30},
        offset = {barcharts: 30, targetLine: 16, annotationVerticalYPosition: 12};
    
    
    function init() {
        
        var dataMin = dataset[0][3],
            dataMax = dataset[dataset.length - 1][3],
            belowTargetCount = 0;
        
        news.$(".ns_7255__interactive").css("display", "block");

        canvasWidth = news.$(canvasContainer).width();
        
        heightScale = d3.scale.linear().domain([80, 100]).range([0, canvasHeight]);
        chartBarWidth = (canvasWidth - chartLabelsWidth) / dataset.length;
        
        if (news.$(canvasContainer).find("svg")) {
            news.$(canvasContainer).find("svg").remove();
        }
        
        canvas = d3.select(canvasContainer).append("svg").attr({height: canvasHeight + offset.barcharts, width: canvasWidth});//.append("g");
        chart = canvas.append("g");
        chart.selectAll("rect").data(dataset).enter().append("rect")
            .attr({
                x: function (d, i) { return chartBarWidth * i; },
                y: function (d) { if (d[3] < 95) { belowTargetCount++; } return canvasHeight - heightScale(d[3]); },
                width: chartBarWidth,
                height: function (d, i) { return heightScale(d[3]); },
                "class": function (d) {
                    var performance = "ns_7255__key--4thquarter ";
                    if (d[2] < 1000) {
                        performance = "ns_7255__attendance--1stquarter ";
                    } else if (d[2] < 1499) {
                        performance = "ns_7255__attendance--2ndquarter ";
                    } else if (d[2] < 1999) {
                        performance = "ns_7255__attendance--3rdquarter ";
                    }
                    return "performance_bar " + performance + d[0];
                }
            })
            .on("mouseover", function (d, i) {
                toolTipHtml = "<p class=\"ns_7255__tooltip_info\">" + d[1] + "</p>" +
                                "<p class=\"ns_7255__tooltip_info ns_7255__tooltip_info--figures\">4-hour average: <span>" + d[3] + "%</span></p>" +
                                "<p class=\"ns_7255__tooltip_info ns_7255__tooltip_info--figures\">Attendance average: <span>" + tooltipAddCommas(d[2]) + "</span></p>";

                tooltip = news.$(".ns_7255__tooltip").removeClass("ns_7255__tooltip--hidden").addClass("ns_7255__tooltip--visible").html(toolTipHtml);
                
                d3.select(this).classed("ns_7255__attendance--active_chart", true);
            })
            .on("mousemove", function (d, i) {
                tooltipMousemove(this, i);
            })
            .on("mouseout", function () {
                d3.select(this).classed("ns_7255__attendance--active_chart", false);
                news.$(".ns_7255__tooltip").removeClass("ns_7255__tooltip--visible").addClass("ns_7255__tooltip--hidden");
            });
        
        chart.append("text").text("100%").attr({x: canvasWidth - chartLabelsWidth + getYLabelOffset(100), y: offset.annotationVerticalYPosition, "class": "y-axis-label"});
        chart.append("text").text("80%").attr({x: canvasWidth - chartLabelsWidth + getYLabelOffset(dataMin), y: heightScale(100) - 1, "class": "y-axis-label"});
        chart.attr("transform", "translate(0 " + offset.barcharts + ")");
        
        canvas.append("text").text("Not meeting target").attr({
            x: function () {
                return ((belowTargetCount / 2) * chartBarWidth) - this.getComputedTextLength() / 2;
            },
            y: offset.annotationVerticalYPosition,
            "class": "ns_7255__annotation"
        });
        
        canvas.append("text").text("Meeting target").attr({
            x: function () {
                return (belowTargetCount + ((dataset.length - belowTargetCount) / 2)) * chartBarWidth - (this.getComputedTextLength() / 2);
            },
            y: offset.annotationVerticalYPosition,
            "class": "ns_7255__annotation"
        });
        
        canvas.append("text").text("95% Target").attr({
            x: function () {
                return (belowTargetCount * chartBarWidth) - (this.getComputedTextLength() / 2);
            },
            y: offset.annotationVerticalYPosition,
            "class": "ns_7255__annotation ns_7255__annotation--target"
        });
        
        canvas.append("line").attr({
            "x1": belowTargetCount * chartBarWidth,
            "y1": offset.targetLine,
            "x2": belowTargetCount * chartBarWidth,
            "y2": heightScale(100) + offset.barcharts,
            "stroke-width": 1,
            "stroke": "black",
            "stroke-dasharray": "5,5"
        });

    }
    
    function tooltipAddCommas(nStr) {
        nStr += "";
        x = nStr.split(".");
        x1 = x[0];
        x2 = x.length > 1 ? "." + x[1] : "";
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, "$1" + "," + "$2");
        }
        return x1 + x2;
    }
    
    function tooltipMousemove(activeElement, barIndex) {
        var tooltip = news.$(".ns_7255__tooltip"),
            ypos = d3.mouse(activeElement)[1] - tooltip.height() - 5,
            xpos = d3.mouse(activeElement)[0],
            horizontalPosition,
            tooltipWidth = tooltip.outerWidth() + 12;
        
        if (xpos + tooltipWidth > canvasWidth) {
            horizontalPosition = "right: 0px;";
            horizontalPosition = "left: " + (xpos - tooltipWidth) + "px;";
        } else {
            horizontalPosition = "left: " + (xpos + 12) + "px;";
        }
        
        tooltip.attr("style", horizontalPosition + " top:" + ypos + "px");
    }
    
    function getYLabelOffset(val) {
        return (val.toString().length < 3) ? 5 : 2;
    }
    
    return {
        init: init
    };
    
});