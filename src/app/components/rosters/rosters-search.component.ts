import { Subscription } from 'rxjs';
import { Input, ViewEncapsulation } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { links } from '../../constants/config';
import { CommonService } from './../../services/common.service';
import { RosterService } from './roster.service';
import { RosterCohortStudentsModel } from './../../models/roster-cohort-students.model';


@Component({
    selector: 'rosters-search',
    templateUrl: './rosters-search.component.html',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ['./rosters-search.component.css']
})
export class RostersSearchComponent implements OnInit, OnDestroy {
    _institutionId: number;
    @Input()
    set institutionId(value: number) {
        this._institutionId = value;
        if (value)
            this.validInstitution = true;
        this.resetSearch();
        $('.typeahead').typeahead('val', '');
        $('.typeahead').typeahead('destroy');
    }
    get institutionId() {
        return this._institutionId;
    }

    searchString: string;
    validInstitution: boolean = false;
    searchStudentsSubscription: Subscription;
    activeStudents: Array<RosterCohortStudentsModel>;
    inactiveStudents: Array<RosterCohortStudentsModel>;
    anyRepeatStudents: boolean = false;
    anyExpiredStudents: boolean = false;
    anyStudentPayStudents: boolean = false;
    anyDuplicateStudents: boolean = false;
    searchTriggered: boolean = false;
    prevSearchText: string = "";
    typeaheadStudentlist: any;
    typeahead: any;

    constructor(private common: CommonService, private rosterService: RosterService) { }


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

    ngOnDestroy() {
        if (this.searchStudentsSubscription)
            this.searchStudentsSubscription.unsubscribe();
        this.resetSearch();
        $('.typeahead').typeahead('val', '');
        $('.typeahead').typeahead('destroy');
    }

    resetSearch() {
        this.searchString = '';
        this.activeStudents = this.inactiveStudents = [];
        this.searchTriggered = false;
        this.typeaheadStudentlist = [];
        this.prevSearchText = '';
    }

    clear(e) {
        e.preventDefault();
        this.resetSearch();
        if (this.typeahead) {
            $('.typeahead').typeahead('val', '');
        }
    }

    filterStudents(students) {
        // need to get FirtName and LastName from each object in array and join with space to compare against search string 
        return _.filter(students, (student: any) => {
            let fullName = (student.FirstName + ' ' + student.LastName).toUpperCase();
            return fullName.indexOf(this.searchString.toUpperCase()) != -1
        });
    }

    searchStudents(e) {
        e.preventDefault();
        this.activeStudents = this.inactiveStudents = [];
        if (!this.institutionId || !this.searchString || this.searchString === '') {
            // this.activeStudents = this.inactiveStudents = [];
            return;
        }
        try {
            if (this.typeaheadStudentlist) {
                this.anyRepeatStudents = this.anyExpiredStudents = this.anyStudentPayStudents = this.anyDuplicateStudents = false;
                if (this.typeaheadStudentlist.Active && this.typeaheadStudentlist.Active.length > 0) {
                    this.activeStudents = this.mapStudents(this.filterStudents(this.typeaheadStudentlist.Active), true);
                }
                if (this.typeaheadStudentlist.InactiveOrExpired && this.typeaheadStudentlist.InactiveOrExpired.length > 0) {
                    this.inactiveStudents = this.mapStudents(this.filterStudents(this.typeaheadStudentlist.InactiveOrExpired), true);
                }
            }
            this.searchTriggered = true;
            setTimeout(() => {
                $('.has-popover').popover();
            });
            $('.typeahead').typeahead('close');
        } catch (error) {
            this.anyRepeatStudents = this.anyExpiredStudents = this.anyStudentPayStudents = this.anyDuplicateStudents =  false;
            this.activeStudents = this.inactiveStudents = [];
        }
    }

