/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { dom } from '@fortawesome/fontawesome-svg-core'
import { RouterOutlet } from '@angular/router'
import { WelcomeComponent } from './welcome/welcome.component'
import { CtfSystemWideNotificationComponent } from './ctf-system-wide-notification/ctf-system-wide-notification.component'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { NavbarComponent } from './navbar/navbar.component'
import { SidenavComponent } from './sidenav/sidenav.component'
import { MatSidenavContainer, MatSidenav } from '@angular/material/sidenav'

dom.watch()

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [MatSidenavContainer, MatSidenav, SidenavComponent, NavbarComponent, ServerStartedNotificationComponent, CtfSystemWideNotificationComponent, WelcomeComponent, RouterOutlet]
})
export class AppComponent {
}
