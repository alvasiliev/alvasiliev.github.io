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
    constructor(image, width, height, position, deltaX, deltaY) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.image = image;
        this.deltaX = deltaX || 0;
        this.deltaY = deltaY || 0;
    }

    draw(context) {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.position.angle + this.position.spinAngle);
        context.translate(this.deltaX, this.deltaY);
        context.drawImage(
            this.image,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        context.restore();
    }
}

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

class Rect {
    constructor(width, height, color, leftX, topY) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.leftX = leftX || 0;
        this.topY = topY || 0;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.leftX, this.topY, this.width, this.height);
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
    constructor(image, width, height, imageWidth, imageHeight, position, numFramesX, numFramesY, looped, onFinishedHandler, deltaX, deltaY, startFrameNumber) {
        this.position = position;
        this.frameNumber = startFrameNumber || 0;
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
        this.deltaX = deltaX || 0;
        this.deltaY = deltaY || 0;
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
        context.rotate(this.position.angle + this.position.spinAngle);
        context.translate(this.deltaX, this.deltaY);
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

// UI Parts

class Background {
    constructor(width, height) {
        this.background = new Rect(width, height, '#0F065D');
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
        this.background.draw(context);
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

class StatusPanel {
    constructor(game) {
        this.game = game;
    }

    getItems() {
        const shipStatuses = !this.game.players ? [] : this.game.players.map((player, i) => {
            const posY = 20 * (i + 1);
            const shipHealth = {
                draw: context => {
                    const ship = player.getShip();
                    if (!ship) return;
                    context.fillStyle = '#888';
                    context.font = "14px  'Courier New', Courier, monospace";
                    context.fillText(`Health: ${ship.health} / ${ship.maxHealth}`, 10, posY);
                }
            };

            const shipAmmo = {
                draw: context => {
                    const ship = player.getShip();
                    if (!ship) return;
                    context.fillStyle = '#888';
                    context.font = "14px  'Courier New', Courier, monospace";
                    context.fillText(`Ammo: ${ship.ammo} / ${ship.maxAmmo}`, 170, posY);
                }
            };

            const shipMissiles = {
                draw: context => {
                    const ship = player.getShip();
                    if (!ship) return;
                    context.fillStyle = '#888';
                    context.font = "14px  'Courier New', Courier, monospace";
                    context.fillText(`Missiles: ${ship.missileCount} / ${ship.maxMissiles}`, 300, posY);
                }
            };

            const shipBeacons = {
                draw: context => {
                    const ship = player.getShip();
                    if (!ship) return;
                    const numOfBeacons = this.game.currentMission.numOfBeacons;
                    if (numOfBeacons) {
                        context.fillStyle = '#888';
                        context.font = "14px  'Courier New', Courier, monospace";
                        context.fillText(`Beacons: ${ship.beaconCount} / ${numOfBeacons}`, 440, posY);
                    }
                }
            };

            return new CombinedDrawItem([
                shipHealth,
                shipAmmo,
                shipMissiles,
                shipBeacons,
            ]);
        });

        this.messages = {
            draw: context => {
                const msgs = [];

                if (this.game.players) {
                    if (this.game.players.length > 1) {
                        context.font = "26px  'Courier New', Courier, monospace";
                        for (let player of this.game.players) {
                            const ship = player.getShip();
                            if (ship && !ship.getGameObject().getIsDestroyed()) {
                                if (ship.ammo <= 0 && !ship.dockedStation) {
                                    msgs.push(`${player.getName()} is out of ammo`);
                                }
                            }
                        }
                    } else {
                        context.font = "36px  'Courier New', Courier, monospace";
                        const ship = this.game.players[0].getShip();
                        if (ship && !ship.getGameObject().getIsDestroyed()) {
                            if (ship.ammo <= 0 && !ship.dockedStation) {
                                msgs.push(`OUT OF AMMO`);
                            }
                        }
                    }
                }

                const originalTextAlign = context.textAlign;
                context.textAlign = 'center';
                context.fillStyle = 'rgba(240,240,240,0.3)';

                let top = 80;
                for (let m of msgs) {
                    context.fillText(m, this.game.width / 2, top);
                    top += 40;
                }

                context.textAlign = originalTextAlign;
            }
        };

        this.duration = {
            draw: context => {
                if (!this.game.currentMission.getRequiredDuration) return;

                let durationLeft = this.game.currentMission.getRequiredDuration() - this.game.currentMission.getMissionDuration();
                if (durationLeft < 0) durationLeft = 0;
                const msg = durationLeft.toFixed();

                const originalTextAlign = context.textAlign;
                context.textAlign = 'end';
                context.font = "60px  'Courier New', Courier, monospace";
                context.fillStyle = 'rgba(240,240,240,0.3)';
                context.fillText(msg, this.game.width - 20, this.game.height - 20);
                context.textAlign = originalTextAlign;
            }
        };

        return new CombinedDrawItem([
            ...shipStatuses,
            this.messages,
            this.duration,
        ]);
    }

    getDrawItem() {
        return this.getItems();
    }
}

class MissionDescription {
    constructor(game) {
        this.descriptionItem = {
            draw: context => {
                if (!this.descriptionLines) return;

                const originalTextAlign = context.textAlign;
                context.textAlign = 'start';
                context.fillStyle = 'rgba(240,240,240,0.5)';

                const headerTop = game.height - 50 - 30 * this.descriptionLines.length;
                context.font = "28px  'Courier New', Courier, monospace";
                context.fillText('MISSION GOAL', 20, headerTop);

                context.font = "22px  'Courier New', Courier, monospace";
                let lineNum = 0
                for (let m of this.descriptionLines) {
                    const top = game.height - 20 - 30 * (this.descriptionLines.length - lineNum);
                    context.fillText(m, 20, top);
                    lineNum += 1;
                }

                context.textAlign = originalTextAlign;
            }
        };

        this.drawItem = new CombinedDrawItem([
            this.descriptionItem,
        ]);
    }

    getDrawItem() {
        return this.drawItem;
    }

    show(descriptionLines) {
        this.descriptionLines = descriptionLines;
    }

    hide() {
        this.descriptionLines = null
    }
}

class ControlsInfo {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    draw(context) {
        context.fillStyle = '#aaa';

        const textLeft = this.width / 2 - 130;
        context.fillText("Keyboard controls:", textLeft, this.height / 2 - 9 + 45);

        context.font = "16px 'Courier New', Courier, monospace";
        context.fillText("Arrow " + String.fromCharCode(8593) + "  - move", textLeft, this.height / 2 - 9 + 70);
        context.fillText("Arrow " + String.fromCharCode(8592) + "  - rotate left", textLeft, this.height / 2 - 9 + 90);
        context.fillText("Arrow " + String.fromCharCode(8594) + "  - rotate right", textLeft, this.height / 2 - 9 + 110);
        context.fillText("Arrow " + String.fromCharCode(8595) + "  - dock / undock", textLeft, this.height / 2 - 9 + 130);
        context.fillText("Key X    - shoot", textLeft, this.height / 2 - 9 + 150);
        context.fillText("Key Z    - launch missile", textLeft, this.height / 2 - 9 + 170);
        context.fillText("ENTER    - pause", textLeft, this.height / 2 - 9 + 190);
        context.fillText("ESCAPE   - reset", textLeft, this.height / 2 - 9 + 210);
    }
}

// Screens

class SplashScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#0E0855');
        this.controlsInfo = new ControlsInfo(width, height);
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

            this.controlsInfo.draw(context);
        }
    }
}

class PauseScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#000');
        this.controlsInfo = new ControlsInfo(width, height);
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

        this.controlsInfo.draw(context);
    }
}

class GameOverScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#900');
        this.controlsInfo = new ControlsInfo(width, height);
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

        this.controlsInfo.draw(context);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('gameover');
        this.sound.play();
    }
}

class VictoryScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#090');
        this.controlsInfo = new ControlsInfo(width, height);
        this.sound = null;
    }

    draw(context) {
        context.globalAlpha = 0.5;
        this.background.draw(context);
        context.globalAlpha = 1;

        const originalTextAlign = context.textAlign;
        context.textAlign = 'center';
        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("MISSION ACCOMPLISHED", this.width / 2, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER start next mission", this.width / 2, this.height / 2 - 9);
        context.textAlign = originalTextAlign;

        this.controlsInfo.draw(context);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('victory');
        this.sound.play();
    }
}

class CampaignFinishedScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#0F5D06');
        this.controlsInfo = new ControlsInfo(width, height);
        this.sound = null;
    }

    draw(context) {
        this.background.draw(context);

        const originalTextAlign = context.textAlign;
        context.textAlign = 'center';
        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("CAMPAING FINISHED", this.width / 2, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER restart", this.width / 2, this.height / 2 - 9);
        context.textAlign = originalTextAlign;

        this.controlsInfo.draw(context);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('victory');
        this.sound.play();
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
            'victory',
            'gameover',
            'explosion',
            'shot',
            'missile',
            'jet',
            'music',
            'dock',
            'undock',
            'pickUp',
            'pickAmmo',
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
            'shipFire',
            'bullet',
            'asteroid',
            'explosion',
            'station',
            'missile',
            'missileFire',
            'beacon',
            'supplyPackage',
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

class UserControls {
    constructor(keys) {
        this.state = {
            MOVE: false,
            LEFT: false,
            RIGHT: false,
            SHOOT: false,
            LAUNCH: false,
            DOCK: false,
        };

        this.setup(keys);
        this.onKeyDownHandler = this._onKeyDown.bind(this);
        this.onKeyUpHandler = this._onKeyUp.bind(this);
        this._init();
    }

    _onKeyDown(event) {
        const key = event.code;
        const action = this.keyToActionMap[key];
        if (action) this.state[action] = true;
    }

    _onKeyUp(event) {
        const key = event.code;
        const action = this.keyToActionMap[key];
        if (action) this.state[action] = false;
    }

    _init() {
        this.dispose();
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
    }

    setup(keys) {
        const actionToKeyMap = keys || {
            MOVE: 'ArrowUp',
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            SHOOT: 'ControlLeft',
            LAUNCH: 'ShiftLeft',
            DOCK: 'KeyZ',
        };
        this.keyToActionMap = {};
        Object.keys(actionToKeyMap).forEach(action => {
            const key = actionToKeyMap[action];
            this.keyToActionMap[key] = action;
        });
    }

    dispose() {
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }
}

class RenderEngine {
    constructor(viewportWidth, viewportHeight, figures, userInterfaceItems) {
        this.figures = figures;
        this.width = viewportWidth;
        this.height = viewportHeight;
        this.userInterfaceItems = userInterfaceItems;

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

    drawVictoryScreen() {
        const screen = new VictoryScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawCampaignFinishedScreen() {
        const screen = new CampaignFinishedScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawFrame() {
        for (let f of this.figures.get()) {
            if (f.getDrawItem) {
                f.getDrawItem().draw(this.context);
            }
        }
        if (this.userInterfaceItems) {
            this.userInterfaceItems.forEach(ui => ui.getDrawItem().draw(this.context));
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
        this.context.font = "14px 'Courier New', Courier, monospace";
        this.context.fillText("fps: " + this.fps.toFixed(1), this.width - 80, 20);
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

    checkShipAsteriodCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let ship of ships) {
            for (let a of asteroids) {
                if (!a.getGameObject().getIsDestroyed()) {
                    const isCollision = this.checkCollision(ship, a);
                    if (isCollision) {
                        const wrecklesA = a.hit();
                        if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                        const wrecklesS = ship.hit(a.getDamage());
                        if (wrecklesS && wrecklesS.length) wreckles.push(...wrecklesS);
                    }
                }
            }
        }
        return wreckles;
    }

    checkBulletAsteroidCollisions() {
        const bullets = this.figures.get().filter(f => f instanceof Bullet && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let asteroid of asteroids) {
            for (let bullet of bullets) {
                const isCollision = this.checkCollision(bullet, asteroid);
                if (isCollision) {
                    bullet.blowUp();
                    const wrecklesA = asteroid.hit(1);
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                }
            }
        }

        return wreckles;
    }

    checkMissileAsteroidCollisions() {
        const missiles = this.figures.get().filter(f => f instanceof Missile && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let asteroid of asteroids) {
            for (let missile of missiles) {
                const isCollision = this.checkCollision(missile, asteroid);
                if (isCollision) {
                    missile.blowUp();
                    const wrecklesA = asteroid.hit(100);
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                }
            }
        }

        return wreckles;
    }

    checkStationAsteroidCollisions() {
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let asteroid of asteroids) {
            for (let station of stations) {
                const isCollision = this.checkCollision(station, asteroid);
                if (isCollision) {
                    const wrecklesA = asteroid.hit();
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                    const wrecklesS = station.hit(asteroid.getDamage());
                    if (wrecklesS && wrecklesS.length) wreckles.push(...wrecklesS);
                }
            }
        }
        return wreckles;
    }

    checkShipBeaconCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const beacons = this.figures.get().filter(f => f instanceof Beacon && !f.getGameObject().getIsDestroyed());

        for (let ship of ships) {
            for (let b of beacons) {
                if (!b.getGameObject().getIsDestroyed()) {
                    const isCollision = this.checkCollision(ship, b);
                    if (isCollision) {
                        ship.gatherBeacon(b);
                    }
                }
            }
        }
    }

    checkCanDock(ship) {
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());

        for (let s of stations) {
            if (s.checkCanDock(ship)) {
                return s;
            }
        }
        return null;
    }

    checkShipStationCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());

        for (let station of stations) {
            let stationCanDoc = false;
            for (let ship of ships) {
                const shipCanDock = station.checkCanDock(ship);
                stationCanDoc = stationCanDoc || shipCanDock;
            }
            station.showCanDock(stationCanDoc);
        }
    }

    checkShipSupplyPackageCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const packages = this.figures.get().filter(f => f instanceof SupplyPackage && !f.getGameObject().getIsDestroyed());

        for (let ship of ships) {
            for (let pack of packages) {
                const isCollision = this.checkCollision(ship, pack);
                if (isCollision) {
                    ship.pickSupplyPackage(pack);
                }
            }
        }
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

    checkAllCollisions() {
        const newFigures1 = this.checkBulletAsteroidCollisions();
        const newFigures2 = this.checkMissileAsteroidCollisions();
        const newFigures3 = this.checkStationAsteroidCollisions();
        const newFigures4 = this.checkShipAsteriodCollisions();
        this.checkShipBeaconCollisions();
        this.checkShipStationCollisions();
        this.checkShipSupplyPackageCollisions();
        return [
            ...newFigures1,
            ...newFigures2,
            ...newFigures3,
            ...newFigures4,
        ];
    }
}

