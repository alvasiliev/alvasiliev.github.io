import imageManager from '../managers/imageManager.js';
import soundManager from '../managers/soundManager.js';

import {
    GameObject,
    Sprite,
    Ring,
    CombinedDrawItem,
} from '../primitives.js'

import Explosion from './Explosion.js';

export default class Station {
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