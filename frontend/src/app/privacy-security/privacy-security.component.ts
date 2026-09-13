/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-privacy-security',
  templateUrl: './privacy-security.component.html',
  styleUrls: ['./privacy-security.component.scss'],
  imports: [RouterOutlet]
})
export class PrivacySecurityComponent {}
