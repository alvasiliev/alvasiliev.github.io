import UserControls from './UserControls.js';

export default class Player {
    constructor(name, keys) {
        this.name = name;
        this.userControls = new UserControls(keys);
        this.ship = null;
    }

    getName() {
        return this.name;
    }

    getUserControls() {
        return this.userControls;
    }

    getShip() {
        return this.ship;
    }

    setShip(ship) {
        this.ship = ship;
    }
}