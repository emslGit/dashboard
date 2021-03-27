import {Component} from '@angular/core'
import {Router} from '@angular/router'
import {DashboardService} from '../dashboard.service'
import {HttpClient} from '@angular/common/http'

const KEY = 'cebd7a90-76ed-44f6-809c-316d6385120c'

type Word = {
  word: string,
  synonyms: string[],
  descriptions: string[],
  usages: string[],
}

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.sass']
})
export class DictionaryComponent {
  time: Date
  night: boolean
  started: boolean
  wordStrs: string[] = []
  word: Word
  show: boolean

  constructor(private router: Router, private http: HttpClient, public service: DashboardService) {
    this.time = DashboardService.getTime()
    this.init(http)
  }

  async init(http: HttpClient) {
    this.wordStrs = await http.get('assets/words.txt', {responseType: 'text'}).toPromise().then(data => {
      return data.split('\n')
    })
    this.getRandomWord()
  }

  getInput() {
    if (this.word.synonyms.includes(document.getElementById('dict-box')['value'].toLowerCase())) {
      document.getElementById('dict-box')['value'] = ''
      this.getRandomWord()
    }
  }

  getRandomWord() {
    this.show = false
    if (!this.wordStrs.length) {
      this.router.navigate(['/'])
    }

    const i = Math.floor(Math.random() * this.wordStrs.length)
    this.word = this.fetchWord(this.wordStrs[i])
    this.wordStrs.splice(i, 1)
  }

  fetchWord(wordStr: string) {
    const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${wordStr}?key=${KEY}`
    const synonyms: string[] = []
    const descriptions: string[] = []
    const usages: string[] = []

    this.http.get(url).toPromise().then(res => {
      if (res[0].def) {
        const def = res[0].def[0].sseq
        def.forEach(x => {
          if (x[0][1].syn_list) {
            x[0][1].syn_list.flat(1).forEach(syn => {
              if (!synonyms.includes(syn.wd)) {
                synonyms.push(syn.wd)
              }
            })
          } else if (res[0].meta.syns[0]) {
            res[0].meta.syns[0].forEach(syn => {
              if (!synonyms.includes(syn)) {
                synonyms.push(syn)
              }
            })
          } else {
            console.log('error with word', wordStr, res)
            this.getRandomWord()
          }
          if (x[0][1].dt[1]) {
            descriptions.push(x[0][1].dt[0][1])
            usages.push(x[0][1].dt[1][1][0].t.replace('{it}', '').replace('{/it}', ''))
          }
        })
      } else {
        console.log('error with word', wordStr, res)
        this.getRandomWord()
      }
    })

    return {
      word: wordStr,
      synonyms,
      descriptions,
      usages
    }
  }
}

