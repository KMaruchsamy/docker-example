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
  public displayedColumns: string[] = ['checkBox', 'Last Name', 'First Name', 'Cohort', 'Test', 'Testing Status'];
  public dataSource: MatTableDataSource<IFacultyApprovalStudent>;
  public numberOfStudentsConfirmed: number = 0;
  public numberOfStudentsNotConfirmed: number = 0;
  public emptyStateMessage: string = "";
  public selection: SelectionModel<any>;
  public isDisabled: boolean = false;
  public isNotConfirmedActive: boolean = true;
  public isConfirmedActive: boolean = false;
  public staticMessage: string = "";
  public institutionTimezone: string = "";
  public localTime;
  public schedStartTime;
  public schedEndTime;
  public searchString: string;
  public validInstitution: boolean = false;
  public notConfirmed: MatTableDataSource<IFacultyApprovalStudent>;
  public confirmed: MatTableDataSource<IFacultyApprovalStudent>;


  constructor(public common: CommonService) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    const initialSelection = [];
    const allowMultiSelect = true;
    this.selection = new SelectionModel<any>(allowMultiSelect, initialSelection);
    this.getTempStudents();
    this.dataSource = this.notConfirmed;
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

  // TODO: remove with new api service
  parseAttendanceNotConfirmed(students) {
    if (students && students.length) {
        this.numberOfStudentsNotConfirmed = students.length;
        return students.map(student => ({
            "First Name": student.FirstName,
            "Last Name": student.LastName,
            "Cohort": student.CohortName,
            "Test": student.StudentTestName,
            "Testing Status": 'Not Started',
            attendanceConfirmed: false
        }));
    }
    this.emptyStateMessage = AttendanceMessage.EmptyConfirmed;
    return [];
  }

  // TODO: remove with new api service
  parseAttendanceConfirmed(students) {
    if (students && students.length) {
        this.numberOfStudentsConfirmed = students.length;
        return students.map(student => ({
            "First Name": student.FirstName,
            "Last Name": student.LastName,
            "Cohort": student.CohortName,
            "Test": student.StudentTestName,
            "Testing Status": 'Started',
            attendanceConfirmed: true
        }));
    }
    this.emptyStateMessage = AttendanceMessage.EmptyNotConfirmed;
    return [];
  }

  // TODO: remove with new api service
  getTempStudents(): void {
    const students = this.schedule.selectedStudents;
    const half = Math.ceil(students.length / 2);
    this.notConfirmed = new MatTableDataSource(
        this.parseAttendanceNotConfirmed(students.slice(0, half))
    );
    this.confirmed = new MatTableDataSource(
        this.parseAttendanceConfirmed(students.slice(half))
    );
  }

  getAttendance(event, type: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'confirmed') {
      this.isConfirmedActive = true;
      this.isNotConfirmedActive = false;
      this.dataSource = this.confirmed;
    }
    else {
      this.isConfirmedActive = false;
      this.isNotConfirmedActive = true;
      this.dataSource = this.notConfirmed;
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