class PlayerManager {
    constructor() {
        this.count = 2;

        this.singlePlayer = {
            name: 'Player 1',
            keys: {
                MOVE: 'ArrowUp',
                LEFT: 'ArrowLeft',
                RIGHT: 'ArrowRight',
                DOCK: 'ArrowDown',
                SHOOT: 'KeyX',
                LAUNCH: 'KeyZ',
            }
        };

        this.player1 = {
            name: 'Player 1',
            keys: {
                MOVE: 'ArrowUp',
                LEFT: 'ArrowLeft',
                RIGHT: 'ArrowRight',
                DOCK: 'ArrowDown',
                SHOOT: 'KeyM',
                LAUNCH: 'KeyN',
            }
        };

        this.player2 = {
            name: 'Player 2',
            keys: {
                MOVE: 'KeyW',
                LEFT: 'KeyA',
                RIGHT: 'KeyD',
                DOCK: 'KeyS',
                SHOOT: 'KeyX',
                LAUNCH: 'KeyZ',

            }
        };

        this.setOnePlayer();
    }

    setOnePlayer() {
        this.players = [this.singlePlayer];
    }

    setTwoPlayers() {
        this.players = [this.player1, this.player2];
    }

    getPlayers() {
        return this.players;
    }
}

// Objects

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
        this.shotAt = null;
        this.shotSound = null;

        this.missilesPerSecond = 1; // Скорострельность: 1 ракета в секунду
        this.missileLaunchedAt = null;
        this.missileSound = null;
        this.maxMissiles = 5;
        this.missileCount = 5;

        this.maxHealth = 100;
        this.health = 100;
        this.maxAmmo = 30;
        this.ammo = 30;
        this.pickAmmoSound = null;

        this.isDockingInProgress = false;
        this.dockedStation = null;

        this.beaconCount = 0;
        this.pickUpSound = null;

        this.gameObject = new GameObject(x, y, this.width, this.height, angle, 0, 0);
        this.drawItemShip = new Sprite(imageManager.get('ship'), this.width, this.height, this.gameObject);
        this.drawItemShipFireLeft = new Sprite(imageManager.get('shipFire'), 10, 5, this.gameObject, -30, -19);
        this.drawItemShipFireRight = new Sprite(imageManager.get('shipFire'), 10, 5, this.gameObject, -30, 19);
        this.drawItem = new CombinedDrawItem([
            this.drawItemShip,
        ]);

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

    shoot() {
        if (this.getGameObject().getIsDestroyed()) return;
        if (this.ammo <= 0) return null;
        const now = new Date().getTime();
        const timeout = 1000 / this.shootsPerSecond;
        if (this.shotAt == null || this.shotAt + timeout < now) {
            this.shotAt = now;

            if (!this.shotSound) this.shotSound = soundManager.get('shot');
            this.shotSound.play(0.1);

            this.ammo -= 1;
            return new Bullet(this.gameObject.x, this.gameObject.y, this.gameObject.angle + this.gameObject.spinAngle);
        } else {
            return null;
        }
    }

    launchMissile() {
        if (this.getGameObject().getIsDestroyed()) return;
        if (this.missileCount <= 0) return null;
        const now = new Date().getTime();
        const timeout = 1000 / this.missilesPerSecond;
        if (this.missileLaunchedAt == null || this.missileLaunchedAt + timeout < now) {
            this.missileLaunchedAt = now;
            this.missileCount -= 1;
            return new Missile(this.gameObject.x, this.gameObject.y, this.gameObject.angle + this.gameObject.spinAngle);
        } else {
            return null;
        }
    }

    turnEngineOn() {
        if (this.getGameObject().getIsDestroyed()) return;
        if (!this.isEngineOn && !this.isDockedToStation()) {
            this.isEngineOn = true;
            this.accelerationTurnedOnAt = new Date().getTime();
            this.acceleration = this.maxAcceleration;
            this.engineSound = soundManager.get('jet'); // New each time. This sound is looped it has to be stopped on engine off
            this.engineSound.play(2, true, true);
            this.drawItem.drawItems = [
                this.drawItemShip,
                this.drawItemShipFireLeft,
                this.drawItemShipFireRight,
            ];
        }
    }

    turnEngineOff() {
        if (this.getGameObject().getIsDestroyed()) return;
        if (this.isEngineOn) {
            this.isEngineOn = false;
            this.accelerationTurnedOnAt = new Date().getTime();
            this.acceleration = -this.maxAcceleration;
            if (this.engineSound) this.engineSound.stop();
            this.drawItem.drawItems = [
                this.drawItemShip,
            ];
        }
    }

    turnRotationLeftOn() {
        if (this.getGameObject().getIsDestroyed()) return;
        this.getGameObject().rotateSpeed = -this.maxRotateSpeed;
    }

    turnRotationRightOn() {
        if (this.getGameObject().getIsDestroyed()) return;
        this.getGameObject().rotateSpeed = this.maxRotateSpeed;
    }

    turnRotationOff() {
        if (this.getGameObject().getIsDestroyed()) return;
        this.getGameObject().rotateSpeed = 0;
    }

    isDockingIsProgress() {
        return this.isDockingInProgress;
    }

    isDockedToStation() {
        return this.dockedStation != null;
    }

    dockToStation(station) {
        if (this.getGameObject().getIsDestroyed()) return;
        if (station != null && !this.isDockedToStation() && !this.isDockingIsProgress()) {
            this.dockedStation = station;
            station.dockShip(this);

            this.getGameObject().speed = 0;
            this.getGameObject().spinSpeed = station.getGameObject().spinSpeed;
            this.getGameObject().x = station.getGameObject().x;
            this.getGameObject().y = station.getGameObject().y;

            this.isDockingInProgress = true;
            setTimeout(() => {
                this.isDockingInProgress = false;
            }, 2000);
        }
    }

    undockFromStation() {
        if (this.getGameObject().getIsDestroyed()) return;
        if (this.isDockedToStation() && !this.isDockingIsProgress()) {
            this.dockedStation.undockShip();
            this.dockedStation = null;

            const go = this.getGameObject();
            go.angle += go.spinAngle;
            go.spinAngle = 0;
            go.spinSpeed = 0;

            this.isDockingInProgress = true;
            setTimeout(() => {
                this.isDockingInProgress = false;
            }, 2000);
        }
    }

    gatherBeacon(beacon) {
        if (this.getGameObject().getIsDestroyed()) return;
        this.beaconCount += 1;
        beacon.getGameObject().destroy();

        if (!this.pickUpSound) this.pickUpSound = soundManager.get('pickUp');
        this.pickUpSound.play(0.4);
    }

    pickSupplyPackage(pack) {
        if (this.ammo < this.maxAmmo) {
            const requiredAmmo = this.maxAmmo - this.ammo;
            const packAmmo = pack.getAmmo();
            const ammoToLoad = packAmmo < requiredAmmo ? packAmmo : requiredAmmo;
            this.ammo += ammoToLoad;
            pack.gameObject.destroy();
            if (!this.pickAmmoSound) this.pickAmmoSound = soundManager.get('pickAmmo');
            this.pickAmmoSound.play();
        }
    }

    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.getGameObject().destroy();
            this.dispose();
            return []; // TODO: return explosion
        }
        return [];
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.width = 10;
        this.height = 10;
        this.speed = 100;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, true);
        this.drawItem = new Sprite(imageManager.get('bullet'), this.width, this.height, this.gameObject);
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

