import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';

import '@polymer/paper-input/paper-input.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// This element is connected to the Redux store.
import { store } from '../store.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { practiceVocable } from '../actions/vocabulary.js';

class VocableMapping extends connect(store)(PageViewElement) {
  static get properties() { return {
    _cards: { type: Array }
  }}

  constructor() {
    super();

    this._cards = [];
  }

  render() {
    const { _cards } = this;

    return html`
      ${SharedStyles}
      <style>
        .items {
          display: flex;
          align-items: center;
        }

        .items > ul {
          list-style: none;
          padding: 0;
        }

        .item > ul > li {
          cursor: pointer;
        }

        *[draggable=true] {
          background: #0000ff33;
        }

        .items[hidden] {
          display: none;
        }
      </style>
      <section>
        <h2>Map vocables</h2>
        <p>This module will help you to practice vocables. It will remember your mistakes and attempt to guide you.</p>
      </section>
      <section class="items" ?hidden="${_cards.length === 0}">
        <ul>
        ${_cards.map(card => html`
          <li draggable="true" @dragstart="${(e) => e.dataTransfer.setData('text', card.id)}">${card.de.text}</li>
        `)}
        </ul>
        <div class="divider">
          <span>➡</span>
        </div>
        <ul>
        ${_cards.map(card => html`
          <li @dragenter="${e => this._onDragEnter(e)}" @dragleave="${e => this._onDragLeave(e)}" @dragover="${e => e.preventDefault()}" @drop="${e => this._matchCards(e, card.id)}">${card.en.text}</li>
        `)}
        </ul>
      </section>
      <section @click="${() => this._refreshCards()}" class="items" ?hidden="${_cards.length > 0}">
        <p>No cards left. Get new cards.</p>
      </section>
    `;
  }

  _refreshCards() {
    this._cards = store.getState().vocabulary.vocables;
  }

  _onDragEnter(e) {
    e.preventDefault();
    // Give color feedback when dropping is possible
    e.target.style.backgroundColor = '#33330033';
  }

  _onDragLeave(e) {
    e.preventDefault();
    // Give color feedback when dropping is possible
    e.target.style.backgroundColor = 'initial';
  }

  _matchCards(e, id) {
    let draggedId = Number.parseInt(e.dataTransfer.getData('text'));
    let elementStyle = e.target.style;

    // Reset color feedback
    if (id === draggedId) {
      // dispatch succ
      elementStyle.backgroundColor = 'green';
    } else {
      // dispatch failed
      elementStyle.backgroundColor = 'red';
    }

    elementStyle.transition = 'all 1s';

    let answer = this._cards.find(c => c.id === id).en.text;
    store.dispatch(practiceVocable(draggedId, answer, 'mapping', false));
    
    setTimeout(() => {
      elementStyle.backgroundColor = 'initial';

      // Remove element from list
      let card = this._cards.find(c => c.id === draggedId);
      let index = this._cards.indexOf(card);
      this._cards = [...this._cards.slice(0, index), ...this._cards.slice(index + 1)]
    }, 1000);
  }

  updated(changedProps) {
    if (changedProps.has('active') && this.active) {
      // reload mapping
      this._cards = store.getState().vocabulary.vocables;
    }
  }

  _stateChanged(state) {
    if (this._cards.length === 0 && state.vocabulary.vocables.length !== 0) {
      this._refreshCards();
    }
  }
}

window.customElements.define('vocable-mapping', VocableMapping);
