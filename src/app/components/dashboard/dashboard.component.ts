import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import betaTemplate from '../../../assets/json/template_beta.json';
import nonBetaTemplate from '../../../assets/json/template_non_beta.json';
import { MatSelect } from '@angular/material/select';

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
  @ViewChild(MatSelect, { static: true }) institutionList: MatSelect;
  constructor(private httpClient: HttpClient, public auth: AuthService) {}

  ngOnInit(): void {
    this.templateJson = betaTemplate;
    console.log(this.templateJson);
    this.loadInstitutions();
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
  }

  onInstitutionSelected(e) {
    this.selectedInstitution = this.institutions.find((i) => {
      return i.InstitutionId === e.value;
    });
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }
}
