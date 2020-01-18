import imageManager from '../managers/imageManager.js';

import {
    GameObject,
    Sprite,
} from '../primitives.js'

export default class Bullet {
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