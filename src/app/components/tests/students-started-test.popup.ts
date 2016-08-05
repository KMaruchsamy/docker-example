import {Component, OnInit, OnChanges, AfterViewChecked, ElementRef, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {DomSanitizationService, SafeUrl} from '@angular/platform-browser';
import {Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart} from '@angular/router';
import {Subscription, Observable} from 'rxjs/Rx';
import {Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {NgIf, NgFor} from '@angular/common';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {TestScheduleModel} from '../../models/testSchedule.model';

@Component({
    selector: 'students-started-test-popup',
    templateUrl: 'templates/tests/students-started-test.popup.html',
    directives: [NgFor, NgIf]
})

export class StudentsStartedTest implements OnInit {
    @Input() students;
    @Output() onOK = new EventEmitter();
    constructor() { }


    ngOnInit(): void {
        console.log(this.students);
    }

    OK(e:any): void{
        this.onOK.emit(e);
   }

}