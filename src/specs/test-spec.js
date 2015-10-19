import {Auth} from '../services/auth';
import {View, Component, bootstrap} from 'angular2/angular2';
import {Router, Location, LocationStrategy} from 'angular2/router';
import {Help} from '../components/help/help';

let help;
let auth;


beforeEach(function () {
    help = new Help();
    auth = new Auth();
});

describe('Tests', function () {
    it('test function', function () {
        expect(true).toEqual(true);
    });
    it('authentication token', function () {
        expect(auth.isAuth()).toEqual(false);
    });
    it('Check for undefined', function () {
        expect(Component).toBeDefined();
    });
    it('check for undefined help component', function () {
        expect(help).toBeDefined();
    });
});
