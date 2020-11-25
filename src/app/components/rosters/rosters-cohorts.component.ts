import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { links, Timezones, cohortRosterChangeUserPreference } from '../../constants/config';
import { Subscription } from 'rxjs';

import { RostersModal } from './../../models/rosters.model';
import { RosterCohortsModel } from './../../models/roster-cohorts.model';
import { RosterCohortStudentsModel } from './../../models/roster-cohort-students.model';
import { CommonService } from './../../services/common.service';
import { RosterService } from './roster.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RosterCohortUserPreferenceModel } from '../../models/roster-cohort-user-preference.model';


@Component({
    selector: 'rosters-cohorts',
    providers: [RostersModal, RosterCohortsModel, RosterCohortStudentsModel, RosterCohortUserPreferenceModel],
    encapsulation: ViewEncapsulation.Emulated,
    templateUrl: './rosters-cohorts.component.html',
    // directives: [NgIf, NgFor],
    // pipes: [ParseDatePipe],
    styles: [`
    .name-multiple-icons  {
        top: -.75em;
        right: -.75em;
        position: relative;
    }
    .list-item-with-icons {
        padding-right: 55px !important;
        display: flex;
    }
    .small-popover {
        margin-left: -0.15em;
        margin-right: .25em;
    }
    .large-expander-trigger {
        padding-right: 100px;
    }
    .strikethrough-text{
        text-decoration: line-through;
    }`]
})
export class RostersCohortsComponent implements OnInit, OnDestroy {
    _institutionId: number;
    noCohorts: Boolean = false;
    hiddenForPrint: Boolean = false;
    cohortToPrint: number;
    sStorage: any;
    @Input()
    set institutionId(value: number) {
        this._institutionId = value;
        if (this._institutionId)
            this.rosterCohorts(this.institutionId);
    }
    get institutionId() {
        return this._institutionId;
    }
    searchString: string;
    cohortSubscription: Subscription;
    cohortStudentsSubscription: Subscription;
    apiServer: string;
    getUserPreferenceSubscription: Subscription;
    rosterCohortUserPreferenceModel: RosterCohortUserPreferenceModel;

    constructor(public rosters: RostersModal, private rosterService: RosterService, private common: CommonService, private router: Router, private auth: AuthService, private rosterChangesModel: RosterChangesModel) { }

    ngOnInit() {
        $('body').on('hidden.bs.popover', function (e) {
            $(e.target).data("bs.popover").inState.click = false;
        });

        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }

    ngOnDestroy(): void {
        if (this.cohortSubscription)
            this.cohortSubscription.unsubscribe();
        if (this.cohortStudentsSubscription)
            this.cohortStudentsSubscription.unsubscribe();
    }

    loadCohorts(roster: any) {
        if (roster) {
            this.rosters.institutionId = roster.InstitutionId;
            this.rosters.institutionName = roster.InstitutionName;
            this.rosters.programOfStudy = roster.ProgramOfStudyName;
            this.rosters.accountManagerId = roster.AccountManagerId;
            this.rosters.accountManagerFirstName = roster.AccountManagerFirstName;
            this.rosters.accountManagerLastName = roster.AccountManagerLastName;
            this.rosters.accountManagerEmail = roster.AccountManagerEmail;
            this.rosters.studentPayEnabled = roster.StudentPayEnabled;
            if (roster.Cohorts.length > 0) {
                roster.Cohorts = _.orderBy(roster.Cohorts, function (o: any) {
                    if (o.CohortName.toUpperCase().indexOf('EXTENSION') != -1)
                        return new Date(0);
                    else
                        return new Date(o.CohortEndDate);
                }, 'desc');
                this.rosters.cohorts = _.map(roster.Cohorts, (cohort: any) => {
                    let rosterCohort = new RosterCohortsModel();
                    rosterCohort.cohortId = cohort.CohortId;
                    rosterCohort.cohortName = cohort.CohortName;
                    rosterCohort.cohortStartDate = cohort.CohortStartDate;
                    rosterCohort.cohortEndDate = cohort.CohortEndDate;
                    rosterCohort.studentCount = cohort.StudentCount;
                    return rosterCohort;
                })
            }
        }
    }


