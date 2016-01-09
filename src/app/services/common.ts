import * as _ from '../../lib/index';
import {links} from '../constants/config';
import {Injectable} from 'angular2/core';

@Injectable()
export class Common {
    constructor() {
    }

    isPrivateBrowsing() {
        var testKey = 'test', storage = window.sessionStorage;
        try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return false;
        } catch (error) {
            return true;
        }
    }


    getStorage() {
        if (this.isPrivateBrowsing())
            return window.sessionStorage.__proto__;
        else
            return window.sessionStorage;
    }

    getApiServer() {
        if (location.hostname.indexOf('localhost') > -1)
            return links.api.local.server;
        if (location.hostname.indexOf('dev') > -1)
            return links.api.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            return links.api.qa.server;
        if (location.href.indexOf('81') > -1) // Incase if SSL not working then to read from IP address
            return links.api.qa.server;
        if (location.href.indexOf('138') > -1) // Incase if SSL not working then to read from IP address
            return links.api.dev.server;
    }

    getNursingITServer() {
        if (location.hostname.indexOf('localhost') > -1)
            return links.nursingit.local.server;
        if (location.hostname.indexOf('dev') > -1)
            return links.nursingit.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            return links.nursingit.qa.server;
        if (location.href.indexOf('81') > -1) // Incase if SSL not working then to read from IP address
            return links.nursingit.qa.server;
        if (location.href.indexOf('138') > -1) // Incase if SSL not working then to read from IP address
            return links.nursingit.dev.server;
    }
}