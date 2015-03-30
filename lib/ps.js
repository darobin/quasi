
var q = require("./quasi");


exports.ps = function (opt) {
    opt = opt || {};
    var strokeWidth = opt.strokeWidth || "0.015";
    
    if (opt.color) console.error("The ps module does not support the `color` option.");

    // PS header
    var ret = [
        "%%!PS-Adobe-1.0 "
    ,   "%%%%BoundingBox: -1 -1 766.354 567.929 "
    ,   "%%%%EndComments "
    ,   "%%%%EndProlog "
    ,   "gsave "
    ,   " "
    ,   "/f {findfont exch scalefont setfont} bind def "
    ,   "/s {show} bind def "
    ,   "/ps {true charpath} bind def "
    ,   "/l {lineto} bind def "
    ,   "/m {newpath moveto} bind def "
    ,   "/sg {setgray} bind def"
    ,   "/a {stroke} bind def"
    ,   "/cp {closepath} bind def"
    ,   "/g {gsave} bind def"
    ,   "/h {grestore} bind def"
    ,   "matrix currentmatrix /originmat exch def "
    ,   "/umatrix {originmat matrix concatmatrix setmatrix} def "
    ,   " "
    ,   "%% Flipping coord system "
    ,   "[8.35928e-09 28.3465 -28.3465 8.35928e-09 609.449 28.6299] umatrix "
    ,   "[] 0 setdash "
    ,   "0 0 0 setrgbcolor "
    ,   "0 0 m "
    ,   strokeWidth + " setlinewidth "
    ];

    q.quasi(
        opt
    ,   {
            newPath:    function () {}
        ,   moveTo:     function (x, y) {
                ret.push(x.toFixed(2) + " " + y.toFixed(2) + " m");
            }
        ,   lineTo:     function (x, y) {
                ret.push(x.toFixed(2) + " " + y.toFixed(2) + " l");
            }
        ,   closePath:  function () {
                ret.push("cp");
            }
        ,   startGroup:  function () {
                ret.push("g");
            }
        ,   endGroup:  function () {
                ret.push("h");
            }
        ,   setFillGrey:  function (colour) {
                ret.push(colour + " sg");
                ret.push("fill");
            }
        ,   setStrokeGrey:  function (colour) {
                ret.push(colour + " sg");
                ret.push("a");
            }
            // we don't take these into account
        ,   boundaries: function () {}
        }
    );
    
    // PS Footer
    ret.push("showpage grestore ");
    ret.push("%%%%Trailer");

    return ret.join("\n");
};