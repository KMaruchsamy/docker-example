// import * as _ from 'lodash';
import {links,Timezones} from '../constants/config';
import { Injectable } from '@angular/core';
// import * as CryptoJS from 'crypto-js';

@Injectable()
export class CommonService {
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
            return  (window.sessionStorage as any).__proto__;
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
            case this.getHostName(links.faculty.qa_old.server):
                apiServer = links.api.qa.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                apiServer = links.api.qa.server;
                break;
            case this.getHostName(links.faculty.qa_new.server):
                apiServer = links.api.qa.server;
                break;
            case this.getHostName(links.faculty.stg_old.server):
                apiServer = links.api.stg.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                apiServer = links.api.stg.server;
                break;
            case this.getHostName(links.faculty.stg_new.server):
                apiServer = links.api.stg.server;
                break;
            case this.getHostName(links.faculty.prod_old.server):
                apiServer = links.api.prod.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                apiServer = links.api.prod.server;
                break;
            case this.getHostName(links.faculty.prod_new.server):
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
            case this.getHostName(links.faculty.qa_old.server):
                ITServer = links.nursingit.qa.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                ITServer = links.nursingit.qa.server;
                break;
            case this.getHostName(links.faculty.qa_new.server):
                ITServer = links.nursingit.qa.server;
                break;
            case this.getHostName(links.faculty.stg_old.server):
                ITServer = links.nursingit.stg.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                ITServer = links.nursingit.stg.server;
                break;
            case this.getHostName(links.faculty.stg_new.server):
                ITServer = links.nursingit.stg.server;
                break;
            case this.getHostName(links.faculty.prod_old.server):
                ITServer = links.nursingit.prod.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                ITServer = links.nursingit.prod.server;
                break;
            case this.getHostName(links.faculty.prod_new.server):
                ITServer = links.nursingit.prod.server;
                break;
            default:
                ITServer = links.nursingit.local.server;
                break;
        }
        return ITServer;
    }

    getKaptestServer() {
        let ITServer = '';
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
                ITServer = links.atomStudyPlan.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
                ITServer = links.atomStudyPlan.dev.server;
                break;
            case this.getHostName(links.faculty.qa_old.server):
                ITServer = links.atomStudyPlan.qa.server;
                break;
            case this.getHostName(links.faculty.qa.server):
                ITServer = links.atomStudyPlan.qa.server;
                break;
            case this.getHostName(links.faculty.qa_new.server):
                ITServer = links.atomStudyPlan.qa.server;
                break;
            case this.getHostName(links.faculty.stg_old.server):
                ITServer = links.atomStudyPlan.stg.server;
                break;
            case this.getHostName(links.faculty.stg.server):
                ITServer = links.atomStudyPlan.stg.server;
                break;
            case this.getHostName(links.faculty.stg_new.server):
                ITServer = links.atomStudyPlan.stg.server;
                break;
            case this.getHostName(links.faculty.prod_old.server):
                ITServer = links.atomStudyPlan.prod.server;
                break;
            case this.getHostName(links.faculty.prod.server):
                ITServer = links.atomStudyPlan.prod.server;
                break;
            case this.getHostName(links.faculty.prod_new.server):
                ITServer = links.atomStudyPlan.prod.server;
                break;
            default:
                ITServer = links.atomStudyPlan.local.server;
                break;
        }
        return ITServer;
    }

    getExamityServer() {
        let examityServer = '';
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
            examityServer = links.examity.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
            examityServer = links.examity.dev.server;
                break;
            case this.getHostName(links.faculty.qa_old.server):
                examityServer = links.examity.qa.server;
                    break;
            case this.getHostName(links.faculty.qa.server):
            examityServer = links.examity.qa.server;
                break;
            case this.getHostName(links.faculty.qa_new.server):
            examityServer = links.examity.qa.server;
                break;
            case this.getHostName(links.faculty.stg_old.server):
            examityServer = links.examity.stg.server;
                break;
            case this.getHostName(links.faculty.stg.server):
            examityServer = links.examity.stg.server;
                break;
            case this.getHostName(links.faculty.stg_new.server):
            examityServer = links.examity.stg.server;
                break;
            case this.getHostName(links.faculty.prod_old.server):
                examityServer = links.examity.prod.server;
                    break;
            case this.getHostName(links.faculty.prod.server):
            examityServer = links.examity.prod.server;
                break;
            case this.getHostName(links.faculty.prod_new.server):
            examityServer = links.examity.prod.server;
                break;
            default:
            examityServer = links.examity.local.server;
                break;
        }
        return examityServer;
    }

    getPingFederateServer() {
        let examityServer = '';
        switch (location.hostname) {
            case this.getHostName(links.faculty.local.server):
            examityServer = links.pingfederate.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
            examityServer = links.pingfederate.dev.server;
                break;
            case this.getHostName(links.faculty.qa_old.server):
                examityServer = links.pingfederate.qa.server;
                    break;
            case this.getHostName(links.faculty.qa.server):
            examityServer = links.pingfederate.qa.server;
                break;
            case this.getHostName(links.faculty.qa_new.server):
                examityServer = links.pingfederate.qa.server;
                    break;
            case this.getHostName(links.faculty.stg_old.server):
                examityServer = links.pingfederate.stg.server;
                    break;
            case this.getHostName(links.faculty.stg.server):
            examityServer = links.pingfederate.stg.server;
                break;
            case this.getHostName(links.faculty.stg_new.server):
                examityServer = links.pingfederate.stg.server;
                    break;
            case this.getHostName(links.faculty.prod_old.server):
                examityServer = links.pingfederate.prod.server;
                    break;
            case this.getHostName(links.faculty.prod.server):
            examityServer = links.pingfederate.prod.server;
                break;
            case this.getHostName(links.faculty.prod_new.server):
            examityServer = links.pingfederate.prod.server;
                break;
            default:
            examityServer = links.pingfederate.local.server;
                break;
        }
        return examityServer;
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
            let selectedInstitution:any = _.find(JSON.parse(institutions), { 'InstitutionId': institutionId });
            if (selectedInstitution) {
                return selectedInstitution.HourOffset;
            }
        }
        return 0;
    }

    getOrigin(): string {
        if (!window.location.origin) {
            return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
        return window.location.origin;
    }


    getInstitutionTimeZoneOffsetName(institutionId: number): string {
        let sStorage = this.getStorage();
        let institutions = sStorage.getItem('institutions');
        if (institutions) {
            let selectedInstitution:any = _.find(JSON.parse(institutions), { 'InstitutionId': +institutionId });
            if (selectedInstitution) {
                return selectedInstitution.TimeZoneName;
            }
        }
        return '';
    }

    getTimezone(institutionId: number): string {
        if (institutionId == undefined || institutionId===0)
            return '';
        let gmtOffset: string = '';
        gmtOffset = this.getInstitutionTimeZoneOffsetName(institutionId);
        if (gmtOffset === '')
            return '';    
        gmtOffset = gmtOffset.replace('+', 'plus').replace('-', 'minus').replace(' ', '');
        console.log(gmtOffset);
        return Timezones[gmtOffset];
    }

    getLogServer(): string {
        let logserver = '';
        switch (location.hostname) {
            case this.getHostName(links.log.local.server):
                logserver = links.log.local.server;
                break;
            case this.getHostName(links.faculty.dev.server):
                logserver = links.log.dev.server;
                break;
            default:
                logserver = links.log.local.server;
                break;
        }
        return logserver;
    }

     decryption(strToDecrypt) {
        let key = CryptoJS.enc.Base64.parse("MTIzNDU2NzgxMjM0NTY3OA==");
        let iv = CryptoJS.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");
        let decodedString = decodeURIComponent(strToDecrypt);
        let decryptedStr = CryptoJS.AES.decrypt(decodedString, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        return decryptedStr;
    }
    getEncryption(strToEncrypt) {
        let key = CryptoJS.enc.Base64.parse("MTIzNDU2NzgxMjM0NTY3OA==");
        let iv = CryptoJS.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");
        let encryptedStr = CryptoJS.AES.encrypt(strToEncrypt, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
        return encodeURIComponent(encryptedStr);
    }
}