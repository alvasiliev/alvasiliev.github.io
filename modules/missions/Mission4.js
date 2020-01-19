import MissionGenerator from './MissionGenerator.js';
import BlackHole from '../gameObjects/BlackHole.js';

export default class Mission4 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 0;

        this.objects = this._generate();
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0);

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            
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
            `Just chill out`
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        const d = this.game.width < this.game.height ? this.game.width : this.game.height;
        const blackHole = new BlackHole(this.game.width / 2, this.game.height / 2, d / 2.1, -0.0025);
        return [
            blackHole,
        ]
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}