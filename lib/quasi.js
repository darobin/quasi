
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
//      strokeWidth. The stroke width for drawing.

function toInt (num) {
    return parseInt(num, 10);
}

exports.ps = function (opt) {
    opt = opt || {};
    var strokeWidth = opt.strokeWidth || "0.015";
    

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

    exports.quasi(
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
        ,   setGrey:  function (colour) {
                ret.push(colour + " sg");
            }
        ,   fill:  function () {
                ret.push("fill");
            }
        ,   stroke:  function () {
                ret.push("stroke");
            }
        }
    );
    
    // PS Footer
    ret.push("showpage grestore ");
    ret.push("%%%%Trailer");

    return ret.join("\n");
};

exports.quasi = function (opt, writer) {
    opt = opt || {};
    
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

    // helpers
    var getdx = function (x_d, center_d) {
            var dx_d = (x_d - center_d) / window_d;
            return 0.5 * (dx_d + 1);
        }
        /* flag variable:  0 = start line; 1 = lineto; 2 = endpoint */
    ,   plot = function (x_d, y_d, plotflag_i)  {
            var dx_d, dy_d, swap_d, cmx_d, cmy_d;
            dx_d = getdx(x_d, xcen_d);
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
                    writer.newPath();
                    writer.moveTo(cmx_d, cmy_d);
                }
                else {
                    if (oldflag_b) {
                        writer.newPath();
                        writer.moveTo(cmx_d, cmy_d);
                    }
                    writer.lineTo(cmx_d, cmy_d);
                    if (plotflag_i === 2)  {
                        writer.closePath();
                        if (fillon_b)  {
                            writer.startGroup();
                            writer.setGrey(color_d);
                            writer.fill();
                            writer.endGroup();
                        }
                        if (midon_i[0]) writer.setGrey(gray_d);
                        writer.stroke();
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
    var index_i = []
    ,   flag_b
    ,   vx_d = []
    ,   vy_d = []
    ,   mm_d = []
    ,   b_d = []
    ,   phi_d
    ,   x0_d
    ,   y0_d
    ,   x1_d
    ,   y1_d
    ,   dx_d
    ,   midx1_d
    ,   midx2_d
    ,   midx3_d
    ,   midx4_d
    ,   midy1_d
    ,   midy2_d
    ,   midy3_d
    ,   midy4_d
    ,   dx1_d
    ,   dx2_d
    ,   dy1_d
    ,   dy2_d
    ,   dist1_d
    ,   dist2_d
    ,   themin_i
    ,   themax_i
    ,   minmin_d
    ,   rad1_d
    ,   rad2_d
    ,   rad_d
    ,   halfmax_i = maxmax_i/2
    ,   midsix_i = 0
    ,   type_i
    ,   segtype_i
    ;
    
    for (var t = 0; t < symmetry_i; t++) {
        phi_d = (t * 2) / symmetry_i * Math.PI;
        vx_d[t] = Math.cos(phi_d);
        vy_d[t] = Math.sin(phi_d);
        mm_d[t] = vy_d[t] / vx_d[t];
        for (var r = 0; r < maxmax_i; r++) {
            y1_d = vy_d[t] * (t * 0.1132) - vx_d[t] * (r - halfmax_i);
            x1_d = vx_d[t] * (t * 0.2137) + vy_d[t] * (r - halfmax_i);
            if (!b_d[t]) b_d[t] = [];
            b_d[t][r] = y1_d - mm_d[t] * x1_d;
        }
    }
    
    color_d = 0.2;
    themax_i = maxmax_i - 1;
    themin_i = toInt(themax_i / 2);
    for (minmin_d = 0; minmin_d <= themax_i; minmin_d += 0.4) {
        rad1_d = minmin_d * minmin_d;
        rad2_d = (minmin_d + 0.4) * (minmin_d + 0.4);
        for (var n = 1; n < themax_i; n++) {
            for (var m = 1; m < themax_i; m++) {
                rad_d = (n - themin_i) * (n - themin_i) + (m - themin_i) * (m - themin_i);
                if (rad_d >= rad1_d && rad_d < rad2_d) {
                    for (var t = 0; t < symmetry_i - 1; t++) {
                        for (var r = t + 1; r < symmetry_i; r++) {
                            x0_d = ((b_d[t][n] || 0) - (b_d[r][m] || 0)) / ((mm_d[r] || 0) - (mm_d[t] || 0));
                            y0_d = (mm_d[t] || 0) * x0_d + (b_d[t][n] || 0);
                            // START OF D+D
                            flag_b = false;
                            for (var i = 0; i < symmetry_i; i++) {
                                if (i != t && i != r) {
                                    dx_d = -x0_d * (vy_d[i] || 0) + (y0_d - (b_d[i][0] || 0)) * (vx_d[i] || 0);
                                    index_i[i] = toInt(-dx_d);
                                    if (index_i[i] > maxmax_i - 3 || index_i[i] < 1) flag_b = true;
                                }
                            }
                            if (!flag_b) {
                                index_i[t] = n - 1;
                                index_i[r] = m - 1;
                                x0_d = 0;
                                y0_d = 0;
                                for (var i = 0; i < symmetry_i; i++) {
                                    x0_d += (vx_d[i] || 0) * (index_i[i] || 0);
                                    y0_d += (vy_d[i] || 0) * (index_i[i] || 0);
                                }
                                if (midon_i[0] > 0) gray_d = 0.8;
                                color_d += 0.05;
                                if (color_d > 1) color_d = 0.2;
                                if (zfill_b) {
                                    color_d = 0;
                                    for (var i = 0; i < symmetry_i; i++) color_d += (index_i[i] || 0);
                                    while (color_d > (symmetry_i - 1) / 2) color_d -= (symmetry_i - 1) / 2;
                                    color_d = color_d / ((symmetry_i - 1) / 2) * 0.8 + 0.1;
                                    color_d += Math.abs((vx_d[t] || 0) * (vx_d[r] || 0) + (vy_d[t] || 0) * (vy_d[r] || 0));
                                    if (color_d > 1) color_d -= 1;
                                }
                                plot(x0_d, y0_d, 0);
                                x0_d += (vx_d[t] || 0);
                                y0_d += (vy_d[t] || 0);
                                plot(x0_d, y0_d, 1);
                                x0_d += (vx_d[r] || 0);
                                y0_d += (vy_d[r] || 0);
                                plot(x0_d, y0_d, 1);
                                x0_d -= (vx_d[t] || 0);
                                y0_d -= (vy_d[t] || 0);
                                plot(x0_d, y0_d, 1);
                                x0_d -= (vx_d[r] || 0);
                                y0_d -= (vy_d[r] || 0);
                                plot(x0_d, y0_d, 2);
                                if (midon_i[0] > 0) {
                                    midx1_d = x0_d + (vx_d[t] || 0) * 0.5;
                                    midy1_d = y0_d + (vy_d[t] || 0) * 0.5;
                                    midx2_d = x0_d + (vx_d[t] || 0) + (vx_d[r] || 0) * 0.5;
                                    midy2_d = y0_d + (vy_d[t] || 0) + (vy_d[r] || 0) * 0.5;
                                    midx3_d = x0_d + (vx_d[r] || 0) + (vx_d[t] || 0) * 0.5;
                                    midy3_d = y0_d + (vy_d[r] || 0) + (vy_d[t] || 0) * 0.5;
                                    midx4_d = x0_d + (vx_d[r] || 0) * 0.5;
                                    midy4_d = y0_d + (vy_d[r] || 0) * 0.5;
                                    dx1_d = midx1_d - midx2_d;
                                    dy1_d = midy1_d - midy2_d;
                                    dist1_d = dx1_d * dx1_d + dy1_d * dy1_d;
                                    dx2_d = midx2_d - midx3_d;
                                    dy2_d = midy2_d - midy3_d;
                                    dist2_d = dx2_d * dx2_d + dy2_d * dy2_d;
                                    gray_d = 0;
                                    if (dist1_d * dist2_d < 0.1) type_i = 0;
                                    else type_i = 1;
                                    segtype_i = midon_i[type_i];
                                    if (segtype_i === 1 || segtype_i === 2) {
                                        if (dist1_d > dist2_d) segtype_i = 3 - segtype_i;
                                    }
                                    else if (segtype_i === 5) {
                                        midsix_i = 1 - midsix_i;
                                        segtype_i = midsix_i + 1;
                                    }
                                    else if (segtype_i === 6) {
                                        midsix_i++;
                                        if (midsix_i > 2) midsix_i = 0;
                                        segtype_i = midsix_i + 1;
                                    }
                                    if (segtype_i === 3) {
                                        segment(midx1_d, midy1_d, midx3_d, midy3_d);
                                        segment(midx2_d, midy2_d, midx4_d, midy4_d);
                                    }
                                    else if (segtype_i === 1) {
                                        segment(midx1_d, midy1_d, midx2_d, midy2_d);
                                        segment(midx3_d, midy3_d, midx4_d, midy4_d);
                                    }
                                    else if (segtype_i === 2) {
                                        segment(midx1_d, midy1_d, midx4_d, midy4_d);
                                        segment(midx2_d, midy2_d, midx3_d, midy3_d);
                                    }
                                    else if (segtype_i === 4)  {
                                        segment(midx1_d, midy1_d, midx2_d, midy2_d);
                                        segment(midx3_d, midy3_d, midx4_d, midy4_d);
                                        segment(midx1_d, midy1_d, midx4_d, midy4_d);
                                        segment(midx2_d, midy2_d, midx3_d, midy3_d);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// a few tests from http://www.physics.emory.edu/faculty/weeks/software/quasic.html
//  quasi -z -n 80 -m 0.3
//  quasi -z -m 0.6 -S 7
//  quasi -M1 -N1
//  quasi -M2 -N2
//  quasi -M3 -N3
//  quasi -M1 -N2
//  quasi -M2 -N1
//  quasi -M5 -N5
//  quasi -M3 -N2

