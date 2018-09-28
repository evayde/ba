import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';

import '@polymer/paper-input/paper-input.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// This element is connected to the Redux store.
import { store } from '../store.js';
import { connect } from 'pwa-helpers/connect-mixin';

class VocableOverview extends connect(store)(PageViewElement) {
  static get properties() { return {
    _cards: { type: Array },
    _history: { type: Object }
  }}

  constructor() {
    super();

    this._cards = [];
    this._history = {};
  }

  render() {
    const { _cards, _history } = this;

    return html`
      ${SharedStyles}
      <style>
        .header,
        .stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header h3 {
          margin: 0;
        }
        
        .module h6 {
          margin: 0;
        }
      </style>
      <section>
        <h2>Learning overview</h2>
        <p>Learning Overview.</p>
      </section>
      ${_cards.map(c => html`
        <section>
          <div class="header"><h3>#${c.id}</h3><span>${c.en.text} - ${c.de.text}</span></div>
          <div class="body">
            <div class="stat">
              <span>Answers</span>
              <span>
                <span>total ${_history[c.id] ? _history[c.id].length : 0}</span> /
                <span>correct ${_history[c.id] ? _history[c.id].reduce((acc, cur) => cur.correct ? acc + 1 : acc, 0) : 0}</span>
              </span>
            </div>
            <div class="stat">
              <span>With hints</span>
              <span>
                <span>total ${_history[c.id] ? _history[c.id].reduce((acc, cur) => cur.hints ? acc + 1 : acc, 0) : 0}</span> /
                <span>correct ${_history[c.id] ? _history[c.id].reduce((acc, cur) => cur.correct && cur.hints ? acc + 1 : acc, 0) : 0}</span>
              </span>
            </div>
            <div class="stat">
              <span>In Module</span>
              ${['flashcard', 'mapping'].map(type => html`
                <div class="module">
                  <h6>${type}</h6>
                  <div>
                    <span>total ${_history[c.id] ? _history[c.id].reduce((acc, cur) => cur.type === type ? acc + 1 : acc, 0) : 0}</span> /
                    <span>correct ${_history[c.id] ? _history[c.id].reduce((acc, cur) => cur.correct && cur.type === type ? acc + 1 : acc, 0) : 0}</span>
                  </div>
                </div>
              `)}
            </div>
          </div>
        </section>
      `)}
    `;
  }

  _stateChanged(state) {
    this._cards = state.vocabulary.vocables;
    this._history = state.history;
  }
}

window.customElements.define('vocable-overview', VocableOverview);