class Missile {
    constructor(x, y, angle) {
        this.width = 10;
        this.height = 10;
        this.speed = 55;
        this.rotateSpeed = 0.2; // Скорость разворота: 0.2 оборота в секунду
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, true);

        this.drawItemMissile = new Sprite(imageManager.get('missile'), 30, 10, this.gameObject);
        this.drawItemMissileFire = new Sprite(imageManager.get('missileFire'), 10, 5, this.gameObject, -20, 0);
        this.drawItem = new CombinedDrawItem([
            this.drawItemMissile,
            this.drawItemMissileFire,
        ]);

        this.missileSound = soundManager.get('missile'); // New each time. This sound is looped it has to be stopped on destroy
        this.missileSound.play(0.5, true, true);

        this.gameObject.destroy = () => {
            this.gameObject.isDestroyed = true;
            this.missileSound.stop();
        }
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
        this.drawItemSprite = new Sprite(imageManager.get('asteroid'), this.width, this.height, this.gameObject);
        this.drawItemDamage = {
            draw: context => {
                const originalTextAlign = context.textAlign;
                context.textAlign = 'center';
                context.fillStyle = '#888';
                context.font = "10px  'Courier New', Courier, monospace";
                context.fillText(this.getDamage(), this.gameObject.x, this.gameObject.y - radius - 3);
                context.textAlign = originalTextAlign;
            }
        };
        this.drawItem = new CombinedDrawItem([
            this.drawItemSprite,
            this.drawItemDamage,
        ]);
        this.explosionSound = null;
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    hit(damage) {
        this.getGameObject().destroy();

        if (!this.explosionSound) this.explosionSound = soundManager.get('explosion');
        this.explosionSound.play();

        const wreckles = [];

        const x = this.getGameObject().x;
        const y = this.getGameObject().y;
        wreckles.push(new Explosion(x, y, this.radius * 2));

        if (damage < 100 && this.radius > 20) {
            const wreckleRadius = this.radius / 2;
            const wreckleSpeed = this.speed * 1.5;

            const spinSpeed = this.getGameObject().spinSpeed * 2;

            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed, spinSpeed));
            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed, spinSpeed));
            wreckles.push(new Asteroid(x, y, Math.random() * 360 * Math.PI / 180, wreckleRadius, wreckleSpeed, spinSpeed));
        }

        return wreckles;
    }

    getDamage() {
        const damage = Math.round(this.radius * this.radius * this.radius / 100);
        return damage || 1;
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
        this.drawItem = new AnimatedSprite(imageManager.get(this.imgSrc), radius * 2, radius * 2, this.width, this.height, this.gameObject, this.numFramesX, this.numFramesY, false, () => {
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
        this.radius = 120;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.gameObject = new GameObject(x, y, this.width, this.height, 0, 0, 0, false, 0.01);
        this.drawItemStation = new Sprite(imageManager.get('station'), this.width, this.height, this.gameObject);
        this.drawItemRing = new Ring(30, '#0f0', this.gameObject);
        this.drawItemHealth = {
            draw: context => {
                const originalTextAlign = context.textAlign;
                context.textAlign = 'center';
                context.fillStyle = '#888';
                context.font = "10px  'Courier New', Courier, monospace";
                context.fillText(`${this.health} / ${this.maxHealth}`, this.gameObject.x, this.gameObject.y - this.radius - 3);
                context.textAlign = originalTextAlign;
            }
        };
        this.drawItem = new CombinedDrawItem([
            this.drawItemStation,
            this.drawItemHealth,
        ]);

        this.dockedShip = null;
        this.dockSound = null;
        this.undockSound = null;

        this.maxHealth = 1000;
        this.health = 1000;

        this.ammoLoadsPerSecond = 2;
        this.ammoLoadedAt = null;

        this.missileLoadsPerSecond = 0.25;
        this.missileLoadedAt = null;
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    showCanDock(canDock) {
        if (canDock) {
            this.drawItem.drawItems = [this.drawItemStation, this.drawItemHealth, this.drawItemRing];
        } else {
            this.drawItem.drawItems = [this.drawItemStation, this.drawItemHealth];
        }
    }

    checkCanDock(ship) {
        if (this.dockedShip != null) {
            return false;
        }

        const shipPos = ship.getGameObject();
        const stationPos = this.getGameObject();

        const dx = shipPos.x - stationPos.x;
        const dy = shipPos.y - stationPos.y;
        const dockRadius = 30;

        const canDock = dx * dx + dy * dy <= dockRadius * dockRadius;

        return canDock;
    }

    dockShip(ship) {
        if (!this.dockedShip) {
            this.dockedShip = ship;
            this.playDockSound();
        }
    }

    undockShip() {
        if (this.dockedShip) {
            this.dockedShip = null;
            this.playUnockSound();
        }
    }

    playDockSound() {
        if (!this.dockSound) this.dockSound = soundManager.get('dock');
        this.dockSound.play();
    }

    playUnockSound() {
        if (!this.undockSound) this.undockSound = soundManager.get('undock');
        this.undockSound.play();
    }

    hit(damage) {
        if (this.getGameObject().getIsDestroyed()) return;
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.getGameObject().destroy();

            if (!this.explosionSound) this.explosionSound = soundManager.get('explosion');
            this.explosionSound.play();

            const wreckles = [];

            const x = this.getGameObject().x;
            const y = this.getGameObject().y;
            wreckles.push(new Explosion(x, y, this.radius * 2));

            this.undockShip();

            return wreckles;
        } else {
            return []
        }
    }

    loadAmmo() {
        if (this.dockedShip) {
            const now = new Date().getTime();
            if (this.ammoLoadedAt == null) {
                this.ammoLoadedAt = now;
            } else {
                const timeout = 1000 / this.ammoLoadsPerSecond;
                const timeToLoad = this.ammoLoadedAt + timeout < now;
                if (this.dockedShip.ammo < this.dockedShip.maxAmmo && timeToLoad) {
                    this.ammoLoadedAt = now;
                    this.dockedShip.ammo += 1;
                }
            }
        }
    }

    loadMissile() {
        if (this.dockedShip) {
            const now = new Date().getTime();
            if (this.missileLoadedAt == null) {
                this.missileLoadedAt = now;
            } else {
                const timeout = 1000 / this.missileLoadsPerSecond;
                const timeToLoad = this.missileLoadedAt + timeout < now;
                if (this.dockedShip.missileCount < this.dockedShip.maxMissiles && timeToLoad) {
                    this.missileLoadedAt = now;
                    this.dockedShip.missileCount += 1;
                }
            }
        }
    }

    tick() {
        this.loadAmmo();
        this.loadMissile();
    }
}

class Beacon {
    constructor(x, y, angle, speed) {
        this.radius = 15;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.speed = speed;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, false);

        const startFrameNumber = Math.round(Math.random() * 100);
        this.drawItemSprite = new AnimatedSprite(imageManager.get('beacon'), this.radius * 2, this.radius * 2, 30, 30, this.gameObject, 10, 10, true, null, 0, 0, startFrameNumber);
        this.drawItem = new CombinedDrawItem([
            this.drawItemSprite,
        ]);
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }
}

