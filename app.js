class Keys {
    constructor() {
        this.keyLeft = false;
        this.keyRight = false;
        this.keyUp = false;
        this.keyDown = false;
        this.keySpace = false;

        document.addEventListener("keydown", function (event) {
            switch (event.code) {
                case 'ArrowLeft':
                    this.keyLeft = true;
                    break;
                case 'ArrowUp':
                    this.keyUp = true;
                    break;
                case 'ArrowRight':
                    this.keyRight = true;
                    break;
                case 'ArrowDown':
                    this.keyDown = true;
                    break;
                case 'Space':
                    this.keySpace = true;
                    break;
            }
        }.bind(this));

        document.addEventListener("keyup", function (event) {
            switch (event.code) {
                case 'ArrowLeft':
                    this.keyLeft = false;
                    break;
                case 'ArrowUp':
                    this.keyUp = false;
                    break;
                case 'ArrowRight':
                    this.keyRight = false;
                    break;
                case 'ArrowDown':
                    this.keyDown = false;
                    break;
                case 'Space':
                    this.keySpace = false;
                    break;
            }
        }.bind(this));
    }
}

class Engine {
    constructor(width, height) {
        this.isRunning = false;
        this.width = width;
        this.height = height;

        const root = document.body;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        root.append(canvas);
        const context = canvas.getContext('2d');

        this.keys = new Keys();

        this.figures = [];

        const background = new Background(context, width, height);
        this.figures.push(background);

        const ship = new Ship(context, this.keys);
        this.figures.push(ship);
    }

    drawAll() {
        for (let i = 0; i < this.figures.length; ++i) {
            const f = this.figures[i];
            let destroy = false;
            if (f.move) {
                f.move();

                if (f instanceof Ship) {
                    if (f.x > this.width + f.width / 2) f.x = f.x - this.width - f.width;
                    else if (f.x < -f.width / 2) f.x = f.x + this.width + f.width;

                    if (f.y > this.height + f.height / 2) f.y = f.y - this.height - f.height;
                    else if (f.y < -f.height / 2) f.y = f.y + this.height + f.height;
                } else {
                    if (
                        f.x > this.width + f.width / 2 ||
                        f.x < -f.width / 2 ||
                        f.y > this.height + f.height / 2 ||
                        f.y < -f.height / 2
                    ) {
                        destroy = true;
                    }
                }
            }
            if (this.keys.keySpace && f.launchMissle) {
                const missle = f.launchMissle();
                if (missle) {
                    this.figures.push(missle);
                }
            }
            f.draw();
            if (destroy) {
                this.figures[i] = null;
            }
        }
        this.figures = this.figures.filter(x => !!x); // remove destroyed figures
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.handle = setInterval(() => this.drawAll(), 1000 / 60); // 60 frames per second
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.handle);
        }
    }
}

class Background {
    constructor(context, width, height) {
        this.context = context;
        this.width = width;
        this.height = height;
        this.color = '#bbb';
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
    }
}

class Ship {
    constructor(context, keys) {
        this.context = context;
        this.keys = keys;
        this.x = 400;
        this.y = 300;
        this.speed = 0;
        this.maxSpeed = 5;
        this.angleSpeed = 0;
        this.maxAngleSpeed = 100;
        this.angle = 0;
        this.width = 40;
        this.height = 40;
        this.sprite = new Image();
        this.sprite.src = 'ship.png';
        this.missleTimeout = 200;
        this.missleLaunchedAt = null;
    }

    draw() {
        this.context.save();
        this.context.translate(this.x, this.y);
        this.context.rotate(this.angle);
        this.context.drawImage(
            this.sprite,
            0, 0, this.width, this.height,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        this.context.restore();
    }

    move() {
        if (this.keys) {
            const dAngle = 1;
            if (this.keys.keyLeft && !this.keys.keyRight) {
                if (this.angleSpeed > -this.maxAngleSpeed) this.angleSpeed -= dAngle;
            } else if (this.keys.keyRight && !this.keys.keyLeft) {
                if (this.angleSpeed < this.maxAngleSpeed) this.angleSpeed += dAngle;
            } else {
                if (this.angleSpeed > 0) this.angleSpeed -= dAngle;
                else if (this.angleSpeed < 0) this.angleSpeed += dAngle;
            }
            this.angle += (this.angleSpeed / 50) * Math.PI / 180;

            if (this.keys.keyUp) {
                if (this.speed < this.maxSpeed) this.speed += 0.1;
            } else {
                if (this.speed > 0) this.speed -= 0.1;
            }
        }
        if (this.speed) {
            const speedX = this.speed * Math.cos(this.angle);
            const speedY = this.speed * Math.sin(this.angle);
            this.x += speedX;
            this.y += speedY;
        }
    }

    launchMissle() {
        const now = new Date().getTime();
        if (this.missleLaunchedAt == null || this.missleLaunchedAt + this.missleTimeout < now) {
            this.missleLaunchedAt = now;
            const missle = new Missle(this.context, this.x, this.y, this.angle);
            return missle;
        } else {
            return null;
        }
    }
}

class Missle {
    constructor(context, x, y, angle) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.angle = angle;
        this.width = 10;
        this.height = 10;
        this.sprite = new Image();
        this.sprite.src = 'missle.png';
    }

    draw() {
        this.context.save();
        this.context.translate(this.x, this.y);
        this.context.rotate(this.angle);
        this.context.drawImage(
            this.sprite,
            0, 0, this.width, this.height,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        this.context.restore();
    }

    move() {
        const speedX = this.speed * Math.cos(this.angle);
        const speedY = this.speed * Math.sin(this.angle);
        this.x += speedX;
        this.y += speedY;
    }
}

const engine = new Engine(800, 600);

function start() {
    engine.start();
}

function pause() {
    engine.pause();
}