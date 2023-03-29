import { Component, Input, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { TestScheduleModel } from '../../models/test-schedule.model';
import { IFacultyApprovalStudent } from '../../models/faculty-approval-student.model.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from './../../services/common.service';
import { AttendanceMessage } from '../../models/faculty-approval.enum';

@Component({
    selector: "faculty-approval",
    templateUrl: "./faculty-approval.component.html"
})
export class FacultyApprovalComponent implements OnInit {

    @Input() schedule: TestScheduleModel;
    displayedColumns: string[] = ['checkBox', 'Last Name', 'First Name', 'Cohort', 'Test', 'Testing Status'];
    public dataSource: MatTableDataSource<IFacultyApprovalStudent>;
    numberOfStudentsConfirmed: number = 0;
    numberOfStudentsNotConfirmed: number = 0;
    emptyStateMessage: string = "";
    selection: SelectionModel<any>;
    isDisabled: boolean = false;
    isNotConfirmedActive: boolean = true;
    isConfirmedActive: boolean = false;
    staticMessage: string = "";
    institutionTimezone: string = "";
    localTime;
    schedStartTime;
    schedEndTime;
    searchString: string;
    validInstitution: boolean = false;


    constructor(public common: CommonService) { }

    ngOnInit(): void {
        this.dataSource = new MatTableDataSource([]);
        const initialSelection = [];
        const allowMultiSelect = true;
        this.selection = new SelectionModel<any>(allowMultiSelect, initialSelection);
        this.displayAttendanceNotConfirmed();
        this.isConfirmedActive = false;
        this.isNotConfirmedActive = true;
        this.setTime();
        this.isDisabled = this.isBeforeStartTime();
        this.staticMessage = this.getStaticMessage();
    }

    setTime(): void {
        this.institutionTimezone = this.common.getTimezone(this.schedule.institutionId);
        this.localTime = moment();
        this.schedStartTime = moment(this.schedule.scheduleStartTime);
        this.schedEndTime = moment(this.schedule.scheduleEndTime);
    }

    getStaticMessage(): string {
        if (this.isBeforeStartTime()) {
            this.isDisabled = true;
            return AttendanceMessage.BeforeTestWindow;
        }
        else if (this.isWithinTime()) {
            this.isDisabled = false;
            return AttendanceMessage.DuringTestWindow;
        }
        else {
            this.isDisabled = true;
            this.emptyStateMessage = AttendanceMessage.EmptyNotConfirmed;
            return AttendanceMessage.AfterTestWindow;
        }
    }

    isWithinTime(): boolean {
        const minRemaining = Math.abs(this.localTime.diff(this.schedStartTime, 'minutes'));
        const validDateRange = this.localTime.isBetween(this.schedStartTime, this.schedEndTime);
        return (minRemaining > 0 && minRemaining < 20) || validDateRange
    }

    isBeforeStartTime(): boolean {
        if (this.localTime.isBefore(this.schedStartTime)) {
            return Math.abs(this.localTime.diff(this.schedStartTime, 'minutes')) >= 20;
        }
        else return false;
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.connect().value.length;
        return numSelected == numRows;
    }

    toggleAllRows() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.connect().value.forEach(row => this.selection.select(row));
    }

    // TODO: This is temporary.  Remove when API is finished.
    parseResults(results) {
        if (results && results.length) {
            return results.map(student => ({
                "First Name": student.FirstName,
                "Last Name": student.LastName,
                "Cohort": student.CohortName,
                "Test": student.StudentTestName,
                "Testing Status": 'Not Started',
                attendanceConfirmed: false
            }));
        }
        return [];
    }

    displayAttendanceNotConfirmed() {
        this.dataSource = new MatTableDataSource(
            this.parseResults(this.schedule.selectedStudents)
        );
        this.numberOfStudentsNotConfirmed = this.dataSource.connect().value.length;
        if (this.numberOfStudentsNotConfirmed === 0)
            this.emptyStateMessage = AttendanceMessage.EmptyNotConfirmed;
    }

    displayAttendanceConfirmed() {
        this.dataSource = new MatTableDataSource([]);;
        this.numberOfStudentsConfirmed = this.dataSource.connect().value.length;
        if (this.numberOfStudentsConfirmed === 0)
            this.emptyStateMessage = AttendanceMessage.EmptyConfirmed;
    }

    getAttendance(event, type: string): void {
        event.preventDefault();
        event.stopPropagation();
        if (type === 'confirmed') {
            this.isConfirmedActive = true;
            this.isNotConfirmedActive = false;
            this.displayAttendanceConfirmed();
        }
        else {
            this.isConfirmedActive = false;
            this.isNotConfirmedActive = true;
            this.displayAttendanceNotConfirmed();
        }
    }

    refreshData(event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    exportToExcel(event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    searchStudents(event): void {

    }

    getStudentsByName(event): void {

    }
}
