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
    "ff0000ff", // L Bright red
    "005555ff", // M Dark turqoise (is that a word)
    "55aaaaff", // N Brighter version of the previous color
];


const COLOR_MAP = [

    "1540", "1540", "6670", "0880", "1E70", "19A0", "19A0", "19A0",
    "1670", "1670", "1B80", "1B80", "1E70", "19A0", "19A0", "19A0",
    "1670", "1670", "1540", "1540", "1670", "1B80", "1B80", "1B80",
    "6660", "6660", "1540", "1540", "1670", "1670", "1L30", "1970",
    "1FG0", "1FG0", "1FG0", "1FG0", "1FG0", "1FG0", "1DC0", "1DC0",
    "1B80", "1B80", "1B80", "1B80", "1B80", "1B80", "1DC0", "1DC0",
    "1B80", "1B80", "1B80", "1B80", "1FG0", "1FG0", "1FG0", "1FG0",
    "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "0HI2", "1780", 
    "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "H2I0", "0HI2", "1780", 
    "1J50", "1J50", "1J50", "1J50", "0400", "0400", "0400", "0400",
    "1540", "1540", "1540", "1E70", "1E70", "1E70", "3000", "3000",
    "1540", "1540", "1540", "0K20", "1FG0", "14C0", undefined, undefined,
    "1DC0", "1DC0", undefined, undefined, undefined, undefined, undefined, undefined,
    "1DC0", "1DC0", undefined, undefined, undefined, undefined, undefined, undefined
];


const generateFonts = (font : Bitmap | undefined, event : ProgramEvent) : void => {

    const fontWhite = BitmapGenerator.applyPalette(font,
        (new Array<string>(16*4)).fill("0002"),
        PALETTE);
    const fontYellow= BitmapGenerator.applyPalette(font,
        (new Array<string>(16*4)).fill("0003"),
        PALETTE);
    event.assets.addBitmap("fw", fontWhite);
    event.assets.addBitmap("fy", fontYellow);
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
        put(6, 3, 13 + i, 7);
        put(7, 3, 15 + i, 7);
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

        c.drawImage(bmp[0], 24, 88 + a[2]*4, 4, 4, a[0], a[1], 4, 4);
    }
}


const generateGameOverTextBase = (c : CanvasRenderingContext2D, 
    width : number, height : number, bmp : (Bitmap | undefined) []) : void => {

    c.font = "bold 18px Arial";
    c.textAlign = "center";

    c.fillStyle = "#ffffff";
    c.fillText("Game Over!", width/2, height - 2);
}


const generateLogoBase = (c : CanvasRenderingContext2D, 
    width : number, height : number, bmp : (Bitmap | undefined) []) : void => {

    c.font = "bold 24px Arial";
    c.textAlign = "center";

    c.fillStyle = "#ffffff";
    c.fillText("Game\nTitle", width/2, height - 2);
}


const generateOutlinedText = (c : CanvasRenderingContext2D, 
    width : number, height : number, bmp : (Bitmap | undefined) []) : void => {

    for (let j = -1; j <= 2; ++ j) {

        for (let i = -1; i <= 1; ++ i) {

            c.drawImage(bmp[0], i + 1, j + 1);
        }
    }
    c.drawImage(bmp[1], 1, 1);
}


const generate = (event : ProgramEvent) : void => {

    const BALL_NAMES = [ "b1", "b2", "b3", "b4", "b5" ];
    const BALL_COLORS = [ 
        ["1KN0", "1MN0", "1MN0", "1MN0"],
        ["12G0", "1FG0", "1FG0", "1FG0"],
        ["1KI0", "1HI0", "1HI0", "1HI0"],
        ["18A0", "19A0", "19A0", "19A0"],
        ["12C0", "1DC0", "1DC0", "1DC0"],
    ];

    const bmpBase = event.assets.getBitmap("_b");
    const bmpFont = event.assets.getBitmap("_f");

    generateFonts(bmpFont, event);    

    const coloredBase = BitmapGenerator.applyPalette(bmpBase, COLOR_MAP, PALETTE);

    event.assets.addBitmap("b", coloredBase);
    event.assets.addBitmap("t", 
        BitmapGenerator.createCustom(256, 128, [coloredBase], generateTerrainTileset));
    event.assets.addBitmap("s", 
        BitmapGenerator.createCustom(192, 144, [coloredBase], generateSky)); 

    const gameoverBase = BitmapGenerator.createCustom(112, 20, [], generateGameOverTextBase,
        [255, 85, 0], 192);
    const gameoverDark = BitmapGenerator.createCustom(112, 20, [], generateGameOverTextBase,
        [85, 0, 0], 192);

    const logoBase = BitmapGenerator.createCustom(128, 24, [], generateLogoBase,
        [255, 85, 0], 192);
    const logoDark = BitmapGenerator.createCustom(128, 24, [], generateLogoBase,
        [85, 0, 0], 192);    

    event.assets.addBitmap("g", 
        BitmapGenerator.createCustom(114, 22, [gameoverDark, gameoverBase], generateOutlinedText));   
    event.assets.addBitmap("l", 
        BitmapGenerator.createCustom(130, 26, [logoDark, logoBase], generateOutlinedText));  

    // Not baseball, mind you
    const baseBall = BitmapGenerator.createCustom(16, 16, [bmpBase],
        (c : CanvasRenderingContext2D, w : number, h : number, bmps : Bitmap[]) => {

            c.drawImage(bmps[0], 0, 96, 16, 16, 0, 0, 16, 16);
        });

    for (let i = 0; i < 5; ++ i) {

        event.assets.addBitmap(BALL_NAMES[i], 
            BitmapGenerator.applyPalette(baseBall, BALL_COLORS[i], PALETTE)
        );
    }
}


export const AssetGen = { generate: generate };

