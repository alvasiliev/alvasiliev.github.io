import imageManager from '../managers/imageManager.js';

import {
    GameObject,
    AnimatedSprite,
    CombinedDrawItem,
} from '../primitives.js'

export default class Beacon {
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