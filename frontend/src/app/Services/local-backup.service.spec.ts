/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { firstValueFrom, of, Subject, throwError } from 'rxjs'

import { LocalBackupService } from './local-backup.service'
import { CookieModule, CookieService } from 'ngy-cookie'
import { TranslateNoOpLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackBarHelperService } from './snack-bar-helper.service'
import { WindowRefService } from './window-ref.service'

describe('LocalBackupService', () => {
    let snackBar: any
    let cookieService: any
    let windowRefService: any
    let snackBarAction$: Subject<any>

    beforeEach(() => {
        snackBarAction$ = new Subject()
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }
        const snackBarRef = {
            onAction: () => snackBarAction$.asObservable()
        }
        snackBar.open.mockReturnValue(snackBarRef)

        windowRefService = {
            nativeWindow: {
                location: {
                    reload: vi.fn().mockName("window.location.reload")
                }
            }
        }

        TestBed.configureTestingModule({
            imports: [
                CookieModule.forRoot(),
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateNoOpLoader
                    }
                })
            ],
            providers: [
                { provide: MatSnackBar, useValue: snackBar },
                { provide: WindowRefService, useValue: windowRefService },
                CookieService,
                LocalBackupService
            ]
        })
        cookieService = TestBed.inject(CookieService)
    })

    it('should be created', () => {
        const service = TestBed.inject(LocalBackupService)

        expect(service).toBeTruthy()
    })

    it('should save language to file', async () => {
        const service = TestBed.inject(LocalBackupService)
        const saveFileSpy = vi.spyOn(service, 'saveFile').mockImplementation(() => {})

        cookieService.put('language', 'de')
        await service.save()

        const blob = new Blob([JSON.stringify({ version: 1, language: 'de' })], { type: 'text/plain;charset=utf-8' })
        expect(saveFileSpy).toHaveBeenCalledWith(blob, `owasp_juice_shop-${new Date().toISOString().split('T')[0]}.json`)
    })

    it('should restore language from backup file', async () => {
        const service = TestBed.inject(LocalBackupService)
        cookieService.put('language', 'de')
        await firstValueFrom(service.restore(new File(['{ "version": 1, "language": "cn" }'], 'test.json')))
        expect(cookieService.get('language')).toBe('cn')
        expect(snackBar.open).toHaveBeenCalled()
    })

    it('should not restore language from an outdated backup version', async () => {
        const service = TestBed.inject(LocalBackupService)
        cookieService.put('language', 'de')
        await firstValueFrom(service.restore(new File(['{ "version": 0, "language": "cn" }'], 'test.json')))
        expect(cookieService.get('language')).toBe('de')
        expect(snackBar.open).toHaveBeenCalled()
    })



    it('should handle restore error and show snackbar', async () => {
        const service = TestBed.inject(LocalBackupService)
        const snackBarHelperService = TestBed.inject(SnackBarHelperService)
        const spy = vi.spyOn(snackBarHelperService, 'open')

        await firstValueFrom(service.restore(new File(['invalid JSON'], 'test.json')))
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Backup restore operation failed'), 'errorBar')
    })


})
