import { Component, OnInit, OnChanges, AfterViewChecked, ElementRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { Subscription, Observable } from 'rxjs/Rx';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { NgIf, NgFor } from '@angular/common';
import { ParseDatePipe } from '../../pipes/parsedate.pipe';
// import {TestService} from '../../services/test.service';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
import { links } from '../../constants/config';
import { TestScheduleModel } from '../../models/test-schedule.model';
import { SortPipe } from '../../pipes/sort.pipe';

@Component({
    selector: 'students-started-test-popup',
    templateUrl: './students-started-test.popup.component.html'
    // directives: [NgFor, NgIf],
    // pipes: [SortPipe]
})

export class StudentsStartedTestComponent implements OnInit {
    @Input() students;
    @Input() mainHeader;
    @Input() subContent;
    @Input() mainContent;
    @Input() pageName;
    @Output() onOK = new EventEmitter();
    @Output() onBack = new EventEmitter();
    constructor() { }


    ngOnInit(): void {
    }

    OK(e: any): void {
        this.onOK.emit(e);
    }

    back(e: any): void {
        this.onBack.emit(e);
    }

}