// Primitives

class GameObject {
    constructor(x, y, width, height, angle, speed, rotateSpeed, destroyOnLeave) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle || 0;
        this.speed = speed || 0; // Юнитов в секунду
        this.rotateSpeed = rotateSpeed || 0; // Оборотов в секунду
        this.destroyOnLeave = destroyOnLeave;
        this.isDestroyed = false;
    }

    getDestroyOnLeave() {
        return !!this.destroyOnLeave;
    }

    destroy() {
        this.isDestroyed = true;
    }

    getIsDestroyed() {
        return !!this.isDestroyed;
    }
}

class Sprite {
    constructor(imgSrc, width, height, position) {
        this.width = width;
        this.height = height;
        this.position = position;

        this.image = new Image();
        this.image.src = imgSrc;
    }

    draw(context) {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.position.angle);
        context.drawImage(
            this.image,
            0, 0, this.width, this.height,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        context.restore();
    }
}

class Rect {
    constructor(width, height, color) {
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.width, this.height);
    }
}

// Engines

class Figures {
    constructor() {
        this.figures = [];
    }

    get() {
        return this.figures;
    }

    set(figures) {
        this.figures = figures;
    }

    add(f) {
        this.figures.push(f);
    }
}

class Keys {
    constructor() {
        this.state = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            ControlLeft: false
        };

        document.addEventListener("keydown", function (event) {
            switch (event.code) {
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowRight':
                case 'ArrowDown':
                case 'ControlLeft':
                    this.state[event.code] = true;
                    break;
                default:
                    console.log(event.code);
                    break;
            }
        }.bind(this));

        document.addEventListener("keyup", function (event) {
            switch (event.code) {
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowRight':
                case 'ArrowDown':
                case 'ControlLeft':
                    this.state[event.code] = false;
                    break;
            }
        }.bind(this));
    }
}

class RenderEngine {
    constructor(viewportWidth, viewportHeight, figures) {
        this.figures = figures;
        this.width = viewportWidth;
        this.height = viewportHeight;

        const canvas = document.createElement('canvas');
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;
        document.body.append(canvas);
        this.context = canvas.getContext('2d');

        this.fpsCalculatedAt = new Date().getTime();
        this.framesCount = 0;
        this.fps = 0;
        this.fpsStep = 100;
    }

    drawFrame() {
        for (let f of this.figures.get()) {
            if (f.getDrawItem) {
                f.getDrawItem().draw(this.context);
            }
        }
        this.drawFps();
    }

    drawFps() {
        this.framesCount += 1;
        if (this.framesCount === this.fpsStep) {
            const now = new Date().getTime();
            const timePassed = now - this.fpsCalculatedAt;
            this.fps = this.framesCount * 1000 / timePassed;
            this.framesCount = 0;
            this.fpsCalculatedAt = now;
        }

        this.context.fillStyle = '#888';
        this.context.font = "14px serif";
        this.context.fillText("fps: " + this.fps.toFixed(1), this.width - 60, 20);
    }
}

class PhysicsEngine {
    constructor(viewportWidth, viewportHeight, figures) {
        this.width = viewportWidth;
        this.height = viewportHeight;
        this.figures = figures;
        this.movedAt = null;
        this.UNIT_SIZE = 10; // 10px
    }

    moveAll() {
        const now = new Date().getTime();
        const timePassed = this.movedAt ? now - this.movedAt : 0;
        this.movedAt = now;
        if (!timePassed) return;

        for (let f of this.figures.get()) {
            if (f.getGameObject) {
                this.moveGameObject(f.getGameObject(), timePassed);
            }
        }

        const figuresWithoutDestroyed = this.figures.get().filter(f => !f.getGameObject || !f.getGameObject().getIsDestroyed());
        this.figures.set(figuresWithoutDestroyed);
    }

