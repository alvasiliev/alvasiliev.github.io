import MissionGenerator from './MissionGenerator.js';

export default class Mission2 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 5;
        this.numOfBeacons = 3;

        this.objects = this._generate();
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0);

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            const numOfBeaconsGathered = allShips.map(ship => ship.beaconCount).reduce((a, b) => a + b);
            if (numOfBeaconsGathered === this.numOfBeacons) {
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
            'You mission is to gather all the beacons',
            'Asteroids can hit both you and station',
            'Protect the station - you can get ammo there',
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        const asteroids = this.missionGenerator.generateAsteroids(this.numOfAsteroids);
        const stations = this.missionGenerator.generateStations();
        const beacons = this.missionGenerator.generateBeacons(this.numOfBeacons);
        return [
            ...asteroids,
            ...stations,
            ...beacons,
        ];
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}