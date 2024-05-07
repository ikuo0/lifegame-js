var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var KEY_LEFT  = 0x0001;
var KEY_RIGHT = 0x0002;
var KEY_UP    = 0x0004;
var KEY_DOWN  = 0x0008;
var KEY_A     = 0x0100;
var KEY_B     = 0x0200;

function GameMain() {
    var self = this;
    
    self.loadImage = function(pathName) {
        var img = new Image();
        img.src = pathName;
        return img;
    };
    
    self.playerMove = function(k) {
        var r2 = 0.707106781188095;//1 / 1.41421356237;
        if(k & KEY_LEFT && k & KEY_UP) {
            return [-r2, -r2];
        } else if(k & KEY_LEFT && k & KEY_DOWN) {
            return [-r2, r2];
        } else if(k & KEY_RIGHT && k & KEY_UP) {
            return [r2, -r2];
        } else if(k & KEY_RIGHT && k & KEY_DOWN) {
            return [r2, r2];
        } else if(k & KEY_LEFT) {
            return [-1.0, 0.0];
        } else if(k & KEY_RIGHT) {
            return [1.0, 0.0];
        } else if(k & KEY_UP) {
            return [0.0, -1.0];
        } else if(k & KEY_DOWN) {
            return [0.0, 1.0];
        }
        return [0.0, 0.0];
    };
    
    self.playerOperation = function(input, x) {
        var me = this;
        var mv = me.playerMove(input);
        x.x += mv[0] * 8;
        x.y += mv[1] * 8;
        if(x.x < 0) {
            x.x = 0;
        }
        if(x.x > CANVAS_WIDTH) {
            x.x = CANVAS_WIDTH - 1;
        }
        if(x.y < 0) {
            x.y = 0;
        }
        if(x.y > CANVAS_HEIGHT) {
            x.y = CANVAS_HEIGHT - 1;
        }
    };
    
    self.X = {
        "img": self.loadImage("./circle.png"),
        "x": 100,
        "y": 100,
        "w": 128,
        "h": 128
    };
    self.main = function(input) {
        var me = this;
        me.playerOperation(input, me.X)
    };
    
    self.getDraw = function() {
        var me = this;
        var x = {
            "img": me.X.img,
            "x": me.X.x,
            "y": me.X.y,
            "w": me.X.w,
            "h": me.X.h,
        };
        return [x];
    };
}

function Draw(ctx, x) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for(var i = 0; i < x.length; i += 1) {
        var ix = x[i];
        ctx.drawImage(ix.img, 0, 0, ix.w, ix.h, ix.x - ix.w / 2, ix.y - ix.h / 2, ix.w, ix.h);
    }
}

function MainLoop() {
    var self = this;
    self.keys = new Array(256);
    
    addEventListener("keydown", function(e) {
        self.keys[e.keyCode] = 1;
        e.preventDefault();
    }, false);
    
    addEventListener("keyup", function(e) {
        self.keys[e.keyCode] = 0;
    }, false);
    
    self.deviceToInput = function() {
        var me = this;
        var k = me.keys;
        var x = 0;
        if(k[37] || k[65]) {
            x |= KEY_LEFT;
        }
        if(k[38] || k[87]) {
            x |= KEY_UP;
        }
        if(k[39] || k[68]) {
            x |= KEY_RIGHT;
        }
        if(k[40] || k[83]) {
            x |= KEY_DOWN;
        }
        if(k[32] || k[0]) {
            x |= KEY_A;
        }
        if(k[13] || k[0]) {
            x |= KEY_B;
        }
        return x;
    }
    
    var g = new GameMain();
    var t = performance.now();
    var fpst = t;
    var framen = 0;
    var framerec = 0;
    var mainLoop = function(timestamp) {
        if((timestamp - fpst) > 1000) {
            fpst = performance.now();
            framerec = framen;
            framen = 0;
        }
        while(1) {
            if((performance.now() - t) > 16.66) {
                t = performance.now();
                var input = self.deviceToInput();
                g.main(input);
                
                var canvas = document.getElementById("main_canvas");
                var ctx = canvas.getContext("2d");
                Draw(ctx, g.getDraw());
                
                ctx.font = '20px sans-serif';
                ctx.fillText(String(framerec) + "fps", 0, 32);
                framen += 1;
                break;
            }
        }
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}


window.onload = function() {
    var g = new MainLoop();
}
