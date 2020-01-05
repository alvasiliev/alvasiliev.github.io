// Primitives

class GameObject {
    constructor(x, y, width, height, angle, speed, rotateSpeed, destroyOnLeave, spinSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle || 0; // Направление полёта
        this.speed = speed || 0; // Юнитов в секунду
        this.rotateSpeed = rotateSpeed || 0; // Скорость поворота - оборотов в секунду
        this.spinAngle = 0; // Положение разворота относительно оси. Не влияет на направление полёта
        this.spinSpeed = spinSpeed || 0; // Скорость вращения отновительно оси
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

    getSpeed() {
        return this.speed;
    }

    getRotateSpeed() {
        return this.rotateSpeed;
    }
}

class Sprite {
    constructor(image, width, height, position) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.image = image;
    }

    draw(context) {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.position.angle + this.position.spinAngle);
        context.drawImage(
            this.image,
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

class Ring {
    constructor(radius, color, position) {
        this.radius = radius;
        this.color = color;
        this.position = position;
    }

    draw(context) {
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.stroke();
    }
}

class AnimatedSprite {
    constructor(image, width, height, imageWidth, imageHeight, position, numFramesX, numFramesY, looped, onFinishedHandler) {
        this.position = position;
        this.frameNumber = 0;
        this.numFramesX = numFramesX;
        this.numFramesY = numFramesY;
        this.numFrames = numFramesX * numFramesY;
        this.image = image;
        this.width = width;
        this.height = height;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.looped = looped;
        this.onFinishedHandler = onFinishedHandler;
    }

    draw(context) {
        if (this.frameNumber >= this.numFrames) {
            if (this.looped) {
                this.frameNumber = 0;
            } else {
                if (this.onFinishedHandler) this.onFinishedHandler();
                return;
            }
        }

        const x = (this.frameNumber % this.numFramesX);
        const y = Math.trunc(this.frameNumber / this.numFramesX);

        context.save();
        context.translate(this.position.x, this.position.y);
        context.drawImage(
            this.image,
            x * this.imageWidth, y * this.imageHeight, this.imageWidth, this.imageHeight,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        context.restore();

        this.frameNumber += 1;
    }
}

class CombinedDrawItem {
    constructor(drawItems) {
        this.drawItems = drawItems;
    }

    draw(context) {
        this.drawItems.forEach(di => di.draw(context));
    }
}

// Engines

class Sound {
    constructor(context, buffer) {
        this.context = context;
        this.buffer = buffer;
        this.isPlaying = false;
        this.gainNode = null;
        this.source = null;
    }

    play(volume, isLooped, fadeIn) {
        if (!isLooped || !this.isPlaying) {
            this.isPlaying = true;
            const now = this.context.currentTime;

            this.gainNode = this.context.createGain();

            this.source = this.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.loop = isLooped;
            this.source.connect(this.gainNode);

            this.gainNode.connect(this.context.destination);

            if (!fadeIn) {
                this.gainNode.gain.setValueAtTime(volume || 1, now);
            } else {
                this.gainNode.gain.setValueAtTime(0, now);
                this.gainNode.gain.linearRampToValueAtTime(volume || 1, now + 0.5);
            }

            this.source.start(now);
        }
    }

    stop() {
        if (this.isPlaying) {
            this.isPlaying = false;

            const now = this.context.currentTime;
            this.gainNode.gain.linearRampToValueAtTime(0, now + 1);
            this.source.stop(now + 2);
        }
    }
}

class SoundManager {
    constructor() {
        this.context = new(window.AudioContext || window.webkitAudioContext)();

        this.sounds = {};
        this.loadedCount = 0;
        this.sndList = [
            'success',
            'gameover',
            'explosion',
            'shot',
            'jet',
            'music',
        ];
        this.onLoadFinished = null;
        this.isLoaded = false;
    }

    async load() {
        const promises = this.sndList.map(snd => this.loadSound(snd));

        await Promise.all(promises)

        this.isLoaded = true;
        this.onLoadFinished();
    }

    get(soundName) {
        const audioBuffer = this.sounds[soundName];
        if (!audioBuffer) {
            return {
                play: function () {},
                stop: function () {}
            };
        } else {
            return new Sound(this.context, audioBuffer)
        }
    }

    async loadSound(sndSrc) {
        const url = `audio/${sndSrc}.mp3`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const audioData = await response.arrayBuffer();
                const decodedData = await this.context.decodeAudioData(audioData);
                this.sounds[sndSrc] = decodedData;
            } else {
                console.error('Failed to load sound: ' + sndSrc);
            }
        } catch (e) {
            console.error('Failed to load sound: ' + sndSrc);
        }
    }
}

class ImageManager {
    constructor() {
        this.images = {}
        this.loadedCount = 0;
        this.imgList = [
            'space',
            'stars_small',
            'stars_large',
            'cloud_small',
            'cloud_large',
            'ship',
            'missle',
            'asteroid',
            'explosion',
            'station',
        ];
        this.onLoadFinished = null;
        this.isLoaded = false;
    }

