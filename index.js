var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var KEY_LEFT  = 0x0001;
var KEY_RIGHT = 0x0002;
var KEY_UP    = 0x0004;
var KEY_DOWN  = 0x0008;
var KEY_A     = 0x0100;
var KEY_B     = 0x0200;

function LinearCongruentialGenerator(seed) {
    var m = 4294967296; // 2^32
    var a = 1664525;
    var c = 1013904223;
    var state = seed;
    this.next = function() {
        state = (a * state + c) % m;
        return state / m;
    }
}

function Random() {
	var self = this;
	self.generator = new LinearCongruentialGenerator(0);
	self.seed = function(n) {
		var me = this;
		me.generator = new LinearCongruentialGenerator(n);
	}
	self.rand = function() {
		var me = this;
		return me.generator.next();
	}
	self.intRange = function(min, max) {
		var me = this;
		return Math.floor(me.generator.next() * (max - min + 1)) + min;
	}
}
var random = new Random();
random.seed((new Date()).getMilliseconds());

function Number2D() {
    var self = this;
    self.create = function(rows, cols) {
        var res = [];
        for(var i = 0; i < rows; i += 1) {
            res.push(new Array(cols).fill(0));
        }
        return res;
    }
    self.clone = function(X) {
        var me = this;
        var rows = X.length;
        var cols = X[0].length;
        var newMatrix = me.create(rows, cols);
        for(var y = 0; y < rows; y += 1) {
            for(var x = 0; x < cols; x += 1) {
                newMatrix[y][x] = X[y][x];
            }
        }
        return newMatrix;
    }
    self.rows = function(X) {
        return X.length;
    }
    self.cols = function(X) {
        return X[0].length;
    }
}
var n2d = new Number2D();

function LifeGameCore() {
    var self = this;
    self.initializeMatrix = function(height, width, matrix) {
        var me = this;
        for(var y = 0; y < height; y += 1) {
            for(var x = 0; x < width; x += 1) {
                matrix[y][x] = random.rand() < 0.4 ? 1 : 0;
            }
        }
    }
    self.countAlives = function(height, width, yidx, xidx, X) {
        var alive = 0;
        for(var y = yidx - 1; y < yidx + 2; y += 1) {
            if(y < 0 || y >= height) {
                continue;
            }
            for(var x = xidx - 1; x < xidx + 2; x += 1) {
                if(x < 0 || x >= width) {
                    continue;
                }
                if(y == yidx && x == xidx) {
                    continue;
                }
                alive += X[y][x];
            }
        }
        return alive;
    }
    self.deadOrAlive = function(value, aliveCount) {
        if(value == 0) {
            if(aliveCount == 3) {
                value = 1;
            }
        } else {
            if(aliveCount == 2 || aliveCount == 3) {
                value = 1;
            } else if(aliveCount <= 1) {
                value = 0;
            } else if(aliveCount >= 4) {
                value = 0;
            }
        }
        return value;
    }
    self.applyRulesToMatrix = function(matrix) {
        var me = this;
        var rows = n2d.rows(matrix);
        var cols = n2d.cols(matrix);
        var newMatrix = n2d.clone(matrix);
        for(var y = 0; y < rows; y += 1) {
            for(var x = 0; x < cols; x += 1) {
                var aliveCount = me.countAlives(rows, cols, y, x, matrix);
                var newValue = me.deadOrAlive(matrix[y][x], aliveCount);
                newMatrix[y][x] = newValue;
            }
        }
        return newMatrix;
    }
}

