import imageManager from '../managers/imageManager.js';
import soundManager from '../managers/soundManager.js';

import {
    GameObject,
    Sprite,
    CombinedDrawItem,
} from '../primitives.js'

export default class Missile {
    constructor(x, y, angle) {
        this.width = 10;
        this.height = 10;
        this.speed = 55;
        this.rotateSpeed = 0.2; // Скорость разворота: 0.2 оборота в секунду
        this.gameObject = new GameObject(x, y, this.width, this.height, angle, this.speed, 0, true);

        this.drawItemMissile = new Sprite(imageManager.get('missile'), 30, 10, this.gameObject);
        this.drawItemMissileFire = new Sprite(imageManager.get('missileFire'), 10, 5, this.gameObject, -20, 0);
        this.drawItem = new CombinedDrawItem([
            this.drawItemMissile,
            this.drawItemMissileFire,
        ]);

        this.missileSound = soundManager.get('missile'); // New each time. This sound is looped it has to be stopped on destroy
        this.missileSound.play(0.5, true, true);

        this.gameObject.destroy = () => {
            this.gameObject.isDestroyed = true;
            this.missileSound.stop();
        }
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