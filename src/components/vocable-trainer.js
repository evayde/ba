import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';
import { unsafeHTML } from 'lit-html/lib/unsafe-html.js';

import '@polymer/paper-input/paper-input.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// This element is connected to the Redux store.
import { store } from '../store.js';
import { connect } from 'pwa-helpers/connect-mixin';

import { practiceVocable } from '../actions/vocabulary.js';

class VocableTrainer extends connect(store)(PageViewElement) {
  static get properties() { return {
    _answerGiven: { type: String },
    _cards: { type: Array },
    _card: { type: Object },
    _current: { type: Number },
    _checking: { type: Boolean },
    _historicCard: { type: Object },
    _historicStats: { type: Object },
    _analysis: { type: Object }
  }}

  constructor() {
    super();
    
    this._answerGiven = '';
    this._cards = [];
    // current index of cards
    this._current = 0;
    // User-Answer-Card, used to validate input
    this._card = null;
    // Currently checking user-input
    this._checking = false;
    // historic card evaluations
    this._historicCard = {};
    this._historicStats = {};

    // Analysis
    this._analysis = {};
  }

  render() {
    const { _card, _cards, _current, _answerGiven, _historicCard, _historicStats, _analysis } = this;

    return html`
      ${SharedStyles}
      <style>
        .button-container {
          display: flex;
        }

        paper-button[hidden] {
          display: none;
        }

        *[hidden] {
          display: none;
        }
      </style>
      <section>
        <h2>Practice vocabulary</h2>
        <p>This module will help you to practice vocables. It will remember your mistakes and attempt to guide you.</p>
      </section>
      <section>
        <h2>
          ${_card ? (_card.correct 
                      ? 'Hooray! Your answer is correct!' 
                      : html`Your answer is not correct :( you can try again or skip. Translate <q>${_cards[_current].de.text}</q>`
                    ) 
                  : html`Please translate <q>${_cards[_current].de.text}</q>`}
        </h2>
        <div class="stats" ?hidden="${Object.keys(_historicCard).length === 0}">
          <p>Your last answer was ${_historicCard.correct ? 'correct' : 'wrong'}</p>
          <p>
            You get this right ${(_historicStats.correct / _historicStats.answers) * 100}% 
            and achieved a score of ${_analysis[_cards[_current].id] ? _analysis[_cards[_current].id].score : 0}
          </p>
          <p ?hidden="${this._showWrongAnswer() === ''}">Last answer: ${unsafeHTML(this._showWrongAnswer())}</p>
        </div>
        <p>${this._showHints() ? 'Hint: ' + _cards[_current].en.mnemonic : ''}</p>
        <paper-input autofocus value="${_answerGiven}" placeholder="Translate ${_cards[_current].de.text}" @keyup="${e => this._onInputKeyUp(e)}" @value-changed="${e => this._answerGiven = e.target.value}"></paper-input>
        <div class="button-container">
          <paper-button ?hidden="${_card && _card.correct}" @click="${() => this._check()}">Check</paper-button>
          <paper-button class="grey" @click="${() => this._skip()}">Next</paper-button>
        </div>
      </section>
    `;
  }

  firstUpdated() {
    this._getHistoricStats();
  }

  _showWrongAnswer() {
    if (Object.keys(this._historicCard).length === 0 || this._historicCard.correct) {
      return '';
    }

    let answer = '';
    for (let i = 0; i < this._historicCard.givenAnswer.length; i++) {
      answer += this._historicCard.wrongIndex.indexOf(i) > -1 
                  ? `<s style="color:red;">${this._historicCard.givenAnswer[i]}</s>`
                  : this._historicCard.givenAnswer[i];
    }

    return answer;
  }

  _showHints() {
    return this._analysis[this._cards[this._current].id] && this._analysis[this._cards[this._current].id].score < 5 &&
           this._historicCard && !this._historicCard.correct;
  }

  _getHistoricStats() {
    // set last history Card
    let history = store.getState().history[this._cards[this._current].id];

    if (!history) {
      this._historicCard = {};
      return;
    }

    this._historicCard = history ? history[history.length - 1] : {};

    // get overall stats
    this._historicStats.answers = history.length;
    this._historicStats.correct = history.reduce((acc, curr) => curr.correct ? acc + 1 : acc, 0);
    this._historicStats.wrong = history.length - this._historicStats.correct;
  }

  _onInputKeyUp(e) {
    if (e.key === 'Enter') {
      if ((this._card && this._card.givenAnswer === this._answerGiven) || this._answerGiven === '') {
        this._skip();
      } else {
        this._check();
      }
    }
  }

  _check() {
    this._card = null;
    this._checking = true;
    store.dispatch(practiceVocable(this._cards[this._current].id, this._answerGiven, 'flashcard', this._showHints()));
    this._getHistoricStats();
  }

  _skip() {
    this._card = null;
    this._answerGiven = '';

    this._current = (this._current < this._cards.length - 1) ? this._current = this._current + 1 : 0;
    this._getHistoricStats();
  }

  _stateChanged(state) {
    this._cards = state.vocabulary.vocables;
    this._analysis = state.analysis;
    let vocableHistory = state.history[this._cards[this._current].id] || {};

    if (this._checking && !this._card) {
      this._card = vocableHistory[vocableHistory.length - 1];
      this._checking = false;
    }
  }
}

window.customElements.define('vocable-trainer', VocableTrainer);