class SupplyPackage {
    constructor(x, y, angle, speed) {
        this.radius = 20;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.speed = speed;
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, false);

        const startFrameNumber = Math.round(Math.random() * 100);
        this.drawItemSprite = new AnimatedSprite(imageManager.get('supplyPackage'), this.radius * 2, this.radius * 2, 50, 50, this.gameObject, 250, 1, true, null, 0, 0, startFrameNumber);
        this.drawItemAmmo = {
            draw: context => {
                const originalTextAlign = context.textAlign;
                context.textAlign = 'center';
                context.fillStyle = '#888';
                context.font = "10px  'Courier New', Courier, monospace";
                context.fillText(this.getAmmo(), this.gameObject.x, this.gameObject.y - this.radius - 3);
                context.textAlign = originalTextAlign;
            }
        };
        this.drawItem = new CombinedDrawItem([
            this.drawItemSprite,
            this.drawItemAmmo,
        ]);

        this.ammo = 10;
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    getAmmo() {
        return this.ammo;
    }
}

// Game

class Campaign {
    constructor() {
        this.missions = [{
            name: 'Mission 1',
            create: game => new Mission1(game)
        }, {
            name: 'Mission 2',
            create: game => new Mission2(game)
        }, {
            name: 'Mission 3',
            create: game => new Mission3(game)
        }];
    }