    mapStudents(objStudents: Array<any>, isActive: boolean) {
        if (!objStudents)
            return [];
        else if (objStudents.length === 0)
            return [];
        else
            return _.map(objStudents, (student: any) => {
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

                rosterCohortStudent.isDuplicate = _.some(objStudents, function (stud: any) {
                    return stud.StudentId !== student.StudentId
                        && student.FirstName.toUpperCase() === stud.FirstName.toUpperCase()
                        && student.LastName.toUpperCase() === stud.LastName.toUpperCase()
                });


                if (isActive) {

                    rosterCohortStudent.isRepeatStudent = !!rosterCohortStudent.repeatExpiryDate && moment(rosterCohortStudent.repeatExpiryDate).isAfter(new Date(), 'day');
                    rosterCohortStudent.isExpiredStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !rosterCohortStudent.studentPayInstitution);
                    rosterCohortStudent.isStudentPayDeactivatedStudent = (moment(rosterCohortStudent.userExpireDate).isSameOrBefore(new Date(), 'day') && !!rosterCohortStudent.studentPayInstitution);

                if (!this.anyDuplicateStudents) {
                    if (rosterCohortStudent.isDuplicate)
                        this.anyDuplicateStudents = true;
                }                    

                    if (!this.anyRepeatStudents) {
                        if (rosterCohortStudent.isRepeatStudent)
                            this.anyRepeatStudents = true;
                    }

                    if (!this.anyExpiredStudents) {
                        if (rosterCohortStudent.isExpiredStudent)
                            this.anyExpiredStudents = true;
                    }

                    if (!this.anyStudentPayStudents) {
                        if (rosterCohortStudent.isStudentPayDeactivatedStudent)
                            this.anyStudentPayStudents = true;
                    }

                }

                return rosterCohortStudent;
            });
    }

    getStudentsByName(studentName: string): void {
        this.searchString = studentName;
        let self = this;
        if ((this.searchString.length === 2 && this.prevSearchText != this.searchString)
            || (this.prevSearchText === '' && this.searchString.length >= 2)
            || (this.searchString.length >= 2 && this.prevSearchText.length > this.searchString.length)
            || (this.searchString.length >= 2 && !_.startsWith(this.searchString, this.prevSearchText) && this.prevSearchText != this.searchString)) {
            this.prevSearchText = this.searchString;
            let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.search}`;
            url = url.replace("§institutionId", this.institutionId.toString()).replace('§searchString', this.searchString);
            let searchStudentsObservable  = this.rosterService.searchStudents(url);
            this.searchStudentsSubscription = searchStudentsObservable
                .map(response => response.body)
                .subscribe((json: any) => {
                    if (json) {
                        this.typeaheadStudentlist = json;
                        let typeaheadSource: Array<string> = [];
                        if (json.Active) {
                            for (var i = 0; i < json.Active.length; i++) {
                                typeaheadSource.push(json.Active[i].FirstName + ' ' + json.Active[i].LastName);
                            }
                        }
                        if (json.InactiveOrExpired) {
                            for (var i = 0; i < json.InactiveOrExpired.length; i++) {
                                typeaheadSource.push(json.InactiveOrExpired[i].FirstName + ' ' + json.InactiveOrExpired[i].LastName);
                            }
                        }
                        if (this.typeahead) {
                            $('.typeahead').typeahead('destroy');
                        }

                        let source = new Bloodhound({
                            local: typeaheadSource,
                            queryTokenizer: Bloodhound.tokenizers.whitespace,
                            datumTokenizer: Bloodhound.tokenizers.whitespace
                        });
                        this.typeahead = $('.typeahead').typeahead({
                            hint: false,
                            highlight: true,
                            minLength: 2,
                        },
                            {
                                name: 'cohort',
                                source: source,
                                limit: Number.MAX_VALUE
                            });
                        $('.typeahead').focus();
                        $('.typeahead').on('typeahead:select', function (ev, suggestion) {
                            self.searchString = suggestion;
                            ev.preventDefault();
                            self.searchStudents(ev);
                        });
                    }
                },
                error => {
                    this.anyRepeatStudents = this.anyExpiredStudents = this.anyStudentPayStudents = false;
                    this.activeStudents = this.inactiveStudents = [];
                });
        }
    }

}
