"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SaclaySlitherGame {
    constructor() {
        this.foods = [];
        this.snakes = [];
        this.gaussR = 8;
        this.gauss = [];
        this.globZoom = 1.5;
        this.automaticZoom = true;
        this.state = 1;
        this.frameCount = 0;
        this.lastTime = 0;
        this.panX = 0;
        this.panY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.names = ["Fred", "Nicolas", "Yacine", "Olivia", "Medhi", "Christian", "Laura", "Guillaume",
            "Sandrine", "Lila", "Sarah", "Cecile", "Philippe", "Emmy", "Florian"];
        this.init();
        for (let k = 0; k < 10000; k++) {
        }
    }
    init() {
    }
}
SaclaySlitherGame.BORDER_SIZE = 200;
SaclaySlitherGame.NBINITIALSNAKES = 14;
SaclaySlitherGame.NBINITIALFOODS = 10000;
SaclaySlitherGame.IMG_SIZE = 128;
SaclaySlitherGame.LOOSEWEIGHT = 2;
SaclaySlitherGame.LOOSEWEIGHTPACE = 4;
SaclaySlitherGame.WORLDRADIUS = 1500;
SaclaySlitherGame.MIN_SPEED = 4;
SaclaySlitherGame.PREF_SPEED = 4;
SaclaySlitherGame.MAX_SPEED = 8;
SaclaySlitherGame.SPACEBETWEENSEGMENTS = 10.0;
SaclaySlitherGame.MAX_TURN = Math.PI / 48;
SaclaySlitherGame.colors = [[[0, 0, 255], [0, 0, 255], [255, 255, 255], [255, 255, 255], [255, 0, 0], [255, 0, 0]],
    [[96, 96, 255], [96, 96, 192], [96, 96, 128], [96, 96, 96], [96, 96, 128], [96, 96, 192]],
    [[255, 96, 0], [192, 96, 0], [128, 96, 0], [96, 96, 0], [128, 96, 0], [192, 96, 0]],
    [[0, 0, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0], [255, 0, 255]],
    [[0, 255, 0], [0, 255, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [255, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 0]],
    [[255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 0], [255, 255, 0]],
    [[255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0]],
    [[255, 0, 0], [255, 0, 0], [255, 255, 255], [255, 255, 255], [0, 0, 255], [0, 0, 255]],
    [[255, 0, 0], [255, 0, 0], [255, 255, 255], [255, 255, 255], [255, 0, 255], [255, 0, 0]],
    [[0, 192, 0], [0, 192, 0], [255, 255, 255], [255, 255, 255], [255, 128, 0], [255, 128, 0]],
    [[0, 0, 0], [0, 0, 0], [255, 255, 0], [255, 255, 0], [255, 0, 0], [255, 0, 0]],
    [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255]],
    [[0, 255, 0], [0, 255, 0], [255, 255, 255], [255, 255, 255], [255, 0, 0], [255, 0, 0]]
];
exports.SaclaySlitherGame = SaclaySlitherGame;
//# sourceMappingURL=SaclaySlitherGame.js.map