import { CommonService } from './../../services/common.service';
import { AuthService } from './../../services/auth.service';
import { RosterChangesPages } from './../../constants/config';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class RosterChangesService {
    sStorage: any;
    accountManagerId: number;
    institutionId: number;
    institutionName: string;
    cohortName: string;
    institutions: Array<any> = [];

    constructor(public auth: AuthService, private common: CommonService, private http: HttpClient) {
        this.http = http;
    }

    getRosterChangesModel(): RosterChangesModel {
        this.sStorage = this.common.getStorage();
        let rosterChanges = this.sStorage.getItem('rosterChanges');
        let rosterChangesModel = this.bindJSONToModel(rosterChanges);
        // set user info to include in email to faculty after change request has been successful
        rosterChangesModel.facultyEmail = this.sStorage.getItem('useremail');
        rosterChangesModel.facultyFirstName = this.sStorage.getItem('firstname');
        rosterChangesModel.facultyLastName = this.sStorage.getItem('lastname');
        if (!rosterChangesModel.students)
            rosterChangesModel.students = [];
        return rosterChangesModel;
    }

    getUpdatedRosterChangesModel(): RosterChangesModel {
        this.sStorage = this.common.getStorage();
        let rosterChanges = this.sStorage.getItem('rosterChanges');
        let rosterChangesModel = this.bindJSONToModel(rosterChanges);
        return rosterChangesModel;
    }

    bindJSONToModel(JSONString: string): RosterChangesModel {
        let parsedJSON: RosterChangesModel = JSON.parse(JSONString);
        return parsedJSON;
    }

    outOfRostersChanges(routeName: string): boolean {
        routeName = routeName.toUpperCase();
        if (routeName.indexOf(RosterChangesPages.MAKECHANGES) > -1
            || routeName.indexOf(RosterChangesPages.REVIEWCHANGES) > -1
            || routeName.indexOf(RosterChangesPages.CHANGESCONFIRMATION) > -1
            || routeName.indexOf(RosterChangesPages.EXTENDACCESS) > -1     
            || routeName.indexOf('ERROR') > -1)
            return false;
        return true;
    }

    clearRosterChangesObjects(): void {
        // this.sStorage.removeItem('rosterChangesModel');
        this.sStorage.removeItem('rosterChanges');
    }

    updateRosterChanges(url: string, input: string) {
        return this.http.post(url, input, this.getRequestOptions());
    }
    private getRequestOptions(): any {
        let self = this;
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let requestOptions = {
            headers: headers,
            observe: 'response' as const
        };
        return requestOptions;
    }
}
