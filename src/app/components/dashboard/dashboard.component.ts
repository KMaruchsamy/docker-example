import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import betaTemplate from '../../../assets/json/template_beta.json';
import nonBetaTemplate from '../../../assets/json/template_non_beta.json';
import { MatSelect } from '@angular/material/select';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  templateJson: any;
  institutions: any[];
  isBetaInstitution = false;
  selectedInstitution;
  username: string;
  @ViewChild(MatSelect, { static: true }) institutionList: MatSelect;

  constructor(public location: Location, public auth: AuthService, public router: Router) {
  }

  ngOnInit(): void {
    this.templateJson = betaTemplate;
    this.auth.dashboardTemplate = JSON.stringify(this.templateJson);
    this.username = this.auth.firstname + ' ' + this.auth.lastname;
    this.redirectToPage();
    if(this.auth.isAuth()){
      this.loadInstitutions();
    }
  }

  redirectToPage(): void {
    if (this.location.path().search("first") > 0) {
        if (this.auth.istemppassword && this.auth.isAuth())
            this.router.navigate(['/']);
    }
    else if (!this.auth.isAuth())
        this.router.navigate(['/']);
}
  loadInstitutions() {
    this.institutions = (JSON.parse(this.auth.institutions) as any[]).sort(
      (a, b) => b.InstitutionId - a.InstitutionId
    );
    this.selectedInstitution = this.institutions[0];
    this.institutionList.value = this.selectedInstitution.InstitutionId;
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }

  loadTemplate() {
    this.templateJson = this.isBetaInstitution ? betaTemplate : nonBetaTemplate;
    this.auth.dashboardTemplate = JSON.stringify(this.templateJson);
  }

  onInstitutionSelected(e) {
    this.selectedInstitution = this.institutions.find((i) => {
      return i.InstitutionId === e.value;
    });
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }
}
