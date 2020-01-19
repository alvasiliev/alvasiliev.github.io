import imageManager from '../managers/imageManager.js';

import {
    GameObject,
    AnimatedSprite,
    CombinedDrawItem,
    Ring,
} from '../primitives.js'

export default class Flash {
    constructor(x, y, radius, shadow) {
        this.width = 200;
        this.height = 200;
        this.imgSrc = 'flash';
        this.numFramesX = 5;
        this.numFramesY = 1;

        this.gameObject = new GameObject(x, y, radius * 2, radius * 2, 0, 0, 0, false, 0);
        this.drawItemFlash = new AnimatedSprite(imageManager.get(this.imgSrc), radius * 2, radius * 2, this.width, this.height, this.gameObject, this.numFramesX, this.numFramesY, false, () => {
            this.gameObject.destroy();
        });
        //this.drawItemRing = new Ring(radius, '#f00', this.gameObject);

        this.drawItem = new CombinedDrawItem([
            this.drawItemFlash,
            //this.drawItemRing,
            shadow,
        ]);
    }

    getDrawItem() {
        return this.drawItem;
    }

    getGameObject() {
        return this.gameObject;
    }
}