/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Component, EventEmitter, NgZone, type OnInit, Output, inject, ChangeDetectionStrategy } from '@angular/core'
import { AdministrationService } from '../Services/administration.service'
import { Router, RouterLink } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { ConfigurationService } from '../Services/configuration.service'
import { LoginGuard } from '../app.guard'
import { roles } from '../roles'
import { MatDivider } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { NgClass } from '@angular/common'

import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatNavList, MatListSubheaderCssMatStyler, MatListItem } from '@angular/material/list'
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [MatToolbar, MatToolbarRow, MatNavList, MatButtonModule, MatListSubheaderCssMatStyler, TranslateModule, MatListItem, RouterLink, MatIconModule, NgClass, MatDivider]
})
export class SidenavComponent implements OnInit {
  private readonly administrationService = inject(AdministrationService)
  private readonly ngZone = inject(NgZone)
  private readonly userService = inject(UserService)
  private readonly cookieService = inject(CookieService)
  private readonly router = inject(Router)
  private readonly configurationService = inject(ConfigurationService)
  private readonly loginGuard = inject(LoginGuard)

  public applicationName = 'Lollo Logistics'
  public showGitHubLink = true
  public userEmail = ''
  public version = ''
  public showPrivacySubmenu = false
  public showOrdersSubmenu = false
  public isShowing = false
  @Output() public sidenavToggle = new EventEmitter()

  ngOnInit (): void {
    this.administrationService.getApplicationVersion().subscribe({
      next: (version: any) => {
        if (version) {

          this.version = `v${version}`
        }
      },
      error: (err) => { console.log(err) }
    })
    this.getApplicationDetails()

    if (localStorage.getItem('token')) {
      this.getUserDetails()
    } else {
      this.userEmail = ''
    }

    this.userService.getLoggedInState().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.getUserDetails()
      } else {
        this.userEmail = ''
      }
    })
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe({ next: () => { this.noop() }, error: (err) => { console.log(err) } })
    localStorage.removeItem('token')
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
    sessionStorage.removeItem('itemTotal')
    sessionStorage.removeItem('guestBasket')
    this.userService.isLoggedIn.next(false)
    this.ngZone.run(async () => await this.router.navigate(['/']))
  }

  goToProfilePage () {
    window.location.replace(environment.hostServer + '/profile')
  }

  goToDataErasurePage () {
    window.location.replace(environment.hostServer + '/privacy/erase')
  }


  noop () { }

  getUserDetails () {
    this.userService.whoAmI(['email']).subscribe({
      next: (user: any) => {
        this.userEmail = user.email
      },
      error: (err) => { console.log(err) }
    })
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit()
  }

  getApplicationDetails () {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config: any) => {
        if (config?.application?.name) {
          this.applicationName = config.application.name
        }
        if (config?.application) {
          this.showGitHubLink = config.application.showGitHubLinks ?? true
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  isAccounting () {
    const payload = this.loginGuard.tokenDecode()
    return payload?.data?.role === roles.accounting
  }

}
