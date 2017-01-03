import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from './../../services/auth.service';

@Component({
    selector: 'manage-tests-multicampus',
    templateUrl: './manage-tests-multicampus.component.html'
})
export class ManageTestsMultiCampusComponent implements OnInit {    
    @Output() onInstitutionChange = new EventEmitter();
    institutions: Array<any>;
    showDropdown: boolean = false;
    institutionId: number;
    constructor(private auth:AuthService) {
    }

    ngOnInit() {
        this.resolveInstitutions();
    }

    resolveInstitutions(): void {
        if (this.auth.institutions)
            this.institutions = _.sortBy(JSON.parse(this.auth.institutions), (i:any) => {return i.InstitutionNameWithProgOfStudy });
        
        if (this.institutions && this.institutions.length > 1) {
            this.showDropdown = true;
            this.refreshSelectpicker();
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

    changeInstitution(institutionId: number, event): void {
        if (event) {
            event.preventDefault;
            event.stopPropagation();
        }
        this.onInstitutionChange.emit(institutionId);
    }

}
