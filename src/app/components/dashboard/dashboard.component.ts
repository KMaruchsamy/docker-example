import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as data from './../../../assets/json/template.json';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  templateJson: any;
  constructor(private httpClient:HttpClient) {
    // this.httpClient.get("assets/json/template.json").subscribe(data =>{
    //   console.log(JSON.stringify(data));
      //  this.templateJson = data;
    // })
   }

  
  ngOnInit(): void {
    //  alert('dashboard');
    this.templateJson = data;
    this.templateJson = this.templateJson.default;
    console.log(this.templateJson);
  }

}
