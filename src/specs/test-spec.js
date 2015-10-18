import {Auth} from '../services/auth';
import {View, Component,bootstrap} from 'angular2/angular2';
let auth = new Auth();

describe('Test', function () {
    it('testing', function () {
		expect(true).toEqual(true);
    });
    it('authentication token', function () {
		expect(auth.isAuth()).toEqual(false);
    });
    it('Check for undefined', function () {
		expect(Component).toBeDefined();
    });
});

describe('Test1', function () {
    it('testing', function () {
		expect(true).toEqual(true);
    });
    it('authentication token', function () {
		expect(auth.isAuth()).toEqual(false);
    });
    it('Check for undefined', function () {
		expect(Component).toBeDefined();
    });
});