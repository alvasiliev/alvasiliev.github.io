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

class Circle {
    constructor(radius, color, position) {
        this.radius = radius;
        this.color = color;
        this.position = position;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
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
        document.getElementById('root').append(canvas);
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

class CollisionEngine {
    constructor(figures) {
        this.figures = figures;
    }

    checkShipCollisions() {
        const ship = this.figures.get().find(f => f instanceof Ship);
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());

        for (let a of asteroids) {
            if (!a.getGameObject().getIsDestroyed()) {
                const isCollision = this.checkCollision(ship, a);
                if (isCollision) return true;
            }
        }
        return false;
    }

    checkMissleCollisions() {
        const missles = this.figures.get().filter(f => f instanceof Missle && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const newAsteroids = [];

        for (let a of asteroids) {
            for (let m of missles) {
                const isCollision = this.checkCollision(m, a);
                if (isCollision) {
                    m.getGameObject().destroy();
                    const wreckles = this.blowUpAsteroid(a);
                    if (wreckles.length) {
                        newAsteroids.push(...wreckles);
                    }
                }
            }
        }

        return newAsteroids;
    }

    checkCollision(go1, go2) {
        const go1Radius = go1.getGameObject().width / 2;
        const go1X = go1.getGameObject().x;
        const go1Y = go1.getGameObject().y;

        const go2Radius = go2.getGameObject().width / 2;
        const go2X = go2.getGameObject().x;
        const go2Y = go2.getGameObject().y;

        const minDistance = (go1Radius + go2Radius);
        const minDistance2 = minDistance * minDistance;

        const dx = go1X - go2X;
        const dy = go1Y - go2Y;
        const distance2 = dx * dx + dy * dy;

        return distance2 < minDistance2;
    }

    blowUpAsteroid(a) {
        a.getGameObject().destroy();

        const wreckles = [];
        if (a.radius > 20) {
            const wreckleRadius = a.radius / 3;
            const wreckleSpeed = a.speed * 1.5;
            const x = a.getGameObject().x;
            const y = a.getGameObject().y;

            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed));
            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed));
            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed));
        }

        return wreckles;
    }
}

// Objects

class Background {
    constructor(width, height) {
        const position = {
            x: width / 2,
            y: height / 2
        }
        this.drawItem = new Sprite('space.png', width, height, position);
    }

    getDrawItem() {
        return this.drawItem;
    }
}

class Ship {
    constructor(x, y, angle) {
        this.width = 60;
        this.height = 60;
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

class Asteroid {
    constructor(x, y, angle, radius, speed) {
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.speed = speed;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, false);
        this.drawItem = new Circle(this.radius, '#555', this.gameObject);
        //this.drawItem = new Sprite('asteroid.png', this.width, this.height, this.gameObject);
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
        this.isFinished = false;

        this.keys = new Keys();
        this.figures = new Figures();

        this.width = 1024;
        this.height = 768;
        this.renderEngine = new RenderEngine(this.width, this.height, this.figures);
        this.physicsEngine = new PhysicsEngine(this.width, this.height, this.figures);
        this.collisionEngine = new CollisionEngine(this.figures);

        this.background = new Background(this.width, this.height);
        this.ship = new Ship(this.width / 2, this.height / 2, 0);

        this.init();
    }

    init() {
        this.background.getDrawItem().color = '#78f';
        this.figures.set([]);

        const asteroids = this.generateAsteroids();
        this.addFigure(this.background);
        this.addFigure(this.ship);
        asteroids.forEach(a => this.addFigure(a));
    }

    generateAsteroids() {
        const asteroids = [];
        const asteroidsCount = 5;
        const minRadius = 20;
        const maxRadius = 70;
        const minSpeed = 1;
        const maxSpeed = 20
        for (let i = 0; i < asteroidsCount; ++i) {
            const rand = Math.random();
            const radius = Math.trunc(rand * (maxRadius - minRadius) + minRadius);
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;

            const linearPos = Math.trunc((this.width + this.height) * 2 * Math.random());

            let x, y;
            if (linearPos < this.width) {
                x = linearPos;
                y = 0;
            } else if (linearPos < this.width + this.height) {
                x = this.width;
                y = linearPos - this.width;
            } else if (linearPos < this.width * 2 + this.height) {
                x = linearPos - this.width - this.height;
                y = this.height;
            } else {
                x = 0;
                y = linearPos - this.width * 2 - this.height;
            }

            const angle = Math.random() * 360 * Math.PI / 180;

            const a = new Asteroid(x, y, angle, radius, speed);
            asteroids.push(a);
        }
        return asteroids;
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
        if (!this.isFinished) {
            this.processUserControl();
            this.physicsEngine.moveAll();
        }
        this.renderEngine.drawFrame();

        if (!this.isFinished) {
            const newAsteriods = this.collisionEngine.checkMissleCollisions();
            for (let a of newAsteriods) {
                this.addFigure(a);
            }

            // Remove all destroyed objects
            const figuresWithoutDestroyed = this.figures.get().filter(f => !f.getGameObject || !f.getGameObject().getIsDestroyed());
            this.figures.set(figuresWithoutDestroyed);

            const isShipCollision = this.collisionEngine.checkShipCollisions();
            if (isShipCollision) {
                this.loose();
            } else {
                const asteroids = this.figures.get().filter(f => f instanceof Asteroid);
                if (asteroids.length === 0) {
                    this.win();
                }
            }
        }
    }

    loose() {
        this.background.getDrawItem().color = '#f78';
        this.isFinished = true;
    }

    win() {
        this.background.getDrawItem().color = '#7f8';
        this.isFinished = true;
    }

    start() {
        if (!this.intervalHandle) {
            this.intervalHandle = setInterval(() => this.performAll(), 1000 / this.calcFrequency);
        }
        if (this.isFinished) {
            this.isFinished = false;
            this.init();
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
