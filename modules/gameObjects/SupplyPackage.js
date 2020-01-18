import imageManager from '../managers/imageManager.js';

import {
    GameObject,
    AnimatedSprite,
    CombinedDrawItem,
} from '../primitives.js'

export default class SupplyPackage {
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