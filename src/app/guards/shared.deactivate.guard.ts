import {Router, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized } from "@angular/router";
import { Observable, Subscription } from "rxjs/Rx";
import {Injectable} from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';

// export interface ComponentCanDeactivate {
//   canDeactivate: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => boolean | Observable<boolean>;
// }

// @Injectable()
// export class SharedDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
//   canDeactivate(component: ComponentCanDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
//     debugger;
//     return component.canDeactivate ? component.canDeactivate(route, state) : true;
//   }
// }


@Injectable()
export class SharedDeactivateGuard implements CanDeactivate<any> {
  constructor(private router: Router) {

  }

  canDeactivate(component: any, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate ? component.canDeactivate() : true
  }
}
