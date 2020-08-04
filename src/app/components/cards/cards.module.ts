import { PrettyCardDirective } from './directives/pretty-card/pretty-card.directive';

import { LinksCardModule } from './links-card/links-card.module';
import { ProfileCardModule } from './profile-card/profile-card.module';
import { HtmlCardModule } from './html-card/html-card.module';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [PrettyCardDirective],
  imports: [HtmlCardModule, ProfileCardModule, LinksCardModule],
  exports: [
    HtmlCardModule,
    ProfileCardModule,
    LinksCardModule,
    PrettyCardDirective,
  ],
})
export class CardsModule {}