    rosterCohorts(institutionId: number) {
        let __this = this;
        let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.cohorts}`;
        if (institutionId) {
            url = url.replace('§institutionId', institutionId.toString());
            let rosterCohortsObservable  = this.rosterService.getRosterCohorts(url);
            this.cohortSubscription = rosterCohortsObservable
                .map(response => response.body)
                .subscribe((json: any) => {
                    __this.noCohorts = false;
                    __this.loadCohorts(json);
                }, error => {
                    console.log(error)
                    __this.noCohorts = true;
                    __this.rosters = new RostersModal();
                });
        }
    }

    loadRosterCohortStudents(cohort: RosterCohortsModel, cohortStudents: any) {
        let rosterCohortStudents: Array<RosterCohortStudentsModel> = [];
        let inactiveForRosteringStudentsCount = 0;
        if (cohortStudents) {
            rosterCohortStudents = _.map(cohortStudents, (student: any) => {
                let rosterCohortStudent = new RosterCohortStudentsModel();
                rosterCohortStudent.cohortId = student.CohortId;
                rosterCohortStudent.cohortName = student.CohortName;
                rosterCohortStudent.email = student.Email;
                rosterCohortStudent.firstName = student.FirstName;
                rosterCohortStudent.lastName = student.LastName;
                rosterCohortStudent.studentId = student.StudentId;
                rosterCohortStudent.repeatExpiryDate = student.RepeatExpiryDate;
                rosterCohortStudent.userExpireDate = student.UserExpireDate;
                rosterCohortStudent.studentPayInstitution = student.StudentPayInstitution;
                rosterCohortStudent.isRepeatStudent = !!rosterCohortStudent.repeatExpiryDate && moment(rosterCohortStudent.repeatExpiryDate).isAfter(new Date(), 'day');
                rosterCohortStudent.isExpiredStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !rosterCohortStudent.studentPayInstitution);
                rosterCohortStudent.isStudentPayDeactivatedStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !!rosterCohortStudent.studentPayInstitution);
                rosterCohortStudent.IsInactiveForRostering = student.IsInactiveForRostering;

                rosterCohortStudent.isDuplicate = _.some(cohortStudents, function (stud: any) {
                    return stud.StudentId !== student.StudentId
                        && student.FirstName.toUpperCase() === stud.FirstName.toUpperCase()
                        && student.LastName.toUpperCase() === stud.LastName.toUpperCase()
                });

                if (!cohort.hasDuplicateStudent) {
                    if (rosterCohortStudent.isDuplicate)
                        cohort.hasDuplicateStudent = true;
                }

                if (!cohort.hasRepeatStudent) {
                    if (rosterCohortStudent.isRepeatStudent)
                        cohort.hasRepeatStudent = true;
                }

                if (!cohort.hasExpiredStudent) {
                    if (rosterCohortStudent.isExpiredStudent)
                        cohort.hasExpiredStudent = true;
                }

                if (!cohort.hasStudentPayDeactivatedStudent) {
                    if (rosterCohortStudent.isStudentPayDeactivatedStudent)
                        cohort.hasStudentPayDeactivatedStudent = true;
                }

                if (student.IsInactiveForRostering) {
                    inactiveForRosteringStudentsCount = inactiveForRosteringStudentsCount + 1;
                }
                return rosterCohortStudent;
            });
        }
        cohort.studentCount = rosterCohortStudents ? (rosterCohortStudents.length - inactiveForRosteringStudentsCount): 0;
        cohort.students = rosterCohortStudents;
        cohort.visible = !cohort.visible;
    }

    rosterCohortStudents(cohortId: number): any {
        let rosterCohort: RosterCohortsModel = _.find(this.rosters.cohorts, { "cohortId": cohortId });
        if (rosterCohort) {
            if (rosterCohort.students || rosterCohort.visible) {
                rosterCohort.visible = !rosterCohort.visible;
                return;
            }

            let __this = this;
            let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.cohortStudents}`;
            if (cohortId) {
                url = url.replace('§cohortId', cohortId.toString());
                let rosterCohortsObservable  = this.rosterService.getRosterStudentCohorts(url);
                this.cohortStudentsSubscription = rosterCohortsObservable
                    .map(response => response.body)
                    .subscribe((json: any) => {
                        __this.loadRosterCohortStudents(rosterCohort, json);
                    }, error => {
                        __this.loadRosterCohortStudents(rosterCohort, null);
                    }, () => {
                        setTimeout(() => {
                            $('.has-popover').popover();
                        });
                    });
            }

        }


    }

    isExtensionCohort(cohortName: string) {
        if (cohortName.toUpperCase().indexOf('EXTENSION') != -1)
            return true;
        else
            return false;
    }

    isCohortAboutToExpire(cohort: RosterCohortsModel) {
        let cohortExpiry = moment(cohort.cohortEndDate);
        let dateAfterTwoWeek = moment().add(14, "days").tz(Timezones.GMTminus5);
        let isExpire = cohortExpiry.isSameOrBefore(dateAfterTwoWeek);
        return isExpire;
    }

    getUserPreference(): void {
        let __this = this;
        let userPreferenceURL = `${this.auth.common.apiServer}${links.api.baseurl}${links.api.admin.rosters.getUserPreference}`;
        userPreferenceURL = userPreferenceURL.replace('§userId', this.auth.userid.toString()).replace('§preferenceTypeName', cohortRosterChangeUserPreference.PreferenceTypeName).replace('§userType', cohortRosterChangeUserPreference.UserType);
        let UserPreferenceObservable = this.rosterService.getRosterCohortUserPreference(userPreferenceURL);
        this.getUserPreferenceSubscription = UserPreferenceObservable
            .map(response => response.body)
            .subscribe((json: any) => {
                __this.rosterCohortUserPreferenceModel = json;
                if (__this.rosterCohortUserPreferenceModel.PreferenceValue === cohortRosterChangeUserPreference.PreferenceTypeHideValueName) {
                    __this.router.navigate(['/rosters/change-update']);
                } else {
                    __this.router.navigate(['/rosters/changes-note']);
                }

            }, error => console.log(error));
    }


    directToChangeOrExtendForm(cohortId, cohortName, targetRoute) {
        //save model
        this.rosterChangesModel.institutionId = this.institutionId;
        this.rosterChangesModel.institutionName = this.rosters.institutionName;
        this.rosterChangesModel.programOfStudy = this.rosters.programOfStudy;
        this.rosterChangesModel.accountManagerId = this.rosters.accountManagerId;
        this.rosterChangesModel.accountManagerFirstName = this.rosters.accountManagerFirstName;
        this.rosterChangesModel.accountManagerLastName = this.rosters.accountManagerLastName;
        this.rosterChangesModel.accountManagerEmail = this.rosters.accountManagerEmail;
        this.rosterChangesModel.cohortId = cohortId;
        this.rosterChangesModel.cohortName = cohortName;
        this.sStorage = this.common.getStorage();
        this.sStorage.setItem('rosterChanges', JSON.stringify(this.rosterChangesModel))
        this.apiServer = this.auth.common.getApiServer();
        // check if cohort has Account Manager associated with it
        if (this.rosters.accountManagerId) {
            if(targetRoute === 'change-form') {
                this.getUserPreference();
            } 
            // else {
            // // redirect to extend access page
            // this.router.navigate(['/rosters/extend-access']);
            // }
        } else {
            this.router.navigate(['/rosters/no-account-manager']);
        }
    }

    printRoster(cohortId) {
        this.cohortToPrint = cohortId;
        this.hiddenForPrint = true;
        setTimeout(() => {
            window.print();
            this.hiddenForPrint = false;
        })
    }  

}

