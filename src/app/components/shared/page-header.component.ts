import {Component, Input, OnInit} from '@angular/core';
import {NgClass} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
// import {AuthService} from '../../services/auth';
// import {DropdownMenu} from '../controls/dropdown-menu';
import { DropdownMenuComponent } from './../controls/dropdown-menu.component';
import { AuthService } from './../../services/auth.service';


@Component({
    selector: 'page-header',
    // providers: [AuthService],
    templateUrl: './page-header.component.html'
    // directives: [, DropdownMenuComponent, NgClass, RouterLinkActive]
})

export class PageHeaderComponent implements OnInit {
    @Input() showCover: boolean;
    @Input() ariaDisabled: boolean;
    @Input() hideDropdown: boolean;
    constructor() {
    }

    ngOnInit(): void {
    }
}

