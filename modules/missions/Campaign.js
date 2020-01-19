import Mission1 from './Mission1.js';
import Mission2 from './Mission2.js';
import Mission3 from './Mission3.js';
import Mission4 from './Mission4.js';

export default class Campaign {
    constructor() {
        this.missions = [{
            name: 'Mission 1',
            create: game => new Mission1(game)
        }, {
            name: 'Mission 2',
            create: game => new Mission2(game)
        }, {
            name: 'Mission 3',
            create: game => new Mission3(game)
        }, {
            name: 'Mission 4',
            create: game => new Mission4(game)
        }];
    }

    getMissions() {
        return this.missions;
    }
}