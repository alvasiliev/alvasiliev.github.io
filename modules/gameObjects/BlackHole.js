import imageManager from '../managers/imageManager.js';

import {
    Sprite,
    Ring,
    GameObject,
    CombinedDrawItem,
    Circle,
} from '../primitives.js'
import Flash from './Flash.js';

export default class BlackHole {
    constructor(x, y, radius, spinSpeed) {
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.spinSpeed = spinSpeed;
        this.destroyRadius = this._calcDestroyRadius();

        this.gameObject = new GameObject(x, y, this.width, this.height, 0, 0, 0, false, spinSpeed);
        this.drawItemSprite = new Sprite(imageManager.get('blackHole'), this.width, this.height, this.gameObject);
        // this.drawItemDestroy = new Ring(this.destroyRadius, '#f00', this.gameObject);
        // this.drawItemRing = new Ring(radius, '#ff0', this.gameObject);
        this.drawItem = new CombinedDrawItem([
            this.drawItemSprite,
            // this.drawItemDestroy,
            // this.drawItemRing,
        ]);

        this.affectedAt = null;
        this.UNIT_SIZE = 10; // 10px
    }

    _calcDestroyRadius() {
        const origDestroyRadius = 50;
        const origHoleRadius = 250;
        return this.radius / origHoleRadius * origDestroyRadius;
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }

    affectGameObject(gameObject, timePassed) {
        const oX = gameObject.x,
            oY = gameObject.y;
        const bX = this.getGameObject().x,
            bY = this.getGameObject().y;

        const dx = bX - oX,
            dy = bY - oY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.destroyRadius) {
            gameObject.destroy();
            const oW = gameObject.width,
                oH = gameObject.height;
            const r = oW > oH ? oW : oH;
            const shadow = new Circle(distance, '#000', this.gameObject);
            return new Flash(oX, oY, r * 3, shadow);
        }

        // calc moving to center
        const sinA = dy / distance,
            cosA = dx / distance;

        const speed = 1000 / distance;
        const speedX = speed * cosA,
            speedY = speed * sinA;

        const pathX = this.UNIT_SIZE * speedX * (timePassed / 1000);
        if (pathX) gameObject.x += pathX;

        const pathY = this.UNIT_SIZE * speedY * (timePassed / 1000);
        if (pathY) gameObject.y += pathY;

        // calc mooving around
        const sinR = cosA,
            cosR = -sinA;
        const speedR = -speed * (this.spinSpeed * 2 * Math.PI) * 2000;
        const speedRx = speedR * cosR,
            speedRy = speedR * sinR;

        const pathRx = speedRx * (timePassed / 1000);
        if (pathRx) gameObject.x += pathRx;

        const pathRy = speedRy * (timePassed / 1000);
        if (pathRy) gameObject.y += pathRy;
        return null;
    }

    affect(objects) {
        const now = new Date().getTime();
        const timePassed = this.affectedAt ? now - this.affectedAt : 0;
        this.affectedAt = now;
        const flashes = [];
        if (!timePassed) return flashes;


        for (let f of objects) {
            const flash = this.affectGameObject(f.getGameObject(), timePassed);
            if (flash) {

                flashes.push(flash);
            }
        }
        return flashes;
    }
}