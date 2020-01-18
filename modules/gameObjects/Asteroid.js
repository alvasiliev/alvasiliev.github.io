import imageManager from '../managers/imageManager.js';
import soundManager from '../managers/soundManager.js';

import {
    GameObject,
    Sprite,
    CombinedDrawItem,
} from '../primitives.js'

import Explosion from './Explosion.js';

export default class Asteroid {
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