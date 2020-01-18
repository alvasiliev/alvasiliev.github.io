import imageManager from '../managers/imageManager.js';
import soundManager from '../managers/soundManager.js';

import {
    GameObject,
    Sprite,
    CombinedDrawItem,
} from '../primitives.js'

import Bullet from './Bullet.js';
import Missile from './Missile.js';

export default class Ship {
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