    load() {
        this.imgList.forEach(img => this.loadImage(img));
    }

    get(imageName) {
        return this.images[imageName];
    }

    loadImage(imgSrc) {
        const image = new Image();
        image.src = 'sprites/' + imgSrc + '.png';
        image.onload = () => {
            this.images[imgSrc] = image;
            this.loadedCount += 1;

            if (this.loadedCount === this.imgList.length && this.onLoadFinished) {
                this.isLoaded = true;
                this.onLoadFinished();
            }
        }
        return image;
    }
}

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

class SplashScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#0E0855');
    }

    draw(context, isLoading) {
        this.background.draw(context);

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("ASTEROIDS", this.width / 2 - 130, this.height / 2 - 50);

        if (isLoading) {
            context.fillStyle = '#aaa';
            context.font = "18px 'Courier New', Courier, monospace";
            context.fillText("Loading...", this.width / 2 - 50, this.height / 2 - 9);
        } else {
            context.fillStyle = '#aaa';
            context.font = "18px 'Courier New', Courier, monospace";
            context.fillText("Press ENTER play", this.width / 2 - 85, this.height / 2 - 9);

            const textLeft = this.width / 2 - 130;
            context.fillText("Keyboard controls:", textLeft, this.height / 2 - 9 + 45);

            context.font = "16px 'Courier New', Courier, monospace";
            context.fillText("Arrow " + String.fromCharCode(8593) + "   - move", textLeft, this.height / 2 - 9 + 70);
            context.fillText("Arrow " + String.fromCharCode(8592) + "   - rotate left", textLeft, this.height / 2 - 9 + 90);
            context.fillText("Arrow " + String.fromCharCode(8594) + "   - rotate right", textLeft, this.height / 2 - 9 + 110);
            context.fillText("Left CTRL - shoot", textLeft, this.height / 2 - 9 + 130);
            context.fillText("Key Z     - dock / undock", textLeft, this.height / 2 - 9 + 150);
            context.fillText("ENTER     - pause", textLeft, this.height / 2 - 9 + 170);
            context.fillText("ESCAPE    - reset", textLeft, this.height / 2 - 9 + 190);
        }
    }
}

class PauseScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#000');
    }

    draw(context) {
        context.globalAlpha = 0.5;
        this.background.draw(context);
        context.globalAlpha = 1;

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("PAUSE", this.width / 2 - 80, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER continue", this.width / 2 - 110, this.height / 2 - 9);

        const textLeft = this.width / 2 - 110;
        context.fillText("Keyboard controls:", textLeft, this.height / 2 - 9 + 45);

        context.font = "16px 'Courier New', Courier, monospace";
        context.fillText("Arrow " + String.fromCharCode(8593) + "   - move", textLeft, this.height / 2 - 9 + 70);
        context.fillText("Arrow " + String.fromCharCode(8592) + "   - rotate left", textLeft, this.height / 2 - 9 + 90);
        context.fillText("Arrow " + String.fromCharCode(8594) + "   - rotate right", textLeft, this.height / 2 - 9 + 110);
        context.fillText("Left CTRL - shoot", textLeft, this.height / 2 - 9 + 130);
        context.fillText("Key Z     - dock / undock", textLeft, this.height / 2 - 9 + 150);
        context.fillText("ENTER     - pause", textLeft, this.height / 2 - 9 + 170);
        context.fillText("ESCAPE    - reset", textLeft, this.height / 2 - 9 + 190);
    }
}

class GameOverScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#900');
        this.sound = null;
    }

    draw(context) {
        context.globalAlpha = 0.5;
        this.background.draw(context);
        context.globalAlpha = 1;

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("GAME OVER", this.width / 2 - 120, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER restart", this.width / 2 - 110, this.height / 2 - 9);

        const textLeft = this.width / 2 - 110;
        context.fillText("Keyboard controls:", textLeft, this.height / 2 - 9 + 45);

        context.font = "16px 'Courier New', Courier, monospace";
        context.fillText("Arrow " + String.fromCharCode(8593) + "   - move", textLeft, this.height / 2 - 9 + 70);
        context.fillText("Arrow " + String.fromCharCode(8592) + "   - rotate left", textLeft, this.height / 2 - 9 + 90);
        context.fillText("Arrow " + String.fromCharCode(8594) + "   - rotate right", textLeft, this.height / 2 - 9 + 110);
        context.fillText("Left CTRL - shoot", textLeft, this.height / 2 - 9 + 130);
        context.fillText("Key Z     - dock / undock", textLeft, this.height / 2 - 9 + 150);
        context.fillText("ENTER     - pause", textLeft, this.height / 2 - 9 + 170);
        context.fillText("ESCAPE    - reset", textLeft, this.height / 2 - 9 + 190);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('gameover');
        this.sound.play();
    }
}

class WinnerScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#090');
        this.sound = null;
    }

    draw(context) {
        context.globalAlpha = 0.5;
        this.background.draw(context);
        context.globalAlpha = 1;

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("WELL DONE", this.width / 2 - 120, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER restart", this.width / 2 - 110, this.height / 2 - 9);

        const textLeft = this.width / 2 - 110;
        context.fillText("Keyboard controls:", textLeft, this.height / 2 - 9 + 45);

        context.font = "16px 'Courier New', Courier, monospace";
        context.fillText("Arrow " + String.fromCharCode(8593) + "   - move", textLeft, this.height / 2 - 9 + 70);
        context.fillText("Arrow " + String.fromCharCode(8592) + "   - rotate left", textLeft, this.height / 2 - 9 + 90);
        context.fillText("Arrow " + String.fromCharCode(8594) + "   - rotate right", textLeft, this.height / 2 - 9 + 110);
        context.fillText("Left CTRL - shoot", textLeft, this.height / 2 - 9 + 130);
        context.fillText("Key Z     - dock / undock", textLeft, this.height / 2 - 9 + 150);
        context.fillText("ENTER     - pause", textLeft, this.height / 2 - 9 + 170);
        context.fillText("ESCAPE    - reset", textLeft, this.height / 2 - 9 + 190);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('success');
        this.sound.play();
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

    drawSplashScreen(isLoading) {
        const screen = new SplashScreen(this.width, this.height);
        screen.draw(this.context, isLoading);
    }

    drawPauseScreen() {
        const screen = new PauseScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawGameOverScreen() {
        const screen = new GameOverScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawWinnerScreen() {
        const screen = new WinnerScreen(this.width, this.height);
        screen.draw(this.context);
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

    reset() {
        this.movedAt = null;
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
        const pathPassed = this.UNIT_SIZE * gameObject.getSpeed() * (timePassed / 1000);

        if (pathPassed) {
            const pathX = pathPassed * Math.cos(gameObject.angle);
            const pathY = pathPassed * Math.sin(gameObject.angle);
            gameObject.x += pathX;
            gameObject.y += pathY;
        }

        const rotateSpeed = gameObject.getRotateSpeed();
        if (rotateSpeed) {
            const anglePassed = 2 * Math.PI * rotateSpeed * timePassed / 1000;
            gameObject.angle += anglePassed;
        }

        if (gameObject.spinSpeed) {
            const spinPassed = 2 * Math.PI * gameObject.spinSpeed * timePassed / 1000;
            gameObject.spinAngle += spinPassed;
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
        const wreckles = [];

        for (let a of asteroids) {
            for (let m of missles) {
                const isCollision = this.checkCollision(m, a);
                if (isCollision) {
                    m.blowUp();
                    const wrecklesA = a.blowUp();
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                }
            }
        }

        return wreckles;
    }

    checkStationsCollisions() {
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let a of asteroids) {
            for (let s of stations) {
                const isCollision = this.checkCollision(s, a);
                if (isCollision) {
                    const wrecklesA = a.blowUp();
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                }
            }
        }
        return wreckles;
    }

    checkCanDock() {
        const ship = this.figures.get().find(f => f instanceof Ship);
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());

        for (let s of stations) {
            if (s.checkCanDock(ship)) {
                return s;
            }
        }
        return null;
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
}

// Objects

class Img {
    constructor(x, y, angle, width, height, image) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.width = width;
        this.height = height;
        this.image = image;
    }
}

class Background {
    constructor(width, height) {
        this.sprites = {
            space: new Img(width / 2, height / 2, 0, width, height, imageManager.get('space')),
            starsSmall: new Img(width / 2, height / 2, 0, width, height, imageManager.get('stars_small')),
            starsLarge: new Img(width / 2, height / 2, 0, width, height, imageManager.get('stars_large')),
            cloudsSmall: new Img(width / 2, height / 2, 0, width, height, imageManager.get('cloud_small')),
            cloudsLarge: new Img(width / 2, height / 2, 0, width, height, imageManager.get('cloud_large')),
        }
    }

    drawSprite(context, sprite) {
        context.save();
        context.translate(sprite.x, sprite.y);
        context.rotate(sprite.angle);
        context.drawImage(
            sprite.image,
            0, 0, sprite.width, sprite.height,
            -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height
        );
        context.restore();
    }

    drawAll(context) {
        this.drawSprite(context, this.sprites.space);
        this.drawSprite(context, this.sprites.starsSmall);
        this.drawSprite(context, this.sprites.starsLarge);
        this.drawSprite(context, this.sprites.cloudsSmall);
        this.drawSprite(context, this.sprites.cloudsLarge);
    }

    getDrawItem() {
        return {
            draw: context => this.drawAll(context)
        };
    }
}

class Ship {
    constructor(x, y, angle) {
        this.width = 60;
        this.height = 60;

        this.maxSpeed = 50; // Скорость движения: 50 юнитов в секунду
        this.acceleration = 0;
        this.maxAcceleration = 0.0005;
        this.accelerationTurnedOnAt = null;
        this.isEngineOn = false;
        this.engineSound = null;

        this.maxRotateSpeed = 0.25; // Скорость разворота: 0.25 оборота в секунду

        this.shootsPerSecond = 5; // Скорострельность: 5 выстрелов в секунду
        this.missleLaunchedAt = null;
        this.missleSound = null;

        this.dockedStation = null;

        this.gameObject = new GameObject(x, y, this.width, this.height, angle, 0, 0);
        this.drawItem = new Sprite(imageManager.get('ship'), this.width, this.height, this.gameObject);

        this.gameObject.getSpeed = () => {
            if (this.accelerationTurnedOnAt) {
                const now = new Date().getTime();
                const newSpeed = this.gameObject.speed + this.acceleration * (now - this.accelerationTurnedOnAt);
                this.gameObject.speed = newSpeed
                if (this.gameObject.speed > this.maxSpeed) this.gameObject.speed = this.maxSpeed;
                if (this.gameObject.speed < 0) this.gameObject.speed = 0;
            }
            return this.gameObject.speed;
        }

        this.gameObject.getRotateSpeed = () => {
            return this.gameObject.rotateSpeed;
        }
    }

    dispose() {
        if (this.engineSound) this.engineSound.stop();
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

            if (!this.missleSound) this.missleSound = soundManager.get('shot');
            this.missleSound.play(0.1);

            return new Missle(this.gameObject.x, this.gameObject.y, this.gameObject.angle + this.gameObject.spinAngle);
        } else {
            return null;
        }
    }

    turnEngineOn() {
        if (!this.isEngineOn && !this.isDockedToStation()) {
            this.isEngineOn = true;
            this.accelerationTurnedOnAt = new Date().getTime();
            this.acceleration = this.maxAcceleration;
            this.engineSound = soundManager.get('jet'); // New each time. This sound is looped it has to be stopped on engine off
            this.engineSound.play(2, true, true);
        }
    }

    turnEngineOff() {
        if (this.isEngineOn) {
            this.isEngineOn = false;
            this.accelerationTurnedOnAt = new Date().getTime();
            this.acceleration = -this.maxAcceleration;
            if (this.engineSound) this.engineSound.stop();
        }
    }

    turnRotationLeftOn() {
        this.getGameObject().rotateSpeed = -this.maxRotateSpeed;
    }

    turnRotationRightOn() {
        this.getGameObject().rotateSpeed = this.maxRotateSpeed;
    }

    turnRotationOff() {
        this.getGameObject().rotateSpeed = 0;
    }

    isDockedToStation() {
        return this.dockedStation != null;
    }

    dockToStation(station) {
        if (station != null) {
            this.dockedStation = station;
            station.dockShip(this);

            this.getGameObject().speed = 0;
            this.getGameObject().spinSpeed = station.getGameObject().spinSpeed;
            this.getGameObject().x = station.getGameObject().x;
            this.getGameObject().y = station.getGameObject().y;
        }
    }

    undockFromStation() {
        if (this.isDockedToStation()) {
            this.dockedStation.undockShip();
            this.dockedStation = null;

            const go = this.getGameObject();
            go.angle += go.spinAngle;
            go.spinAngle = 0;
            go.spinSpeed = 0;
        }
    }
}

class Missle {
    constructor(x, y, angle) {
        this.width = 10;
        this.height = 10;
        this.speed = 100;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, true);
        this.drawItem = new Sprite(imageManager.get('missle'), this.width, this.height, this.gameObject);
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    blowUp() {
        this.getGameObject().destroy();
    }
}

class Asteroid {
    constructor(x, y, angle, radius, speed, spinSpeed) {
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.speed = speed;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, false, spinSpeed);
        this.drawItem = new Sprite(imageManager.get('asteroid'), this.width, this.height, this.gameObject);
        this.explosionSound = null;
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    blowUp() {
        this.getGameObject().destroy();

        if (!this.explosionSound) this.explosionSound = soundManager.get('explosion');
        this.explosionSound.play();

        const wreckles = [];

        const x = this.getGameObject().x;
        const y = this.getGameObject().y;
        wreckles.push(new Explosion(x, y, this.radius * 2));

        if (this.radius > 20) {
            const wreckleRadius = this.radius / 3;
            const wreckleSpeed = this.speed * 1.5;

            const spinSpeed = this.getGameObject().spinSpeed * 2;

            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed, spinSpeed));
            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed, spinSpeed));
            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed, spinSpeed));
        }

        return wreckles;
    }
}

