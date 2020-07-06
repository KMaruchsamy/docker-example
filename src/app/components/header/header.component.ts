import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import  {Router} from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  
  @Input() header;
  username: string;

  constructor(public router: Router, public auth: AuthService) {
    this.username = this.auth.firstname + ' ' + this.auth.lastname;
  }
  logout(e) {
    this.auth.logout();
    e.preventDefault();
    this.router.navigate(['/logout']);
}
}
