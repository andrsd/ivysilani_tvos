import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import template from './template.hbs'
import API from 'lib/ivysilani.js'
import favorites from 'lib/favorites.js'
import History from 'lib/history.js'
import HB from 'lib/template-helpers.js'

let showInfo

var ProgrammeListPage = ATV.Page.create({
  name: 'programme-list',
  template: template,
  events: {
    highlight: 'onHighlight',
    holdselect: 'onHoldSelect'
  },
  ready: function (options, resolve, reject) {
    // Paging support
    let currentPage
    let pageSize = 20
    if ('paging' in options) { currentPage = options.paging.nextPage } else { currentPage = '1' }
    showInfo = options

    let getProgrammeList = ATV.Ajax.post(API.url.programmeList, API.xhrOptions({
        ID: showInfo.ID,
        'paging[episodes][currentPage]': currentPage,
        'paging[episodes][pageSize]': pageSize,
        'type[0]': 'episodes',
        'type[1]': 'related',
        'type[2]': 'bonuses'
      }))

    var promises = [ getProgrammeList ]
    promises.push(
      ATV.Ajax.post(API.url.programmeDetails,
        API.xhrOptions({
          ID: showInfo.ID
        })
      )
    )

    Promise
      .all(promises)
      .then((xhrs) => {
        let programmeList = fastXmlParser.parse(xhrs[0].response).programmes
        let programmeDetails = fastXmlParser.parse(xhrs[1].response).programme
        if (programmeDetails.description.length == 0) {
          programmeDetails.description = options.synopsis
        }

        // Modifikace pagování, odstraň paging, pokud se všechno vešlo na 1 stránku
        if (programmeList.episodes.paging.pagesCount === 1) {
          delete programmeList.episodes.paging
        }
        // U některých pořadů má iVysílání chybu -> ukazuje, že je více stránek,
        // přitom další už je prázdná
        if (programmeList.episodes.programme.length < pageSize) {
          delete programmeList.episodes.paging
        }
        // Pokud to není seriál ale film, obal to do pole, kvůli korektnímu zobrazení
        // Kvuli konverzti XML -> JSON. fastXMLParser hodí jednu epizodu jako child, ne jako pole
        if (!(programmeList.episodes.programme.constructor === Array)) {
          programmeList.episodes.programme = [programmeList.episodes.programme]
        }

        for (var e of programmeList.episodes.programme) {
          e.watched = History.watched(e.ID)
        }

        resolve({
          favoriteButton: favorites.badge(showInfo.ID),
          details: programmeDetails,
          related: programmeList.related.programme,
          showInfo: showInfo,
          paging: programmeList.episodes.paging,
          single: programmeList.episodes.programme.length == 1,
          episodes: programmeList.episodes.programme
        })
      }, (xhr) => {
        reject()
      })
  },
  afterReady (doc) {
    const changeFavorites = () => {
      favorites.change(showInfo.title, showInfo.ID)
      doc.getElementById('favButton').innerHTML = favorites.badge(showInfo.ID)
    }

    doc
      .getElementById('favButton')
      .addEventListener('select', changeFavorites)
  },
  onHighlight(e) {
    let element = e.target
    let elementType = element.nodeName

    if (elementType === 'listItemLockup') {
      var ph = element.getElementsByTagName("placeholder").item(0)

      var doc = getActiveDocument()
      doc.getElementById('description').innerHTML = ph.innerHTML
    }
  },
  onHoldSelect(e) {
    let element = e.target
    let elementType = element.nodeName

    if (elementType === 'listItemLockup') {
      var programme = JSON.parse(element.getAttribute("data-href-page-options"))
      ATV.Navigation.navigate('programme-context-menu', {
         programme: programme
      })

      var watched = History.watched(programme.ID)
      var ordinal = element.getElementsByTagName('ordinal').item(0)
      ordinal.innerHTML = HB.helpers.watchedState(watched)
    }
  },
})

export default ProgrammeListPage