function MoveTest() {
    var self = this;
    
    self.loadImage = function(pathName) {
        var img = new Image();
        img.src = pathName;
        return img;
    };
    
    self.playerMove = function(gi) {
        var r2 = 0.707106781188095;//1 / 1.41421356237;
        if(gi.left && gi.up) {
            return [-r2, -r2];
        } else if(gi.left && gi.down) {
            return [-r2, r2];
        } else if(gi.right && gi.up) {
            return [r2, -r2];
        } else if(gi.right && gi.down) {
            return [r2, r2];
        } else if(gi.left) {
            return [-1.0, 0.0];
        } else if(gi.right) {
            return [1.0, 0.0];
        } else if(gi.up) {
            return [0.0, -1.0];
        } else if(gi.down) {
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

function LifeGameGame() {
    var self = this;
    var core = new LifeGameCore();
    var X = n2d.create(128, 128);
    core.initializeMatrix(n2d.rows(X), n2d.cols(X), X);
    self.core = core;
    self.X = X;
    self.tick = 0;
    self.updateTick = 10;
    self.update = function() {
        var me = this;
        if((me.tick % me.updateTick) == 0) {
            me.X = me.core.applyRulesToMatrix(me.X);
        }
        me.tick += 1;
    }
    self.drawData = function() {
        var me = this;
        var X = me.X;
        var rows = n2d.rows(X);
        var cols = n2d.cols(X);
        var data = [];
        for(var y = 0; y < rows; y += 1) {
            for(var x = 0; x < cols; x += 1) {
                var mx = x * 2;
                var my = y * 2;
                if(X[y][x]) {
                    data.push([mx, my, 2, 2, "white"]);
                } else {
                    data.push([mx, my, 2, 2, "black"]);
                }
            }
        }
        return data;
    }
}

function Draw(ctx, x) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for(var i = 0; i < x.length; i += 1) {
        var ix = x[i];
        ctx.drawImage(ix.img, 0, 0, ix.w, ix.h, ix.x - ix.w / 2, ix.y - ix.h / 2, ix.w, ix.h);
    }
}

function DrawLifeGame(ctx, data) {
    data.forEach(function(z) {
        ctx.fillStyle = z[4];
        ctx.fillRect(z[0], z[1], z[2], z[3]);
    });
}

function GameInput() {
    var self = this;
    self.left = 0;
    self.right = 0;
    self.up = 0;
    self.down = 0;
    self.a = 0;
    self.b = 0;
    self.c = 0;
}

function MainLoop() {
    var self = this;
    self.keyCodes = [];
    self.keyEvents = [];
    
    addEventListener("keydown", function(e) {
        self.keyCodes.push(e.code);
        self.keyEvents.push(1);
        e.preventDefault();
    }, false);
    
    addEventListener("keyup", function(e) {
        self.keyCodes.push(e.code);
        self.keyEvents.push(0);
    }, false);
    
    self.deviceToInput = function(gameInput, codes, events) {
        codes.forEach(function(code, i) {
            if(["ArrowLeft", "KeyA"].includes(code)) {
                gameInput.left = events[i];
                return;
            }
            if(["ArrowRight", "KeyD"].includes(code)) {
                gameInput.right = events[i];
                return;
            }
            if(["ArrowUp", "KeyW"].includes(code)) {
                gameInput.up = events[i];
                return;
            }
            if(["ArrowDown", "KeyS"].includes(code)) {
                gameInput.down = events[i];
                return;
            }
        });
    }

    self.MainProcess = function() {
        //var g = new MoveTest();
        var g = new LifeGameGame();
        var t = performance.now();
        var fpst = t;
        var framen = 0;
        var framerec = 0;
        var gameInput = new GameInput();
        var updatelimit = 0;
        var mainLoop = function() {
            var timestamp = performance.now();
            if((timestamp - fpst) > 1000) {
                fpst = timestamp;
                framerec = framen;
                framen = 0;
            }
            if(timestamp >= updatelimit) {
                updatelimit = timestamp + 15;
                self.deviceToInput(gameInput, self.keyCodes, self.keyEvents);
                self.keyCodes = [];
                self.keyEvents = [];
                //g.main(gameInput);
                g.update();
                framen += 1;
            }
            setTimeout(mainLoop);
        }
        var drawLoop = function() {
            var canvas = document.getElementById("main_canvas");
            var ctx = canvas.getContext("2d");
            //Draw(ctx, g.drawData());
            DrawLifeGame(ctx, g.drawData());
            ctx.font = '20px sans-serif';
            ctx.fillText(String(framerec) + "fps", 0, 32);
            requestAnimationFrame(drawLoop);
        }
        mainLoop();
        drawLoop();
    }
}


window.onload = function() {
    var g = new MainLoop();
    g.MainProcess();
}
