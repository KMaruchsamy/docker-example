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


    getHostName(url: string): any {
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    }

    getDomain(url) {
        var hostName = this.getHostName(url);
        var domain = hostName;

        if (hostName != null) {
            var parts = hostName.split('.').reverse();

            if (parts != null && parts.length > 1) {
                domain = parts[1] + '.' + parts[0];

                if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                    domain = parts[2] + '.' + domain;
                }
            }
        }

        return domain;
    }

    getApiServer(): string {
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
                return links.api.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
                return links.api.dev.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                return links.api.qa.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                return links.api.stg.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                return links.api.prod.server;
                break;
            default:
                return links.api.local.server;
                break;
        }

        // 
        //         if (location.hostname.indexOf('localhost') > -1)
        //             return links.api.local.server;
        //         if (location.hostname.indexOf('dev') > -1)
        //             return links.api.dev.server;
        //         if (location.hostname.indexOf('qa') > -1)
        //             return links.api.qa.server;
        //         if (location.hostname.indexOf('stg') > -1)
        //             return links.api.qa.server;
        //         if (location.hostname.indexOf('nit.kaplan.com') > -1)
        //             return links.api.qa.server;
        //         if (location.href.indexOf('81') > -1) // Incase if SSL not working then to read from IP address
        //             return links.api.qa.server;
        //         if (location.href.indexOf('138') > -1) // Incase if SSL not working then to read from IP address
        //             return links.api.dev.server;
    }

    getNursingITServer() {
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
                return links.nursingit.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
                return links.nursingit.dev.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                return links.nursingit.qa.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                return links.nursingit.stg.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                return links.nursingit.prod.server;
                break;
            default:
                return links.nursingit.local.server;
                break;
        }
        
        
        
        // if (location.hostname.indexOf('localhost') > -1)
        //     return links.nursingit.local.server;
        // if (location.hostname.indexOf('dev') > -1)
        //     return links.nursingit.dev.server;
        // if (location.hostname.indexOf('qa') > -1)
        //     return links.nursingit.qa.server;
        // if (location.href.indexOf('81') > -1) // Incase if SSL not working then to read from IP address
        //     return links.nursingit.qa.server;
        // if (location.href.indexOf('138') > -1) // Incase if SSL not working then to read from IP address
        //     return links.nursingit.dev.server;
    }
}