    moveGameObject(gameObject, timePassed) {
        const pathPassed = this.UNIT_SIZE * gameObject.speed * (timePassed / 1000);

        if (pathPassed) {
            const pathX = pathPassed * Math.cos(gameObject.angle);
            const pathY = pathPassed * Math.sin(gameObject.angle);
            gameObject.x += pathX;
            gameObject.y += pathY;
        }

        if (gameObject.rotateSpeed) {
            const anglePassed = 2 * Math.PI * gameObject.rotateSpeed * timePassed / 1000;
            gameObject.angle += anglePassed;
        }

        if (this.checkOutsideViewport(gameObject)) {
            if (gameObject.getDestroyOnLeave()) {
                gameObject.destroy();
            } else {
                if (gameObject.x < -gameObject.width / 2) gameObject.x += this.width + gameObject.width;
                else if (gameObject.x > this.width + gameObject.width / 2) gameObject.x -= this.width + gameObject.width;

                if (gameObject.y < -gameObject.height / 2) gameObject.y += this.height + gameObject.height;
                else if (gameObject.y > this.height + gameObject.height / 2) gameObject.y -= this.height + gameObject.height;
            }
        }
    }

    checkOutsideViewport(f) {
        return (f.x > this.width + f.width / 2) ||
            (f.x < -f.width / 2) ||
            (f.y > this.height + f.height / 2) ||
            (f.y < -f.height / 2);
    }
}

// Objects

class Background {
    constructor(width, height) {
        this.drawItem = new Rect(width, height, '#bbb');
    }

    getDrawItem() {
        return this.drawItem;
    }
}

class Ship {
    constructor(x, y, angle) {
        this.width = 40;
        this.height = 40;
        this.maxSpeed = 20; // Скорость движения: 20 юнитов в секунду
        this.maxRotateSpeed = 0.25; // Скорость разворота: 0.25 оборота в секунду
        this.shootsPerSecond = 5; // Скорострельность: 5 выстрелов в секунду
        this.missleLaunchedAt = null;

        this.gameObject = new GameObject(x, y, this.width, this.height, angle, 0, 0);
        this.drawItem = new Sprite('ship.png', this.width, this.height, this.gameObject);
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    launchMissle() {
        const now = new Date().getTime();
        const timeout = 1000 / this.shootsPerSecond;
        if (this.missleLaunchedAt == null || this.missleLaunchedAt + timeout < now) {
            this.missleLaunchedAt = now;
            return new Missle(this.gameObject.x, this.gameObject.y, this.gameObject.angle);
        } else {
            return null;
        }
    }
}

class Missle {
    constructor(x, y, angle) {
        this.width = 10;
        this.height = 10;
        this.speed = 100;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, true);
        this.drawItem = new Sprite('missle.png', this.width, this.height, this.gameObject);
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }
}

// Game

class Game {
    constructor() {
        this.intervalHandle = null;
        this.calcFrequency = 60; // 60 раз в секунду

        this.keys = new Keys();

        this.figures = new Figures();

        const width = 800;
        const height = 600;
        this.renderEngine = new RenderEngine(width, height, this.figures);
        this.physicsEngine = new PhysicsEngine(width, height, this.figures);

        this.background = new Background(width, height);
        this.addFigure(this.background);

        this.ship = new Ship(width / 2, height / 2, 0);
        this.addFigure(this.ship);
    }

    addFigure(f) {
        this.figures.add(f);
    }

    processUserControl() {
        const k = this.keys.state;
        // Rotate
        if (k.ArrowLeft && !k.ArrowRight) {
            this.ship.getGameObject().rotateSpeed = -this.ship.maxRotateSpeed;
        } else if (!k.ArrowLeft && k.ArrowRight) {
            this.ship.getGameObject().rotateSpeed = +this.ship.maxRotateSpeed;
        } else {
            this.ship.getGameObject().rotateSpeed = 0;
        }

        // Move
        if (k.ArrowUp) {
            this.ship.getGameObject().speed = this.ship.maxSpeed;
        } else {
            this.ship.getGameObject().speed = 0;
        }

        // Shoot
        if (k.ControlLeft) {
            const missle = this.ship.launchMissle();
            if (missle) {
                this.addFigure(missle);
            }
        }
    }

    performAll() {
        this.processUserControl();
        this.physicsEngine.moveAll();
        this.renderEngine.drawFrame();
    }

    start() {
        if (!this.intervalHandle) {
            this.intervalHandle = setInterval(() => this.performAll(), 1000 / this.calcFrequency);
        }
    }

    pause() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }
}

// Initialization

const game = new Game();