    getMissions() {
        return this.missions;
    }
}

class Mission1 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 5;

        this.objects = this._generate();
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0);

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            const asteroids = this.game.figures.get().filter(obj => obj instanceof Asteroid && !obj.getGameObject().getIsDestroyed());
            if (asteroids.length === 0) {
                this.status = 'succeeded'
            }
        }

        return this.status;
    }

    interrupt() {
        this.status = 'interrupted'
    }

    isInProgress() {
        return this.status === 'inProgress';
    }

    isSucceeded() {
        return this.status === 'succeeded';
    }

    isFailed() {
        return this.status === 'failed';
    }

    isInterrupted() {
        return this.status === 'interrupted';
    }

    getDescription() {
        return [
            'You mission is to destroy all the asteroids'
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        return this.missionGenerator.generateAsteroids(this.numOfAsteroids);
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}

class Mission2 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 5;
        this.numOfBeacons = 3;

        this.objects = this._generate();
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0);

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            const numOfBeaconsGathered = allShips.map(ship => ship.beaconCount).reduce((a, b) => a + b);
            if (numOfBeaconsGathered === this.numOfBeacons) {
                this.status = 'succeeded'
            }
        }

        return this.status;
    }

    interrupt() {
        this.status = 'interrupted'
    }

    isInProgress() {
        return this.status === 'inProgress';
    }

    isSucceeded() {
        return this.status === 'succeeded';
    }

    isFailed() {
        return this.status === 'failed';
    }

    isInterrupted() {
        return this.status === 'interrupted';
    }

    getDescription() {
        return [
            'You mission is to gather all the beacons',
            'Asteroids can hit both you and station',
            'Protect the station - you can get ammo there',
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        const asteroids = this.missionGenerator.generateAsteroids(this.numOfAsteroids);
        const stations = this.missionGenerator.generateStations();
        const beacons = this.missionGenerator.generateBeacons(this.numOfBeacons);
        return [
            ...asteroids,
            ...stations,
            ...beacons,
        ];
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}

class Mission3 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 35;
        this.requiredDuration = 30;

        this.objects = this._generate();
        this.missionStartedAt = new Date().getTime();
        this.pauseDuration = 0;
        this.missionPausedAt = null;
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0);

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            const missionDuration = this.getMissionDuration();
            if (missionDuration >= this.getRequiredDuration()) {
                this.status = 'succeeded';
            }
        }

        return this.status;
    }

    interrupt() {
        this.status = 'interrupted'
    }

    isInProgress() {
        return this.status === 'inProgress';
    }

    isSucceeded() {
        return this.status === 'succeeded';
    }

    isFailed() {
        return this.status === 'failed';
    }

    isInterrupted() {
        return this.status === 'interrupted';
    }

    getDescription() {
        return [
            `You must survive for ${this.getRequiredDuration()} seconds`
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        return this.missionGenerator.generateAsteroids(this.numOfAsteroids, 10, 20, 10, 25);
    }

    pause() {
        if (!this.missionPausedAt) {
            this.missionPausedAt = new Date().getTime();
        }
    }

    resume() {
        if (this.missionPausedAt) {
            this.pauseDuration += new Date().getTime() - this.missionPausedAt;
            this.missionPausedAt = null;
        }
    }

    getRequiredDuration() {
        return this.requiredDuration;
    }

    getMissionDuration() {
        return (new Date().getTime() - this.missionStartedAt - this.pauseDuration) / 1000;
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}

class MissionGenerator {
    constructor(game) {
        this.game = game;
        this.packageSuppiedAt = null;
        this.supplyDelay = 10; // 10 seconds between supplies
    }

    generateAsteroids(asteroidsCount, minR, maxR, minS, maxS) {
        const asteroids = [];
        const minRadius = minR || 20;
        const maxRadius = maxR || 70;
        const minSpeed = minS || 1;
        const maxSpeed = maxS || 20;
        const maxSpin = 0.5;
        for (let i = 0; i < asteroidsCount; ++i) {
            const rand = Math.random();
            const radius = Math.trunc(rand * (maxRadius - minRadius) + minRadius);
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;
            const pos = this._getRandomStartPosition();
            const angle = Math.random() * 360 * Math.PI / 180;
            const spinSpeed = ((1 - rand) * maxSpin * 2) - maxSpin;

            const a = new Asteroid(pos.x, pos.y, angle, radius, speed, spinSpeed);
            asteroids.push(a);
        }
        return asteroids;
    }

    generatePackages(packageCount) {
        const packages = [];
        const minSpeed = 1;
        const maxSpeed = 5;
        for (let i = 0; i < packageCount; ++i) {
            const rand = Math.random();
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;
            const pos = this._getRandomStartPosition();
            const angle = Math.random() * 360 * Math.PI / 180;

            const p = new SupplyPackage(pos.x, pos.y, angle, speed);
            packages.push(p);
        }
        return packages;
    }

    generateBeacons(totalBeaconCount) {
        const beacons = [];
        const minSpeed = 1;
        const maxSpeed = 20;
        for (let i = 0; i < totalBeaconCount; ++i) {
            const rand = Math.random();
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;
            const pos = this._getRandomStartPosition();
            const angle = Math.random() * 360 * Math.PI / 180;

            const b = new Beacon(pos.x, pos.y, angle, speed);
            beacons.push(b);
        }
        return beacons;
    }

    generateStations() {
        const width = this.game.width,
            height = this.game.height;
        const stations = [];

        const x = width / 2;
        const y = height / 2;
        const s = new Station(x, y);
        stations.push(s);

        return stations;
    }

    supplyPackagesIfRequired() {
        const playersWithoutAmmo = this.game.players.map(p => p.getShip()).filter(ship => ship.ammo <= 0 && ship.maxAmmo);
        const packages = this.game.figures.get().filter(f => f instanceof SupplyPackage && !f.gameObject.getIsDestroyed());
        const stations = this.game.figures.get().filter(f => f instanceof Station && !f.gameObject.getIsDestroyed());
        if (playersWithoutAmmo.length > 0 && packages.length === 0 && stations.length == 0) {
            const now = new Date().getTime();
            const timeToSupply = this.packageSuppiedAt == null || this.packageSuppiedAt + this.supplyDelay * 1000 < now;
            if (timeToSupply) {
                const packages = this.generatePackages(3);
                packages.forEach(p => this.game.addFigure(p));
            }
        }
    }

    _getRandomStartPosition() {
        const width = this.game.width,
            height = this.game.height;
        const linearPos = Math.trunc((width + height) * 2 * Math.random());

        let x, y;
        if (linearPos < width) {
            x = linearPos;
            y = 0;
        } else if (linearPos < width + height) {
            x = width;
            y = linearPos - width;
        } else if (linearPos < width * 2 + height) {
            x = linearPos - width - height;
            y = height;
        } else {
            x = 0;
            y = linearPos - width * 2 - height;
        }

        return {
            x,
            y
        }
    }
}

class Player {
    constructor(name, keys) {
        this.name = name;
        this.userControls = new UserControls(keys);
        this.ship = null;
    }

    getName() {
        return this.name;
    }

    getUserControls() {
        return this.userControls;
    }

    getShip() {
        return this.ship;
    }

    setShip(ship) {
        this.ship = ship;
    }
}

class Game {
    constructor(imageManager, soundManager, w, h) {
        this.intervalHandle = null;
        this.calcFrequency = 60; // 60 раз в секунду

        this.players = [];

        this.figures = new Figures();

        this.width = w || 1024;
        this.height = h || 768;
        this.playerManager = new PlayerManager();
        this.statusPanel = new StatusPanel(this);
        this.missionDescription = new MissionDescription(this);
        this.renderEngine = new RenderEngine(this.width, this.height, this.figures, [
            this.statusPanel,
            this.missionDescription,
        ]);
        this.physicsEngine = new PhysicsEngine(this.width, this.height, this.figures);
        this.collisionEngine = new CollisionEngine(this.figures);

        this.musicSound = null;

        this.campaign = new Campaign();
        this.nextMissionNumber = 0;
        this.currentMission = null;

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
        this.renderEngine.drawSplashScreen(false);
    }

    //-------------------------------------------------------------------------
    // GAME MENU
    configureKeys() {
        document.addEventListener("keypress", function (event) {
            if (event.code === 'Enter') {
                if (!this.intervalHandle) {
                    this.start();
                } else {
                    this.pause();
                }
            }
        }.bind(this));

        document.addEventListener("keyup", function (event) {
            if (event.code === 'Escape') {
                this.stop();
            }
        }.bind(this));
    }

    start() {
        if (this.currentMission !== null && this.currentMission.isInProgress()) {
            this.startPerforming();
            if (this.currentMission.resume) this.currentMission.resume();
        } else {
            this.startMission();
        }
    }

    pause() {
        this.stopPerforming();
        this.renderEngine.drawFrame();
        this.renderEngine.drawPauseScreen();
        if (this.currentMission.pause) this.currentMission.pause();
    }

    stop() {
        this.stopMission();
        this.nextMissionNumber = 0;
        this.renderEngine.drawFrame();
        this.renderEngine.drawSplashScreen();
    }

    //-------------------------------------------------------------------------
    addFigure(f) {
        this.figures.add(f);
    }

    processUserControl(ship, userControls) {
        if (ship.getGameObject().getIsDestroyed()) return;
        const k = userControls.state;

        // Rotate
        if (k.LEFT && !k.RIGHT) {
            ship.turnRotationLeftOn();
        } else if (!k.LEFT && k.RIGHT) {
            ship.turnRotationRightOn();
        } else {
            ship.turnRotationOff();
        }

        // Move
        if (k.MOVE) {
            ship.turnEngineOn();
        } else {
            ship.turnEngineOff();
        }

        // Shoot
        if (k.SHOOT) {
            const bullet = ship.shoot();
            if (bullet) {
                this.addFigure(bullet);
            }
        }

        // Launch missile
        if (k.LAUNCH) {
            const missile = ship.launchMissile();
            if (missile) {
                this.addFigure(missile);
            }
        }

        // Dock to station
        if (k.DOCK && !ship.isDockingIsProgress()) {
            if (ship.isDockedToStation()) {
                ship.undockFromStation();
            } else {
                const stationToDock = this.collisionEngine.checkCanDock(ship);
                if (stationToDock) {
                    ship.dockToStation(stationToDock);
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    // PERFORMING
    performAll() {
        this.players.forEach(player => {
            this.processUserControl(player.getShip(), player.getUserControls());
        });
        this.physicsEngine.moveAll();
        this.renderEngine.drawFrame();

        const newFigures = this.collisionEngine.checkAllCollisions();
        for (let f of newFigures) {
            this.addFigure(f);
        }

        // Remove all destroyed objects
        const figuresWithoutDestroyed = this.figures.get().filter(f => !f.getGameObject || !f.getGameObject().getIsDestroyed());
        this.figures.set(figuresWithoutDestroyed);

        this.checkGameResult();

        this.figures.get().filter(f => f.tick).forEach(f => f.tick());
        if (this.currentMission.tick) this.currentMission.tick();
    }

    startPerforming() {
        if (!this.intervalHandle) {
            this.physicsEngine.reset();
            this.intervalHandle = setInterval(() => this.performAll(), 1000 / this.calcFrequency);
        }
    }

    stopPerforming() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    //-------------------------------------------------------------------------
    // MISSION

    createPlayers() {
        const settings = this.playerManager.getPlayers();
        return settings.map(s => new Player(s.name, s.keys));
    }

    disposePlayers(players) {
        players.forEach(player => {
            player.getUserControls().dispose();
            const ship = player.getShip();
            if (ship) ship.dispose();
        });
    }

    startMission() {
        if (this.currentMission !== null && this.currentMission.isInProgress()) return;

        const mission = this.campaign.missions[this.nextMissionNumber];
        this.currentMission = mission.create(this);

        const background = new Background(this.width, this.height);
        const missionObjects = this.currentMission.getObjects();

        this.players = this.createPlayers();
        this.players.forEach(player => {
            const minX = this.width / 2 - 250;
            const maxX = this.width / 2 + 250;
            const minY = this.height / 2 - 100;
            const maxY = this.height / 2 + 100;

            const x = Math.round(Math.random() * (maxX - minX) + minX);
            const y = Math.round(Math.random() * (maxY - minY) + minY);

            const ship = new Ship(x, y, 0);
            player.setShip(ship);
        });

        // Order of adding figures is important to render properly
        this.figures.set([]);
        this.addFigure(background);
        missionObjects.forEach(o => this.addFigure(o));
        this.players.forEach(player => {
            this.addFigure(player.getShip());
        });

        this.physicsEngine.reset();
        this.startMusic();
        this.startPerforming();
        this.showMissionDescription();
    }

    stopMission() {
        if (this.currentMission == null) return;

        if (this.currentMission.isInProgress()) {
            this.currentMission.interrupt();
        }

        this.disposePlayers(this.players);

        this.stopMusic();
        this.stopPerforming();
    }

    showMissionDescription() {
        this.missionDescription.show(this.currentMission.getDescription());
        setTimeout(() => {
            this.missionDescription.hide();
        }, 3000);
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

        // Stop missile sound
        this.figures.get().forEach(f => {
            if (f instanceof Missile) {
                f.getGameObject().destroy();
            }
        });
    }

    //-------------------------------------------------------------------------
    // GAME RESULT
    checkGameResult() {
        const result = this.currentMission.checkResult();
        switch (result) {
            case 'succeeded': {
                this.win();
                break;
            }
            case 'failed': {
                this.loose();
                break;
            }
        }
    }

    loose() {
        this.stopMission();
        this.renderEngine.drawFrame();
        this.renderEngine.drawGameOverScreen();
    }

    win() {
        this.stopMission();
        this.renderEngine.drawFrame();
        this.nextMissionNumber += 1;
        if (this.campaign.missions.length === this.nextMissionNumber) {
            this.renderEngine.drawCampaignFinishedScreen();
            this.nextMissionNumber = 0;
        } else {
            this.renderEngine.drawVictoryScreen();
        }
    }
}

// Initialization

const w = window.innerWidth,
    h = window.innerHeight;
const imageManager = new ImageManager();
const soundManager = new SoundManager();
const game = new Game(imageManager, soundManager, w, h);