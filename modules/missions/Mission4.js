import MissionGenerator from './MissionGenerator.js';
import BlackHole from '../gameObjects/BlackHole.js';
import Asteroid from '../gameObjects/Asteroid.js';

export default class Mission4 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 5;

        this.objects = this._generate();
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0 && !ship.getGameObject().getIsDestroyed());

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            const asteroids = this.game.figures.get().filter(obj => obj instanceof Asteroid && !obj.getGameObject().getIsDestroyed());
            if (asteroids.length === 0) {
                this.status = 'succeeded'
            }
        }

        return this.status;
    }

    interrupt() {
        this.status = 'interrupted'
    }

    isInProgress() {
        return this.status === 'inProgress';
    }

    isSucceeded() {
        return this.status === 'succeeded';
    }

    isFailed() {
        return this.status === 'failed';
    }

    isInterrupted() {
        return this.status === 'interrupted';
    }

    getDescription() {
        return [
            'Destroy all the asteroids',
            `Avoid black hole - there is no way back from it`
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        const r = this._getBlackHoleRadius();
        const blackHole = new BlackHole(this.game.width / 2, this.game.height / 2, r, -0.0025);
        const asteroids = this.missionGenerator.generateAsteroids(this.numOfAsteroids);
        return [
            blackHole,
            ...asteroids,
        ]
    }

    _getBlackHoleRadius() {
        const w = this.game.width,
            h = this.game.height;
        const d = w < h ? w : h;
        const r = d / 2 - 60;
        const radius = r < 500 ? r : 500;
        return radius;
    }

    generateShipPosition() {
        const w = this.game.width,
            h = this.game.height;
        const r = this._getBlackHoleRadius() + 35;
        const a = Math.PI * 2 * Math.random();

        const x = w / 2 + r * Math.cos(a);
        const y = h / 2 + r * Math.sin(a);
        const angle = Math.random() * Math.PI * 2;
        return {
            x,
            y,
            angle,
        }
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}