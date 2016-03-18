import * as _ from '../../lib/index';
import {links} from '../constants/config';
import {Injectable} from 'angular2/core';

@Injectable()
export class Common {
    apiServer: string;
    nitServer: string;
    constructor() {
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
    }
    
    
    removeWhitespace(value: string): string {
        if (!value)
            return '';
        return value.replace(/\s/g, "");
    }
    
    
    getOffsetInstitutionTimeZone(institutionId: number):number {
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
    noBack() {
        var nHist = window.history.length;
        if (window.history[nHist] != window.location) {
            window.history.forward(-1);
            return false;
        }
       // window.history.back();
    }

    disabledforward(): void {
        //alert('back');
        let __this = this;
        __this.noBack();
        window.onload = function () { __this.noBack(); alert('load'); };
        window.onpageshow = function (evt) {
            if (evt.persisted) { __this.noBack(); alert('pageshow inside'); }
            else
                alert('pageshow outside');
        }
        window.onunload = function () { void (0); alert('pageshow onunload'); }
    }
}