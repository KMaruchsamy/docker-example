import {Component, Input, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
// import {AuthService} from '../../services/auth';
// import {DropdownMenu} from '../controls/dropdown-menu';
import { AuthService } from './../../services/auth.service';
// import { HeaderComponent } from "../header/header.component";


@Component({
    selector: 'page-header',
    // providers: [AuthService],
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss']
    // directives: [, DropdownMenuComponent, NgClass, RouterLinkActive]
})

export class PageHeaderComponent implements OnChanges{
    @Input() showCover: boolean;
    @Input() ariaDisabled: boolean;
    @Input() hideDropdown: boolean;
    header: any;
    username: string;

  constructor(public router: Router, public auth: AuthService) {
    this.updateHeaderBasedOnTemplate();
    // this.showCover = true;
    // this.hideDropdown = true;
  }
  ngOnChanges() {
    this.updateHeaderBasedOnTemplate();
  }
  updateHeaderBasedOnTemplate() {
    this.username = this.auth.firstname + ' ' + this.auth.lastname;
    this.header = (this.auth.dashboardTemplate) ? JSON.parse(this.auth.dashboardTemplate).header : "";
  }
  logout(e) {
    this.auth.logout();
    e.preventDefault();
    this.router.navigate(['/logout']);
}
}

