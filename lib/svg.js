
var q = require("./quasi");

function greyToColour (grey) {
    var col = Math.round(grey * 255).toString(16);
    if (col.length < 2) col = "0" + col;
    return "#" + col + col + col;
}

exports.svg = function (opt) {
    opt = opt || {};
    var strokeWidth = opt.strokeWidth || "0.01";
    
    // SVG header
    var ret = []
    ,   curObj = {
            commands: []
        }
    ;

    q.quasi(
        opt
    ,   {
            newPath:    function () {
                if (!curObj.commands.length) return;
                var str = '    <path d="' + curObj.commands.join(" ") + '"';
                if (typeof curObj.fill !== "undefined") str += ' fill="' + curObj.fill + '"';
                if (typeof curObj.stroke !== "undefined") str += ' stroke="' + curObj.stroke + '"';
                str += '></path>';
                curObj = { commands: [] };
                ret.push(str);
            }
        ,   moveTo:     function (x, y) {
                curObj.commands.push("M " + x.toFixed(2) + ", " + y.toFixed(2));
            }
        ,   lineTo:     function (x, y) {
                curObj.commands.push("L " + x.toFixed(2) + ", " + y.toFixed(2));
            }
        ,   closePath:  function () {
                curObj.commands.push("z");
            }
        ,   startGroup:  function () {}
        ,   endGroup:  function () {}
        ,   setFillGrey:  function (colour) {
                curObj.fill = greyToColour(colour);
            }
        ,   setStrokeGrey:  function (colour) {
                curObj.stroke = greyToColour(colour);
            }
        ,   boundaries: function (minx, miny, maxx, maxy) {
                // magic: the x needs be moved but not the y
                ret.unshift('  <g transform="translate(-' + minx.toFixed(2) + ', 0)">');
                ret.unshift('<svg xmlns="http://www.w3.org/2000/svg" ' +
                            'viewBox="' + [minx.toFixed(2), miny.toFixed(2), (maxx - minx).toFixed(2), maxy.toFixed(2)].join(" ") + '" ' +
                            'stroke-width="' + strokeWidth + '" stroke="none" fill="none">');
            }
        }
    );
    
    // SVG Footer
    ret.push("  </g>");
    ret.push("</svg>");

    return ret.join("\n");
};