class Explosion {
    constructor(x, y, radius) {
        this.width = 100;
        this.height = 100;
        this.imgSrc = 'explosion';
        this.numFramesX = 9;
        this.numFramesY = 9;

        this.gameObject = new GameObject(x, y, this.width, this.height, 0, 0, 0, false, 0);
        this.drawItem = new AnimatedSprite(imageManager.get('explosion'), radius * 2, radius * 2, this.width, this.height, this.gameObject, this.numFramesX, this.numFramesY, false, () => {
            this.gameObject.destroy();
        });
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }
}

class Station {
    constructor(x, y) {
        this.width = 240;
        this.height = 240;
        this.gameObject = new GameObject(x, y, this.width, this.height, 0, 0, 0, false, 0.01);
        this.drawItem1 = new Sprite(imageManager.get('station'), this.width, this.height, this.gameObject);
        this.drawItem2 = new Ring(30, '#0f0', this.gameObject);
        this.drawItem = new CombinedDrawItem([this.drawItem1]);

        this.dockedShip = null;
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    showCanDock(canDock) {
        if (canDock) {
            this.drawItem.drawItems = [this.drawItem1, this.drawItem2];
        } else {
            this.drawItem.drawItems = [this.drawItem1];
        }
    }

    checkCanDock(ship) {
        if (this.dockedShip != null) {
            this.showCanDock(false);
            return false;
        }

        const shipPos = ship.getGameObject();
        const stationPos = this.getGameObject();

        const dx = shipPos.x - stationPos.x;
        const dy = shipPos.y - stationPos.y;
        const dockRadius = 30;

        const canDock = dx * dx + dy * dy <= dockRadius * dockRadius;

        this.showCanDock(canDock);
        return canDock;
    }

    dockShip(ship) {
        this.dockedShip = ship;
    }

    undockShip() {
        this.dockedShip = null;
    }
}

// Game

class Game {
    constructor(imageManager, soundManager, w, h) {
        this.intervalHandle = null;
        this.calcFrequency = 60; // 60 раз в секунду
        this.isFinished = false;

        this.keys = new Keys();
        this.figures = new Figures();

        this.width = w || 1024;
        this.height = h || 768;
        this.renderEngine = new RenderEngine(this.width, this.height, this.figures);
        this.physicsEngine = new PhysicsEngine(this.width, this.height, this.figures);
        this.collisionEngine = new CollisionEngine(this.figures);

        this.musicSound = null;

        this.stationToDock = null;

        this.renderEngine.drawSplashScreen(true);
        imageManager.onLoadFinished = () => {
            if (imageManager.isLoaded && soundManager.isLoaded) this.loadFinished();
        }
        soundManager.onLoadFinished = () => {
            if (imageManager.isLoaded && soundManager.isLoaded) this.loadFinished();
        }
        setTimeout(() => {
            imageManager.load();
            soundManager.load();
        }, 200);

        this.configureKeys();
    }

