import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubheaderComponent } from './subheader.component';

@NgModule({
  declarations: [SubheaderComponent],
  imports: [CommonModule, PipesModule],
  exports: [SubheaderComponent],
})
export class SubheaderModule {}
