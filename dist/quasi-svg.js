(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Quasi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function toInt (num) {
    return parseInt(num, 10);
}

function phi (n) {
    return 2 * Math.PI * n;
}

function theta (n) {
    return (Math.PI / 2) * Math.sin(3 * phi(n)) + Math.PI / 2;
}

function rcolour (n) {
    return 0.5 * Math.sin(theta(n)) * Math.cos(phi(n)) + 0.5;
}

function gcolour (n) {
    return 0.5 * Math.sin(theta(n)) * Math.sin(phi(n)) + 0.5;
}

function bcolour (n) {
    return 0.5 * Math.cos(theta(n)) + 0.5;
}


exports.quasi = function (opt, writer) {
    opt = opt || {};
    
    // slew of variables
    if (opt.fillColor) opt.fillPolygons = true;
    var color       = 0.2
    ,   fillon      = !!opt.fillPolygons
    ,   gray        = 0
    ,   midon       = [
                          opt.skinnyMidpoint || 0
                      ,   opt.fatMidpoint || 0
                      ]
    ,   scale       = opt.size || 15
    ,   offsetx_f   = 2
    ,   offsety_f   = 2
    ,   oldflag
    ,   rotate      = !!opt.rotate
    ,   xcen        = 0
    ,   ycen        = 0
    ,   symmetry    = opt.symmetry || 5
    ,   zfill       = !!opt.fillColor
    ,   maxmax      = opt.lines || 30
    ,   magnifya    = opt.magnify || 1
    ,   win         = 20/magnifya
    ,   minx        = Infinity
    ,   maxx        = -Infinity
    ,   miny        = Infinity
    ,   maxy        = -Infinity
    ;

    // helpers
    var getdx = function (x, center) {
            var dx = (x - center) / win;
            return 0.5 * (dx + 1);
        }
        /* flag variable:  0 = start line; 1 = lineto; 2 = endpoint */
    ,   plot = function (x, y, color, plotflag)  {
            var dx, dy, swap, cmx, cmy;
            dx = getdx(x, xcen);
            dy = getdx(y, ycen);
            if (rotate) {
                swap = dx;
                dx = dy;
                dy = swap;
            }
            if (dx < 1.3 && dy < 1 && dx > 0 && dy > 0) {
                cmx = dx * scale + offsetx_f;
                cmy = dy * scale + offsety_f;
                minx = Math.min(minx, cmx);
                maxx = Math.max(maxx, cmx);
                miny = Math.min(miny, cmy);
                maxy = Math.max(maxy, cmy);
                if (plotflag < 1) {
                    writer.newPath();
                    writer.moveTo(cmx, cmy);
                }
                else {
                    if (oldflag) {
                        writer.newPath();
                        writer.moveTo(cmx, cmy);
                    }
                    writer.lineTo(cmx, cmy);
                    if (plotflag === 2)  {
                        writer.closePath();
                        if (fillon)  {
                            writer.startGroup();
                            if (opt.color) writer.setFillColor(rcolour(color), gcolour(color), bcolour(color));
                            else writer.setFillGrey(color);
                            writer.endGroup();
                        }
                        if (midon[0]) writer.setStrokeGrey(gray);
                        else writer.setStrokeGrey(0);
                    }
                }
                oldflag = false;
            }
            else {
                oldflag = true;
            }

        }
    ,   segment = function (x1, y1, x2, y2, color) {
            plot(x1, y1, color, 0);
            plot(x2, y2, color, 2);
        }
    ;

    // Quasi
    var index = []
    ,   flag
    ,   vx = []
    ,   vy = []
    ,   mm = []
    ,   b = []
    ,   phi
    ,   x0
    ,   y0
    ,   x1
    ,   y1
    ,   dx
    ,   midx1
    ,   midx2
    ,   midx3
    ,   midx4
    ,   midy1
    ,   midy2
    ,   midy3
    ,   midy4
    ,   dx1
    ,   dx2
    ,   dy1
    ,   dy2
    ,   dist1
    ,   dist2
    ,   themin
    ,   themax
    ,   minmin
    ,   rad1
    ,   rad2
    ,   rad
    ,   halfmax = maxmax/2
    ,   midsix = 0
    ,   type
    ,   segtype
    ;
    
    for (var t = 0; t < symmetry; t++) {
        phi = (t * 2) / symmetry * Math.PI;
        vx[t] = Math.cos(phi);
        vy[t] = Math.sin(phi);
        mm[t] = vy[t] / vx[t];
        for (var r = 0; r < maxmax; r++) {
            y1 = vy[t] * (t * 0.1132) - vx[t] * (r - halfmax);
            x1 = vx[t] * (t * 0.2137) + vy[t] * (r - halfmax);
            if (!b[t]) b[t] = [];
            b[t][r] = y1 - mm[t] * x1;
        }
    }
    
    themax = maxmax - 1;
    themin = toInt(themax / 2);
    for (minmin = 0; minmin <= themax; minmin += 0.4) {
        rad1 = minmin * minmin;
        rad2 = (minmin + 0.4) * (minmin + 0.4);
        for (var n = 1; n < themax; n++) {
            for (var m = 1; m < themax; m++) {
                rad = (n - themin) * (n - themin) + (m - themin) * (m - themin);
                if (rad >= rad1 && rad < rad2) {
                    for (var t = 0; t < symmetry - 1; t++) {
                        for (var r = t + 1; r < symmetry; r++) {
                            x0 = ((b[t][n] || 0) - (b[r][m] || 0)) / ((mm[r] || 0) - (mm[t] || 0));
                            y0 = (mm[t] || 0) * x0 + (b[t][n] || 0);
                            // START OF D+D
                            flag = false;
                            for (var i = 0; i < symmetry; i++) {
                                if (i != t && i != r) {
                                    dx = -x0 * (vy[i] || 0) + (y0 - (b[i][0] || 0)) * (vx[i] || 0);
                                    index[i] = toInt(-dx);
                                    if (index[i] > maxmax - 3 || index[i] < 1) flag = true;
                                }
                            }
                            if (!flag) {
                                index[t] = n - 1;
                                index[r] = m - 1;
                                x0 = 0;
                                y0 = 0;
                                for (var i = 0; i < symmetry; i++) {
                                    x0 += (vx[i] || 0) * (index[i] || 0);
                                    y0 += (vy[i] || 0) * (index[i] || 0);
                                }
                                if (midon[0] > 0) gray = 0.8;
                                color += 0.05;
                                if (color > 1) color = 0.2;
                                if (zfill) {
                                    color = 0;
                                    for (var i = 0; i < symmetry; i++) color += (index[i] || 0);
                                    while (color > (symmetry - 1) / 2) color -= (symmetry - 1) / 2;
                                    color = color / ((symmetry - 1) / 2) * 0.8 + 0.1;
                                    color += Math.abs((vx[t] || 0) * (vx[r] || 0) + (vy[t] || 0) * (vy[r] || 0));
                                    if (color > 1) color -= 1;
                                }
                                plot(x0, y0, color, 0);
                                x0 += (vx[t] || 0);
                                y0 += (vy[t] || 0);
                                plot(x0, y0, color, 1);
                                x0 += (vx[r] || 0);
                                y0 += (vy[r] || 0);
                                plot(x0, y0, color, 1);
                                x0 -= (vx[t] || 0);
                                y0 -= (vy[t] || 0);
                                plot(x0, y0, color, 1);
                                x0 -= (vx[r] || 0);
                                y0 -= (vy[r] || 0);
                                plot(x0, y0, color, 2);
                                if (midon[0] > 0) {
                                    midx1 = x0 + (vx[t] || 0) * 0.5;
                                    midy1 = y0 + (vy[t] || 0) * 0.5;
                                    midx2 = x0 + (vx[t] || 0) + (vx[r] || 0) * 0.5;
                                    midy2 = y0 + (vy[t] || 0) + (vy[r] || 0) * 0.5;
                                    midx3 = x0 + (vx[r] || 0) + (vx[t] || 0) * 0.5;
                                    midy3 = y0 + (vy[r] || 0) + (vy[t] || 0) * 0.5;
                                    midx4 = x0 + (vx[r] || 0) * 0.5;
                                    midy4 = y0 + (vy[r] || 0) * 0.5;
                                    dx1 = midx1 - midx2;
                                    dy1 = midy1 - midy2;
                                    dist1 = dx1 * dx1 + dy1 * dy1;
                                    dx2 = midx2 - midx3;
                                    dy2 = midy2 - midy3;
                                    dist2 = dx2 * dx2 + dy2 * dy2;
                                    gray = 0;
                                    if (dist1 * dist2 < 0.1) type = 0;
                                    else type = 1;
                                    segtype = midon[type];
                                    if (segtype === 1 || segtype === 2) {
                                        if (dist1 > dist2) segtype = 3 - segtype;
                                    }
                                    else if (segtype === 5) {
                                        midsix = 1 - midsix;
                                        segtype = midsix + 1;
                                    }
                                    else if (segtype === 6) {
                                        midsix++;
                                        if (midsix > 2) midsix = 0;
                                        segtype = midsix + 1;
                                    }
                                    if (segtype === 3) {
                                        segment(midx1, midy1, midx3, midy3, color);
                                        segment(midx2, midy2, midx4, midy4, color);
                                    }
                                    else if (segtype === 1) {
                                        segment(midx1, midy1, midx2, midy2, color);
                                        segment(midx3, midy3, midx4, midy4, color);
                                    }
                                    else if (segtype === 2) {
                                        segment(midx1, midy1, midx4, midy4, color);
                                        segment(midx2, midy2, midx3, midy3, color);
                                    }
                                    else if (segtype === 4)  {
                                        segment(midx1, midy1, midx2, midy2, color);
                                        segment(midx3, midy3, midx4, midy4, color);
                                        segment(midx1, midy1, midx4, midy4, color);
                                        segment(midx2, midy2, midx3, midy3, color);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    writer.boundaries(minx, miny, maxx, maxy);
};

},{}],2:[function(require,module,exports){

var q = require("./quasi");

function toHex (component) {
    var col = Math.round(component * 255).toString(16);
    return (col.length < 2) ? "0" + col : col;
}

function greyToColour (grey) {
    var col = toHex(grey);
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
        ,   setFillColor:  function (r, g, b) {
                curObj.fill = "#" + toHex(r) + toHex(g) + toHex(b);
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

},{"./quasi":1}]},{},[2])(2)
});
