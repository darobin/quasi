
// quasi.ps(opt)
//  Takes some options, returns a PostScript quasicrystal
//  Options:
//      size. Number, the size of the output in cm. CLI: -s. Var: scale.
//      fillPolygons. Boolean, fills the polygons. CLI: -f. Var: fillon.
//      fillColor. Boolean, fill colour is according to polygon type (sets fillPolygons). CLI: -z. Var: zfill.
//      rotate. Boolean, flip 90°. CLI: -F. Var: rotate.
//      magnify. Number, magnification factor. CLI: -m. Var: magnifya.
//      skinnyMidpoint. Int (really option, should become that), midpoint type for skinny diamonds. CLI: -M. Var: midon[0]
//      fatMidpoint. Int (really option, should become that), midpoint type for fat diamonds. CLI: -N. Var: midon[1]
//          1 = acute angle sides joined
//          2 = obtuse angle sides joined
//          3 = opposite sides joined to make cross
//          4 = all sides joined to make rectangle
//          5 = randomly choose 1 or 2
//          6 = randomly choose 1, 2, or 4
//      symmetry. Int, degrees of symmetry. CLI: -S. Var: symmetry.
//      lines. Int, number of lines to use. CLI: -n. Var: maxmax

exports.ps = function (opt) {
    opt = opt || {};
    var ret = [];
    
    // constants
    var LINEWIDTH = "0.015" // PS linewidths in cm
    ,   MAX = 100           // increase to make more tiles XXX should be a param?
    ;

    // slew of variables
    if (opt.fillColor) opt.fillPolygons = true;
    var color_d
    ,   fillon_b    = !!opt.fillPolygons
    ,   gray_d
    ,   midon_i     = [
                        opt.skinnyMidpoint || 0
                    ,   opt.fatMidpoint || 0
                    ]
    ,   scale_d     = opt.size || 15
    ,   offsetx_f   = 2
    ,   offsety_f   = 2
    ,   oldflag_b
    ,   rotate_b    = !!opt.rotate
    ,   xcen_d      = 0
    ,   ycen_d      = 0
    ,   symmetry_i  = opt.symmetry || 5
    ,   zfill_b     = !!opt.fillColor
    ,   maxmax_i    = opt.lines || 30
    ,   magnifya_d  = opt.magnify || 1
    ,   window_d    = 20/magnifya_d
    ;
    

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
    ,   LINEWIDTH + " setlinewidth "
    ];

    // helpers
    var getdx = function (x_d, center_d) {
            var dx_d = (x_d - center_d) / window_d;
            return 0.5 * (dx_d + 1);
        }
        /* flag variable:  0 = start line; 1 = lineto; 2 = endpoint */
    ,   plot = function (x_d, y_d, plotflag_i)  {
            var dx_d, dy_d, swap_d, cmx_d, cmy_d;
            dx_d = getdx(xcen_d, xcen_d);
            dy_d = getdx(y_d, ycen_d);
            if (rotate_b) {
                swap_d = dx_d;
                dx_d = dy_d;
                dy_d = swap_d;
            }
            if (dx_d < 1.3 && dy_d < 1 && dx_d > 0 && dy_d > 0) {
                cmx_d = dx_d * scale_d + offsetx_f;
                cmy_d = dy_d * scale_d + offsety_f;
                if (plotflag_i < 1) {
                    ret.push(cmx_d + " " + cmy_d + " m");
                }
                else {
                    if (oldflag_b) ret.push(cmx_d + " " + cmy_d + " m");
                    ret.push(cmx_d + " " + cmy_d + " l");
                    if (plotflag_i === 2)  {
                        ret.push("cp");
                        if (fillon_b)  {
                            ret.push("g");
                            ret.push(color_d + " sg");
                            ret.push("fill");
                            ret.push("h");
                        }
                        if (midon_i[0] > 0) ret.push(gray_d + " sg");
                        ret.push("a");
                    }
                }
                oldflag_b = false;
            }
            else {
                oldflag_b = true;
            }

        }
    ,   segment = function (x1_d, y1_d, x2_d, y2_d) {
            plot(x1_d, y1_d, 0);
            plot(x2_d, y2_d, 2);
        }
    ;

    // Quasi
    
    // PS Footer
    ret.push("showpage grestore ");
    ret.push("%%%%Trailer");
    
    return ret.join("\n");
};

