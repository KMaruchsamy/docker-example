﻿import * as _ from '../../lib/index';
import {links} from '../constants/config';

export class Common {
    constructor() {
        this.sStorage = this.getStorage();
        this.getApiServer();
        this.getNursingITServer();
        this.errorMessages = this.fetchErrorMessages();
        this.config = this.fetchConfig();
    }

    getErrorMessages() {
        return fetch('../config/error-messages.json');
    }

    getConfig() {
        return fetch('../config/config.json');
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

    fetchErrorMessages() {
       let self = this;
       fetch('../config/error-messages.json').then(function (response) {
            return response.json()
        }).then(function (json) {
            self.errorMessages = json
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    }

    fetchConfig() {
        let self = this;
        fetch('../config/config.json').then(function (response) {
            return response.json()
        }).then(function (json) {
            self.config = json
           // self.getApiServer();
            //self.getNursingITServer();
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    }


    getApiServer() {
        if (location.hostname.indexOf('localhost') > -1)
            this.apiServer = links.api.local.server;
        if (location.hostname.indexOf('dev') > -1)
            this.apiServer = links.api.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            this.apiServer = links.api.qa.server;
    }

    getNursingITServer() {
        if (location.hostname.indexOf('localhost') > -1)
            this.nursingITServer = links.nursingit.local.server;
        if (location.hostname.indexOf('dev') > -1)
            this.nursingITServer = links.nursingit.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            this.nursingITServer = links.nursingit.qa.server;
    }
}