    loadFinished() {
        this.background = new Background(this.width, this.height);
        this.init();
        this.renderEngine.drawSplashScreen(false);
    }

    configureKeys() {
        document.addEventListener("keypress", function (event) {
            if (event.code === 'Enter') {
                if (!this.intervalHandle) {
                    this.start();
                } else {
                    this.pause();
                }
            } else if (event.code === 'KeyZ') {
                if (this.ship.isDockedToStation()) {
                    this.ship.undockFromStation();
                } else if (this.stationToDock) {
                    this.ship.dockToStation(this.stationToDock);
                }
            }
        }.bind(this));

        document.addEventListener("keyup", function (event) {
            if (event.code === 'Escape') {
                if (this.intervalHandle) {
                    clearInterval(this.intervalHandle);
                    this.intervalHandle = null;
                }
                this.isFinished = true;
                this.renderEngine.drawSplashScreen();
                this.stopMusic();
            }
        }.bind(this));
    }

    init() {
        this.background.getDrawItem().color = '#78f';
        this.figures.set([]);

        this.ship = new Ship(this.width / 2 + 250, this.height / 2, 0);

        const asteroids = this.generateAsteroids();
        const stations = this.generateStations();

        this.addFigure(this.background);
        stations.forEach(s => this.addFigure(s));
        this.addFigure(this.ship);
        asteroids.forEach(a => this.addFigure(a));

        this.physicsEngine.reset();
    }

    generateAsteroids() {
        const asteroids = [];
        const asteroidsCount = 5;
        const minRadius = 20;
        const maxRadius = 70;
        const minSpeed = 1;
        const maxSpeed = 20;
        const maxSpin = 0.5;
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

            const spinSpeed = ((1 - rand) * maxSpin * 2) - maxSpin;

            const a = new Asteroid(x, y, angle, radius, speed, spinSpeed);
            asteroids.push(a);
        }
        return asteroids;
    }

    generateStations() {
        const stations = [];

        const x = this.width / 2;
        const y = this.height / 2;
        const s = new Station(x, y);
        stations.push(s);

        return stations;
    }

    addFigure(f) {
        this.figures.add(f);
    }

    processUserControl() {
        const k = this.keys.state;
        // Rotate
        if (k.ArrowLeft && !k.ArrowRight) {
            this.ship.turnRotationLeftOn();
        } else if (!k.ArrowLeft && k.ArrowRight) {
            this.ship.turnRotationRightOn();
        } else {
            this.ship.turnRotationOff();
        }

        // Move
        if (k.ArrowUp) {
            this.ship.turnEngineOn();
        } else {
            this.ship.turnEngineOff();
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

        const newAsteriods = this.collisionEngine.checkMissleCollisions();
        for (let a of newAsteriods) {
            this.addFigure(a);
        }

        const newAsteriods2 = this.collisionEngine.checkStationsCollisions();
        for (let a of newAsteriods2) {
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

        this.stationToDock = this.collisionEngine.checkCanDock();
    }

    loose() {
        this.isFinished = true;
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
        this.renderEngine.drawGameOverScreen();
        if (this.ship) this.ship.dispose();
        this.stopMusic();
    }

    win() {
        this.isFinished = true;
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
        this.renderEngine.drawWinnerScreen();
        if (this.ship) this.ship.dispose();
        this.stopMusic();
    }

    start() {
        if (!this.intervalHandle) {
            this.physicsEngine.reset();
            this.intervalHandle = setInterval(() => this.performAll(), 1000 / this.calcFrequency);
        }
        if (this.isFinished) {
            this.isFinished = false;
            this.init();
        }
        this.startMusic();
    }

    pause() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
            this.renderEngine.drawPauseScreen();
        }
    }

    startMusic() {
        if (!this.musicSound) {
            this.musicSound = soundManager.get('music');
        }
        this.musicSound.play(1, true, true);
    }

    stopMusic() {
        if (this.musicSound) {
            this.musicSound.stop();
        }
    }
}

// Initialization

const w = window.innerWidth,
    h = window.innerHeight;
const imageManager = new ImageManager();
const soundManager = new SoundManager();
const game = new Game(imageManager, soundManager, w, h);