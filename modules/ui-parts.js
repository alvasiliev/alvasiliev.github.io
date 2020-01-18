import {
    Circle,
    Sprite,
    Rect,
    CombinedDrawItem,
} from './primitives.js'

import imageManager from './managers/imageManager.js';

export class Background {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        const background = new Rect(width, height, '#0a063a');
        const space = new Sprite(imageManager.get('space'), width, height, {
            x: width / 2,
            y: height / 2,
        });
        const clouds = this._generateClouds();
        const smallStars = this._generateSmallStars();
        const largeStars = this._generateLargeStars();

        this.drawItem = new CombinedDrawItem([
            background,
            space,
            ...clouds,
            ...smallStars,
            ...largeStars,
        ]);
    }

    _generateClouds() {
        const minW = 100,
            maxW = 950;
        const maxH = 600;
        const clouds = [];
        const cloudsCount = Math.trunc(this.width * this.height / 260000);

        for (let i = 0; i < cloudsCount; ++i) {
            const w = Math.round(Math.random() * (maxW - minW) + minW);
            const scale = w / maxW;
            const h = Math.round(maxH * scale);

            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            const cloud = new Sprite(imageManager.get('cloud'), w, h, {
                x,
                y,
            });
            clouds.push(cloud);
        }

        return clouds;
    }

    _generateSmallStars() {
        const width = this.width,
            height = this.height;
        const startsCount = Math.trunc(width * height / 15000);

        const stars = [];
        const minRadius = 1;
        const maxRadius = 3;

        for (let i = 0; i < startsCount; ++i) {
            const r = Math.round(Math.random() * (maxRadius - minRadius) + minRadius);
            const x = Math.round(Math.random() * width);
            const y = Math.round(Math.random() * height);

            const drawItem = new Circle(r, '#8380a9', {
                x,
                y,
            })

            stars.push(drawItem);
        }
        return stars;
    }

    _generateLargeStars() {
        const width = this.width,
            height = this.height;
        const startsCount = Math.trunc(width * height / 70000);

        const stars = [];
        const minRadius = 3;
        const maxRadius = 4;

        for (let i = 0; i < startsCount; ++i) {
            const r = Math.round(Math.random() * (maxRadius - minRadius) + minRadius);
            const x = Math.round(Math.random() * width);
            const y = Math.round(Math.random() * height);

            const drawItem = new Rect(r * 2, r * 2, '#c1bfd3', x, y, Math.PI / 4);

            stars.push(drawItem);
        }
        return stars;
    }

    getDrawItem() {
        return this.drawItem;
    }
}

export class StatusPanel {
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
                    } else if (this.game.players.length === 1) {
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
                if (!this.game.currentMission || !this.game.currentMission.getRequiredDuration) return;

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

export class MissionDescription {
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

export class ControlsInfo {
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