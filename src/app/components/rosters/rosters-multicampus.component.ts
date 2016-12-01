import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
// import * as _ from 'lodash';
import { AuthService } from './../../services/auth.service';

@Component({
    selector: 'rosters-multicampus',
    templateUrl: './rosters-multicampus.component.html',
    styles: [
    `
    .button-group label .button-group-item {
        font-weight: bold;
        text-align: center;
        width: 100%;
    }
    @media (min-width: 551px) {
        .button-group label {
            width: 50%;
        }
    }
    @media (min-width:768px) {
        .tabs li {
            width: 50%;
        }
        .tabs a {
            width: 100%;
            text-align: center;
        }
    }`]
})
export class RostersMultiCampusComponent implements OnInit {    
    @Output() onInstitutionChange = new EventEmitter();
    institutions: Array<any>;
    showDropdown: boolean = false;
    showRadioButton: boolean = false;
    institutionIdRN: number;
    institutionIdPN: number;
    activeRN: boolean = true;
    constructor(private auth:AuthService) {
    }

    ngOnInit() {
        
        this.resolveInstitutions();
    }

    resolveInstitutions(): void {
        if (this.auth.institutions)
            this.institutions = _.sortBy(JSON.parse(this.auth.institutions), (i:any) => {return i.InstitutionNameWithProgOfStudy });
        
        if (this.institutions && this.institutions.length > 1) {
            
            if (this.institutions.length === 2) {
                 let rnInstitutions = _.filter(this.institutions, { 'ProgramofStudyName': 'RN' });
                 // if only one instition is RN show radio buttons
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
                 // otherwise there must be either two RN or two PN institutions in which case the dropdown should be shown
                 else {
                    this.showDropdown = true;
                    this.refreshSelectpicker();
                }
                this.changeInstitution(this.institutionIdRN, true, null);
            }
            else {
                this.showDropdown = true;
                this.refreshSelectpicker();
            }

        }

    }

    refreshSelectpicker(): void {
        setTimeout(json => {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                $('.selectpicker').selectpicker('mobile');
            else
                $('.selectpicker').selectpicker('refresh');
        });
    }

    changeInstitution(institutionId: number, isRN: boolean, event): void {
        if (isRN) {
            this.activeRN = true;
        } else {
            this.activeRN = false;
        }
        if (event) {
            event.preventDefault;
            event.stopPropagation();
        }
        this.onInstitutionChange.emit(institutionId);
    }

}
