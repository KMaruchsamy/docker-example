import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';
import { Observable } from 'rxjs/Rx';

import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import { RosterChangesSummaryTablesComponent } from './rosters-changes-summary-tables.component';
import * as _ from 'lodash';

@Component({
    selector: 'rosters-changes-summary',
    templateUrl: './rosters-changes-summary.component.html'
})

export class RosterChangesSummaryComponent implements OnInit {
    sStorage: any;
    overrideRouteCheck: boolean = false;
    attemptedRoute: string;
    destinationRoute: string;
    isExtendedAccess: boolean = false;

    constructor(public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, private rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        this.router
            .events
            .filter(event => event instanceof NavigationStart)
            .subscribe(e => {
                this.destinationRoute = e.url;
            });

        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getUpdatedRosterChangesModel();
            this.titleService.setTitle('Roster Change Request Summary – Kaplan Nursing');
            window.scroll(0, 0);
        }
    }

    canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        let outOfRostersChanges: boolean = this.rosterChangesService.outOfRostersChanges((this.common.removeWhitespace(this.destinationRoute)));
        if (!this.overrideRouteCheck) {
            if (outOfRostersChanges) {
                this.attemptedRoute = this.destinationRoute;
                $('#confirmationPopup').modal('show');
                return false;
            }
        }
        if (outOfRostersChanges) {
            this.rosterChangesService.clearRosterChangesObjects();
        }
        this.overrideRouteCheck = false;
        return true;
    }

    onOKConfirmation(e: any): void {
        $('#confirmationPopup').modal('hide');
        this.overrideRouteCheck = true;
        this.router.navigateByUrl(this.attemptedRoute);
    }
    
    onCancelConfirmation(popupId): void {
        $('#' + popupId).modal('hide');
        this.attemptedRoute = '';
    }

    cancelChanges(): void {
        this.attemptedRoute = '/rosters';
        $('#confirmationPopup').modal('show');
    }


}
