import imageManager from '../managers/imageManager.js';

import {
    GameObject,
    AnimatedSprite,
} from '../primitives.js'

export default class Explosion {
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