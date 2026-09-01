/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForInputToHaveValue,
  waitForElementToGetClicked,
  waitInMs,
  waitForAngularRouteToBeVisited, waitForLogOut, waitForInputToNotHaveValueAndNotBeEmpty
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const LoginJimInstruction: ChallengeInstruction = {
  name: 'Login Leo',
  hints: [
    {
      text:
        "To start this challenge, you'll have to log out first.",
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForLogOut() // TODO Add check if "Login Admin" is solved and if not recommend doing that first
    },
    {
      text:
        "Let's try if we find a way to log in with Leo's user account. To begin, go to the _Login_ page via the _Account_ menu.",
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text:
        "As you would expect you need to supply Leo's email address and password to log in regularly. But you might have neither at the moment.",
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
        "So, let's go find out Leo's email! Luckily the shop is very bad with privacy and leaks emails in different places, for instance in the product reviews.",
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        'Go back to the product list and click on some to open their details dialog which also hold the user reviews.',
      fixture: '.fill-remaining-space',
      resolved: waitForAngularRouteToBeVisited('search')
    },
    {
      text:
        'Once you found a user review by Leo and learned his email, go to the _Login_ screen.',
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text: "Supply Leo's email address in the **email field**.",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', 'leo@lollo-logistics.shop', { replacement: ['lollo-logistics.shop', 'application.domain'] })
    },
    {
      text: "Now put anything in the **password field**. Let's assume we don't know it yet, even if you happen to already do.",
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToNotHaveValueAndNotBeEmpty('#password', 'ncc-1701')
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
      text: "You can comment out the entire password check clause of the DB query by adding `'--` to Leo's email address!",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', "leo@lollo-logistics.shop'--", { replacement: ['lollo-logistics.shop', 'application.domain'] })
    },
    {
      text: 'Now click the _Log in_ button again.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text:
        '🎉 Congratulations! You have been logged in as Leo!',
      fixture: 'app-navbar',
      resolved: waitInMs(5000)
    }
  ]
}
