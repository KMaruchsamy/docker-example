import { Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from './../../services/common.service';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { Injectable } from '@angular/core';

@Injectable()

export class RosterChangesService {
    sStorage: any;
    accountManagerId: number;
    institutionId: number;
    institutionName: string;
    cohortName: string;
    institutions: Array<any> = [];
    constructor(public auth: AuthService, private common: CommonService, private rosterChangesModel: RosterChangesModel) {
    }

    getRosterChangesModel(): RosterChangesModel {
        this.sStorage = this.common.getStorage();
        let rosterChanges = this.sStorage.getItem('rosterChangesModel');
        let rosterChangesModel = this.bindJSONToModel(rosterChanges);
        let accountManagerInfo = this.getAccountManagerID(rosterChangesModel.institutionId);
        rosterChangesModel.accountManagerId = accountManagerInfo.accountManagerId;
        rosterChangesModel.institutionName = accountManagerInfo.institutionName;
        rosterChangesModel.students = [];
        return rosterChangesModel;
    }        


    bindJSONToModel(JSONString: string): RosterChangesModel {
        let parsedJSON: RosterChangesModel = JSON.parse(JSONString);
        return parsedJSON;
    }

     getAccountManagerID(institutionId: number) {
        let institution: any = _.find(JSON.parse(this.auth.institutions), { 'InstitutionId': +institutionId });
        if (institution) {
            return {
                accountManagerId: institution.AccountManagerId,
                institutionName: institution.InstitutionName
            }
        }
    }

}
