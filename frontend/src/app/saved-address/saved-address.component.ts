/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { AddressComponent } from '../address/address.component'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-saved-address',
  templateUrl: './saved-address.component.html',
  styleUrls: ['./saved-address.component.scss'],
  imports: [AddressComponent]
})

export class SavedAddressComponent {
}
