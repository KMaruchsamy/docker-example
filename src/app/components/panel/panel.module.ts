import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from './panel.component';

@NgModule({
  declarations: [PanelComponent],
  imports: [CommonModule, PipesModule],
  exports: [PanelComponent],
})
export class PanelModule {}
