/**
 * Created by dav on 01.09.16.
 */
var CSS_COLOR_NAMES = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet", "AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
$(document).ready(function(){
    var width = 690;
    var height = 400;

    var stage = new Konva.Stage({
        container: 'chart_container',
        width: width,
        height: height
    });

    var layer = new Konva.Layer();

    var tooltipLayer = new Konva.Layer();

    var tooltip = new Konva.Label({
        opacity: 0.75,
        visible: false,
        listening: false
    });

    tooltip.add(new Konva.Tag({
        fill: 'black',
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: 10,
        shadowOpacity: 0.2
    }));

    tooltip.add(new Konva.Tag({
        fill: 'black',
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: 10,
        shadowOpacity: 0.2
    }));

    tooltip.add(new Konva.Text({
        text: '',
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'white'
    }));

    tooltipLayer.add(tooltip);

    var chart_colors;
    var total = getTotalVotes();
    var x = stage.getWidth()/2;
    var y = stage.getHeight()/2;
    var innerRadius = 100;
    var outerRadius = 180;
    var stroke = 'White';
    var strokeWidth = 3;
    var arcs;

    if(total > 0){
        //chart_colors = getColors();
        arcs = getArcs(total, x, y, innerRadius, outerRadius, strokeWidth, stroke);
        console.log(arcs);

        for(var i = 0; i < arcs.length; i++){
            layer.add(new Konva.Arc(arcs[i]));
        }
        stage.add(layer);
        stage.add(tooltipLayer);

        stage.on('mouseover mousemove', function(evt) {
            var node = evt.target;
            if (node) {
                // update tooltip
                var mousePos = node.getStage().getPointerPosition();
                tooltip.position({
                    x : mousePos.x,
                    y : mousePos.y - 5
                });
                tooltip.getText().setText(node.attrs.title + ": " + node.attrs.voted);
                tooltip.show();
                tooltipLayer.batchDraw();
            }
        });

        stage.on('mouseout', function(evt) {
            tooltip.hide();
            tooltipLayer.draw();
        });
    }

});

/*function getColors(){
    var color = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
    var colors = [];
    for(var i = 0; i < options.length; i++){
        while(colors.indexOf(color) != -1){
            color = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
        }
        colors.push(color);
    }
    console.log(colors);
    return colors;
}*/

function getArcs(total, x_pos, y_Pos, inner_R, outer_R, strokeSize, stroke_color){
    var arcs = [];
    var arc;

    var arc_rotation = 0;
    var arc_angle = 0;

    for(var i = 0; i < options.length; i++){
        arc_angle = getAngle(options[i].votedfor, total);
        arc = {
            x: x_pos,
            y: y_Pos,
            innerRadius: inner_R,
            outerRadius: outer_R,
            angle: arc_angle,
            rotation: arc_rotation,
            fill: CSS_COLOR_NAMES[i],
            stroke: stroke_color,
            strokeWidth: strokeSize,
            voted: options[i].votedfor,
            title: options[i].name
        };
        arcs.push(arc);
        $('.legend').append(getLegend(options[i].name, CSS_COLOR_NAMES[i]));
        arc_rotation += arc_angle;
    }
    return arcs;
}

function getTotalVotes(){
    var total = 0;
    for(var i = 0; i < options.length; i++){
        total += options[i].votedfor;
    }
    return total;
}

function getAngle(votes, total){
    if(votes == 0){
        return 0;
    }
    return 360 * (votes/total);
}

function getLegend(name, color){
    var item = '<li><span style="background-color:' + color + '"></span>' + name + '</li>'
    console.log(item);
    return item;
}

