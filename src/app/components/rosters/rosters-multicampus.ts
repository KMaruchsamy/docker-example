import { Auth } from './../../services/auth';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import * as _ from 'lodash';

@Component({
    selector: 'rosters-multicampus',
    providers: [],
    templateUrl: 'templates/rosters/rosters-multicampus.html',
    directives: [NgIf]
})
export class RostersMultiCampus implements OnInit {    
    @Output() onInstitutionChange = new EventEmitter();
    institutions: Array<any>;
    showDropdown: boolean = false;
    showRadioButton: boolean = false;
    institutionIdRN: number;
    institutionIdPN: number;
    constructor(private auth:Auth) {
    }

    ngOnInit() {
        
        this.resolveInstitutions();
    }

    resolveInstitutions(): void {
        if (this.auth.institutions)
            this.institutions = JSON.parse(this.auth.institutions);
        
        if (this.institutions && this.institutions.length > 1) {
            if (this.institutions.length === 2) {
                 let rnInstitutions = _.filter(this.institutions, { 'ProgramofStudyName': 'RN' });
                 if (rnInstitutions.length === 1) {
                     this.showRadioButton = true;
                     if (this.institutions[0].ProgramofStudyName === 'RN') {
                         this.institutionIdRN = this.institutions[0].InstitutionId;
                         this.institutionIdPN = this.institutions[1].InstitutionId;
                     }
                     else {
                         this.institutionIdRN = this.institutions[1].InstitutionId;
                         this.institutionIdPN = this.institutions[0].InstitutionId;
                     }
                 }
                this.changeInstitution(this.institutionIdRN);
            }
            else {
                this.showDropdown = true;
                setTimeout(json => {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                        $('.selectpicker').selectpicker('mobile');
                    else
                        $('.selectpicker').selectpicker('refresh');
                });
            }

        }

    }

    changeInstitution(institutionId: number): void {
        this.onInstitutionChange.emit(institutionId);
    }


}