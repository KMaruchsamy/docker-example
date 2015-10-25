import {Component, View} from 'angular2/angular2';
import {Router,Location} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
import {DashboardHeader} from './dashboard-header';
import {DashboardPod1} from './dashboard-pod1';
import {DashboardPod2} from './dashboard-pod2';
import {DashboardPod3} from './dashboard-pod3';
import {DashboardPod4} from './dashboard-pod4';
import {Auth} from '../../services/auth';

@Component({
    selector: 'home',
    viewBindings:[Auth]
})
@View({
  templateUrl: '../../templates/home/home.html',
  directives:[PageHeader,DashboardHeader,DashboardPod1,DashboardPod2,DashboardPod3,DashboardPod4]
})
export class Home {
  constructor(router: Router, auth:Auth,location:Location) {
      this.router = router;
      this.auth = auth;
      this.location=location;
      this.redirectToPage();
      this.initialize();
  }
  redirectToPage(){
      if(this.location.path().search("first")>0){
          if((this.auth.istemppassword=="true"?true:false) && this.auth.isAuth())
              this.router.parent.navigateByUrl('/login');
      }
      else if (!this.auth.isAuth())
          this.router.parent.navigateByUrl('/login');
  }
  initialize(){
    $('title').html('Faculty Home Page');
  }

  redirectToLogin(event) {
    event.preventDefault(); 
    this.router.parent.navigateByUrl('/login');    
  }
}