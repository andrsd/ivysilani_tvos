import ATV from 'atvjs'

// template helpers
import 'lib/template-helpers'
// raw css string
import css from 'assets/css/app.css'
// shared templates
import loaderTpl from 'shared/templates/loader.hbs'
import errorTpl from 'shared/templates/error.hbs'

// pages
import HomePage from 'pages/home'
import DatesPage from 'pages/dates'
import FavoritesPage from 'pages/favorites'
import LivePage from 'pages/live'

import AlphabetLetterPage from 'pages/alphabet-letter'
import DatesDatePage from 'pages/dates-date'
import ProgrammeListPage from 'pages/programme-list'

import ProgrammeDetailsPage from 'pages/programme-details'
import ProgrammeContextMenuPage from 'pages/programme-context-menu'
import PlayPage from 'pages/play'

ATV.start({
  style: css,
  menu: {
    items: [{
      id: 'home',
      name: 'Domů',
      page: HomePage,
      attributes: { autoHighlight: true, reloadOnSelect: true }
    }, {
      id: 'dates',
      name: 'Program',
      page: DatesPage,
      attributes: { reloadOnSelect: true }
    },{
      id: 'favorites',
      name: 'Oblíbené',
      page: FavoritesPage,
      attributes: { reloadOnSelect: true }
    },{
      id: 'live',
      name: 'Živé vysílání',
      page: LivePage,
      attributes: { reloadOnSelect: true }
    }]
  },
  templates: {
    loader: loaderTpl,
    error: errorTpl,
    // status level error handlers
    status: {
      '404': () => errorTpl({
        title: '404',
        message: 'Page cannot be found!'
      }),
      '500': () => errorTpl({
        title: '500',
        message: 'An unknown error occurred in the application. Please try again later.'
      }),
      '503': () => errorTpl({
        title: '500',
        message: 'An unknown error occurred in the application. Please try again later.'
      }),
      '502': () => errorTpl({
        title: 'Spatna brana',
        message: 'Ceska televize to ma rozbity. Zkus to pozdeji.'
      })
    }
  },
  onLaunch (options) {
    ATV.Menu.setOptions({
      loadingMessage: 'Načítání'
    })
    ATV.Navigation.navigateToMenuPage()
  },
  onResume (options) {
  }
})
