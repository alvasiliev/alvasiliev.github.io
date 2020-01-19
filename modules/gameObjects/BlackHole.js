import imageManager from '../managers/imageManager.js';

import {
    Sprite,
    GameObject,
} from '../primitives.js'

export default class BlackHole {
    constructor(x, y, radius, spinSpeed) {
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.gameObject = new GameObject(x, y, this.width, this.height, 0, 0, 0, false, spinSpeed);
        this.drawItem = new Sprite(imageManager.get('blackHole'), this.width, this.height, this.gameObject);
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }
}