import { ProgramEvent } from "../core/event.js";
import { Bitmap, BitmapGenerator } from "../renderer/bitmap.js";


const PALETTE = [

    "00000000", // 0 Alpha
    "000000ff", // 1 Black
    "ffffffff", // 2 White
    "ffff00ff", // 3 Yellow
    "aaff00ff", // 4 Bright green
    "55aa00ff", // 5 Green
    "aa5555ff", // 6 Reddish brown
    "ffaa55ff", // 7 Brownish brown (what)
    "ffffaaff", // 8 Bright yellow
    "aa0000ff", // 9 Red
    "ff5500ff", // A Orange
    "aaaa55ff", // B Ugly yellow
    "aaaaaaff", // C Bright gray
    "555555ff", // D Dark gray
    "aa5500ff", // E Brown,
    "5555aaff", // F Darker purple
    "aaaaffff", // G Lighter purple
    "0055aaff", // H Darker blue,
    "55aaffff", // I Lighter blue
    "005500ff", // J Dark green
    "aaffffff", // K Bright blue
];


const COLOR_MAP = [

    "1540", "1540", "6670", "0880", "1E70", "19A0", "19A0", "19A0",
    "1670", "1670", "1B80", "1B80", "1E70", "19A0", "19A0", "19A0",
    "1670", "1670", "1540", "1540", "1670", "1B80", "1B80", "1B80",
    "6660", "6660", "1540", "1540", "1670", "1670", "1C20", "0K20",
    "1FG0", "1FG0", "1FG0", "1FG0", "1FG0", "1FG0", "1DC0", "1DC0",
    "1B80", "1B80", "1B80", "1B80", "1B80", "1B80", "1DC0", "1DC0",
    "1B80", "1B80", "1B80", "1B80", undefined, undefined, undefined, undefined,
    "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "0HI2", "1780", 
    "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "0HI2", "1780", 
    "1J50", "1J50", "1J50", "1J50", "0400", "0400", "0400", "0400",
    "1540", "1540", "1540", "1E70", "1E70", "1E70", undefined, undefined,
    "1540", "1540", "1540", undefined, undefined, undefined, undefined, undefined,
];


const generateFonts = (font : Bitmap | undefined, event : ProgramEvent) : void => {

    const fontWhite = BitmapGenerator.applyPalette(font,
        (new Array<string>(16*4)).fill("0002"),
        PALETTE);
    const fontYellow= BitmapGenerator.applyPalette(font,
        (new Array<string>(16*4)).fill("0003"),
        PALETTE);
    event.assets.addBitmap("font_white", fontWhite);
    event.assets.addBitmap("font_yellow", fontYellow);
}


