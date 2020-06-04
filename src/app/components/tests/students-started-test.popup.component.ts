import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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