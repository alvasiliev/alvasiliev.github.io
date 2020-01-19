import MissionGenerator from './MissionGenerator.js';
import Asteroid from '../gameObjects/Asteroid.js';

export default class Mission1 {
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
        const shipsAlive = allShips.filter(ship => ship.health > 0);

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
            'You mission is to destroy all the asteroids'
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        return this.missionGenerator.generateAsteroids(this.numOfAsteroids);
    }

    generateShipPosition() {
        const minX = this.width / 2 - 250;
        const maxX = this.width / 2 + 250;
        const minY = this.height / 2 - 100;
        const maxY = this.height / 2 + 100;

        const x = Math.round(Math.random() * (maxX - minX) + minX);
        const y = Math.round(Math.random() * (maxY - minY) + minY);
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