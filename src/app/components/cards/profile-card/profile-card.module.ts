import { DirectivesModule } from './../../../directives/directives.module';
import { PipesModule } from './../../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCardComponent } from './profile-card.component';
import { MaterialModule } from './../../../material.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ProfileCardComponent],
  imports: [
    CommonModule,
    PipesModule,
    MaterialModule,
    RouterModule,
    DirectivesModule
  ],
  exports: [ProfileCardComponent]
})
export class ProfileCardModule {}
