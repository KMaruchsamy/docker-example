import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, RouterLink} from '@angular/router';
import {Title} from '@angular/platform-browser';
import { PageHeaderComponent } from './../shared/page-header.component';
import { RosterService } from './roster.service';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import {Subscription, Observable} from 'rxjs/Rx';
import {links, cohortRosterChangeUserPreference} from '../../constants/config';
import {RosterCohortUserPreferenceModel} from './../../models/roster-cohort-user-preference.model';

@Component({
    selector: 'accounterror',
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent, RouterLink],
    providers: [AuthService, CommonService, RosterService, RosterCohortUserPreferenceModel],
    template: `<page-header [hideDropdown]=true></page-header>   
            <header class="inner-banner" role="banner">
            <div class="container">
            <div class="branding-center">
                <h1 class="center">
                <!--If user is signed out, this link would be disabled-->
                <a [routerLink]="['/home']">
                    <img class="branding-logo-white" src="images/logo-white_2x.png" alt="Kalplan Nursing">
                    <span class="screen-reader-only">Kaplan Nursing Faculty Home Page</span>
                </a>
                </h1>
            </div>
            </div>
            </header>
            <main role="main" class="app-main app-main-no-nav">
            <div class="section">
            <div class="container-narrow center">
                <i class="icon large-roster-icon"></i>
                <h2 class="margin-1em-top">Requesting cohort roster changes or updates</h2>
                <p class="text-larger">Please note: <strong>Cohort rosters will not immediately reflect changes or updates submitted through the next page</strong>. Requests for changes or updates are submitted to your Account Manager, who will process them within (2) business days.</p>
                <p class="text-larger">Your Account Manager will inform you when your changes have been processed.</p>

                <div class="margin-2em-top clearfix">
                <div class="left margin-2em-bottom">
                    <input type="checkbox" #dontshow class="checkbox-image" id="dontShow" (change)="changePreference(dontshow.checked)"/>
                    <label for="dontShow">Don’t show me this again</label>
                </div>
                <div class="page-action-footer">
                    <a [routerLink]="['/rosters']" class="anchor-button anchor-button-left">Go back to View Rosters page</a>
                    <a href="javascript:void(0);" class="button" (click)="saveUserPreference($event)">OK, got it</a>
                </div>
                </div>

            </div>
            </div>
            </main>`
})
export class RosterChangeNoteComponent implements OnInit, OnDestroy {
    apiServer: string;
    userPreference: string = "";
    setUserPreferenceSubscription: Subscription;
    getUserPreferenceSubscription: Subscription;
    userPreferenceValue: string;
    rosterCohortUserPreferenceModel: RosterCohortUserPreferenceModel;

    constructor(public titleService: Title, public rosterService: RosterService, public common: CommonService, public auth: AuthService, public router: Router) {
    }

    ngOnInit(): void {

        if (this.auth.isAuth()) {
            this.titleService.setTitle('Change Note – Kaplan Nursing');
            this.apiServer = this.auth.common.getApiServer();
            this.getUserPreference();
        }
        else
            this.router.navigate(['/']);
    }

    ngOnDestroy(): void {
        if (this.setUserPreferenceSubscription)
            this.setUserPreferenceSubscription.unsubscribe();
        if (this.getUserPreferenceSubscription)
            this.getUserPreferenceSubscription.unsubscribe();
    }
    saveUserPreference(e): void {
        e.preventDefault();
        this.setUserPreference();
    }
    changePreference(chkUserPreference): void {
        if (chkUserPreference)
            this.userPreference = cohortRosterChangeUserPreference.PreferenceTypeHideValueName;
        else
            this.userPreference = cohortRosterChangeUserPreference.PreferenceTypeShowValueName;
    }
    setUserPreference(): void {
        let __this = this;
        let setUserPreferenceURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.rosters.saveUserPreference}`;
        let input = {
            "UserId": this.auth.userid,
            "UserType": cohortRosterChangeUserPreference.UserType,
            "PreferenceTypeName": cohortRosterChangeUserPreference.PreferenceTypeName,
            "PreferenceTypeValueName": this.userPreference === "" ? cohortRosterChangeUserPreference.PreferenceTypeShowValueName : cohortRosterChangeUserPreference.PreferenceTypeHideValueName
        }
        let UserPreferenceObservable = this.rosterService.setUserPreference(setUserPreferenceURL, JSON.stringify(input));
        this.setUserPreferenceSubscription = UserPreferenceObservable
            .map(response => response.json())
            .subscribe(json => {
                __this.router.navigate(['/']); //New Page route to be added here..

            }, error => console.log(error));
    }

    getUserPreference(): void {
        let __this = this;
        let userPreferenceURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.rosters.getUserPreference}`;
        userPreferenceURL = userPreferenceURL.replace('§userId', this.auth.userid.toString()).replace('§preferenceTypeName', cohortRosterChangeUserPreference.PreferenceTypeName).replace('§userType', cohortRosterChangeUserPreference.UserType);
        let UserPreferenceObservable = this.rosterService.getRosterCohortUserPreference(userPreferenceURL);
        this.getUserPreferenceSubscription = UserPreferenceObservable
            .map(response => response.json())
            .subscribe(json => {
                __this.rosterCohortUserPreferenceModel = json;
                if (__this.rosterCohortUserPreferenceModel.PreferenceValue === cohortRosterChangeUserPreference.PreferenceTypeHideValueName)
                    __this.router.navigate(['/']);  //New Page route get tobe added here..

            }, error => console.log(error));
    }
}