const generateTerrainTileset = (c : CanvasRenderingContext2D, 
    width : number, height : number, bmp : (Bitmap | undefined) []) : void => {

    const base = bmp[0];

    const put = (sx : number, sy : number, dx : number, dy : number, xoff = 0, yoff = 0) : void => {

        c.drawImage(base, sx*8, sy*8, 8, 8, dx*8 + xoff, dy*8 + yoff, 8, 8);
    }

    c.fillStyle = "#000000";
    // Don't let this confuse you...
    c.translate(8, 0);

    //
    // Grass & soil (ground & sky)
    //
    
    for (let j = 0; j < 2; ++ j) {

        // Grass edges
        c.drawImage(base, 12, 0, 4, 8, 4, j*32, 4, 8);
        c.drawImage(base, 8, 0, 4, 8, 4*16 - 8, j*32, 4, 8);
        
        // Other grassy stuff
        for (let i = 0; i < 6; ++ i) {

            if (j == 1) {

                if (i == 0)
                    put(0, 2, i + 1, 5);
                else if (i == 5)
                    put(1, 2, i + 1, 5);
                else
                    put(5, 3, i + 1, 5);
            }

            if (j == 0) {

                for (let k = 0; k < 3; ++ k) {

                    put(0, 1, i + 1, k + 1);
                }
            }

            put(0, 0, i + 1, j*4);
            put(2, 0, i + 1, j*4 + 1, 0, -2);
        }
    }

    // Soil edges
    for (let i = 1; i < 4; ++ i) {

        c.drawImage(base, 8, 8, 2, 8, 8, i*8, 2, 8);
        c.drawImage(base, 14, 8, 2, 8, 54, i*8, 2, 8);
    }


    // Tiny platform
    put(0, 2, 9, 5);
    put(1, 2, 10, 5);

    for (let i = 0; i < 2; ++ i) {

        put(0, 0, 9 + i, 4);
        put(2, 0, 9 + i, 5, 0, -2);
    }


    // Correction pixels
    c.fillRect(8, 6, 1, 2);
    c.fillRect(55, 6, 1, 2);
    c.fillRect(8, 6 + 32, 1, 2);
    c.fillRect(55, 6 + 32, 1, 2);
    c.fillRect(72, 6 + 32, 1, 2);
    c.fillRect(87, 6 + 32, 1, 2);

    // Slopes
    let shift : number;
    for (let j = 0; j < 2; ++ j) {

        for (let i = 0; i < 4; ++ i) {

            put(0, 1, 9 + i, 2 + j);
        }

        for (let i = 0; i < 2; ++ i) {

            shift = i*j*2 - (j + i);

            put(4, 2 + j, 9 + i + j*2, 2 + shift);
            put(2 + j, 2, 9 + i + j*2, 1 + shift);
            put(2 + j, 3, 9 + i + j*2, 2 + shift);
            put(j, 3, 9 + i + j*2, 2 + shift, 0, -1);
        }
    }


    // 
    // Bridge & spikes
    //

    for (let i = 0; i < 2; ++ i) {

        // Bridge
        put(4, 0, 11 + i, 4);
        put(4, 1, 11 + i, 5);
        put(3, 0, 11 + i, 4, 1, 5);

        // Spikes
        put(6, 3, 13 + i, 5);
    }


    //
    // Palm tree
    //

    // Leaves
    for (let i = 0; i < 2; ++ i) {

        c.drawImage(base, i*32, 72, 32, 8, 152, 1, 32, 8);
        // Missing pixels
        c.fillRect(152 + 8 + i*11, 0, 5, 1);
    }
    
    // Trunk
    for (let i = 0; i < 2; ++ i) {

        put(7, 7, 20, 1 + i, 4, 1);
    }
    put(7, 8, 20, 3, 4, 1);


    //
    // Mushrooms
    //
    
    // "Leg"
    for (let j = 0; j < 4; ++ j) {

        put(2, 1, 15, 5 - j);
        put(3, 1, 16, 5 - j);
    }
    // Hat shadow
    c.fillStyle = "#aaaa55";
    c.fillRect(122, 16, 12, 1);

    // Ring
    c.drawImage(base, 40, 16, 24, 8, 116, 24, 24, 8);

    // Hat
    for (let i = 0; i < 4; ++ i) {

        put(6, 0, 14 + i, 0);
        put(6, 1, 14 + i, 1);
    }
    for (let i = 0; i < 2; ++ i) {

        put(5 + i*2, 0, 13 + i*5, 0);
        put(5 + i*2, 1, 13 + i*5, 1);
    }

    c.translate(-8, 0);
    // Bushes
    c.drawImage(base, 0, 80, 24, 16, 0, 48, 24, 16);
    c.drawImage(base, 0, 80, 8, 16, 24, 48, 8, 16);
    c.drawImage(base, 16, 80, 8, 16, 32, 48, 8, 16);

    // Fence
    put(3, 10, 1, 9);
    put(4, 10, 2, 9);
    put(4, 10, 3, 9);
    put(5, 10, 4, 9);
}


const generateSky = (c : CanvasRenderingContext2D, 
    width : number, height : number, bmp : (Bitmap | undefined) []) : void => {

    const STARS = [
        [32, 16, 0],
        [84, 40, 1],
        [64, 8, 1],
        [112, 20, 0],
        [8, 36, 1],
        [48, 48, 0],
        [180, 12, 0],
        [180, 64, 1],
        [104, 64, 0],
        [18, 62, 1],
        [32, 80, 0],
        [64, 72, 1],
        [128, 84, 1],
        [176, 88, 0],
    ];

    const circle = (cx : number, cy : number, radius : number) => {

        let ny : number;
        let r : number;

        for (let y = -radius; y <= radius; ++ y) {

            ny = y/radius;

            r = Math.round(Math.sqrt(1 - ny*ny) * radius);
            if (r <= 0)
                continue;

            c.fillRect((cx - r) | 0, (cy + y) | 0, r*2, 1);
        }
    }

    c.fillStyle = "#55aaff";
    c.fillRect(0, 0, width, height);

    c.fillStyle = "#aaffff";
    circle(width - 48, 36, 28);
    c.fillStyle = "#55aaff";
    circle(width - 66, 26, 26);

    // Stars
    for (let a of STARS) {

        c.drawImage(bmp[0], 56, 24 + a[2]*4, 4, 4, a[0], a[1], 4, 4);
    }
}


const generate = (event : ProgramEvent) : void => {

    const bmpBase = event.assets.getBitmap("_base");
    const bmpFont = event.assets.getBitmap("_font");

    generateFonts(bmpFont, event);    

    const coloredBase = BitmapGenerator.applyPalette(bmpBase, COLOR_MAP, PALETTE);

    event.assets.addBitmap("base", coloredBase);
    event.assets.addBitmap("terrain", 
        BitmapGenerator.createCustom(256, 128, [coloredBase], generateTerrainTileset));
    event.assets.addBitmap("sky", 
        BitmapGenerator.createCustom(192, 144, [coloredBase], generateSky)); 
}


export const AssetGen = { generate: generate };

