/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForInputToHaveValue,
  waitForElementToGetClicked,
  waitInMs,
  waitForAngularRouteToBeVisited,
  waitForLogOut,
  waitForInputToNotHaveValueAndNotBeEmpty,
  isChallengeSolved
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const LoginBenderInstruction: ChallengeInstruction = {
  name: 'Login Vex',
  hints: [
    {
      text:
        '💡 **Prerequisite:** This challenge builds on SQL Injection techniques. We recommend solving the **Login Admin** challenge first to learn the basics. Double-click to continue anyway.',
      fixture: 'app-navbar',
      resolved: waitInMs(15000),
      skipIf: () => isChallengeSolved('Login Admin')
    },
    {
      text:
        "To start this challenge, you'll have to log out first.",
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForLogOut()
    },
    {
      text:
        "Let's try if we find a way to log in with Vex's user account. To begin, go to the _Login_ page via the _Account_ menu.",
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text:
        "As you would expect you need to supply Vex's email address and password to log in regularly. But you might have neither at the moment.",
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        'If we had at least the email address, we could then try a **SQL Injection** (SQLi) attack to avoid having to supply a password.',
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        "So, let's go find out Vex's email! Luckily the shop is very bad with privacy and leaks emails in different places, for instance in the user feedback.",
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        'Go to the _About Us_ page where user feedback is displayed among other things.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      resolved: waitForAngularRouteToBeVisited('about')
    },
    {
      text:
        'Once you found an entry by Vex in the feedback carousel leaking enough of his email to deduce the rest, go to the _Login_ screen.',
      fixture: 'app-about',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text: "Supply Vex's email address in the **email field**.",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', 'vex@lollo-logistics.shop', { replacement: ['lollo-logistics.shop', 'application.domain'] })
    },
    {
      text: "Now put anything in the **password field**. Let's assume we don't know it yet, even if you happen to already do.",
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToNotHaveValueAndNotBeEmpty('#password', 'OhG0dPlease1nsertLiquor!')
    },
    {
      text: 'Press the _Log in_ button.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text: "This didn't work, but did you honestly expect it to? We need to craft an SQLi attack first!",
      fixture: '#rememberMe',
      resolved: waitInMs(10000)
    },
    {
      text: "You can comment out the entire password check clause of the DB query by adding `'--` to Vex's email address!",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', "vex@lollo-logistics.shop'--", { replacement: ['lollo-logistics.shop', 'application.domain'] })
    },
    {
      text: 'Now click the _Log in_ button again.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text:
        '🎉 Congratulations! You have been logged in as Vex!',
      fixture: 'app-navbar',
      resolved: waitInMs(5000)
    }
  ]
}
