import { Injectable } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private angulartics2: Angulartics2) {
  }

  track(action: string, properties?: any) {
    const eventOptions: any = {
      action: action,
      properties: properties
    };

    this.angulartics2.eventTrack.next(eventOptions);
  }
}
