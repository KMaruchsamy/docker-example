﻿import * as _ from '../../lib/index';
import {links} from '../constants/config';
import {Injectable} from 'angular2/core';
import {Router,Location} from 'angular2/router';


@Injectable()
export class Common {
    apiServer: string;
    nitServer: string;
    constructor(public router: Router, public aLocation: Location) {
        this.apiServer = this.getApiServer();
        this.nitServer = this.getNursingITServer();
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
        let apiServer = '';
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
                apiServer = links.api.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
                apiServer = links.api.dev.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                apiServer = links.api.qa.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                apiServer = links.api.stg.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                apiServer = links.api.prod.server;
                break;
            default:
                apiServer = links.api.local.server;
                break;
        }
        return apiServer;
    }

    getNursingITServer() {
        let ITServer = '';
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
                ITServer = links.nursingit.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
                ITServer = links.nursingit.dev.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                ITServer = links.nursingit.qa.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                ITServer = links.nursingit.stg.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                ITServer = links.nursingit.prod.server;
                break;
            default:
                ITServer = links.nursingit.local.server;
                break;
        }
        return ITServer;
    }

    isProduction(): boolean {
        let apiServer = this.getApiServer();
        return apiServer === links.api.prod.server;
    }


    removeWhitespace(value: string): string {
        if (!value)
            return '';
        return value.replace(/\s/g, "");
    }


    getOffsetInstitutionTimeZone(institutionId: number): number {
        let sStorage = this.getStorage();
        let institutions = sStorage.getItem('institutions');
        if (institutions) {
            let selectedInstitution = _.find(JSON.parse(institutions), { 'InstitutionId': institutionId });
            if (selectedInstitution) {
                return selectedInstitution.HourOffset;
            }
        }
        return 0;
    }
   
    disabledforward(): void {
        let __this = this;
        $(window).on('popstate', function (event) {
            if (event.originalEvent.state != null) {
                // alert("location: " + __this.aLocation.path());
                //history.replaceState('');
            }
            else {
                history.replaceState(__this.aLocation.path(), '');
                __this.router.navigateByUrl(__this.aLocation.path());
            }
        });
    }
}