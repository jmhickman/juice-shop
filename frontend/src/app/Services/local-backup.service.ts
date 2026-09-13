/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { type Backup } from '../Models/backup.model'
import { CookieService } from 'ngy-cookie'

import { SnackBarHelperService } from './snack-bar-helper.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { from } from 'rxjs'
import { WindowRefService } from './window-ref.service'

@Injectable({
  providedIn: 'root'
})
export class LocalBackupService {
  private readonly cookieService = inject(CookieService)
  private readonly snackBarHelperService = inject(SnackBarHelperService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly windowRefService = inject(WindowRefService)

  private readonly VERSION = 1

  async save (fileName = 'lollo_logistics'): Promise<void> {
    const backup: Backup = { version: this.VERSION }

    backup.banners = {
      welcomeBannerStatus: this.cookieService.get('welcomebanner_status') ? this.cookieService.get('welcomebanner_status') : undefined,
      cookieConsentStatus: this.cookieService.get('cookieconsent_status') ? this.cookieService.get('cookieconsent_status') : undefined
    }
    backup.language = this.cookieService.get('language') ? this.cookieService.get('language') : undefined

    const blob = new Blob([JSON.stringify(backup)], { type: 'text/plain;charset=utf-8' })
    this.saveFile(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.json`)
  }

  saveFile (blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  restore (backupFile: File) {
    return from(backupFile.text().then((backupData) => {
      const backup: Backup = JSON.parse(backupData)

      if (backup.version === this.VERSION) {
        this.restoreCookie('welcomebanner_status', backup.banners?.welcomeBannerStatus)
        this.restoreCookie('cookieconsent_status', backup.banners?.cookieConsentStatus)
        this.restoreCookie('language', backup.language)

        const snackBarRef = this.snackBar.open('Backup has been restored from ' + backupFile.name, 'Apply changes now', {
          duration: 10000,
          panelClass: ['mat-body']
        })
        snackBarRef.onAction().subscribe(() => {
          this.windowRefService.nativeWindow.location.reload()
        })
      } else {
        this.snackBarHelperService.open(`Version ${backup.version} is incompatible with expected version ${this.VERSION}`, 'errorBar')
      }
    }).catch((err: Error) => {
      this.snackBarHelperService.open(`Backup restore operation failed: ${err.message}`, 'errorBar')
    }))
  }

  private restoreCookie (cookieName: string, cookieValue: string) {
    if (cookieValue) {
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      this.cookieService.put(cookieName, cookieValue, { expires })
    } else {
      this.cookieService.remove(cookieName)
    }
  }
}
