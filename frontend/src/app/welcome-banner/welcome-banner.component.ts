/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject, ChangeDetectionStrategy } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialogRef } from '@angular/material/dialog'
import { CookieService } from 'ngy-cookie'
import { TranslateModule } from '@ngx-translate/core'

import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-welcome-banner',
  templateUrl: 'welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.scss'],
  imports: [MatButtonModule, MatTooltip, MatIconModule, TranslateModule]
})
export class WelcomeBannerComponent implements OnInit {
  dialogRef = inject<MatDialogRef<WelcomeBannerComponent>>(MatDialogRef)
  private readonly configurationService = inject(ConfigurationService)
  private readonly cookieService = inject(CookieService)

  public title = 'Welcome to Lollo Logistics!'
  public message = "<p>Lollo Logistics is your one-stop shop for premium shipping supplies, logistics equipment, and delivery services. Browse our catalog of carefully curated products designed to keep your shipments moving smoothly.</p><h1><a href='https://lollo-logistics.shop' target='_blank'>https://lollo-logistics.shop</a></h1>"
  public showHackingInstructor = true
  public showDismissBtn = true

  private readonly welcomeBannerStatusCookieKey = 'welcomebanner_status'

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
        if (config?.application?.welcomeBanner) {
          this.title = config.application.welcomeBanner.title
          this.message = config.application.welcomeBanner.message
        }
        this.showHackingInstructor = config?.hackingInstructor?.isEnabled
        // Don't allow to skip the tutorials when restrictToTutorialsFirst and showHackingInstructor are enabled
        if (this.showHackingInstructor && config?.challenges?.restrictToTutorialsFirst) {
          this.dialogRef.disableClose = true
          this.showDismissBtn = false
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  startHackingInstructor () {
    this.closeWelcome()
    console.log('Starting instructions for challenge "Score Board"')
    this.launchHackingInstructor('Score Board')
  }

  protected launchHackingInstructor (challengeName: string) {
    import('../../hacking-instructor').then(module => {
      module.startHackingInstructorFor(challengeName)
    })
  }

  closeWelcome (): void {
    this.dialogRef.close()
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    this.cookieService.put(this.welcomeBannerStatusCookieKey, 'dismiss', { expires })
  }
}
