import { PipesModule } from './../../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinksCardComponent } from './links-card.component';
import { MaterialModule } from '../../../material.module';
import { DirectivesModule } from './../../../directives/directives.module';

@NgModule({
  declarations: [LinksCardComponent],
  imports: [CommonModule, PipesModule, MaterialModule, DirectivesModule],
  exports: [LinksCardComponent]
})
export class LinksCardModule {}
