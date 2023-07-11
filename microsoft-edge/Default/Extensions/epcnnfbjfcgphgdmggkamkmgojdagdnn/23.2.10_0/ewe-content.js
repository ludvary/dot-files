/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./core/lib/common.js":
/*!****************************!*\
  !*** ./core/lib/common.js ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



let textToRegExp =
/**
 * Converts raw text into a regular expression string
 * @param {string} text the string to convert
 * @return {string} regular expression representation of the text
 * @package
 */
exports.textToRegExp = text => text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const regexpRegexp = /^\/(.*)\/([imu]*)$/;

/**
 * Make a regular expression from a text argument.
 *
 * If it can be parsed as a regular expression, parse it and the flags.
 *
 * @param {string} text the text argument.
 *
 * @return {?RegExp} a RegExp object or null in case of error.
 */
exports.makeRegExpParameter = function makeRegExpParameter(text) {
  let [, source, flags] = regexpRegexp.exec(text) || [null, textToRegExp(text)];

  try {
    return new RegExp(source, flags);
  }
  catch (e) {
    return null;
  }
};

let splitSelector = exports.splitSelector = function splitSelector(selector) {
  if (!selector.includes(","))
    return [selector];

  let selectors = [];
  let start = 0;
  let level = 0;
  let sep = "";

  for (let i = 0; i < selector.length; i++) {
    let chr = selector[i];

    // ignore escaped characters
    if (chr == "\\") {
      i++;
    }
    // don't split within quoted text
    else if (chr == sep) {
      sep = "";             // e.g. [attr=","]
    }
    else if (sep == "") {
      if (chr == '"' || chr == "'") {
        sep = chr;
      }
      // don't split between parentheses
      else if (chr == "(") {
        level++;            // e.g. :matches(div,span)
      }
      else if (chr == ")") {
        level = Math.max(0, level - 1);
      }
      else if (chr == "," && level == 0) {
        selectors.push(selector.substring(start, i));
        start = i + 1;
      }
    }
  }

  selectors.push(selector.substring(start));
  return selectors;
};

function findTargetSelectorIndex(selector) {
  let index = 0;
  let whitespace = 0;
  let scope = [];

  // Start from the end of the string and go character by character, where each
  // character is a Unicode code point.
  for (let character of [...selector].reverse()) {
    let currentScope = scope[scope.length - 1];

    if (character == "'" || character == "\"") {
      // If we're already within the same type of quote, close the scope;
      // otherwise open a new scope.
      if (currentScope == character)
        scope.pop();
      else
        scope.push(character);
    }
    else if (character == "]" || character == ")") {
      // For closing brackets and parentheses, open a new scope only if we're
      // not within a quote. Within quotes these characters should have no
      // meaning.
      if (currentScope != "'" && currentScope != "\"")
        scope.push(character);
    }
    else if (character == "[") {
      // If we're already within a bracket, close the scope.
      if (currentScope == "]")
        scope.pop();
    }
    else if (character == "(") {
      // If we're already within a parenthesis, close the scope.
      if (currentScope == ")")
        scope.pop();
    }
    else if (!currentScope) {
      // At the top level (not within any scope), count the whitespace if we've
      // encountered it. Otherwise if we've hit one of the combinators,
      // terminate here; otherwise if we've hit a non-colon character,
      // terminate here.
      if (/\s/.test(character))
        whitespace++;
      else if ((character == ">" || character == "+" || character == "~") ||
               (whitespace > 0 && character != ":"))
        break;
    }

    // Zero out the whitespace count if we've entered a scope.
    if (scope.length > 0)
      whitespace = 0;

    // Increment the index by the size of the character. Note that for Unicode
    // composite characters (like emoji) this will be more than one.
    index += character.length;
  }

  return selector.length - index + whitespace;
}

/**
 * Qualifies a CSS selector with a qualifier, which may be another CSS selector
 * or an empty string. For example, given the selector "div.bar" and the
 * qualifier "#foo", this function returns "div#foo.bar".
 * @param {string} selector The selector to qualify.
 * @param {string} qualifier The qualifier with which to qualify the selector.
 * @returns {string} The qualified selector.
 * @package
 */
exports.qualifySelector = function qualifySelector(selector, qualifier) {
  let qualifiedSelector = "";

  let qualifierTargetSelectorIndex = findTargetSelectorIndex(qualifier);
  let [, qualifierType = ""] =
    /^([a-z][a-z-]*)?/i.exec(qualifier.substring(qualifierTargetSelectorIndex));

  for (let sub of splitSelector(selector)) {
    sub = sub.trim();

    qualifiedSelector += ", ";

    let index = findTargetSelectorIndex(sub);

    // Note that the first group in the regular expression is optional. If it
    // doesn't match (e.g. "#foo::nth-child(1)"), type will be an empty string.
    let [, type = "", rest] =
      /^([a-z][a-z-]*)?\*?(.*)/i.exec(sub.substring(index));

    if (type == qualifierType)
      type = "";

    // If the qualifier ends in a combinator (e.g. "body #foo>"), we put the
    // type and the rest of the selector after the qualifier
    // (e.g. "body #foo>div.bar"); otherwise (e.g. "body #foo") we merge the
    // type into the qualifier (e.g. "body div#foo.bar").
    if (/[\s>+~]$/.test(qualifier))
      qualifiedSelector += sub.substring(0, index) + qualifier + type + rest;
    else
      qualifiedSelector += sub.substring(0, index) + type + qualifier + rest;
  }

  // Remove the initial comma and space.
  return qualifiedSelector.substring(2);
};


/***/ }),

/***/ "./core/lib/content/elemHideEmulation.js":
/*!***********************************************!*\
  !*** ./core/lib/content/elemHideEmulation.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



const {makeRegExpParameter, splitSelector,
       qualifySelector} = __webpack_require__(/*! ../common */ "./core/lib/common.js");
const {filterToRegExp} = __webpack_require__(/*! ../patterns */ "./core/lib/patterns.js");

const DEFAULT_MIN_INVOCATION_INTERVAL = 3000;
let minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
const DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME = 50;
let maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;

let abpSelectorRegexp = /:(-abp-[\w-]+|has|has-text|xpath|not)\(/;

let testInfo = null;

function toCSSStyleDeclaration(value) {
  return Object.assign(document.createElement("test"), {style: value}).style;
}

/**
 * Enables test mode, which tracks additional metadata about the inner
 * workings for test purposes. This also allows overriding internal
 * configuration.
 *
 * @param {object} options
 * @param {number} options.minInvocationInterval Overrides how long
 *   must be waited between filter processing runs
 * @param {number} options.maxSynchronousProcessingTime Overrides how
 *   long the thread may spend processing filters before it must yield
 *   its thread
 */
exports.setTestMode = function setTestMode(options) {
  if (typeof options.minInvocationInterval !== "undefined")
    minInvocationInterval = options.minInvocationInterval;
  if (typeof options.maxSynchronousProcessingTime !== "undefined")
    maxSynchronousProcessingTime = options.maxSynchronousProcessingTime;

  testInfo = {
    lastProcessedElements: new Set(),
    failedAssertions: []
  };
};

exports.getTestInfo = function getTestInfo() {
  return testInfo;
};

exports.clearTestMode = function() {
  minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
  maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;
  testInfo = null;
};

/**
 * Creates a new IdleDeadline.
 *
 * Note: This function is synchronous and does NOT request an idle
 * callback.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline}.
 * @return {IdleDeadline}
 */
function newIdleDeadline() {
  let startTime = performance.now();
  return {
    didTimeout: false,
    timeRemaining() {
      let elapsed = performance.now() - startTime;
      let remaining = maxSynchronousProcessingTime - elapsed;
      return Math.max(0, remaining);
    }
  };
}

/**
 * Returns a promise that is resolved when the browser is next idle.
 *
 * This is intended to be used for long running tasks on the UI thread
 * to allow other UI events to process.
 *
 * @return {Promise.<IdleDeadline>}
 *    A promise that is fulfilled when you can continue processing
 */
function yieldThread() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(resolve);
    }
    else {
      setTimeout(() => {
        resolve(newIdleDeadline());
      }, 0);
    }
  });
}


function getCachedPropertyValue(object, name, defaultValueFunc = () => {}) {
  let value = object[name];
  if (typeof value == "undefined")
    Object.defineProperty(object, name, {value: value = defaultValueFunc()});
  return value;
}

/**
 * Return position of node from parent.
 * @param {Node} node the node to find the position of.
 * @return {number} One-based index like for :nth-child(), or 0 on error.
 */
function positionInParent(node) {
  let index = 0;
  for (let child of node.parentNode.children) {
    if (child == node)
      return index + 1;

    index++;
  }

  return 0;
}

function makeSelector(node, selector = "") {
  if (node == null)
    return null;
  if (!node.parentElement) {
    let newSelector = ":root";
    if (selector)
      newSelector += " > " + selector;
    return newSelector;
  }
  let idx = positionInParent(node);
  if (idx > 0) {
    let newSelector = `${node.tagName}:nth-child(${idx})`;
    if (selector)
      newSelector += " > " + selector;
    return makeSelector(node.parentElement, newSelector);
  }

  return selector;
}

function parseSelectorContent(content, startIndex) {
  let parens = 1;
  let quote = null;
  let i = startIndex;
  for (; i < content.length; i++) {
    let c = content[i];
    if (c == "\\") {
      // Ignore escaped characters
      i++;
    }
    else if (quote) {
      if (c == quote)
        quote = null;
    }
    else if (c == "'" || c == '"') {
      quote = c;
    }
    else if (c == "(") {
      parens++;
    }
    else if (c == ")") {
      parens--;
      if (parens == 0)
        break;
    }
  }

  if (parens > 0)
    return null;
  return {text: content.substring(startIndex, i), end: i};
}

/**
 * Stringified style objects
 * @typedef {Object} StringifiedStyle
 * @property {string} style CSS style represented by a string.
 * @property {string[]} subSelectors selectors the CSS properties apply to.
 */

/**
 * Produce a string representation of the stylesheet entry.
 * @param {CSSStyleRule} rule the CSS style rule.
 * @return {StringifiedStyle} the stringified style.
 */
function stringifyStyle(rule) {
  let styles = [];
  for (let i = 0; i < rule.style.length; i++) {
    let property = rule.style.item(i);
    let value = rule.style.getPropertyValue(property);
    let priority = rule.style.getPropertyPriority(property);
    styles.push(`${property}: ${value}${priority ? " !" + priority : ""};`);
  }
  styles.sort();
  return {
    style: styles.join(" "),
    subSelectors: splitSelector(rule.selectorText)
  };
}

let scopeSupported = null;

function tryQuerySelector(subtree, selector, all) {
  let elements = null;
  try {
    elements = all ? subtree.querySelectorAll(selector) :
      subtree.querySelector(selector);
    scopeSupported = true;
  }
  catch (e) {
    // Edge doesn't support ":scope"
    scopeSupported = false;
  }
  return elements;
}

/**
 * Query selector.
 *
 * If it is relative, will try :scope.
 *
 * @param {Node} subtree the element to query selector
 * @param {string} selector the selector to query
 * @param {bool} [all=false] true to perform querySelectorAll()
 *
 * @returns {?(Node|NodeList)} result of the query. null in case of error.
 */
function scopedQuerySelector(subtree, selector, all) {
  if (selector[0] == ">") {
    selector = ":scope" + selector;
    if (scopeSupported) {
      return all ? subtree.querySelectorAll(selector) :
        subtree.querySelector(selector);
    }
    if (scopeSupported == null)
      return tryQuerySelector(subtree, selector, all);
    return null;
  }
  return all ? subtree.querySelectorAll(selector) :
    subtree.querySelector(selector);
}

function scopedQuerySelectorAll(subtree, selector) {
  return scopedQuerySelector(subtree, selector, true);
}

class PlainSelector {
  constructor(selector) {
    this._selector = selector;
    this.maybeDependsOnAttributes = /[#.:]|\[.+\]/.test(selector);
    this.maybeContainsSiblingCombinators = /[~+]/.test(selector);
  }

  /**
   * Generator function returning a pair of selector string and subtree.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getSelectors(prefix, subtree, targets) {
    yield [prefix + this._selector, subtree];
  }
}

const incompletePrefixRegexp = /[\s>+~]$/;

class NotSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        if (!this._innerPattern.matches(element, subtree))
          yield element;

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class HasSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        for (let selector of this._innerPattern.evaluate(element, targets)) {
          if (selector == null)
            yield null;
          else if (scopedQuerySelector(element, selector))
            yield element;
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class XPathSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;
    this.maybeDependsOnAttributes = true;

    let evaluator = new XPathEvaluator();
    this._expression = evaluator.createExpression(textContent, null);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  *getElements(prefix, subtree, targets) {
    let {ORDERED_NODE_SNAPSHOT_TYPE: flag} = XPathResult;
    let elements = prefix ? scopedQuerySelectorAll(subtree, prefix) : [subtree];
    for (let parent of elements) {
      let result = this._expression.evaluate(parent, flag, null);
      for (let i = 0, {snapshotLength} = result; i < snapshotLength; i++)
        yield result.snapshotItem(i);
    }
  }
}

class ContainsSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;

    this._regexp = makeRegExpParameter(textContent);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), subtree];
  }

  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;

    let elements = scopedQuerySelectorAll(subtree, actualPrefix);

    if (elements) {
      let lastRoot = null;
      for (let element of elements) {
        // For a filter like div:-abp-contains(Hello) and a subtree like
        // <div id="a"><div id="b"><div id="c">Hello</div></div></div>
        // we're only interested in div#a
        if (lastRoot && lastRoot.contains(element)) {
          yield null;
          continue;
        }

        lastRoot = element;

        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        if (this._regexp && this._regexp.test(element.textContent))
          yield element;
        else
          yield null;
      }
    }
  }
}

class PropsSelector {
  constructor(propertyExpression) {
    this.dependsOnStyles = true;
    this.maybeDependsOnAttributes = true;

    let regexpString;
    if (propertyExpression.length >= 2 && propertyExpression[0] == "/" &&
        propertyExpression[propertyExpression.length - 1] == "/")
      regexpString = propertyExpression.slice(1, -1);
    else
      regexpString = filterToRegExp(propertyExpression);

    this._regexp = new RegExp(regexpString, "i");

    this._subSelectors = [];
  }

  *getSelectors(prefix, subtree, targets) {
    for (let subSelector of this._subSelectors) {
      if (subSelector.startsWith("*") &&
          !incompletePrefixRegexp.test(prefix))
        subSelector = subSelector.substring(1);

      yield [qualifySelector(subSelector, prefix), subtree];
    }
  }

  setStyles(styles) {
    this._subSelectors = [];
    for (let style of styles) {
      if (this._regexp.test(style.style)) {
        for (let subSelector of style.subSelectors) {
          let idx = subSelector.lastIndexOf("::");
          if (idx != -1)
            subSelector = subSelector.substring(0, idx);

          this._subSelectors.push(subSelector);
        }
      }
    }
  }
}

class Pattern {
  constructor(selectors, text) {
    this.selectors = selectors;
    this.text = text;
  }

  get dependsOnStyles() {
    return getCachedPropertyValue(
      this, "_dependsOnStyles", () => this.selectors.some(
        selector => selector.dependsOnStyles
      )
    );
  }

  get maybeDependsOnAttributes() {
    // Observe changes to attributes if either there's a plain selector that
    // looks like an ID selector, class selector, or attribute selector in one
    // of the patterns (e.g. "a[href='https://example.com/']")
    // or there's a properties selector nested inside a has selector
    // (e.g. "div:-abp-has(:-abp-properties(color: blue))")
    return getCachedPropertyValue(
      this, "_maybeDependsOnAttributes", () => this.selectors.some(
        selector => selector.maybeDependsOnAttributes ||
                    (selector instanceof HasSelector &&
                     selector.dependsOnStyles)
      )
    );
  }

  get dependsOnCharacterData() {
    // Observe changes to character data only if there's a contains selector in
    // one of the patterns.
    return getCachedPropertyValue(
      this, "_dependsOnCharacterData", () => this.selectors.some(
        selector => selector.dependsOnCharacterData
      )
    );
  }

  get maybeContainsSiblingCombinators() {
    return getCachedPropertyValue(
      this, "_maybeContainsSiblingCombinators", () => this.selectors.some(
        selector => selector.maybeContainsSiblingCombinators
      )
    );
  }

  matchesMutationTypes(mutationTypes) {
    let mutationTypeMatchMap = getCachedPropertyValue(
      this, "_mutationTypeMatchMap", () => new Map([
        // All types of DOM-dependent patterns are affected by mutations of
        // type "childList".
        ["childList", true],
        ["attributes", this.maybeDependsOnAttributes],
        ["characterData", this.dependsOnCharacterData]
      ])
    );

    for (let mutationType of mutationTypes) {
      if (mutationTypeMatchMap.get(mutationType))
        return true;
    }

    return false;
  }

  /**
   * Generator function returning CSS selectors for all elements that
   * match the pattern.
   *
   * This allows transforming from selectors that may contain custom
   * :-abp- selectors to pure CSS selectors that can be used to select
   * elements.
   *
   * The selectors returned from this function may be invalidated by DOM
   * mutations.
   *
   * @param {Node} subtree the subtree we work on
   * @param {Node[]} [targets] the nodes we are interested in. May be
   * used to optimize search.
   */
  *evaluate(subtree, targets) {
    let selectors = this.selectors;
    function* evaluateInner(index, prefix, currentSubtree) {
      if (index >= selectors.length) {
        yield prefix;
        return;
      }
      for (let [selector, element] of selectors[index].getSelectors(
        prefix, currentSubtree, targets
      )) {
        if (selector == null)
          yield null;
        else
          yield* evaluateInner(index + 1, selector, element);
      }
      // Just in case the getSelectors() generator above had to run some heavy
      // document.querySelectorAll() call which didn't produce any results, make
      // sure there is at least one point where execution can pause.
      yield null;
    }
    yield* evaluateInner(0, "", subtree);
  }

  /**
   * Checks if a pattern matches a specific element
   * @param {Node} [target] the element we're interested in checking for
   * matches on.
   * @param {Node} subtree the subtree we work on
   * @return {bool}
   */
  matches(target, subtree) {
    let targetFilter = [target];
    if (this.maybeContainsSiblingCombinators)
      targetFilter = null;

    let selectorGenerator = this.evaluate(subtree, targetFilter);
    for (let selector of selectorGenerator) {
      if (selector && target.matches(selector))
        return true;
    }
    return false;
  }

  setStyles(styles) {
    for (let selector of this.selectors) {
      if (selector.dependsOnStyles)
        selector.setStyles(styles);
    }
  }
}

function extractMutationTypes(mutations) {
  let types = new Set();

  for (let mutation of mutations) {
    types.add(mutation.type);

    // There are only 3 types of mutations: "attributes", "characterData", and
    // "childList".
    if (types.size == 3)
      break;
  }

  return types;
}

function extractMutationTargets(mutations) {
  if (!mutations)
    return null;

  let targets = new Set();

  for (let mutation of mutations) {
    if (mutation.type == "childList") {
      // When new nodes are added, we're interested in the added nodes rather
      // than the parent.
      for (let node of mutation.addedNodes)
        targets.add(node);
      if (mutation.removedNodes.length > 0)
        targets.add(mutation.target);
    }
    else {
      targets.add(mutation.target);
    }
  }

  return [...targets];
}

function filterPatterns(patterns, {stylesheets, mutations}) {
  if (!stylesheets && !mutations)
    return patterns.slice();

  let mutationTypes = mutations ? extractMutationTypes(mutations) : null;

  return patterns.filter(
    pattern => (stylesheets && pattern.dependsOnStyles) ||
               (mutations && pattern.matchesMutationTypes(mutationTypes))
  );
}

function shouldObserveAttributes(patterns) {
  return patterns.some(pattern => pattern.maybeDependsOnAttributes);
}

function shouldObserveCharacterData(patterns) {
  return patterns.some(pattern => pattern.dependsOnCharacterData);
}

function shouldObserveStyles(patterns) {
  return patterns.some(pattern => pattern.dependsOnStyles);
}

/**
 * @callback hideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be hidden
 */

/**
 * @callback unhideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 */


/**
 * Manages the front-end processing of element hiding emulation filters.
 */
exports.ElemHideEmulation = class ElemHideEmulation {
  /**
   * @param {module:content/elemHideEmulation~hideElemsFunc} hideElemsFunc
   *   A callback that should be provided to do the actual element hiding.
   * @param {module:content/elemHideEmulation~unhideElemsFunc} unhideElemsFunc
   *   A callback that should be provided to unhide previously hidden elements.
   */
  constructor(hideElemsFunc = () => {}, unhideElemsFunc = () => {}) {
    this._filteringInProgress = false;
    this._nextFilteringScheduled = false;
    this._lastInvocation = -minInvocationInterval;
    this._scheduledProcessing = null;

    this.document = document;
    this.hideElemsFunc = hideElemsFunc;
    this.unhideElemsFunc = unhideElemsFunc;
    this.observer = new MutationObserver(this.observe.bind(this));
    this.hiddenElements = new Set();
  }

  isSameOrigin(stylesheet) {
    try {
      return new URL(stylesheet.href).origin == this.document.location.origin;
    }
    catch (e) {
      // Invalid URL, assume that it is first-party.
      return true;
    }
  }

  /**
   * Parse the selector
   * @param {string} selector the selector to parse
   * @return {Array} selectors is an array of objects,
   * or null in case of errors.
   */
  parseSelector(selector) {
    if (selector.length == 0)
      return [];

    let match = abpSelectorRegexp.exec(selector);
    if (!match)
      return [new PlainSelector(selector)];

    let selectors = [];
    if (match.index > 0)
      selectors.push(new PlainSelector(selector.substring(0, match.index)));

    let startIndex = match.index + match[0].length;
    let content = parseSelectorContent(selector, startIndex);
    if (!content) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector} ` +
                                   "due to unmatched parentheses."));
      return null;
    }
    if (match[1] == "-abp-properties") {
      selectors.push(new PropsSelector(content.text));
    }
    else if (match[1] == "-abp-has" || match[1] == "has") {
      let hasSelectors = this.parseSelector(content.text);
      if (hasSelectors == null)
        return null;
      selectors.push(new HasSelector(hasSelectors));
    }
    else if (match[1] == "-abp-contains" || match[1] == "has-text") {
      selectors.push(new ContainsSelector(content.text));
    }
    else if (match[1] === "xpath") {
      try {
        selectors.push(new XPathSelector(content.text));
      }
      catch ({message}) {
        console.warn(
          new SyntaxError(
            "Failed to parse Adblock Plus " +
            `selector ${selector}, invalid ` +
            `xpath: ${content.text} ` +
            `error: ${message}.`
          )
        );

        return null;
      }
    }
    else if (match[1] == "not") {
      let notSelectors = this.parseSelector(content.text);
      if (notSelectors == null)
        return null;

      // if all of the inner selectors are PlainSelectors, then we
      // don't actually need to use our selector at all. We're better
      // off delegating to the browser :not implementation.
      if (notSelectors.every(s => s instanceof PlainSelector))
        selectors.push(new PlainSelector(`:not(${content.text})`));
      else
        selectors.push(new NotSelector(notSelectors));
    }
    else {
      // this is an error, can't parse selector.
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, invalid ` +
                                   `pseudo-class :${match[1]}().`));
      return null;
    }

    let suffix = this.parseSelector(selector.substring(content.end + 1));
    if (suffix == null)
      return null;

    selectors.push(...suffix);

    if (selectors.length == 1 && selectors[0] instanceof ContainsSelector) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, can't ` +
                                   "have a lonely :-abp-contains()."));
      return null;
    }
    return selectors;
  }

  /**
   * Reads the rules out of CSS stylesheets
   * @param {CSSStyleSheet[]} [stylesheets] The list of stylesheets to
   * read.
   * @return {CSSStyleRule[]}
   */
  _readCssRules(stylesheets) {
    let cssStyles = [];

    for (let stylesheet of stylesheets || []) {
      // Explicitly ignore third-party stylesheets to ensure consistent behavior
      // between Firefox and Chrome.
      if (!this.isSameOrigin(stylesheet))
        continue;

      let rules;
      try {
        rules = stylesheet.cssRules;
      }
      catch (e) {
        // On Firefox, there is a chance that an InvalidAccessError
        // get thrown when accessing cssRules. Just skip the stylesheet
        // in that case.
        // See https://searchfox.org/mozilla-central/rev/f65d7528e34ef1a7665b4a1a7b7cdb1388fcd3aa/layout/style/StyleSheet.cpp#699
        continue;
      }

      if (!rules)
        continue;

      for (let rule of rules) {
        if (rule.type != rule.STYLE_RULE)
          continue;

        cssStyles.push(stringifyStyle(rule));
      }
    }
    return cssStyles;
  }

  /**
   * Processes the current document and applies all rules to it.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    The list of new stylesheets that have been added to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, all of document's stylesheets will be considered
   *    then and all rules, including the ones not dependent on styles.
   * @param {MutationRecord[]} [mutations]
   *    The list of DOM mutations that have been applied to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, the entire document will be considered
   *    then and all rules, including the ones not dependent on the DOM.
   * @return {Promise}
   *    A promise that is fulfilled once all filtering is completed
   */
  async _addSelectors(stylesheets, mutations) {
    if (testInfo)
      testInfo.lastProcessedElements.clear();

    let deadline = newIdleDeadline();

    if (shouldObserveStyles(this.patterns))
      this._refreshPatternStyles();

    let patternsToCheck = filterPatterns(
      this.patterns, {stylesheets, mutations}
    );

    let targets = extractMutationTargets(mutations);

    let elementsToHide = [];
    let elementFilters = [];
    let elementsToUnhide = new Set(this.hiddenElements);

    for (let pattern of patternsToCheck) {
      let evaluationTargets = targets;

      // If the pattern appears to contain any sibling combinators, we can't
      // easily optimize based on the mutation targets. Since this is a
      // special case, skip the optimization. By setting it to null here we
      // make sure we process the entire DOM.
      if (pattern.maybeContainsSiblingCombinators)
        evaluationTargets = null;

      let generator = pattern.evaluate(this.document, evaluationTargets);
      for (let selector of generator) {
        if (selector != null) {
          for (let element of this.document.querySelectorAll(selector)) {
            if (!this.hiddenElements.has(element)) {
              elementsToHide.push(element);
              elementFilters.push(pattern.text);
            }
            else {
              elementsToUnhide.delete(element);
            }
          }
        }

        if (deadline.timeRemaining() <= 0)
          deadline = await yieldThread();
      }
    }
    this._hideElems(elementsToHide, elementFilters);

    // The search for elements to hide it optimized to find new things
    // to hide quickly, by not checking all patterns and not checking
    // the full DOM. That's why we need to do a more thorough check
    // for each remaining element that might need to be unhidden,
    // checking all patterns.
    for (let elem of elementsToUnhide) {
      if (!elem.isConnected) {
        // elements that are no longer in the DOM should be unhidden
        // in case they're ever readded, and then forgotten about so
        // we don't cause a memory leak.
        continue;
      }
      let matchesAny = this.patterns.some(pattern => pattern.matches(
        elem, this.document
      ));
      if (matchesAny)
        elementsToUnhide.delete(elem);

      if (deadline.timeRemaining() <= 0)
        deadline = await yieldThread();
    }
    this._unhideElems(Array.from(elementsToUnhide));
  }

  _hideElems(elementsToHide, elementFilters) {
    if (elementsToHide.length > 0) {
      this.hideElemsFunc(elementsToHide, elementFilters);
      for (let elem of elementsToHide)
        this.hiddenElements.add(elem);
    }
  }

  _unhideElems(elementsToUnhide) {
    if (elementsToUnhide.length > 0) {
      this.unhideElemsFunc(elementsToUnhide);
      for (let elem of elementsToUnhide)
        this.hiddenElements.delete(elem);
    }
  }

  /**
   * Performed any scheduled processing.
   *
   * This function is asyncronous, and should not be run multiple
   * times in parallel. The flag `_filteringInProgress` is set and
   * unset so you can check if it's already running.
   * @return {Promise}
   *  A promise that is fulfilled once all filtering is completed
   */
  async _processFiltering() {
    if (this._filteringInProgress) {
      console.warn("ElemHideEmulation scheduling error: " +
                   "Tried to process filtering in parallel.");
      if (testInfo) {
        testInfo.failedAssertions.push(
          "Tried to process filtering in parallel"
        );
      }
      return;
    }
    let params = this._scheduledProcessing || {};
    this._scheduledProcessing = null;
    this._filteringInProgress = true;
    this._nextFilteringScheduled = false;
    await this._addSelectors(
      params.stylesheets,
      params.mutations
    );
    this._lastInvocation = performance.now();
    this._filteringInProgress = false;
    if (this._scheduledProcessing)
      this._scheduleNextFiltering();
  }

  /**
   * Appends new changes to the list of filters for the next time
   * filtering is run.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  _appendScheduledProcessing(stylesheets, mutations) {
    if (!this._scheduledProcessing) {
      // There isn't anything scheduled yet. Make the schedule.
      this._scheduledProcessing = {stylesheets, mutations};
    }
    else if (!stylesheets && !mutations) {
      // The new request was to reprocess everything, and so any
      // previous filters are irrelevant.
      this._scheduledProcessing = {};
    }
    else if (this._scheduledProcessing.stylesheets ||
             this._scheduledProcessing.mutations) {
      // The previous filters are not to filter everything, so the new
      // parameters matter. Push them onto the appropriate lists.
      if (stylesheets) {
        if (!this._scheduledProcessing.stylesheets)
          this._scheduledProcessing.stylesheets = [];
        this._scheduledProcessing.stylesheets.push(...stylesheets);
      }
      if (mutations) {
        if (!this._scheduledProcessing.mutations)
          this._scheduledProcessing.mutations = [];
        this._scheduledProcessing.mutations.push(...mutations);
      }
    }
    else {
      // this._scheduledProcessing is already going to recheck
      // everything, so no need to do anything here.
    }
  }

  /**
   * Schedule filtering to be processed in the future, or start
   * processing immediately.
   *
   * If processing is already scheduled, this does nothing.
   */
  _scheduleNextFiltering() {
    if (this._nextFilteringScheduled || this._filteringInProgress) {
      // The next one has already been scheduled. Our new events are
      // on the queue, so nothing more to do.
      return;
    }

    if (this.document.readyState === "loading") {
      // Document isn't fully loaded yet, so schedule our first
      // filtering as soon as that's done.
      this.document.addEventListener(
        "DOMContentLoaded",
        () => this._processFiltering(),
        {once: true}
      );
      this._nextFilteringScheduled = true;
    }
    else if (performance.now() - this._lastInvocation <
             minInvocationInterval) {
      // It hasn't been long enough since our last filter. Set the
      // timeout for when it's time for that.
      setTimeout(
        () => this._processFiltering(),
        minInvocationInterval - (performance.now() - this._lastInvocation)
      );
      this._nextFilteringScheduled = true;
    }
    else {
      // We can actually just start filtering immediately!
      this._processFiltering();
    }
  }

  /**
   * Re-run filtering either immediately or queued.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  queueFiltering(stylesheets, mutations) {
    this._appendScheduledProcessing(stylesheets, mutations);
    this._scheduleNextFiltering();
  }

  _refreshPatternStyles(stylesheet) {
    let allCssRules = this._readCssRules(this.document.styleSheets);
    for (let pattern of this.patterns)
      pattern.setStyles(allCssRules);
  }

  onLoad(event) {
    let stylesheet = event.target.sheet;
    if (stylesheet)
      this.queueFiltering([stylesheet]);
  }

  observe(mutations) {
    if (testInfo) {
      // In test mode, filter out any mutations likely done by us
      // (i.e. style="display: none !important"). This makes it easier to
      // observe how the code responds to DOM mutations.
      mutations = mutations.filter(
        ({type, attributeName, target: {style: newValue}, oldValue}) =>
          !(type == "attributes" && attributeName == "style" &&
            newValue.display == "none" &&
            toCSSStyleDeclaration(oldValue).display != "none")
      );

      if (mutations.length == 0)
        return;
    }

    this.queueFiltering(null, mutations);
  }

  apply(patterns) {
    this.patterns = [];
    for (let pattern of patterns) {
      let selectors = this.parseSelector(pattern.selector);
      if (selectors != null && selectors.length > 0)
        this.patterns.push(new Pattern(selectors, pattern.text));
    }

    if (this.patterns.length > 0) {
      this.queueFiltering();

      let attributes = shouldObserveAttributes(this.patterns);
      this.observer.observe(
        this.document,
        {
          childList: true,
          attributes,
          attributeOldValue: attributes && !!testInfo,
          characterData: shouldObserveCharacterData(this.patterns),
          subtree: true
        }
      );
      if (shouldObserveStyles(this.patterns)) {
        let onLoad = this.onLoad.bind(this);
        if (this.document.readyState === "loading")
          this.document.addEventListener("DOMContentLoaded", onLoad, true);
        this.document.addEventListener("load", onLoad, true);
      }
    }
  }
};


/***/ }),

/***/ "./core/lib/patterns.js":
/*!******************************!*\
  !*** ./core/lib/patterns.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



/**
 * The maximum number of patterns that
 * `{@link module:patterns.compilePatterns compilePatterns()}` will compile
 * into regular expressions.
 * @type {number}
 */
const COMPILE_PATTERNS_MAX = 100;

/**
 * Regular expression used to match the `^` suffix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let separatorRegExp = /[\x00-\x24\x26-\x2C\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]/;

let filterToRegExp =
/**
 * Converts filter text into regular expression string
 * @param {string} text as in Filter()
 * @return {string} regular expression representation of filter text
 * @package
 */
exports.filterToRegExp = function filterToRegExp(text) {
  // remove multiple wildcards
  text = text.replace(/\*+/g, "*");

  // remove leading wildcard
  if (text[0] == "*")
    text = text.substring(1);

  // remove trailing wildcard
  if (text[text.length - 1] == "*")
    text = text.substring(0, text.length - 1);

  return text
    // remove anchors following separator placeholder
    .replace(/\^\|$/, "^")
    // escape special symbols
    .replace(/\W/g, "\\$&")
    // replace wildcards by .*
    .replace(/\\\*/g, ".*")
    // process separator placeholders (all ANSI characters but alphanumeric
    // characters and _%.-)
    .replace(/\\\^/g, `(?:${separatorRegExp.source}|$)`)
    // process extended anchor at expression start
    .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?:[^\\/]+\\.)?")
    // process anchor at expression start
    .replace(/^\\\|/, "^")
    // process anchor at expression end
    .replace(/\\\|$/, "$");
};

/**
 * Regular expression used to match the `||` prefix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let extendedAnchorRegExp = new RegExp(filterToRegExp("||") + "$");

/**
 * Regular expression for matching a keyword in a filter.
 * @type {RegExp}
 */
let keywordRegExp = /[^a-z0-9%*][a-z0-9%]{2,}(?=[^a-z0-9%*])/;

/**
 * Regular expression for matching all keywords in a filter.
 * @type {RegExp}
 */
let allKeywordsRegExp = new RegExp(keywordRegExp, "g");

/**
 * A `CompiledPatterns` object represents the compiled version of multiple URL
 * request patterns. It is returned by
 * `{@link module:patterns.compilePatterns compilePatterns()}`.
 */
class CompiledPatterns {
  /**
   * Creates an object with the given regular expressions for case-sensitive
   * and case-insensitive matching respectively.
   * @param {?RegExp} [caseSensitive]
   * @param {?RegExp} [caseInsensitive]
   * @private
   */
  constructor(caseSensitive, caseInsensitive) {
    this._caseSensitive = caseSensitive;
    this._caseInsensitive = caseInsensitive;
  }

  /**
   * Tests whether the given URL request matches the patterns used to create
   * this object.
   * @param {module:url.URLRequest} request
   * @returns {boolean}
   */
  test(request) {
    return ((this._caseSensitive &&
             this._caseSensitive.test(request.href)) ||
            (this._caseInsensitive &&
             this._caseInsensitive.test(request.lowerCaseHref)));
  }
}

/**
 * Compiles patterns from the given filters into a single
 * `{@link module:patterns~CompiledPatterns CompiledPatterns}` object.
 *
 * @param {module:filterClasses.URLFilter|
 *         Set.<module:filterClasses.URLFilter>} filters
 *   The filters. If the number of filters exceeds
 *   `{@link module:patterns~COMPILE_PATTERNS_MAX COMPILE_PATTERNS_MAX}`, the
 *   function returns `null`.
 *
 * @returns {?module:patterns~CompiledPatterns}
 *
 * @package
 */
exports.compilePatterns = function compilePatterns(filters) {
  let list = Array.isArray(filters) ? filters : [filters];

  // If the number of filters is too large, it may choke especially on low-end
  // platforms. As a precaution, we refuse to compile. Ideally we would check
  // the length of the regular expression source rather than the number of
  // filters, but this is far more straightforward and practical.
  if (list.length > COMPILE_PATTERNS_MAX)
    return null;

  let caseSensitive = "";
  let caseInsensitive = "";

  for (let filter of filters) {
    let source = filter.urlPattern.regexpSource;

    if (filter.matchCase)
      caseSensitive += source + "|";
    else
      caseInsensitive += source + "|";
  }

  let caseSensitiveRegExp = null;
  let caseInsensitiveRegExp = null;

  try {
    if (caseSensitive)
      caseSensitiveRegExp = new RegExp(caseSensitive.slice(0, -1));

    if (caseInsensitive)
      caseInsensitiveRegExp = new RegExp(caseInsensitive.slice(0, -1));
  }
  catch (error) {
    // It is possible in theory for the regular expression to be too large
    // despite COMPILE_PATTERNS_MAX
    return null;
  }

  return new CompiledPatterns(caseSensitiveRegExp, caseInsensitiveRegExp);
};

/**
 * Patterns for matching against URLs.
 *
 * Internally, this may be a RegExp or match directly against the
 * pattern for simple literal patterns.
 */
exports.Pattern = class Pattern {
  /**
   * @param {string} pattern pattern that requests URLs should be
   * matched against in filter text notation
   * @param {bool} matchCase `true` if comparisons must be case
   * sensitive
   */
  constructor(pattern, matchCase) {
    this.matchCase = matchCase || false;

    if (!this.matchCase)
      pattern = pattern.toLowerCase();

    if (pattern.length >= 2 &&
        pattern[0] == "/" &&
        pattern[pattern.length - 1] == "/") {
      // The filter is a regular expression - convert it immediately to
      // catch syntax errors
      pattern = pattern.substring(1, pattern.length - 1);
      this._regexp = new RegExp(pattern);
    }
    else {
      // Patterns like /foo/bar/* exist so that they are not treated as regular
      // expressions. We drop any superfluous wildcards here so our
      // optimizations can kick in.
      pattern = pattern.replace(/^\*+/, "").replace(/\*+$/, "");

      // No need to convert this filter to regular expression yet, do it on
      // demand
      this.pattern = pattern;
    }
  }

  /**
   * Checks whether the pattern is a string of literal characters with
   * no wildcards or any other special characters.
   *
   * If the pattern is prefixed with a `||` or suffixed with a `^` but otherwise
   * contains no special characters, it is still considered to be a literal
   * pattern.
   *
   * @returns {boolean}
   */
  isLiteralPattern() {
    return typeof this.pattern !== "undefined" &&
      !/[*^|]/.test(this.pattern.replace(/^\|{1,2}/, "").replace(/[|^]$/, ""));
  }

  /**
   * Regular expression to be used when testing against this pattern.
   *
   * null if the pattern is matched without using regular expressions.
   * @type {RegExp}
   */
  get regexp() {
    if (typeof this._regexp == "undefined") {
      this._regexp = this.isLiteralPattern() ?
        null : new RegExp(filterToRegExp(this.pattern));
    }
    return this._regexp;
  }

  /**
   * Pattern in regular expression notation. This will have a value
   * even if `regexp` returns null.
   * @type {string}
   */
  get regexpSource() {
    return this._regexp ? this._regexp.source : filterToRegExp(this.pattern);
  }

  /**
   * Checks whether the given URL request matches this filter's pattern.
   * @param {module:url.URLRequest} request The URL request to check.
   * @returns {boolean} `true` if the URL request matches.
   */
  matchesLocation(request) {
    let location = this.matchCase ? request.href : request.lowerCaseHref;
    let regexp = this.regexp;
    if (regexp)
      return regexp.test(location);

    let pattern = this.pattern;
    let startsWithAnchor = pattern[0] == "|";
    let startsWithExtendedAnchor = startsWithAnchor && pattern[1] == "|";
    let endsWithSeparator = pattern[pattern.length - 1] == "^";
    let endsWithAnchor = !endsWithSeparator &&
        pattern[pattern.length - 1] == "|";

    if (startsWithExtendedAnchor)
      pattern = pattern.substr(2);
    else if (startsWithAnchor)
      pattern = pattern.substr(1);

    if (endsWithSeparator || endsWithAnchor)
      pattern = pattern.slice(0, -1);

    let index = location.indexOf(pattern);

    while (index != -1) {
      // The "||" prefix requires that the text that follows does not start
      // with a forward slash.
      if ((startsWithExtendedAnchor ?
           location[index] != "/" &&
           extendedAnchorRegExp.test(location.substring(0, index)) :
           startsWithAnchor ?
           index == 0 :
           true) &&
          (endsWithSeparator ?
           !location[index + pattern.length] ||
           separatorRegExp.test(location[index + pattern.length]) :
           endsWithAnchor ?
           index == location.length - pattern.length :
           true))
        return true;

      if (pattern == "")
        return true;

      index = location.indexOf(pattern, index + 1);
    }

    return false;
  }

  /**
   * Checks whether the pattern has keywords
   * @returns {boolean}
   */
  hasKeywords() {
    return this.pattern && keywordRegExp.test(this.pattern);
  }

  /**
   * Finds all keywords that could be associated with this pattern
   * @returns {string[]}
   */
  keywordCandidates() {
    if (!this.pattern)
      return null;
    return this.pattern.toLowerCase().match(allKeywordsRegExp);
  }
};


/***/ }),

/***/ "./node_modules/webextension-polyfill/dist/browser-polyfill.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webextension-polyfill/dist/browser-polyfill.js ***!
  \*********************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.8.0 - Tue Apr 20 2021 11:27:38 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      });

      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */


        return function onRequestFinished(req) {
          const wrappedReq = wrapObject(req, {}
          /* wrappers */
          , {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      }); // Keep track if the deprecation warning has been logged at least once.

      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});


/***/ }),

/***/ "./sdk/content/allowlisting.js":
/*!*************************************!*\
  !*** ./sdk/content/allowlisting.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "stopOneClickAllowlisting": () => (/* binding */ stopOneClickAllowlisting),
/* harmony export */   "startOneClickAllowlisting": () => (/* binding */ startOneClickAllowlisting)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const MAX_ERROR_THRESHOLD = 30;
const MAX_QUEUED_EVENTS = 20;
const EVENT_INTERVAL_MS = 100;

let errorCount = 0;
let eventProcessingInterval = null;
let eventProcessingInProgress = false;
let eventQueue = [];

function isEventTrusted(event) {
  return Object.getPrototypeOf(event) === CustomEvent.prototype &&
    !Object.hasOwnProperty.call(event, "detail");
}

async function allowlistDomain(event) {
  if (!isEventTrusted(event))
    return false;

  return (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({
      type: "ewe:allowlist-page",
      timestamp: event.detail.timestamp,
      signature: event.detail.signature
    })
  );
}

async function processNextEvent() {
  if (eventProcessingInProgress)
    return;

  try {
    eventProcessingInProgress = true;
    let event = eventQueue.shift();
    if (event) {
      try {
        let allowlistingResult = await allowlistDomain(event);
        if (allowlistingResult === true) {
          document.dispatchEvent(new Event("domain_allowlisting_success"));
          stopOneClickAllowlisting();
        }
        else {
          throw new Error("Domain allowlisting rejected");
        }
      }
      catch (e) {
        errorCount++;
        if (errorCount >= MAX_ERROR_THRESHOLD)
          stopOneClickAllowlisting();
      }
    }

    if (!eventQueue.length)
      stopProcessingInterval();
  }
  finally {
    eventProcessingInProgress = false;
  }
}

function onDomainAllowlistingRequest(event) {
  if (eventQueue.length >= MAX_QUEUED_EVENTS)
    return;

  eventQueue.push(event);
  startProcessingInterval();
}

function startProcessingInterval() {
  if (!eventProcessingInterval) {
    processNextEvent();
    eventProcessingInterval = setInterval(processNextEvent, EVENT_INTERVAL_MS);
  }
}

function stopProcessingInterval() {
  clearInterval(eventProcessingInterval);
  eventProcessingInterval = null;
}

function stopOneClickAllowlisting() {
  document.removeEventListener("domain_allowlisting_request",
                               onDomainAllowlistingRequest, true);
  eventQueue = [];
  stopProcessingInterval();
}

function startOneClickAllowlisting() {
  document.addEventListener("domain_allowlisting_request",
                            onDomainAllowlistingRequest, true);
}


/***/ }),

/***/ "./sdk/content/element-collapsing.js":
/*!*******************************************!*\
  !*** ./sdk/content/element-collapsing.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hideElement": () => (/* binding */ hideElement),
/* harmony export */   "unhideElement": () => (/* binding */ unhideElement),
/* harmony export */   "startElementCollapsing": () => (/* binding */ startElementCollapsing)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let collapsedSelectors = new Set();
let observers = new WeakMap();

function getURLFromElement(element) {
  if (element.localName == "object") {
    if (element.data)
      return element.data;

    for (let child of element.children) {
      if (child.localName == "param" && child.name == "movie" && child.value)
        return new URL(child.value, document.baseURI).href;
    }

    return null;
  }

  return element.currentSrc || element.src;
}

function getSelectorForBlockedElement(element) {
  // Setting the "display" CSS property to "none" doesn't have any effect on
  // <frame> elements (in framesets). So we have to hide it inline through
  // the "visibility" CSS property.
  if (element.localName == "frame")
    return null;

  // If the <video> or <audio> element contains any <source> children,
  // we cannot address it in CSS by the source URL; in that case we
  // don't "collapse" it using a CSS selector but rather hide it directly by
  // setting the style="..." attribute.
  if (element.localName == "video" || element.localName == "audio") {
    for (let child of element.children) {
      if (child.localName == "source")
        return null;
    }
  }

  let selector = "";
  for (let attr of ["src", "srcset"]) {
    let value = element.getAttribute(attr);
    if (value && attr in element)
      selector += "[" + attr + "=" + CSS.escape(value) + "]";
  }

  return selector ? element.localName + selector : null;
}

function hideElement(element, properties) {
  let {style} = element;

  if (!properties) {
    if (element.localName == "frame")
      properties = [["visibility", "hidden"]];
    else
      properties = [["display", "none"]];
  }

  for (let [key, value] of properties)
    style.setProperty(key, value, "important");

  if (observers.has(element))
    observers.get(element).disconnect();

  let observer = new MutationObserver(() => {
    for (let [key, value] of properties) {
      if (style.getPropertyValue(key) != value ||
          style.getPropertyPriority(key) != "important")
        style.setProperty(key, value, "important");
    }
  });
  observer.observe(
    element, {
      attributes: true,
      attributeFilter: ["style"]
    }
  );
  observers.set(element, observer);
}

function unhideElement(element) {
  let observer = observers.get(element);
  if (observer) {
    observer.disconnect();
    observers.delete(element);
  }

  let property = element.localName == "frame" ? "visibility" : "display";
  element.style.removeProperty(property);
}

function collapseElement(element) {
  let selector = getSelectorForBlockedElement(element);
  if (!selector) {
    hideElement(element);
    return;
  }

  if (!collapsedSelectors.has(selector)) {
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
      webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({
        type: "ewe:inject-css",
        selector
      })
    );
    collapsedSelectors.add(selector);
  }
}

function hideInAboutBlankFrames(selector, urls) {
  // Resources (e.g. images) loaded into about:blank frames
  // are (sometimes) loaded with the frameId of the main_frame.
  for (let frame of document.querySelectorAll("iframe[src='about:blank']")) {
    if (!frame.contentDocument)
      continue;

    for (let element of frame.contentDocument.querySelectorAll(selector)) {
      // Use hideElement, because we don't have the correct frameId
      // for the "ewe:inject-css" message.
      if (urls.has(getURLFromElement(element)))
        hideElement(element);
    }
  }
}

function startElementCollapsing() {
  let deferred = null;

  webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type != "ewe:collapse")
      return false;

    if (document.readyState == "loading") {
      if (!deferred) {
        deferred = new Map();
        document.addEventListener("DOMContentLoaded", () => {
          // Under some conditions a hostile script could try to trigger
          // the event again. Since we set deferred to `null`, then
          // we assume that we should just return instead of throwing
          // a TypeError.
          if (!deferred)
            return;

          for (let [selector, urls] of deferred) {
            for (let element of document.querySelectorAll(selector)) {
              if (urls.has(getURLFromElement(element)))
                collapseElement(element);
            }

            hideInAboutBlankFrames(selector, urls);
          }

          deferred = null;
        });
      }

      let urls = deferred.get(message.selector) || new Set();
      deferred.set(message.selector, urls);
      urls.add(message.url);
    }
    else {
      for (let element of document.querySelectorAll(message.selector)) {
        if (getURLFromElement(element) == message.url)
          collapseElement(element);
      }

      hideInAboutBlankFrames(message.selector, new Set([message.url]));
    }
    return true;
  });
}


/***/ }),

/***/ "./sdk/content/element-hiding-tracer.js":
/*!**********************************************!*\
  !*** ./sdk/content/element-hiding-tracer.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ElementHidingTracer": () => (/* binding */ ElementHidingTracer)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




class ElementHidingTracer {
  constructor(selectors) {
    this.selectors = new Map(selectors);

    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      setTimeout(() => this.trace(), 1000);
    });

    if (document.readyState == "loading")
      document.addEventListener("DOMContentLoaded", () => this.trace());
    else
      this.trace();
  }

  log(filters, selectors = []) {
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage(
      {type: "ewe:trace-elem-hide", filters, selectors}
    ));
  }

  trace() {
    let filters = [];
    let selectors = [];

    for (let [selector, filter] of this.selectors) {
      if (document.querySelector(selector)) {
        this.selectors.delete(selector);
        if (filter)
          filters.push(filter);
        else
          selectors.push(selector);
      }
    }

    if (filters.length > 0 || selectors.length > 0)
      this.log(filters, selectors);

    this.observer.observe(document, {childList: true,
                                     attributes: true,
                                     subtree: true});
  }
}


/***/ }),

/***/ "./sdk/content/subscribe-links.js":
/*!****************************************!*\
  !*** ./sdk/content/subscribe-links.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "subscribeLinksEnabled": () => (/* binding */ subscribeLinksEnabled),
/* harmony export */   "handleSubscribeLinks": () => (/* binding */ handleSubscribeLinks)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const ALLOWED_DOMAINS = new Set([
  "abpchina.org",
  "abpindo.blogspot.com",
  "abpvn.com",
  "adblock.ee",
  "adblock.gardar.net",
  "adblockplus.me",
  "adblockplus.org",
  "commentcamarche.net",
  "droit-finances.commentcamarche.com",
  "easylist.to",
  "eyeo.com",
  "fanboy.co.nz",
  "filterlists.com",
  "forums.lanik.us",
  "gitee.com",
  "gitee.io",
  "github.com",
  "github.io",
  "gitlab.com",
  "gitlab.io",
  "gurud.ee",
  "hugolescargot.com",
  "i-dont-care-about-cookies.eu",
  "journaldesfemmes.fr",
  "journaldunet.com",
  "linternaute.com",
  "spam404.com",
  "stanev.org",
  "void.gr",
  "xfiles.noads.it",
  "zoso.ro"
]);

function isDomainAllowed(domain) {
  if (domain.endsWith("."))
    domain = domain.substring(0, domain.length - 1);

  while (true) {
    if (ALLOWED_DOMAINS.has(domain))
      return true;
    let index = domain.indexOf(".");
    if (index == -1)
      return false;
    domain = domain.substr(index + 1);
  }
}

function subscribeLinksEnabled(url) {
  let {protocol, hostname} = new URL(url);
  return hostname == "localhost" ||
    protocol == "https:" && isDomainAllowed(hostname);
}

function handleSubscribeLinks() {
  document.addEventListener("click", event => {
    if (event.button == 2 || !event.isTrusted)
      return;

    let link = event.target;
    while (!(link instanceof HTMLAnchorElement)) {
      link = link.parentNode;

      if (!link)
        return;
    }

    let queryString = null;
    if (link.protocol == "http:" || link.protocol == "https:") {
      if (link.host == "subscribe.adblockplus.org" && link.pathname == "/")
        queryString = link.search.substr(1);
    }
    else {
      // Firefox doesn't seem to populate the "search" property for
      // links with non-standard URL schemes so we need to extract the query
      // string manually.
      let match = /^abp:\/*subscribe\/*\?(.*)/i.exec(link.href);
      if (match)
        queryString = match[1];
    }

    if (!queryString)
      return;

    let title = null;
    let url = null;
    for (let param of queryString.split("&")) {
      let parts = param.split("=", 2);
      if (parts.length != 2 || !/\S/.test(parts[1]))
        continue;
      switch (parts[0]) {
        case "title":
          title = decodeURIComponent(parts[1]);
          break;
        case "location":
          url = decodeURIComponent(parts[1]);
          break;
      }
    }
    if (!url)
      return;

    if (!title)
      title = url;

    title = title.trim();
    url = url.trim();
    if (!/^(https?|ftp):/.test(url))
      return;

    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
      webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({type: "ewe:subscribe-link-clicked",
                                   title, url})
    );

    event.preventDefault();
    event.stopPropagation();
  }, true);
}


/***/ }),

/***/ "./sdk/errors.js":
/*!***********************!*\
  !*** ./sdk/errors.js ***!
  \***********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERROR_DUPLICATE_FILTERS": () => (/* binding */ ERROR_DUPLICATE_FILTERS),
/* harmony export */   "ERROR_FILTER_NOT_FOUND": () => (/* binding */ ERROR_FILTER_NOT_FOUND),
/* harmony export */   "ERROR_TOO_MANY_FILTERS": () => (/* binding */ ERROR_TOO_MANY_FILTERS),
/* harmony export */   "ignoreNoConnectionError": () => (/* binding */ ignoreNoConnectionError)
/* harmony export */ });
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */

const ERROR_NO_CONNECTION = "Could not establish connection. " +
      "Receiving end does not exist.";
const ERROR_CLOSED_CONNECTION = "A listener indicated an asynchronous " +
      "response by returning true, but the message channel closed before a " +
      "response was received";

const ERROR_DUPLICATE_FILTERS = "storage_duplicate_filters";
const ERROR_FILTER_NOT_FOUND = "filter_not_found";
const ERROR_TOO_MANY_FILTERS = "too_many_filters";

function ignoreNoConnectionError(promise) {
  return promise.catch(error => {
    if (typeof error == "object" &&
        (error.message == ERROR_NO_CONNECTION ||
         error.message == ERROR_CLOSED_CONNECTION))
      return;

    throw error;
  });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************!*\
  !*** ./sdk/content/index.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var adblockpluscore_lib_content_elemHideEmulation_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! adblockpluscore/lib/content/elemHideEmulation.js */ "./core/lib/content/elemHideEmulation.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/* harmony import */ var _element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./element-collapsing.js */ "./sdk/content/element-collapsing.js");
/* harmony import */ var _allowlisting_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./allowlisting.js */ "./sdk/content/allowlisting.js");
/* harmony import */ var _element_hiding_tracer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./element-hiding-tracer.js */ "./sdk/content/element-hiding-tracer.js");
/* harmony import */ var _subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./subscribe-links.js */ "./sdk/content/subscribe-links.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */











async function initContentFeatures() {
  if ((0,_subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__.subscribeLinksEnabled)(window.location.href))
    (0,_subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__.handleSubscribeLinks)();

  let response = await (0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.ignoreNoConnectionError)(
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({type: "ewe:content-hello"})
  );

  if (!response)
    return;

  let tracer;
  if (response.tracedSelectors)
    tracer = new _element_hiding_tracer_js__WEBPACK_IMPORTED_MODULE_5__.ElementHidingTracer(response.tracedSelectors);

  if (response.emulatedPatterns.length > 0) {
    let elemHideEmulation = new adblockpluscore_lib_content_elemHideEmulation_js__WEBPACK_IMPORTED_MODULE_1__.ElemHideEmulation((elements, filters) => {
      for (let element of elements)
        (0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.hideElement)(element, response.cssProperties);

      if (tracer)
        tracer.log(filters);
    }, elements => {
      for (let element of elements)
        (0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.unhideElement)(element);
    });
    elemHideEmulation.apply(response.emulatedPatterns);
  }
}

(0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.startElementCollapsing)();
(0,_allowlisting_js__WEBPACK_IMPORTED_MODULE_4__.startOneClickAllowlisting)();
initContentFeatures();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vY29yZS9saWIvY29tbW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9jb3JlL2xpYi9jb250ZW50L2VsZW1IaWRlRW11bGF0aW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9jb3JlL2xpYi9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vbm9kZV9tb2R1bGVzL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9kaXN0L2Jyb3dzZXItcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L2FsbG93bGlzdGluZy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vc2RrL2NvbnRlbnQvZWxlbWVudC1jb2xsYXBzaW5nLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9zZGsvY29udGVudC9lbGVtZW50LWhpZGluZy10cmFjZXIuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L3N1YnNjcmliZS1saW5rcy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vc2RrL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbImJyb3dzZXIiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsIkNIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSIsIlNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORyIsIndyYXBBUElzIiwiZXh0ZW5zaW9uQVBJcyIsImFwaU1ldGFkYXRhIiwia2V5cyIsImxlbmd0aCIsIkVycm9yIiwiRGVmYXVsdFdlYWtNYXAiLCJXZWFrTWFwIiwiY29uc3RydWN0b3IiLCJjcmVhdGVJdGVtIiwiaXRlbXMiLCJ1bmRlZmluZWQiLCJnZXQiLCJrZXkiLCJoYXMiLCJzZXQiLCJpc1RoZW5hYmxlIiwidmFsdWUiLCJ0aGVuIiwibWFrZUNhbGxiYWNrIiwicHJvbWlzZSIsIm1ldGFkYXRhIiwiY2FsbGJhY2tBcmdzIiwicnVudGltZSIsImxhc3RFcnJvciIsInJlamVjdCIsIm1lc3NhZ2UiLCJzaW5nbGVDYWxsYmFja0FyZyIsInJlc29sdmUiLCJwbHVyYWxpemVBcmd1bWVudHMiLCJudW1BcmdzIiwid3JhcEFzeW5jRnVuY3Rpb24iLCJuYW1lIiwiYXN5bmNGdW5jdGlvbldyYXBwZXIiLCJ0YXJnZXQiLCJhcmdzIiwibWluQXJncyIsIm1heEFyZ3MiLCJQcm9taXNlIiwiZmFsbGJhY2tUb05vQ2FsbGJhY2siLCJjYkVycm9yIiwiY29uc29sZSIsIndhcm4iLCJub0NhbGxiYWNrIiwid3JhcE1ldGhvZCIsIm1ldGhvZCIsIndyYXBwZXIiLCJQcm94eSIsImFwcGx5IiwidGFyZ2V0TWV0aG9kIiwidGhpc09iaiIsImNhbGwiLCJoYXNPd25Qcm9wZXJ0eSIsIkZ1bmN0aW9uIiwiYmluZCIsIndyYXBPYmplY3QiLCJ3cmFwcGVycyIsImNhY2hlIiwiY3JlYXRlIiwiaGFuZGxlcnMiLCJwcm94eVRhcmdldCIsInByb3AiLCJyZWNlaXZlciIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsImRlc2MiLCJSZWZsZWN0IiwiZGVsZXRlUHJvcGVydHkiLCJ3cmFwRXZlbnQiLCJ3cmFwcGVyTWFwIiwiYWRkTGlzdGVuZXIiLCJsaXN0ZW5lciIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzIiwib25SZXF1ZXN0RmluaXNoZWQiLCJyZXEiLCJ3cmFwcGVkUmVxIiwiZ2V0Q29udGVudCIsImxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZyIsIm9uTWVzc2FnZVdyYXBwZXJzIiwib25NZXNzYWdlIiwic2VuZGVyIiwic2VuZFJlc3BvbnNlIiwiZGlkQ2FsbFNlbmRSZXNwb25zZSIsIndyYXBwZWRTZW5kUmVzcG9uc2UiLCJzZW5kUmVzcG9uc2VQcm9taXNlIiwicmVzcG9uc2UiLCJzdGFjayIsInJlc3VsdCIsImVyciIsImlzUmVzdWx0VGhlbmFibGUiLCJzZW5kUHJvbWlzZWRSZXN1bHQiLCJtc2ciLCJlcnJvciIsIl9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXyIsImNhdGNoIiwid3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2siLCJyZXBseSIsIndyYXBwZWRTZW5kTWVzc2FnZSIsImFwaU5hbWVzcGFjZU9iaiIsIndyYXBwZWRDYiIsInB1c2giLCJzZW5kTWVzc2FnZSIsInN0YXRpY1dyYXBwZXJzIiwiZGV2dG9vbHMiLCJuZXR3b3JrIiwib25NZXNzYWdlRXh0ZXJuYWwiLCJ0YWJzIiwic2V0dGluZ01ldGFkYXRhIiwiY2xlYXIiLCJwcml2YWN5Iiwic2VydmljZXMiLCJ3ZWJzaXRlcyIsImNocm9tZSIsImlkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVks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O0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsS0FBSztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDQSxhQUFhLEtBQUs7QUFDbEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsSUFBSTtBQUNsRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxzQkFBc0I7QUFDbkMsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBOztB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFNEM7QUFDUzs7QUFFckQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTLG1FQUF1QjtBQUNoQyxJQUFJLHNFQUEyQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRTRDO0FBQ1M7O0FBRXJEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1EQUFtRDtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVPO0FBQ1AsT0FBTyxNQUFNOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFJLG1FQUF1QjtBQUMzQixNQUFNLHNFQUEyQjtBQUNqQztBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7O0FBRUEsRUFBRSxnRkFBcUM7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRTRDO0FBQ1M7O0FBRTlDO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFJLG1FQUF1QixDQUFDLHNFQUEyQjtBQUN2RCxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEscUNBQXFDO0FBQ3JDO0FBQ0EsbURBQW1EO0FBQ25EO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFNEM7QUFDUzs7QUFFckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUCxPQUFPLG1CQUFtQjtBQUMxQjtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxJQUFJLG1FQUF1QjtBQUMzQixNQUFNLHNFQUEyQixFQUFFO0FBQ25DLDhDQUE4QztBQUM5Qzs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNBO0FBQ0E7O0FBRUE7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7O1VDcENBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esd0NBQXdDLHlDQUF5QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRTRDOztBQUdjOztBQUVMO0FBRXBCO0FBQzJCO0FBQ0c7QUFDa0I7O0FBRWpGO0FBQ0EsTUFBTSwwRUFBcUI7QUFDM0IsSUFBSSx5RUFBb0I7O0FBRXhCLHVCQUF1QixtRUFBdUI7QUFDOUMsSUFBSSxzRUFBMkIsRUFBRSwwQkFBMEI7QUFDM0Q7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLDBFQUFtQjs7QUFFcEM7QUFDQSxnQ0FBZ0MsK0ZBQWlCO0FBQ2pEO0FBQ0EsUUFBUSxtRUFBVzs7QUFFbkI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFFBQVEscUVBQWE7QUFDckIsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSw4RUFBc0I7QUFDdEIsMkVBQXlCO0FBQ3pCIiwiZmlsZSI6ImV3ZS1jb250ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEFkYmxvY2sgUGx1cyA8aHR0cHM6Ly9hZGJsb2NrcGx1cy5vcmcvPixcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBBZGJsb2NrIFBsdXMuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyoqIEBtb2R1bGUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCB0ZXh0VG9SZWdFeHAgPVxuLyoqXG4gKiBDb252ZXJ0cyByYXcgdGV4dCBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgdGhlIHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJuIHtzdHJpbmd9IHJlZ3VsYXIgZXhwcmVzc2lvbiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGV4dFxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy50ZXh0VG9SZWdFeHAgPSB0ZXh0ID0+IHRleHQucmVwbGFjZSgvWy0vXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIik7XG5cbmNvbnN0IHJlZ2V4cFJlZ2V4cCA9IC9eXFwvKC4qKVxcLyhbaW11XSopJC87XG5cbi8qKlxuICogTWFrZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmcm9tIGEgdGV4dCBhcmd1bWVudC5cbiAqXG4gKiBJZiBpdCBjYW4gYmUgcGFyc2VkIGFzIGEgcmVndWxhciBleHByZXNzaW9uLCBwYXJzZSBpdCBhbmQgdGhlIGZsYWdzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IHRoZSB0ZXh0IGFyZ3VtZW50LlxuICpcbiAqIEByZXR1cm4gez9SZWdFeHB9IGEgUmVnRXhwIG9iamVjdCBvciBudWxsIGluIGNhc2Ugb2YgZXJyb3IuXG4gKi9cbmV4cG9ydHMubWFrZVJlZ0V4cFBhcmFtZXRlciA9IGZ1bmN0aW9uIG1ha2VSZWdFeHBQYXJhbWV0ZXIodGV4dCkge1xuICBsZXQgWywgc291cmNlLCBmbGFnc10gPSByZWdleHBSZWdleHAuZXhlYyh0ZXh0KSB8fCBbbnVsbCwgdGV4dFRvUmVnRXhwKHRleHQpXTtcblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgZmxhZ3MpO1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbmxldCBzcGxpdFNlbGVjdG9yID0gZXhwb3J0cy5zcGxpdFNlbGVjdG9yID0gZnVuY3Rpb24gc3BsaXRTZWxlY3RvcihzZWxlY3Rvcikge1xuICBpZiAoIXNlbGVjdG9yLmluY2x1ZGVzKFwiLFwiKSlcbiAgICByZXR1cm4gW3NlbGVjdG9yXTtcblxuICBsZXQgc2VsZWN0b3JzID0gW107XG4gIGxldCBzdGFydCA9IDA7XG4gIGxldCBsZXZlbCA9IDA7XG4gIGxldCBzZXAgPSBcIlwiO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hyID0gc2VsZWN0b3JbaV07XG5cbiAgICAvLyBpZ25vcmUgZXNjYXBlZCBjaGFyYWN0ZXJzXG4gICAgaWYgKGNociA9PSBcIlxcXFxcIikge1xuICAgICAgaSsrO1xuICAgIH1cbiAgICAvLyBkb24ndCBzcGxpdCB3aXRoaW4gcXVvdGVkIHRleHRcbiAgICBlbHNlIGlmIChjaHIgPT0gc2VwKSB7XG4gICAgICBzZXAgPSBcIlwiOyAgICAgICAgICAgICAvLyBlLmcuIFthdHRyPVwiLFwiXVxuICAgIH1cbiAgICBlbHNlIGlmIChzZXAgPT0gXCJcIikge1xuICAgICAgaWYgKGNociA9PSAnXCInIHx8IGNociA9PSBcIidcIikge1xuICAgICAgICBzZXAgPSBjaHI7XG4gICAgICB9XG4gICAgICAvLyBkb24ndCBzcGxpdCBiZXR3ZWVuIHBhcmVudGhlc2VzXG4gICAgICBlbHNlIGlmIChjaHIgPT0gXCIoXCIpIHtcbiAgICAgICAgbGV2ZWwrKzsgICAgICAgICAgICAvLyBlLmcuIDptYXRjaGVzKGRpdixzcGFuKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoY2hyID09IFwiKVwiKSB7XG4gICAgICAgIGxldmVsID0gTWF0aC5tYXgoMCwgbGV2ZWwgLSAxKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGNociA9PSBcIixcIiAmJiBsZXZlbCA9PSAwKSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKHNlbGVjdG9yLnN1YnN0cmluZyhzdGFydCwgaSkpO1xuICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdG9ycy5wdXNoKHNlbGVjdG9yLnN1YnN0cmluZyhzdGFydCkpO1xuICByZXR1cm4gc2VsZWN0b3JzO1xufTtcblxuZnVuY3Rpb24gZmluZFRhcmdldFNlbGVjdG9ySW5kZXgoc2VsZWN0b3IpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IHdoaXRlc3BhY2UgPSAwO1xuICBsZXQgc2NvcGUgPSBbXTtcblxuICAvLyBTdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIHN0cmluZyBhbmQgZ28gY2hhcmFjdGVyIGJ5IGNoYXJhY3Rlciwgd2hlcmUgZWFjaFxuICAvLyBjaGFyYWN0ZXIgaXMgYSBVbmljb2RlIGNvZGUgcG9pbnQuXG4gIGZvciAobGV0IGNoYXJhY3RlciBvZiBbLi4uc2VsZWN0b3JdLnJldmVyc2UoKSkge1xuICAgIGxldCBjdXJyZW50U2NvcGUgPSBzY29wZVtzY29wZS5sZW5ndGggLSAxXTtcblxuICAgIGlmIChjaGFyYWN0ZXIgPT0gXCInXCIgfHwgY2hhcmFjdGVyID09IFwiXFxcIlwiKSB7XG4gICAgICAvLyBJZiB3ZSdyZSBhbHJlYWR5IHdpdGhpbiB0aGUgc2FtZSB0eXBlIG9mIHF1b3RlLCBjbG9zZSB0aGUgc2NvcGU7XG4gICAgICAvLyBvdGhlcndpc2Ugb3BlbiBhIG5ldyBzY29wZS5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgPT0gY2hhcmFjdGVyKVxuICAgICAgICBzY29wZS5wb3AoKTtcbiAgICAgIGVsc2VcbiAgICAgICAgc2NvcGUucHVzaChjaGFyYWN0ZXIpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaGFyYWN0ZXIgPT0gXCJdXCIgfHwgY2hhcmFjdGVyID09IFwiKVwiKSB7XG4gICAgICAvLyBGb3IgY2xvc2luZyBicmFja2V0cyBhbmQgcGFyZW50aGVzZXMsIG9wZW4gYSBuZXcgc2NvcGUgb25seSBpZiB3ZSdyZVxuICAgICAgLy8gbm90IHdpdGhpbiBhIHF1b3RlLiBXaXRoaW4gcXVvdGVzIHRoZXNlIGNoYXJhY3RlcnMgc2hvdWxkIGhhdmUgbm9cbiAgICAgIC8vIG1lYW5pbmcuXG4gICAgICBpZiAoY3VycmVudFNjb3BlICE9IFwiJ1wiICYmIGN1cnJlbnRTY29wZSAhPSBcIlxcXCJcIilcbiAgICAgICAgc2NvcGUucHVzaChjaGFyYWN0ZXIpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaGFyYWN0ZXIgPT0gXCJbXCIpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGFscmVhZHkgd2l0aGluIGEgYnJhY2tldCwgY2xvc2UgdGhlIHNjb3BlLlxuICAgICAgaWYgKGN1cnJlbnRTY29wZSA9PSBcIl1cIilcbiAgICAgICAgc2NvcGUucG9wKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PSBcIihcIikge1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSB3aXRoaW4gYSBwYXJlbnRoZXNpcywgY2xvc2UgdGhlIHNjb3BlLlxuICAgICAgaWYgKGN1cnJlbnRTY29wZSA9PSBcIilcIilcbiAgICAgICAgc2NvcGUucG9wKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFjdXJyZW50U2NvcGUpIHtcbiAgICAgIC8vIEF0IHRoZSB0b3AgbGV2ZWwgKG5vdCB3aXRoaW4gYW55IHNjb3BlKSwgY291bnQgdGhlIHdoaXRlc3BhY2UgaWYgd2UndmVcbiAgICAgIC8vIGVuY291bnRlcmVkIGl0LiBPdGhlcndpc2UgaWYgd2UndmUgaGl0IG9uZSBvZiB0aGUgY29tYmluYXRvcnMsXG4gICAgICAvLyB0ZXJtaW5hdGUgaGVyZTsgb3RoZXJ3aXNlIGlmIHdlJ3ZlIGhpdCBhIG5vbi1jb2xvbiBjaGFyYWN0ZXIsXG4gICAgICAvLyB0ZXJtaW5hdGUgaGVyZS5cbiAgICAgIGlmICgvXFxzLy50ZXN0KGNoYXJhY3RlcikpXG4gICAgICAgIHdoaXRlc3BhY2UrKztcbiAgICAgIGVsc2UgaWYgKChjaGFyYWN0ZXIgPT0gXCI+XCIgfHwgY2hhcmFjdGVyID09IFwiK1wiIHx8IGNoYXJhY3RlciA9PSBcIn5cIikgfHxcbiAgICAgICAgICAgICAgICh3aGl0ZXNwYWNlID4gMCAmJiBjaGFyYWN0ZXIgIT0gXCI6XCIpKVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBaZXJvIG91dCB0aGUgd2hpdGVzcGFjZSBjb3VudCBpZiB3ZSd2ZSBlbnRlcmVkIGEgc2NvcGUuXG4gICAgaWYgKHNjb3BlLmxlbmd0aCA+IDApXG4gICAgICB3aGl0ZXNwYWNlID0gMDtcblxuICAgIC8vIEluY3JlbWVudCB0aGUgaW5kZXggYnkgdGhlIHNpemUgb2YgdGhlIGNoYXJhY3Rlci4gTm90ZSB0aGF0IGZvciBVbmljb2RlXG4gICAgLy8gY29tcG9zaXRlIGNoYXJhY3RlcnMgKGxpa2UgZW1vamkpIHRoaXMgd2lsbCBiZSBtb3JlIHRoYW4gb25lLlxuICAgIGluZGV4ICs9IGNoYXJhY3Rlci5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3IubGVuZ3RoIC0gaW5kZXggKyB3aGl0ZXNwYWNlO1xufVxuXG4vKipcbiAqIFF1YWxpZmllcyBhIENTUyBzZWxlY3RvciB3aXRoIGEgcXVhbGlmaWVyLCB3aGljaCBtYXkgYmUgYW5vdGhlciBDU1Mgc2VsZWN0b3JcbiAqIG9yIGFuIGVtcHR5IHN0cmluZy4gRm9yIGV4YW1wbGUsIGdpdmVuIHRoZSBzZWxlY3RvciBcImRpdi5iYXJcIiBhbmQgdGhlXG4gKiBxdWFsaWZpZXIgXCIjZm9vXCIsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBcImRpdiNmb28uYmFyXCIuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIHRvIHF1YWxpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcXVhbGlmaWVyIFRoZSBxdWFsaWZpZXIgd2l0aCB3aGljaCB0byBxdWFsaWZ5IHRoZSBzZWxlY3Rvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBxdWFsaWZpZWQgc2VsZWN0b3IuXG4gKiBAcGFja2FnZVxuICovXG5leHBvcnRzLnF1YWxpZnlTZWxlY3RvciA9IGZ1bmN0aW9uIHF1YWxpZnlTZWxlY3RvcihzZWxlY3RvciwgcXVhbGlmaWVyKSB7XG4gIGxldCBxdWFsaWZpZWRTZWxlY3RvciA9IFwiXCI7XG5cbiAgbGV0IHF1YWxpZmllclRhcmdldFNlbGVjdG9ySW5kZXggPSBmaW5kVGFyZ2V0U2VsZWN0b3JJbmRleChxdWFsaWZpZXIpO1xuICBsZXQgWywgcXVhbGlmaWVyVHlwZSA9IFwiXCJdID1cbiAgICAvXihbYS16XVthLXotXSopPy9pLmV4ZWMocXVhbGlmaWVyLnN1YnN0cmluZyhxdWFsaWZpZXJUYXJnZXRTZWxlY3RvckluZGV4KSk7XG5cbiAgZm9yIChsZXQgc3ViIG9mIHNwbGl0U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgc3ViID0gc3ViLnRyaW0oKTtcblxuICAgIHF1YWxpZmllZFNlbGVjdG9yICs9IFwiLCBcIjtcblxuICAgIGxldCBpbmRleCA9IGZpbmRUYXJnZXRTZWxlY3RvckluZGV4KHN1Yik7XG5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIGZpcnN0IGdyb3VwIGluIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gaXMgb3B0aW9uYWwuIElmIGl0XG4gICAgLy8gZG9lc24ndCBtYXRjaCAoZS5nLiBcIiNmb286Om50aC1jaGlsZCgxKVwiKSwgdHlwZSB3aWxsIGJlIGFuIGVtcHR5IHN0cmluZy5cbiAgICBsZXQgWywgdHlwZSA9IFwiXCIsIHJlc3RdID1cbiAgICAgIC9eKFthLXpdW2Etei1dKik/XFwqPyguKikvaS5leGVjKHN1Yi5zdWJzdHJpbmcoaW5kZXgpKTtcblxuICAgIGlmICh0eXBlID09IHF1YWxpZmllclR5cGUpXG4gICAgICB0eXBlID0gXCJcIjtcblxuICAgIC8vIElmIHRoZSBxdWFsaWZpZXIgZW5kcyBpbiBhIGNvbWJpbmF0b3IgKGUuZy4gXCJib2R5ICNmb28+XCIpLCB3ZSBwdXQgdGhlXG4gICAgLy8gdHlwZSBhbmQgdGhlIHJlc3Qgb2YgdGhlIHNlbGVjdG9yIGFmdGVyIHRoZSBxdWFsaWZpZXJcbiAgICAvLyAoZS5nLiBcImJvZHkgI2Zvbz5kaXYuYmFyXCIpOyBvdGhlcndpc2UgKGUuZy4gXCJib2R5ICNmb29cIikgd2UgbWVyZ2UgdGhlXG4gICAgLy8gdHlwZSBpbnRvIHRoZSBxdWFsaWZpZXIgKGUuZy4gXCJib2R5IGRpdiNmb28uYmFyXCIpLlxuICAgIGlmICgvW1xccz4rfl0kLy50ZXN0KHF1YWxpZmllcikpXG4gICAgICBxdWFsaWZpZWRTZWxlY3RvciArPSBzdWIuc3Vic3RyaW5nKDAsIGluZGV4KSArIHF1YWxpZmllciArIHR5cGUgKyByZXN0O1xuICAgIGVsc2VcbiAgICAgIHF1YWxpZmllZFNlbGVjdG9yICs9IHN1Yi5zdWJzdHJpbmcoMCwgaW5kZXgpICsgdHlwZSArIHF1YWxpZmllciArIHJlc3Q7XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIGluaXRpYWwgY29tbWEgYW5kIHNwYWNlLlxuICByZXR1cm4gcXVhbGlmaWVkU2VsZWN0b3Iuc3Vic3RyaW5nKDIpO1xufTtcbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBBZGJsb2NrIFBsdXMgPGh0dHBzOi8vYWRibG9ja3BsdXMub3JnLz4sXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggQWRibG9jayBQbHVzLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qKiBAbW9kdWxlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB7bWFrZVJlZ0V4cFBhcmFtZXRlciwgc3BsaXRTZWxlY3RvcixcbiAgICAgICBxdWFsaWZ5U2VsZWN0b3J9ID0gcmVxdWlyZShcIi4uL2NvbW1vblwiKTtcbmNvbnN0IHtmaWx0ZXJUb1JlZ0V4cH0gPSByZXF1aXJlKFwiLi4vcGF0dGVybnNcIik7XG5cbmNvbnN0IERFRkFVTFRfTUlOX0lOVk9DQVRJT05fSU5URVJWQUwgPSAzMDAwO1xubGV0IG1pbkludm9jYXRpb25JbnRlcnZhbCA9IERFRkFVTFRfTUlOX0lOVk9DQVRJT05fSU5URVJWQUw7XG5jb25zdCBERUZBVUxUX01BWF9TWUNIUk9OT1VTX1BST0NFU1NJTkdfVElNRSA9IDUwO1xubGV0IG1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgPSBERUZBVUxUX01BWF9TWUNIUk9OT1VTX1BST0NFU1NJTkdfVElNRTtcblxubGV0IGFicFNlbGVjdG9yUmVnZXhwID0gLzooLWFicC1bXFx3LV0rfGhhc3xoYXMtdGV4dHx4cGF0aHxub3QpXFwoLztcblxubGV0IHRlc3RJbmZvID0gbnVsbDtcblxuZnVuY3Rpb24gdG9DU1NTdHlsZURlY2xhcmF0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZXN0XCIpLCB7c3R5bGU6IHZhbHVlfSkuc3R5bGU7XG59XG5cbi8qKlxuICogRW5hYmxlcyB0ZXN0IG1vZGUsIHdoaWNoIHRyYWNrcyBhZGRpdGlvbmFsIG1ldGFkYXRhIGFib3V0IHRoZSBpbm5lclxuICogd29ya2luZ3MgZm9yIHRlc3QgcHVycG9zZXMuIFRoaXMgYWxzbyBhbGxvd3Mgb3ZlcnJpZGluZyBpbnRlcm5hbFxuICogY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubWluSW52b2NhdGlvbkludGVydmFsIE92ZXJyaWRlcyBob3cgbG9uZ1xuICogICBtdXN0IGJlIHdhaXRlZCBiZXR3ZWVuIGZpbHRlciBwcm9jZXNzaW5nIHJ1bnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLm1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgT3ZlcnJpZGVzIGhvd1xuICogICBsb25nIHRoZSB0aHJlYWQgbWF5IHNwZW5kIHByb2Nlc3NpbmcgZmlsdGVycyBiZWZvcmUgaXQgbXVzdCB5aWVsZFxuICogICBpdHMgdGhyZWFkXG4gKi9cbmV4cG9ydHMuc2V0VGVzdE1vZGUgPSBmdW5jdGlvbiBzZXRUZXN0TW9kZShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5taW5JbnZvY2F0aW9uSW50ZXJ2YWwgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgbWluSW52b2NhdGlvbkludGVydmFsID0gb3B0aW9ucy5taW5JbnZvY2F0aW9uSW50ZXJ2YWw7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5tYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lICE9PSBcInVuZGVmaW5lZFwiKVxuICAgIG1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgPSBvcHRpb25zLm1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWU7XG5cbiAgdGVzdEluZm8gPSB7XG4gICAgbGFzdFByb2Nlc3NlZEVsZW1lbnRzOiBuZXcgU2V0KCksXG4gICAgZmFpbGVkQXNzZXJ0aW9uczogW11cbiAgfTtcbn07XG5cbmV4cG9ydHMuZ2V0VGVzdEluZm8gPSBmdW5jdGlvbiBnZXRUZXN0SW5mbygpIHtcbiAgcmV0dXJuIHRlc3RJbmZvO1xufTtcblxuZXhwb3J0cy5jbGVhclRlc3RNb2RlID0gZnVuY3Rpb24oKSB7XG4gIG1pbkludm9jYXRpb25JbnRlcnZhbCA9IERFRkFVTFRfTUlOX0lOVk9DQVRJT05fSU5URVJWQUw7XG4gIG1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgPSBERUZBVUxUX01BWF9TWUNIUk9OT1VTX1BST0NFU1NJTkdfVElNRTtcbiAgdGVzdEluZm8gPSBudWxsO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IElkbGVEZWFkbGluZS5cbiAqXG4gKiBOb3RlOiBUaGlzIGZ1bmN0aW9uIGlzIHN5bmNocm9ub3VzIGFuZCBkb2VzIE5PVCByZXF1ZXN0IGFuIGlkbGVcbiAqIGNhbGxiYWNrLlxuICpcbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0lkbGVEZWFkbGluZX0uXG4gKiBAcmV0dXJuIHtJZGxlRGVhZGxpbmV9XG4gKi9cbmZ1bmN0aW9uIG5ld0lkbGVEZWFkbGluZSgpIHtcbiAgbGV0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICByZXR1cm4ge1xuICAgIGRpZFRpbWVvdXQ6IGZhbHNlLFxuICAgIHRpbWVSZW1haW5pbmcoKSB7XG4gICAgICBsZXQgZWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgbGV0IHJlbWFpbmluZyA9IG1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgLSBlbGFwc2VkO1xuICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIHJlbWFpbmluZyk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgYnJvd3NlciBpcyBuZXh0IGlkbGUuXG4gKlxuICogVGhpcyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciBsb25nIHJ1bm5pbmcgdGFza3Mgb24gdGhlIFVJIHRocmVhZFxuICogdG8gYWxsb3cgb3RoZXIgVUkgZXZlbnRzIHRvIHByb2Nlc3MuXG4gKlxuICogQHJldHVybiB7UHJvbWlzZS48SWRsZURlYWRsaW5lPn1cbiAqICAgIEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHlvdSBjYW4gY29udGludWUgcHJvY2Vzc2luZ1xuICovXG5mdW5jdGlvbiB5aWVsZFRocmVhZCgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGlmICh0eXBlb2YgcmVxdWVzdElkbGVDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXF1ZXN0SWRsZUNhbGxiYWNrKHJlc29sdmUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZXNvbHZlKG5ld0lkbGVEZWFkbGluZSgpKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfSk7XG59XG5cblxuZnVuY3Rpb24gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShvYmplY3QsIG5hbWUsIGRlZmF1bHRWYWx1ZUZ1bmMgPSAoKSA9PiB7fSkge1xuICBsZXQgdmFsdWUgPSBvYmplY3RbbmFtZV07XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJ1bmRlZmluZWRcIilcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7dmFsdWU6IHZhbHVlID0gZGVmYXVsdFZhbHVlRnVuYygpfSk7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gcG9zaXRpb24gb2Ygbm9kZSBmcm9tIHBhcmVudC5cbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSB0aGUgbm9kZSB0byBmaW5kIHRoZSBwb3NpdGlvbiBvZi5cbiAqIEByZXR1cm4ge251bWJlcn0gT25lLWJhc2VkIGluZGV4IGxpa2UgZm9yIDpudGgtY2hpbGQoKSwgb3IgMCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcG9zaXRpb25JblBhcmVudChub2RlKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIGZvciAobGV0IGNoaWxkIG9mIG5vZGUucGFyZW50Tm9kZS5jaGlsZHJlbikge1xuICAgIGlmIChjaGlsZCA9PSBub2RlKVxuICAgICAgcmV0dXJuIGluZGV4ICsgMTtcblxuICAgIGluZGV4Kys7XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gbWFrZVNlbGVjdG9yKG5vZGUsIHNlbGVjdG9yID0gXCJcIikge1xuICBpZiAobm9kZSA9PSBudWxsKVxuICAgIHJldHVybiBudWxsO1xuICBpZiAoIW5vZGUucGFyZW50RWxlbWVudCkge1xuICAgIGxldCBuZXdTZWxlY3RvciA9IFwiOnJvb3RcIjtcbiAgICBpZiAoc2VsZWN0b3IpXG4gICAgICBuZXdTZWxlY3RvciArPSBcIiA+IFwiICsgc2VsZWN0b3I7XG4gICAgcmV0dXJuIG5ld1NlbGVjdG9yO1xuICB9XG4gIGxldCBpZHggPSBwb3NpdGlvbkluUGFyZW50KG5vZGUpO1xuICBpZiAoaWR4ID4gMCkge1xuICAgIGxldCBuZXdTZWxlY3RvciA9IGAke25vZGUudGFnTmFtZX06bnRoLWNoaWxkKCR7aWR4fSlgO1xuICAgIGlmIChzZWxlY3RvcilcbiAgICAgIG5ld1NlbGVjdG9yICs9IFwiID4gXCIgKyBzZWxlY3RvcjtcbiAgICByZXR1cm4gbWFrZVNlbGVjdG9yKG5vZGUucGFyZW50RWxlbWVudCwgbmV3U2VsZWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGVjdG9yO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlbGVjdG9yQ29udGVudChjb250ZW50LCBzdGFydEluZGV4KSB7XG4gIGxldCBwYXJlbnMgPSAxO1xuICBsZXQgcXVvdGUgPSBudWxsO1xuICBsZXQgaSA9IHN0YXJ0SW5kZXg7XG4gIGZvciAoOyBpIDwgY29udGVudC5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjID0gY29udGVudFtpXTtcbiAgICBpZiAoYyA9PSBcIlxcXFxcIikge1xuICAgICAgLy8gSWdub3JlIGVzY2FwZWQgY2hhcmFjdGVyc1xuICAgICAgaSsrO1xuICAgIH1cbiAgICBlbHNlIGlmIChxdW90ZSkge1xuICAgICAgaWYgKGMgPT0gcXVvdGUpXG4gICAgICAgIHF1b3RlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYyA9PSBcIidcIiB8fCBjID09ICdcIicpIHtcbiAgICAgIHF1b3RlID0gYztcbiAgICB9XG4gICAgZWxzZSBpZiAoYyA9PSBcIihcIikge1xuICAgICAgcGFyZW5zKys7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMgPT0gXCIpXCIpIHtcbiAgICAgIHBhcmVucy0tO1xuICAgICAgaWYgKHBhcmVucyA9PSAwKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAocGFyZW5zID4gMClcbiAgICByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHt0ZXh0OiBjb250ZW50LnN1YnN0cmluZyhzdGFydEluZGV4LCBpKSwgZW5kOiBpfTtcbn1cblxuLyoqXG4gKiBTdHJpbmdpZmllZCBzdHlsZSBvYmplY3RzXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBTdHJpbmdpZmllZFN0eWxlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3R5bGUgQ1NTIHN0eWxlIHJlcHJlc2VudGVkIGJ5IGEgc3RyaW5nLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gc3ViU2VsZWN0b3JzIHNlbGVjdG9ycyB0aGUgQ1NTIHByb3BlcnRpZXMgYXBwbHkgdG8uXG4gKi9cblxuLyoqXG4gKiBQcm9kdWNlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzdHlsZXNoZWV0IGVudHJ5LlxuICogQHBhcmFtIHtDU1NTdHlsZVJ1bGV9IHJ1bGUgdGhlIENTUyBzdHlsZSBydWxlLlxuICogQHJldHVybiB7U3RyaW5naWZpZWRTdHlsZX0gdGhlIHN0cmluZ2lmaWVkIHN0eWxlLlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlTdHlsZShydWxlKSB7XG4gIGxldCBzdHlsZXMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlLnN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHByb3BlcnR5ID0gcnVsZS5zdHlsZS5pdGVtKGkpO1xuICAgIGxldCB2YWx1ZSA9IHJ1bGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gICAgbGV0IHByaW9yaXR5ID0gcnVsZS5zdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KHByb3BlcnR5KTtcbiAgICBzdHlsZXMucHVzaChgJHtwcm9wZXJ0eX06ICR7dmFsdWV9JHtwcmlvcml0eSA/IFwiICFcIiArIHByaW9yaXR5IDogXCJcIn07YCk7XG4gIH1cbiAgc3R5bGVzLnNvcnQoKTtcbiAgcmV0dXJuIHtcbiAgICBzdHlsZTogc3R5bGVzLmpvaW4oXCIgXCIpLFxuICAgIHN1YlNlbGVjdG9yczogc3BsaXRTZWxlY3RvcihydWxlLnNlbGVjdG9yVGV4dClcbiAgfTtcbn1cblxubGV0IHNjb3BlU3VwcG9ydGVkID0gbnVsbDtcblxuZnVuY3Rpb24gdHJ5UXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgYWxsKSB7XG4gIGxldCBlbGVtZW50cyA9IG51bGw7XG4gIHRyeSB7XG4gICAgZWxlbWVudHMgPSBhbGwgPyBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDpcbiAgICAgIHN1YnRyZWUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgc2NvcGVTdXBwb3J0ZWQgPSB0cnVlO1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgLy8gRWRnZSBkb2Vzbid0IHN1cHBvcnQgXCI6c2NvcGVcIlxuICAgIHNjb3BlU3VwcG9ydGVkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGVsZW1lbnRzO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHNlbGVjdG9yLlxuICpcbiAqIElmIGl0IGlzIHJlbGF0aXZlLCB3aWxsIHRyeSA6c2NvcGUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBlbGVtZW50IHRvIHF1ZXJ5IHNlbGVjdG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgdGhlIHNlbGVjdG9yIHRvIHF1ZXJ5XG4gKiBAcGFyYW0ge2Jvb2x9IFthbGw9ZmFsc2VdIHRydWUgdG8gcGVyZm9ybSBxdWVyeVNlbGVjdG9yQWxsKClcbiAqXG4gKiBAcmV0dXJucyB7PyhOb2RlfE5vZGVMaXN0KX0gcmVzdWx0IG9mIHRoZSBxdWVyeS4gbnVsbCBpbiBjYXNlIG9mIGVycm9yLlxuICovXG5mdW5jdGlvbiBzY29wZWRRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCBhbGwpIHtcbiAgaWYgKHNlbGVjdG9yWzBdID09IFwiPlwiKSB7XG4gICAgc2VsZWN0b3IgPSBcIjpzY29wZVwiICsgc2VsZWN0b3I7XG4gICAgaWYgKHNjb3BlU3VwcG9ydGVkKSB7XG4gICAgICByZXR1cm4gYWxsID8gc3VidHJlZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6XG4gICAgICAgIHN1YnRyZWUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgfVxuICAgIGlmIChzY29wZVN1cHBvcnRlZCA9PSBudWxsKVxuICAgICAgcmV0dXJuIHRyeVF1ZXJ5U2VsZWN0b3Ioc3VidHJlZSwgc2VsZWN0b3IsIGFsbCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGFsbCA/IHN1YnRyZWUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOlxuICAgIHN1YnRyZWUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNjb3BlZFF1ZXJ5U2VsZWN0b3Ioc3VidHJlZSwgc2VsZWN0b3IsIHRydWUpO1xufVxuXG5jbGFzcyBQbGFpblNlbGVjdG9yIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3IpIHtcbiAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzID0gL1sjLjpdfFxcWy4rXFxdLy50ZXN0KHNlbGVjdG9yKTtcbiAgICB0aGlzLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMgPSAvW34rXS8udGVzdChzZWxlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBhIHBhaXIgb2Ygc2VsZWN0b3Igc3RyaW5nIGFuZCBzdWJ0cmVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRoZSBwcmVmaXggZm9yIHRoZSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb24uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKi9cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICB5aWVsZCBbcHJlZml4ICsgdGhpcy5fc2VsZWN0b3IsIHN1YnRyZWVdO1xuICB9XG59XG5cbmNvbnN0IGluY29tcGxldGVQcmVmaXhSZWdleHAgPSAvW1xccz4rfl0kLztcblxuY2xhc3MgTm90U2VsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMpIHtcbiAgICB0aGlzLl9pbm5lclBhdHRlcm4gPSBuZXcgUGF0dGVybihzZWxlY3RvcnMpO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPblN0eWxlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLmRlcGVuZHNPblN0eWxlcztcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25DaGFyYWN0ZXJEYXRhKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uQ2hhcmFjdGVyRGF0YTtcbiAgfVxuXG4gIGdldCBtYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXM7XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5nZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpKVxuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgZWxlbWVudF07XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBzZWxlY3RlZCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0aGUgcHJlZml4IGZvciB0aGUgc2VsZWN0b3IuXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uLlxuICAgKiBAcGFyYW0ge05vZGVbXX0gW3RhcmdldHNdIHRoZSBub2RlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICovXG4gICpnZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQgYWN0dWFsUHJlZml4ID0gKCFwcmVmaXggfHwgaW5jb21wbGV0ZVByZWZpeFJlZ2V4cC50ZXN0KHByZWZpeCkpID9cbiAgICAgIHByZWZpeCArIFwiKlwiIDogcHJlZml4O1xuICAgIGxldCBlbGVtZW50cyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgYWN0dWFsUHJlZml4KTtcbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgbmVpdGhlciBhbiBhbmNlc3RvciBub3IgYSBkZXNjZW5kYW50IG9mIG9uZSBvZiB0aGVcbiAgICAgICAgLy8gdGFyZ2V0cywgd2UgY2FuIHNraXAgaXQuXG4gICAgICAgIGlmICh0YXJnZXRzICYmICF0YXJnZXRzLnNvbWUodGFyZ2V0ID0+IGVsZW1lbnQuY29udGFpbnModGFyZ2V0KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQuY29udGFpbnMoZWxlbWVudCkpKSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXN0SW5mbylcbiAgICAgICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAgIGlmICghdGhpcy5faW5uZXJQYXR0ZXJuLm1hdGNoZXMoZWxlbWVudCwgc3VidHJlZSkpXG4gICAgICAgICAgeWllbGQgZWxlbWVudDtcblxuICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFN0eWxlcyhzdHlsZXMpIHtcbiAgICB0aGlzLl9pbm5lclBhdHRlcm4uc2V0U3R5bGVzKHN0eWxlcyk7XG4gIH1cbn1cblxuY2xhc3MgSGFzU2VsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMpIHtcbiAgICB0aGlzLl9pbm5lclBhdHRlcm4gPSBuZXcgUGF0dGVybihzZWxlY3RvcnMpO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPblN0eWxlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLmRlcGVuZHNPblN0eWxlcztcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25DaGFyYWN0ZXJEYXRhKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uQ2hhcmFjdGVyRGF0YTtcbiAgfVxuXG4gIGdldCBtYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXM7XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5nZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpKVxuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgZWxlbWVudF07XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBzZWxlY3RlZCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0aGUgcHJlZml4IGZvciB0aGUgc2VsZWN0b3IuXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uLlxuICAgKiBAcGFyYW0ge05vZGVbXX0gW3RhcmdldHNdIHRoZSBub2RlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICovXG4gICpnZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQgYWN0dWFsUHJlZml4ID0gKCFwcmVmaXggfHwgaW5jb21wbGV0ZVByZWZpeFJlZ2V4cC50ZXN0KHByZWZpeCkpID9cbiAgICAgIHByZWZpeCArIFwiKlwiIDogcHJlZml4O1xuICAgIGxldCBlbGVtZW50cyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgYWN0dWFsUHJlZml4KTtcbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgbmVpdGhlciBhbiBhbmNlc3RvciBub3IgYSBkZXNjZW5kYW50IG9mIG9uZSBvZiB0aGVcbiAgICAgICAgLy8gdGFyZ2V0cywgd2UgY2FuIHNraXAgaXQuXG4gICAgICAgIGlmICh0YXJnZXRzICYmICF0YXJnZXRzLnNvbWUodGFyZ2V0ID0+IGVsZW1lbnQuY29udGFpbnModGFyZ2V0KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQuY29udGFpbnMoZWxlbWVudCkpKSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXN0SW5mbylcbiAgICAgICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHRoaXMuX2lubmVyUGF0dGVybi5ldmFsdWF0ZShlbGVtZW50LCB0YXJnZXRzKSkge1xuICAgICAgICAgIGlmIChzZWxlY3RvciA9PSBudWxsKVxuICAgICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBlbHNlIGlmIChzY29wZWRRdWVyeVNlbGVjdG9yKGVsZW1lbnQsIHNlbGVjdG9yKSlcbiAgICAgICAgICAgIHlpZWxkIGVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFN0eWxlcyhzdHlsZXMpIHtcbiAgICB0aGlzLl9pbm5lclBhdHRlcm4uc2V0U3R5bGVzKHN0eWxlcyk7XG4gIH1cbn1cblxuY2xhc3MgWFBhdGhTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHRleHRDb250ZW50KSB7XG4gICAgdGhpcy5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhID0gdHJ1ZTtcbiAgICB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyA9IHRydWU7XG5cbiAgICBsZXQgZXZhbHVhdG9yID0gbmV3IFhQYXRoRXZhbHVhdG9yKCk7XG4gICAgdGhpcy5fZXhwcmVzc2lvbiA9IGV2YWx1YXRvci5jcmVhdGVFeHByZXNzaW9uKHRleHRDb250ZW50LCBudWxsKTtcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpXG4gICAgICB5aWVsZCBbbWFrZVNlbGVjdG9yKGVsZW1lbnQpLCBlbGVtZW50XTtcbiAgfVxuXG4gICpnZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQge09SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFOiBmbGFnfSA9IFhQYXRoUmVzdWx0O1xuICAgIGxldCBlbGVtZW50cyA9IHByZWZpeCA/IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgcHJlZml4KSA6IFtzdWJ0cmVlXTtcbiAgICBmb3IgKGxldCBwYXJlbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLl9leHByZXNzaW9uLmV2YWx1YXRlKHBhcmVudCwgZmxhZywgbnVsbCk7XG4gICAgICBmb3IgKGxldCBpID0gMCwge3NuYXBzaG90TGVuZ3RofSA9IHJlc3VsdDsgaSA8IHNuYXBzaG90TGVuZ3RoOyBpKyspXG4gICAgICAgIHlpZWxkIHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENvbnRhaW5zU2VsZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcih0ZXh0Q29udGVudCkge1xuICAgIHRoaXMuZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSA9IHRydWU7XG5cbiAgICB0aGlzLl9yZWdleHAgPSBtYWtlUmVnRXhwUGFyYW1ldGVyKHRleHRDb250ZW50KTtcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpXG4gICAgICB5aWVsZCBbbWFrZVNlbGVjdG9yKGVsZW1lbnQpLCBzdWJ0cmVlXTtcbiAgfVxuXG4gICpnZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQgYWN0dWFsUHJlZml4ID0gKCFwcmVmaXggfHwgaW5jb21wbGV0ZVByZWZpeFJlZ2V4cC50ZXN0KHByZWZpeCkpID9cbiAgICAgIHByZWZpeCArIFwiKlwiIDogcHJlZml4O1xuXG4gICAgbGV0IGVsZW1lbnRzID0gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBhY3R1YWxQcmVmaXgpO1xuXG4gICAgaWYgKGVsZW1lbnRzKSB7XG4gICAgICBsZXQgbGFzdFJvb3QgPSBudWxsO1xuICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAvLyBGb3IgYSBmaWx0ZXIgbGlrZSBkaXY6LWFicC1jb250YWlucyhIZWxsbykgYW5kIGEgc3VidHJlZSBsaWtlXG4gICAgICAgIC8vIDxkaXYgaWQ9XCJhXCI+PGRpdiBpZD1cImJcIj48ZGl2IGlkPVwiY1wiPkhlbGxvPC9kaXY+PC9kaXY+PC9kaXY+XG4gICAgICAgIC8vIHdlJ3JlIG9ubHkgaW50ZXJlc3RlZCBpbiBkaXYjYVxuICAgICAgICBpZiAobGFzdFJvb3QgJiYgbGFzdFJvb3QuY29udGFpbnMoZWxlbWVudCkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdFJvb3QgPSBlbGVtZW50O1xuXG4gICAgICAgIGlmICh0YXJnZXRzICYmICF0YXJnZXRzLnNvbWUodGFyZ2V0ID0+IGVsZW1lbnQuY29udGFpbnModGFyZ2V0KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQuY29udGFpbnMoZWxlbWVudCkpKSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXN0SW5mbylcbiAgICAgICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9yZWdleHAgJiYgdGhpcy5fcmVnZXhwLnRlc3QoZWxlbWVudC50ZXh0Q29udGVudCkpXG4gICAgICAgICAgeWllbGQgZWxlbWVudDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFByb3BzU2VsZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eUV4cHJlc3Npb24pIHtcbiAgICB0aGlzLmRlcGVuZHNPblN0eWxlcyA9IHRydWU7XG4gICAgdGhpcy5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMgPSB0cnVlO1xuXG4gICAgbGV0IHJlZ2V4cFN0cmluZztcbiAgICBpZiAocHJvcGVydHlFeHByZXNzaW9uLmxlbmd0aCA+PSAyICYmIHByb3BlcnR5RXhwcmVzc2lvblswXSA9PSBcIi9cIiAmJlxuICAgICAgICBwcm9wZXJ0eUV4cHJlc3Npb25bcHJvcGVydHlFeHByZXNzaW9uLmxlbmd0aCAtIDFdID09IFwiL1wiKVxuICAgICAgcmVnZXhwU3RyaW5nID0gcHJvcGVydHlFeHByZXNzaW9uLnNsaWNlKDEsIC0xKTtcbiAgICBlbHNlXG4gICAgICByZWdleHBTdHJpbmcgPSBmaWx0ZXJUb1JlZ0V4cChwcm9wZXJ0eUV4cHJlc3Npb24pO1xuXG4gICAgdGhpcy5fcmVnZXhwID0gbmV3IFJlZ0V4cChyZWdleHBTdHJpbmcsIFwiaVwiKTtcblxuICAgIHRoaXMuX3N1YlNlbGVjdG9ycyA9IFtdO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBzdWJTZWxlY3RvciBvZiB0aGlzLl9zdWJTZWxlY3RvcnMpIHtcbiAgICAgIGlmIChzdWJTZWxlY3Rvci5zdGFydHNXaXRoKFwiKlwiKSAmJlxuICAgICAgICAgICFpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSlcbiAgICAgICAgc3ViU2VsZWN0b3IgPSBzdWJTZWxlY3Rvci5zdWJzdHJpbmcoMSk7XG5cbiAgICAgIHlpZWxkIFtxdWFsaWZ5U2VsZWN0b3Ioc3ViU2VsZWN0b3IsIHByZWZpeCksIHN1YnRyZWVdO1xuICAgIH1cbiAgfVxuXG4gIHNldFN0eWxlcyhzdHlsZXMpIHtcbiAgICB0aGlzLl9zdWJTZWxlY3RvcnMgPSBbXTtcbiAgICBmb3IgKGxldCBzdHlsZSBvZiBzdHlsZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZWdleHAudGVzdChzdHlsZS5zdHlsZSkpIHtcbiAgICAgICAgZm9yIChsZXQgc3ViU2VsZWN0b3Igb2Ygc3R5bGUuc3ViU2VsZWN0b3JzKSB7XG4gICAgICAgICAgbGV0IGlkeCA9IHN1YlNlbGVjdG9yLmxhc3RJbmRleE9mKFwiOjpcIik7XG4gICAgICAgICAgaWYgKGlkeCAhPSAtMSlcbiAgICAgICAgICAgIHN1YlNlbGVjdG9yID0gc3ViU2VsZWN0b3Iuc3Vic3RyaW5nKDAsIGlkeCk7XG5cbiAgICAgICAgICB0aGlzLl9zdWJTZWxlY3RvcnMucHVzaChzdWJTZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUGF0dGVybiB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycywgdGV4dCkge1xuICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzO1xuICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uU3R5bGVzKCkge1xuICAgIHJldHVybiBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKFxuICAgICAgdGhpcywgXCJfZGVwZW5kc09uU3R5bGVzXCIsICgpID0+IHRoaXMuc2VsZWN0b3JzLnNvbWUoXG4gICAgICAgIHNlbGVjdG9yID0+IHNlbGVjdG9yLmRlcGVuZHNPblN0eWxlc1xuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXQgbWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzKCkge1xuICAgIC8vIE9ic2VydmUgY2hhbmdlcyB0byBhdHRyaWJ1dGVzIGlmIGVpdGhlciB0aGVyZSdzIGEgcGxhaW4gc2VsZWN0b3IgdGhhdFxuICAgIC8vIGxvb2tzIGxpa2UgYW4gSUQgc2VsZWN0b3IsIGNsYXNzIHNlbGVjdG9yLCBvciBhdHRyaWJ1dGUgc2VsZWN0b3IgaW4gb25lXG4gICAgLy8gb2YgdGhlIHBhdHRlcm5zIChlLmcuIFwiYVtocmVmPSdodHRwczovL2V4YW1wbGUuY29tLyddXCIpXG4gICAgLy8gb3IgdGhlcmUncyBhIHByb3BlcnRpZXMgc2VsZWN0b3IgbmVzdGVkIGluc2lkZSBhIGhhcyBzZWxlY3RvclxuICAgIC8vIChlLmcuIFwiZGl2Oi1hYnAtaGFzKDotYWJwLXByb3BlcnRpZXMoY29sb3I6IGJsdWUpKVwiKVxuICAgIHJldHVybiBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKFxuICAgICAgdGhpcywgXCJfbWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzXCIsICgpID0+IHRoaXMuc2VsZWN0b3JzLnNvbWUoXG4gICAgICAgIHNlbGVjdG9yID0+IHNlbGVjdG9yLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyB8fFxuICAgICAgICAgICAgICAgICAgICAoc2VsZWN0b3IgaW5zdGFuY2VvZiBIYXNTZWxlY3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IuZGVwZW5kc09uU3R5bGVzKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSgpIHtcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgdG8gY2hhcmFjdGVyIGRhdGEgb25seSBpZiB0aGVyZSdzIGEgY29udGFpbnMgc2VsZWN0b3IgaW5cbiAgICAvLyBvbmUgb2YgdGhlIHBhdHRlcm5zLlxuICAgIHJldHVybiBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKFxuICAgICAgdGhpcywgXCJfZGVwZW5kc09uQ2hhcmFjdGVyRGF0YVwiLCAoKSA9PiB0aGlzLnNlbGVjdG9ycy5zb21lKFxuICAgICAgICBzZWxlY3RvciA9PiBzZWxlY3Rvci5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGdldCBtYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzKCkge1xuICAgIHJldHVybiBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKFxuICAgICAgdGhpcywgXCJfbWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9yc1wiLCAoKSA9PiB0aGlzLnNlbGVjdG9ycy5zb21lKFxuICAgICAgICBzZWxlY3RvciA9PiBzZWxlY3Rvci5tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIG1hdGNoZXNNdXRhdGlvblR5cGVzKG11dGF0aW9uVHlwZXMpIHtcbiAgICBsZXQgbXV0YXRpb25UeXBlTWF0Y2hNYXAgPSBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKFxuICAgICAgdGhpcywgXCJfbXV0YXRpb25UeXBlTWF0Y2hNYXBcIiwgKCkgPT4gbmV3IE1hcChbXG4gICAgICAgIC8vIEFsbCB0eXBlcyBvZiBET00tZGVwZW5kZW50IHBhdHRlcm5zIGFyZSBhZmZlY3RlZCBieSBtdXRhdGlvbnMgb2ZcbiAgICAgICAgLy8gdHlwZSBcImNoaWxkTGlzdFwiLlxuICAgICAgICBbXCJjaGlsZExpc3RcIiwgdHJ1ZV0sXG4gICAgICAgIFtcImF0dHJpYnV0ZXNcIiwgdGhpcy5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXNdLFxuICAgICAgICBbXCJjaGFyYWN0ZXJEYXRhXCIsIHRoaXMuZGVwZW5kc09uQ2hhcmFjdGVyRGF0YV1cbiAgICAgIF0pXG4gICAgKTtcblxuICAgIGZvciAobGV0IG11dGF0aW9uVHlwZSBvZiBtdXRhdGlvblR5cGVzKSB7XG4gICAgICBpZiAobXV0YXRpb25UeXBlTWF0Y2hNYXAuZ2V0KG11dGF0aW9uVHlwZSkpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIENTUyBzZWxlY3RvcnMgZm9yIGFsbCBlbGVtZW50cyB0aGF0XG4gICAqIG1hdGNoIHRoZSBwYXR0ZXJuLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB0cmFuc2Zvcm1pbmcgZnJvbSBzZWxlY3RvcnMgdGhhdCBtYXkgY29udGFpbiBjdXN0b21cbiAgICogOi1hYnAtIHNlbGVjdG9ycyB0byBwdXJlIENTUyBzZWxlY3RvcnMgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWxlY3RcbiAgICogZWxlbWVudHMuXG4gICAqXG4gICAqIFRoZSBzZWxlY3RvcnMgcmV0dXJuZWQgZnJvbSB0aGlzIGZ1bmN0aW9uIG1heSBiZSBpbnZhbGlkYXRlZCBieSBET01cbiAgICogbXV0YXRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvblxuICAgKiBAcGFyYW0ge05vZGVbXX0gW3RhcmdldHNdIHRoZSBub2RlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi4gTWF5IGJlXG4gICAqIHVzZWQgdG8gb3B0aW1pemUgc2VhcmNoLlxuICAgKi9cbiAgKmV2YWx1YXRlKHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQgc2VsZWN0b3JzID0gdGhpcy5zZWxlY3RvcnM7XG4gICAgZnVuY3Rpb24qIGV2YWx1YXRlSW5uZXIoaW5kZXgsIHByZWZpeCwgY3VycmVudFN1YnRyZWUpIHtcbiAgICAgIGlmIChpbmRleCA+PSBzZWxlY3RvcnMubGVuZ3RoKSB7XG4gICAgICAgIHlpZWxkIHByZWZpeDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgW3NlbGVjdG9yLCBlbGVtZW50XSBvZiBzZWxlY3RvcnNbaW5kZXhdLmdldFNlbGVjdG9ycyhcbiAgICAgICAgcHJlZml4LCBjdXJyZW50U3VidHJlZSwgdGFyZ2V0c1xuICAgICAgKSkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgPT0gbnVsbClcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgeWllbGQqIGV2YWx1YXRlSW5uZXIoaW5kZXggKyAxLCBzZWxlY3RvciwgZWxlbWVudCk7XG4gICAgICB9XG4gICAgICAvLyBKdXN0IGluIGNhc2UgdGhlIGdldFNlbGVjdG9ycygpIGdlbmVyYXRvciBhYm92ZSBoYWQgdG8gcnVuIHNvbWUgaGVhdnlcbiAgICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoKSBjYWxsIHdoaWNoIGRpZG4ndCBwcm9kdWNlIGFueSByZXN1bHRzLCBtYWtlXG4gICAgICAvLyBzdXJlIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBwb2ludCB3aGVyZSBleGVjdXRpb24gY2FuIHBhdXNlLlxuICAgICAgeWllbGQgbnVsbDtcbiAgICB9XG4gICAgeWllbGQqIGV2YWx1YXRlSW5uZXIoMCwgXCJcIiwgc3VidHJlZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgcGF0dGVybiBtYXRjaGVzIGEgc3BlY2lmaWMgZWxlbWVudFxuICAgKiBAcGFyYW0ge05vZGV9IFt0YXJnZXRdIHRoZSBlbGVtZW50IHdlJ3JlIGludGVyZXN0ZWQgaW4gY2hlY2tpbmcgZm9yXG4gICAqIG1hdGNoZXMgb24uXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBtYXRjaGVzKHRhcmdldCwgc3VidHJlZSkge1xuICAgIGxldCB0YXJnZXRGaWx0ZXIgPSBbdGFyZ2V0XTtcbiAgICBpZiAodGhpcy5tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzKVxuICAgICAgdGFyZ2V0RmlsdGVyID0gbnVsbDtcblxuICAgIGxldCBzZWxlY3RvckdlbmVyYXRvciA9IHRoaXMuZXZhbHVhdGUoc3VidHJlZSwgdGFyZ2V0RmlsdGVyKTtcbiAgICBmb3IgKGxldCBzZWxlY3RvciBvZiBzZWxlY3RvckdlbmVyYXRvcikge1xuICAgICAgaWYgKHNlbGVjdG9yICYmIHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHNldFN0eWxlcyhzdHlsZXMpIHtcbiAgICBmb3IgKGxldCBzZWxlY3RvciBvZiB0aGlzLnNlbGVjdG9ycykge1xuICAgICAgaWYgKHNlbGVjdG9yLmRlcGVuZHNPblN0eWxlcylcbiAgICAgICAgc2VsZWN0b3Iuc2V0U3R5bGVzKHN0eWxlcyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RNdXRhdGlvblR5cGVzKG11dGF0aW9ucykge1xuICBsZXQgdHlwZXMgPSBuZXcgU2V0KCk7XG5cbiAgZm9yIChsZXQgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XG4gICAgdHlwZXMuYWRkKG11dGF0aW9uLnR5cGUpO1xuXG4gICAgLy8gVGhlcmUgYXJlIG9ubHkgMyB0eXBlcyBvZiBtdXRhdGlvbnM6IFwiYXR0cmlidXRlc1wiLCBcImNoYXJhY3RlckRhdGFcIiwgYW5kXG4gICAgLy8gXCJjaGlsZExpc3RcIi5cbiAgICBpZiAodHlwZXMuc2l6ZSA9PSAzKVxuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gdHlwZXM7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RNdXRhdGlvblRhcmdldHMobXV0YXRpb25zKSB7XG4gIGlmICghbXV0YXRpb25zKVxuICAgIHJldHVybiBudWxsO1xuXG4gIGxldCB0YXJnZXRzID0gbmV3IFNldCgpO1xuXG4gIGZvciAobGV0IG11dGF0aW9uIG9mIG11dGF0aW9ucykge1xuICAgIGlmIChtdXRhdGlvbi50eXBlID09IFwiY2hpbGRMaXN0XCIpIHtcbiAgICAgIC8vIFdoZW4gbmV3IG5vZGVzIGFyZSBhZGRlZCwgd2UncmUgaW50ZXJlc3RlZCBpbiB0aGUgYWRkZWQgbm9kZXMgcmF0aGVyXG4gICAgICAvLyB0aGFuIHRoZSBwYXJlbnQuXG4gICAgICBmb3IgKGxldCBub2RlIG9mIG11dGF0aW9uLmFkZGVkTm9kZXMpXG4gICAgICAgIHRhcmdldHMuYWRkKG5vZGUpO1xuICAgICAgaWYgKG11dGF0aW9uLnJlbW92ZWROb2Rlcy5sZW5ndGggPiAwKVxuICAgICAgICB0YXJnZXRzLmFkZChtdXRhdGlvbi50YXJnZXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRhcmdldHMuYWRkKG11dGF0aW9uLnRhcmdldCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi50YXJnZXRzXTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyUGF0dGVybnMocGF0dGVybnMsIHtzdHlsZXNoZWV0cywgbXV0YXRpb25zfSkge1xuICBpZiAoIXN0eWxlc2hlZXRzICYmICFtdXRhdGlvbnMpXG4gICAgcmV0dXJuIHBhdHRlcm5zLnNsaWNlKCk7XG5cbiAgbGV0IG11dGF0aW9uVHlwZXMgPSBtdXRhdGlvbnMgPyBleHRyYWN0TXV0YXRpb25UeXBlcyhtdXRhdGlvbnMpIDogbnVsbDtcblxuICByZXR1cm4gcGF0dGVybnMuZmlsdGVyKFxuICAgIHBhdHRlcm4gPT4gKHN0eWxlc2hlZXRzICYmIHBhdHRlcm4uZGVwZW5kc09uU3R5bGVzKSB8fFxuICAgICAgICAgICAgICAgKG11dGF0aW9ucyAmJiBwYXR0ZXJuLm1hdGNoZXNNdXRhdGlvblR5cGVzKG11dGF0aW9uVHlwZXMpKVxuICApO1xufVxuXG5mdW5jdGlvbiBzaG91bGRPYnNlcnZlQXR0cmlidXRlcyhwYXR0ZXJucykge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkT2JzZXJ2ZUNoYXJhY3RlckRhdGEocGF0dGVybnMpIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLmRlcGVuZHNPbkNoYXJhY3RlckRhdGEpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRPYnNlcnZlU3R5bGVzKHBhdHRlcm5zKSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5kZXBlbmRzT25TdHlsZXMpO1xufVxuXG4vKipcbiAqIEBjYWxsYmFjayBoaWRlRWxlbXNGdW5jXG4gKiBAcGFyYW0ge05vZGVbXX0gZWxlbWVudHMgRWxlbWVudHMgb24gdGhlIHBhZ2UgdGhhdCBzaG91bGQgYmUgaGlkZGVuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBlbGVtZW50RmlsdGVyc1xuICogICBUaGUgZmlsdGVyIHRleHQgdGhhdCBjYXVzZWQgdGhlIGVsZW1lbnRzIHRvIGJlIGhpZGRlblxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIHVuaGlkZUVsZW1zRnVuY1xuICogQHBhcmFtIHtOb2RlW119IGVsZW1lbnRzIEVsZW1lbnRzIG9uIHRoZSBwYWdlIHRoYXQgc2hvdWxkIGJlIGhpZGRlblxuICovXG5cblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBmcm9udC1lbmQgcHJvY2Vzc2luZyBvZiBlbGVtZW50IGhpZGluZyBlbXVsYXRpb24gZmlsdGVycy5cbiAqL1xuZXhwb3J0cy5FbGVtSGlkZUVtdWxhdGlvbiA9IGNsYXNzIEVsZW1IaWRlRW11bGF0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bW9kdWxlOmNvbnRlbnQvZWxlbUhpZGVFbXVsYXRpb25+aGlkZUVsZW1zRnVuY30gaGlkZUVsZW1zRnVuY1xuICAgKiAgIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgYmUgcHJvdmlkZWQgdG8gZG8gdGhlIGFjdHVhbCBlbGVtZW50IGhpZGluZy5cbiAgICogQHBhcmFtIHttb2R1bGU6Y29udGVudC9lbGVtSGlkZUVtdWxhdGlvbn51bmhpZGVFbGVtc0Z1bmN9IHVuaGlkZUVsZW1zRnVuY1xuICAgKiAgIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgYmUgcHJvdmlkZWQgdG8gdW5oaWRlIHByZXZpb3VzbHkgaGlkZGVuIGVsZW1lbnRzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaGlkZUVsZW1zRnVuYyA9ICgpID0+IHt9LCB1bmhpZGVFbGVtc0Z1bmMgPSAoKSA9PiB7fSkge1xuICAgIHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgdGhpcy5fbGFzdEludm9jYXRpb24gPSAtbWluSW52b2NhdGlvbkludGVydmFsO1xuICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSBudWxsO1xuXG4gICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50O1xuICAgIHRoaXMuaGlkZUVsZW1zRnVuYyA9IGhpZGVFbGVtc0Z1bmM7XG4gICAgdGhpcy51bmhpZGVFbGVtc0Z1bmMgPSB1bmhpZGVFbGVtc0Z1bmM7XG4gICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHRoaXMub2JzZXJ2ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmhpZGRlbkVsZW1lbnRzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgaXNTYW1lT3JpZ2luKHN0eWxlc2hlZXQpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBVUkwoc3R5bGVzaGVldC5ocmVmKS5vcmlnaW4gPT0gdGhpcy5kb2N1bWVudC5sb2NhdGlvbi5vcmlnaW47XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAvLyBJbnZhbGlkIFVSTCwgYXNzdW1lIHRoYXQgaXQgaXMgZmlyc3QtcGFydHkuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIHNlbGVjdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gcGFyc2VcbiAgICogQHJldHVybiB7QXJyYXl9IHNlbGVjdG9ycyBpcyBhbiBhcnJheSBvZiBvYmplY3RzLFxuICAgKiBvciBudWxsIGluIGNhc2Ugb2YgZXJyb3JzLlxuICAgKi9cbiAgcGFyc2VTZWxlY3RvcihzZWxlY3Rvcikge1xuICAgIGlmIChzZWxlY3Rvci5sZW5ndGggPT0gMClcbiAgICAgIHJldHVybiBbXTtcblxuICAgIGxldCBtYXRjaCA9IGFicFNlbGVjdG9yUmVnZXhwLmV4ZWMoc2VsZWN0b3IpO1xuICAgIGlmICghbWF0Y2gpXG4gICAgICByZXR1cm4gW25ldyBQbGFpblNlbGVjdG9yKHNlbGVjdG9yKV07XG5cbiAgICBsZXQgc2VsZWN0b3JzID0gW107XG4gICAgaWYgKG1hdGNoLmluZGV4ID4gMClcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBQbGFpblNlbGVjdG9yKHNlbGVjdG9yLnN1YnN0cmluZygwLCBtYXRjaC5pbmRleCkpKTtcblxuICAgIGxldCBzdGFydEluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgbGV0IGNvbnRlbnQgPSBwYXJzZVNlbGVjdG9yQ29udGVudChzZWxlY3Rvciwgc3RhcnRJbmRleCk7XG4gICAgaWYgKCFjb250ZW50KSB7XG4gICAgICBjb25zb2xlLndhcm4obmV3IFN5bnRheEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkdWUgdG8gdW5tYXRjaGVkIHBhcmVudGhlc2VzLlwiKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKG1hdGNoWzFdID09IFwiLWFicC1wcm9wZXJ0aWVzXCIpIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBQcm9wc1NlbGVjdG9yKGNvbnRlbnQudGV4dCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PSBcIi1hYnAtaGFzXCIgfHwgbWF0Y2hbMV0gPT0gXCJoYXNcIikge1xuICAgICAgbGV0IGhhc1NlbGVjdG9ycyA9IHRoaXMucGFyc2VTZWxlY3Rvcihjb250ZW50LnRleHQpO1xuICAgICAgaWYgKGhhc1NlbGVjdG9ycyA9PSBudWxsKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBIYXNTZWxlY3RvcihoYXNTZWxlY3RvcnMpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWF0Y2hbMV0gPT0gXCItYWJwLWNvbnRhaW5zXCIgfHwgbWF0Y2hbMV0gPT0gXCJoYXMtdGV4dFwiKSB7XG4gICAgICBzZWxlY3RvcnMucHVzaChuZXcgQ29udGFpbnNTZWxlY3Rvcihjb250ZW50LnRleHQpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWF0Y2hbMV0gPT09IFwieHBhdGhcIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IFhQYXRoU2VsZWN0b3IoY29udGVudC50ZXh0KSk7XG4gICAgICB9XG4gICAgICBjYXRjaCAoe21lc3NhZ2V9KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgICBcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgYHNlbGVjdG9yICR7c2VsZWN0b3J9LCBpbnZhbGlkIGAgK1xuICAgICAgICAgICAgYHhwYXRoOiAke2NvbnRlbnQudGV4dH0gYCArXG4gICAgICAgICAgICBgZXJyb3I6ICR7bWVzc2FnZX0uYFxuICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobWF0Y2hbMV0gPT0gXCJub3RcIikge1xuICAgICAgbGV0IG5vdFNlbGVjdG9ycyA9IHRoaXMucGFyc2VTZWxlY3Rvcihjb250ZW50LnRleHQpO1xuICAgICAgaWYgKG5vdFNlbGVjdG9ycyA9PSBudWxsKVxuICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgLy8gaWYgYWxsIG9mIHRoZSBpbm5lciBzZWxlY3RvcnMgYXJlIFBsYWluU2VsZWN0b3JzLCB0aGVuIHdlXG4gICAgICAvLyBkb24ndCBhY3R1YWxseSBuZWVkIHRvIHVzZSBvdXIgc2VsZWN0b3IgYXQgYWxsLiBXZSdyZSBiZXR0ZXJcbiAgICAgIC8vIG9mZiBkZWxlZ2F0aW5nIHRvIHRoZSBicm93c2VyIDpub3QgaW1wbGVtZW50YXRpb24uXG4gICAgICBpZiAobm90U2VsZWN0b3JzLmV2ZXJ5KHMgPT4gcyBpbnN0YW5jZW9mIFBsYWluU2VsZWN0b3IpKVxuICAgICAgICBzZWxlY3RvcnMucHVzaChuZXcgUGxhaW5TZWxlY3RvcihgOm5vdCgke2NvbnRlbnQudGV4dH0pYCkpO1xuICAgICAgZWxzZVxuICAgICAgICBzZWxlY3RvcnMucHVzaChuZXcgTm90U2VsZWN0b3Iobm90U2VsZWN0b3JzKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvciwgY2FuJ3QgcGFyc2Ugc2VsZWN0b3IuXG4gICAgICBjb25zb2xlLndhcm4obmV3IFN5bnRheEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSwgaW52YWxpZCBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHBzZXVkby1jbGFzcyA6JHttYXRjaFsxXX0oKS5gKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgc3VmZml4ID0gdGhpcy5wYXJzZVNlbGVjdG9yKHNlbGVjdG9yLnN1YnN0cmluZyhjb250ZW50LmVuZCArIDEpKTtcbiAgICBpZiAoc3VmZml4ID09IG51bGwpXG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIHNlbGVjdG9ycy5wdXNoKC4uLnN1ZmZpeCk7XG5cbiAgICBpZiAoc2VsZWN0b3JzLmxlbmd0aCA9PSAxICYmIHNlbGVjdG9yc1swXSBpbnN0YW5jZW9mIENvbnRhaW5zU2VsZWN0b3IpIHtcbiAgICAgIGNvbnNvbGUud2FybihuZXcgU3ludGF4RXJyb3IoXCJGYWlsZWQgdG8gcGFyc2UgQWRibG9jayBQbHVzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNlbGVjdG9yICR7c2VsZWN0b3J9LCBjYW4ndCBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoYXZlIGEgbG9uZWx5IDotYWJwLWNvbnRhaW5zKCkuXCIpKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0b3JzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBydWxlcyBvdXQgb2YgQ1NTIHN0eWxlc2hlZXRzXG4gICAqIEBwYXJhbSB7Q1NTU3R5bGVTaGVldFtdfSBbc3R5bGVzaGVldHNdIFRoZSBsaXN0IG9mIHN0eWxlc2hlZXRzIHRvXG4gICAqIHJlYWQuXG4gICAqIEByZXR1cm4ge0NTU1N0eWxlUnVsZVtdfVxuICAgKi9cbiAgX3JlYWRDc3NSdWxlcyhzdHlsZXNoZWV0cykge1xuICAgIGxldCBjc3NTdHlsZXMgPSBbXTtcblxuICAgIGZvciAobGV0IHN0eWxlc2hlZXQgb2Ygc3R5bGVzaGVldHMgfHwgW10pIHtcbiAgICAgIC8vIEV4cGxpY2l0bHkgaWdub3JlIHRoaXJkLXBhcnR5IHN0eWxlc2hlZXRzIHRvIGVuc3VyZSBjb25zaXN0ZW50IGJlaGF2aW9yXG4gICAgICAvLyBiZXR3ZWVuIEZpcmVmb3ggYW5kIENocm9tZS5cbiAgICAgIGlmICghdGhpcy5pc1NhbWVPcmlnaW4oc3R5bGVzaGVldCkpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBsZXQgcnVsZXM7XG4gICAgICB0cnkge1xuICAgICAgICBydWxlcyA9IHN0eWxlc2hlZXQuY3NzUnVsZXM7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICAvLyBPbiBGaXJlZm94LCB0aGVyZSBpcyBhIGNoYW5jZSB0aGF0IGFuIEludmFsaWRBY2Nlc3NFcnJvclxuICAgICAgICAvLyBnZXQgdGhyb3duIHdoZW4gYWNjZXNzaW5nIGNzc1J1bGVzLiBKdXN0IHNraXAgdGhlIHN0eWxlc2hlZXRcbiAgICAgICAgLy8gaW4gdGhhdCBjYXNlLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9zZWFyY2hmb3gub3JnL21vemlsbGEtY2VudHJhbC9yZXYvZjY1ZDc1MjhlMzRlZjFhNzY2NWI0YTFhN2I3Y2RiMTM4OGZjZDNhYS9sYXlvdXQvc3R5bGUvU3R5bGVTaGVldC5jcHAjNjk5XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJ1bGVzKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgZm9yIChsZXQgcnVsZSBvZiBydWxlcykge1xuICAgICAgICBpZiAocnVsZS50eXBlICE9IHJ1bGUuU1RZTEVfUlVMRSlcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjc3NTdHlsZXMucHVzaChzdHJpbmdpZnlTdHlsZShydWxlKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjc3NTdHlsZXM7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIHRoZSBjdXJyZW50IGRvY3VtZW50IGFuZCBhcHBsaWVzIGFsbCBydWxlcyB0byBpdC5cbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c11cbiAgICogICAgVGhlIGxpc3Qgb2YgbmV3IHN0eWxlc2hlZXRzIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoZSBkb2N1bWVudCBhbmRcbiAgICogICAgbWFkZSByZXByb2Nlc3NpbmcgbmVjZXNzYXJ5LiBUaGlzIHBhcmFtZXRlciBzaG91bGRuJ3QgYmUgcGFzc2VkIGluIGZvclxuICAgKiAgICB0aGUgaW5pdGlhbCBwcm9jZXNzaW5nLCBhbGwgb2YgZG9jdW1lbnQncyBzdHlsZXNoZWV0cyB3aWxsIGJlIGNvbnNpZGVyZWRcbiAgICogICAgdGhlbiBhbmQgYWxsIHJ1bGVzLCBpbmNsdWRpbmcgdGhlIG9uZXMgbm90IGRlcGVuZGVudCBvbiBzdHlsZXMuXG4gICAqIEBwYXJhbSB7TXV0YXRpb25SZWNvcmRbXX0gW211dGF0aW9uc11cbiAgICogICAgVGhlIGxpc3Qgb2YgRE9NIG11dGF0aW9ucyB0aGF0IGhhdmUgYmVlbiBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCBhbmRcbiAgICogICAgbWFkZSByZXByb2Nlc3NpbmcgbmVjZXNzYXJ5LiBUaGlzIHBhcmFtZXRlciBzaG91bGRuJ3QgYmUgcGFzc2VkIGluIGZvclxuICAgKiAgICB0aGUgaW5pdGlhbCBwcm9jZXNzaW5nLCB0aGUgZW50aXJlIGRvY3VtZW50IHdpbGwgYmUgY29uc2lkZXJlZFxuICAgKiAgICB0aGVuIGFuZCBhbGwgcnVsZXMsIGluY2x1ZGluZyB0aGUgb25lcyBub3QgZGVwZW5kZW50IG9uIHRoZSBET00uXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqICAgIEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCBvbmNlIGFsbCBmaWx0ZXJpbmcgaXMgY29tcGxldGVkXG4gICAqL1xuICBhc3luYyBfYWRkU2VsZWN0b3JzKHN0eWxlc2hlZXRzLCBtdXRhdGlvbnMpIHtcbiAgICBpZiAodGVzdEluZm8pXG4gICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuY2xlYXIoKTtcblxuICAgIGxldCBkZWFkbGluZSA9IG5ld0lkbGVEZWFkbGluZSgpO1xuXG4gICAgaWYgKHNob3VsZE9ic2VydmVTdHlsZXModGhpcy5wYXR0ZXJucykpXG4gICAgICB0aGlzLl9yZWZyZXNoUGF0dGVyblN0eWxlcygpO1xuXG4gICAgbGV0IHBhdHRlcm5zVG9DaGVjayA9IGZpbHRlclBhdHRlcm5zKFxuICAgICAgdGhpcy5wYXR0ZXJucywge3N0eWxlc2hlZXRzLCBtdXRhdGlvbnN9XG4gICAgKTtcblxuICAgIGxldCB0YXJnZXRzID0gZXh0cmFjdE11dGF0aW9uVGFyZ2V0cyhtdXRhdGlvbnMpO1xuXG4gICAgbGV0IGVsZW1lbnRzVG9IaWRlID0gW107XG4gICAgbGV0IGVsZW1lbnRGaWx0ZXJzID0gW107XG4gICAgbGV0IGVsZW1lbnRzVG9VbmhpZGUgPSBuZXcgU2V0KHRoaXMuaGlkZGVuRWxlbWVudHMpO1xuXG4gICAgZm9yIChsZXQgcGF0dGVybiBvZiBwYXR0ZXJuc1RvQ2hlY2spIHtcbiAgICAgIGxldCBldmFsdWF0aW9uVGFyZ2V0cyA9IHRhcmdldHM7XG5cbiAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIGFwcGVhcnMgdG8gY29udGFpbiBhbnkgc2libGluZyBjb21iaW5hdG9ycywgd2UgY2FuJ3RcbiAgICAgIC8vIGVhc2lseSBvcHRpbWl6ZSBiYXNlZCBvbiB0aGUgbXV0YXRpb24gdGFyZ2V0cy4gU2luY2UgdGhpcyBpcyBhXG4gICAgICAvLyBzcGVjaWFsIGNhc2UsIHNraXAgdGhlIG9wdGltaXphdGlvbi4gQnkgc2V0dGluZyBpdCB0byBudWxsIGhlcmUgd2VcbiAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBwcm9jZXNzIHRoZSBlbnRpcmUgRE9NLlxuICAgICAgaWYgKHBhdHRlcm4ubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycylcbiAgICAgICAgZXZhbHVhdGlvblRhcmdldHMgPSBudWxsO1xuXG4gICAgICBsZXQgZ2VuZXJhdG9yID0gcGF0dGVybi5ldmFsdWF0ZSh0aGlzLmRvY3VtZW50LCBldmFsdWF0aW9uVGFyZ2V0cyk7XG4gICAgICBmb3IgKGxldCBzZWxlY3RvciBvZiBnZW5lcmF0b3IpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5oaWRkZW5FbGVtZW50cy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgZWxlbWVudHNUb0hpZGUucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgICAgZWxlbWVudEZpbHRlcnMucHVzaChwYXR0ZXJuLnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9VbmhpZGUuZGVsZXRlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWFkbGluZS50aW1lUmVtYWluaW5nKCkgPD0gMClcbiAgICAgICAgICBkZWFkbGluZSA9IGF3YWl0IHlpZWxkVGhyZWFkKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2hpZGVFbGVtcyhlbGVtZW50c1RvSGlkZSwgZWxlbWVudEZpbHRlcnMpO1xuXG4gICAgLy8gVGhlIHNlYXJjaCBmb3IgZWxlbWVudHMgdG8gaGlkZSBpdCBvcHRpbWl6ZWQgdG8gZmluZCBuZXcgdGhpbmdzXG4gICAgLy8gdG8gaGlkZSBxdWlja2x5LCBieSBub3QgY2hlY2tpbmcgYWxsIHBhdHRlcm5zIGFuZCBub3QgY2hlY2tpbmdcbiAgICAvLyB0aGUgZnVsbCBET00uIFRoYXQncyB3aHkgd2UgbmVlZCB0byBkbyBhIG1vcmUgdGhvcm91Z2ggY2hlY2tcbiAgICAvLyBmb3IgZWFjaCByZW1haW5pbmcgZWxlbWVudCB0aGF0IG1pZ2h0IG5lZWQgdG8gYmUgdW5oaWRkZW4sXG4gICAgLy8gY2hlY2tpbmcgYWxsIHBhdHRlcm5zLlxuICAgIGZvciAobGV0IGVsZW0gb2YgZWxlbWVudHNUb1VuaGlkZSkge1xuICAgICAgaWYgKCFlbGVtLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgIC8vIGVsZW1lbnRzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgRE9NIHNob3VsZCBiZSB1bmhpZGRlblxuICAgICAgICAvLyBpbiBjYXNlIHRoZXkncmUgZXZlciByZWFkZGVkLCBhbmQgdGhlbiBmb3Jnb3R0ZW4gYWJvdXQgc29cbiAgICAgICAgLy8gd2UgZG9uJ3QgY2F1c2UgYSBtZW1vcnkgbGVhay5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgbWF0Y2hlc0FueSA9IHRoaXMucGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF0Y2hlcyhcbiAgICAgICAgZWxlbSwgdGhpcy5kb2N1bWVudFxuICAgICAgKSk7XG4gICAgICBpZiAobWF0Y2hlc0FueSlcbiAgICAgICAgZWxlbWVudHNUb1VuaGlkZS5kZWxldGUoZWxlbSk7XG5cbiAgICAgIGlmIChkZWFkbGluZS50aW1lUmVtYWluaW5nKCkgPD0gMClcbiAgICAgICAgZGVhZGxpbmUgPSBhd2FpdCB5aWVsZFRocmVhZCgpO1xuICAgIH1cbiAgICB0aGlzLl91bmhpZGVFbGVtcyhBcnJheS5mcm9tKGVsZW1lbnRzVG9VbmhpZGUpKTtcbiAgfVxuXG4gIF9oaWRlRWxlbXMoZWxlbWVudHNUb0hpZGUsIGVsZW1lbnRGaWx0ZXJzKSB7XG4gICAgaWYgKGVsZW1lbnRzVG9IaWRlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuaGlkZUVsZW1zRnVuYyhlbGVtZW50c1RvSGlkZSwgZWxlbWVudEZpbHRlcnMpO1xuICAgICAgZm9yIChsZXQgZWxlbSBvZiBlbGVtZW50c1RvSGlkZSlcbiAgICAgICAgdGhpcy5oaWRkZW5FbGVtZW50cy5hZGQoZWxlbSk7XG4gICAgfVxuICB9XG5cbiAgX3VuaGlkZUVsZW1zKGVsZW1lbnRzVG9VbmhpZGUpIHtcbiAgICBpZiAoZWxlbWVudHNUb1VuaGlkZS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnVuaGlkZUVsZW1zRnVuYyhlbGVtZW50c1RvVW5oaWRlKTtcbiAgICAgIGZvciAobGV0IGVsZW0gb2YgZWxlbWVudHNUb1VuaGlkZSlcbiAgICAgICAgdGhpcy5oaWRkZW5FbGVtZW50cy5kZWxldGUoZWxlbSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1lZCBhbnkgc2NoZWR1bGVkIHByb2Nlc3NpbmcuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgYXN5bmNyb25vdXMsIGFuZCBzaG91bGQgbm90IGJlIHJ1biBtdWx0aXBsZVxuICAgKiB0aW1lcyBpbiBwYXJhbGxlbC4gVGhlIGZsYWcgYF9maWx0ZXJpbmdJblByb2dyZXNzYCBpcyBzZXQgYW5kXG4gICAqIHVuc2V0IHNvIHlvdSBjYW4gY2hlY2sgaWYgaXQncyBhbHJlYWR5IHJ1bm5pbmcuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqICBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgb25jZSBhbGwgZmlsdGVyaW5nIGlzIGNvbXBsZXRlZFxuICAgKi9cbiAgYXN5bmMgX3Byb2Nlc3NGaWx0ZXJpbmcoKSB7XG4gICAgaWYgKHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIkVsZW1IaWRlRW11bGF0aW9uIHNjaGVkdWxpbmcgZXJyb3I6IFwiICtcbiAgICAgICAgICAgICAgICAgICBcIlRyaWVkIHRvIHByb2Nlc3MgZmlsdGVyaW5nIGluIHBhcmFsbGVsLlwiKTtcbiAgICAgIGlmICh0ZXN0SW5mbykge1xuICAgICAgICB0ZXN0SW5mby5mYWlsZWRBc3NlcnRpb25zLnB1c2goXG4gICAgICAgICAgXCJUcmllZCB0byBwcm9jZXNzIGZpbHRlcmluZyBpbiBwYXJhbGxlbFwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBwYXJhbXMgPSB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nIHx8IHt9O1xuICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSBudWxsO1xuICAgIHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICBhd2FpdCB0aGlzLl9hZGRTZWxlY3RvcnMoXG4gICAgICBwYXJhbXMuc3R5bGVzaGVldHMsXG4gICAgICBwYXJhbXMubXV0YXRpb25zXG4gICAgKTtcbiAgICB0aGlzLl9sYXN0SW52b2NhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZylcbiAgICAgIHRoaXMuX3NjaGVkdWxlTmV4dEZpbHRlcmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgbmV3IGNoYW5nZXMgdG8gdGhlIGxpc3Qgb2YgZmlsdGVycyBmb3IgdGhlIG5leHQgdGltZVxuICAgKiBmaWx0ZXJpbmcgaXMgcnVuLlxuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXVxuICAgKiAgICBuZXcgc3R5bGVzaGVldHMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqIEBwYXJhbSB7TXV0YXRpb25SZWNvcmRbXX0gW211dGF0aW9uc11cbiAgICogICAgbmV3IERPTSBtdXRhdGlvbnMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqL1xuICBfYXBwZW5kU2NoZWR1bGVkUHJvY2Vzc2luZyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKSB7XG4gICAgaWYgKCF0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nKSB7XG4gICAgICAvLyBUaGVyZSBpc24ndCBhbnl0aGluZyBzY2hlZHVsZWQgeWV0LiBNYWtlIHRoZSBzY2hlZHVsZS5cbiAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSB7c3R5bGVzaGVldHMsIG11dGF0aW9uc307XG4gICAgfVxuICAgIGVsc2UgaWYgKCFzdHlsZXNoZWV0cyAmJiAhbXV0YXRpb25zKSB7XG4gICAgICAvLyBUaGUgbmV3IHJlcXVlc3Qgd2FzIHRvIHJlcHJvY2VzcyBldmVyeXRoaW5nLCBhbmQgc28gYW55XG4gICAgICAvLyBwcmV2aW91cyBmaWx0ZXJzIGFyZSBpcnJlbGV2YW50LlxuICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyA9IHt9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzIHx8XG4gICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMpIHtcbiAgICAgIC8vIFRoZSBwcmV2aW91cyBmaWx0ZXJzIGFyZSBub3QgdG8gZmlsdGVyIGV2ZXJ5dGhpbmcsIHNvIHRoZSBuZXdcbiAgICAgIC8vIHBhcmFtZXRlcnMgbWF0dGVyLiBQdXNoIHRoZW0gb250byB0aGUgYXBwcm9wcmlhdGUgbGlzdHMuXG4gICAgICBpZiAoc3R5bGVzaGVldHMpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzKVxuICAgICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3Npbmcuc3R5bGVzaGVldHMgPSBbXTtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cy5wdXNoKC4uLnN0eWxlc2hlZXRzKTtcbiAgICAgIH1cbiAgICAgIGlmIChtdXRhdGlvbnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLm11dGF0aW9ucylcbiAgICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLm11dGF0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLm11dGF0aW9ucy5wdXNoKC4uLm11dGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyBpcyBhbHJlYWR5IGdvaW5nIHRvIHJlY2hlY2tcbiAgICAgIC8vIGV2ZXJ5dGhpbmcsIHNvIG5vIG5lZWQgdG8gZG8gYW55dGhpbmcgaGVyZS5cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGUgZmlsdGVyaW5nIHRvIGJlIHByb2Nlc3NlZCBpbiB0aGUgZnV0dXJlLCBvciBzdGFydFxuICAgKiBwcm9jZXNzaW5nIGltbWVkaWF0ZWx5LlxuICAgKlxuICAgKiBJZiBwcm9jZXNzaW5nIGlzIGFscmVhZHkgc2NoZWR1bGVkLCB0aGlzIGRvZXMgbm90aGluZy5cbiAgICovXG4gIF9zY2hlZHVsZU5leHRGaWx0ZXJpbmcoKSB7XG4gICAgaWYgKHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgfHwgdGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcykge1xuICAgICAgLy8gVGhlIG5leHQgb25lIGhhcyBhbHJlYWR5IGJlZW4gc2NoZWR1bGVkLiBPdXIgbmV3IGV2ZW50cyBhcmVcbiAgICAgIC8vIG9uIHRoZSBxdWV1ZSwgc28gbm90aGluZyBtb3JlIHRvIGRvLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgICAvLyBEb2N1bWVudCBpc24ndCBmdWxseSBsb2FkZWQgeWV0LCBzbyBzY2hlZHVsZSBvdXIgZmlyc3RcbiAgICAgIC8vIGZpbHRlcmluZyBhcyBzb29uIGFzIHRoYXQncyBkb25lLlxuICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBcIkRPTUNvbnRlbnRMb2FkZWRcIixcbiAgICAgICAgKCkgPT4gdGhpcy5fcHJvY2Vzc0ZpbHRlcmluZygpLFxuICAgICAgICB7b25jZTogdHJ1ZX1cbiAgICAgICk7XG4gICAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9sYXN0SW52b2NhdGlvbiA8XG4gICAgICAgICAgICAgbWluSW52b2NhdGlvbkludGVydmFsKSB7XG4gICAgICAvLyBJdCBoYXNuJ3QgYmVlbiBsb25nIGVub3VnaCBzaW5jZSBvdXIgbGFzdCBmaWx0ZXIuIFNldCB0aGVcbiAgICAgIC8vIHRpbWVvdXQgZm9yIHdoZW4gaXQncyB0aW1lIGZvciB0aGF0LlxuICAgICAgc2V0VGltZW91dChcbiAgICAgICAgKCkgPT4gdGhpcy5fcHJvY2Vzc0ZpbHRlcmluZygpLFxuICAgICAgICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgLSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9sYXN0SW52b2NhdGlvbilcbiAgICAgICk7XG4gICAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBXZSBjYW4gYWN0dWFsbHkganVzdCBzdGFydCBmaWx0ZXJpbmcgaW1tZWRpYXRlbHkhXG4gICAgICB0aGlzLl9wcm9jZXNzRmlsdGVyaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlLXJ1biBmaWx0ZXJpbmcgZWl0aGVyIGltbWVkaWF0ZWx5IG9yIHF1ZXVlZC5cbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c11cbiAgICogICAgbmV3IHN0eWxlc2hlZXRzIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKiBAcGFyYW0ge011dGF0aW9uUmVjb3JkW119IFttdXRhdGlvbnNdXG4gICAqICAgIG5ldyBET00gbXV0YXRpb25zIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKi9cbiAgcXVldWVGaWx0ZXJpbmcoc3R5bGVzaGVldHMsIG11dGF0aW9ucykge1xuICAgIHRoaXMuX2FwcGVuZFNjaGVkdWxlZFByb2Nlc3Npbmcoc3R5bGVzaGVldHMsIG11dGF0aW9ucyk7XG4gICAgdGhpcy5fc2NoZWR1bGVOZXh0RmlsdGVyaW5nKCk7XG4gIH1cblxuICBfcmVmcmVzaFBhdHRlcm5TdHlsZXMoc3R5bGVzaGVldCkge1xuICAgIGxldCBhbGxDc3NSdWxlcyA9IHRoaXMuX3JlYWRDc3NSdWxlcyh0aGlzLmRvY3VtZW50LnN0eWxlU2hlZXRzKTtcbiAgICBmb3IgKGxldCBwYXR0ZXJuIG9mIHRoaXMucGF0dGVybnMpXG4gICAgICBwYXR0ZXJuLnNldFN0eWxlcyhhbGxDc3NSdWxlcyk7XG4gIH1cblxuICBvbkxvYWQoZXZlbnQpIHtcbiAgICBsZXQgc3R5bGVzaGVldCA9IGV2ZW50LnRhcmdldC5zaGVldDtcbiAgICBpZiAoc3R5bGVzaGVldClcbiAgICAgIHRoaXMucXVldWVGaWx0ZXJpbmcoW3N0eWxlc2hlZXRdKTtcbiAgfVxuXG4gIG9ic2VydmUobXV0YXRpb25zKSB7XG4gICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAvLyBJbiB0ZXN0IG1vZGUsIGZpbHRlciBvdXQgYW55IG11dGF0aW9ucyBsaWtlbHkgZG9uZSBieSB1c1xuICAgICAgLy8gKGkuZS4gc3R5bGU9XCJkaXNwbGF5OiBub25lICFpbXBvcnRhbnRcIikuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAgICAvLyBvYnNlcnZlIGhvdyB0aGUgY29kZSByZXNwb25kcyB0byBET00gbXV0YXRpb25zLlxuICAgICAgbXV0YXRpb25zID0gbXV0YXRpb25zLmZpbHRlcihcbiAgICAgICAgKHt0eXBlLCBhdHRyaWJ1dGVOYW1lLCB0YXJnZXQ6IHtzdHlsZTogbmV3VmFsdWV9LCBvbGRWYWx1ZX0pID0+XG4gICAgICAgICAgISh0eXBlID09IFwiYXR0cmlidXRlc1wiICYmIGF0dHJpYnV0ZU5hbWUgPT0gXCJzdHlsZVwiICYmXG4gICAgICAgICAgICBuZXdWYWx1ZS5kaXNwbGF5ID09IFwibm9uZVwiICYmXG4gICAgICAgICAgICB0b0NTU1N0eWxlRGVjbGFyYXRpb24ob2xkVmFsdWUpLmRpc3BsYXkgIT0gXCJub25lXCIpXG4gICAgICApO1xuXG4gICAgICBpZiAobXV0YXRpb25zLmxlbmd0aCA9PSAwKVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5xdWV1ZUZpbHRlcmluZyhudWxsLCBtdXRhdGlvbnMpO1xuICB9XG5cbiAgYXBwbHkocGF0dGVybnMpIHtcbiAgICB0aGlzLnBhdHRlcm5zID0gW107XG4gICAgZm9yIChsZXQgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgbGV0IHNlbGVjdG9ycyA9IHRoaXMucGFyc2VTZWxlY3RvcihwYXR0ZXJuLnNlbGVjdG9yKTtcbiAgICAgIGlmIChzZWxlY3RvcnMgIT0gbnVsbCAmJiBzZWxlY3RvcnMubGVuZ3RoID4gMClcbiAgICAgICAgdGhpcy5wYXR0ZXJucy5wdXNoKG5ldyBQYXR0ZXJuKHNlbGVjdG9ycywgcGF0dGVybi50ZXh0KSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGF0dGVybnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5xdWV1ZUZpbHRlcmluZygpO1xuXG4gICAgICBsZXQgYXR0cmlidXRlcyA9IHNob3VsZE9ic2VydmVBdHRyaWJ1dGVzKHRoaXMucGF0dGVybnMpO1xuICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKFxuICAgICAgICB0aGlzLmRvY3VtZW50LFxuICAgICAgICB7XG4gICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICAgICAgYXR0cmlidXRlT2xkVmFsdWU6IGF0dHJpYnV0ZXMgJiYgISF0ZXN0SW5mbyxcbiAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiBzaG91bGRPYnNlcnZlQ2hhcmFjdGVyRGF0YSh0aGlzLnBhdHRlcm5zKSxcbiAgICAgICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBpZiAoc2hvdWxkT2JzZXJ2ZVN0eWxlcyh0aGlzLnBhdHRlcm5zKSkge1xuICAgICAgICBsZXQgb25Mb2FkID0gdGhpcy5vbkxvYWQuYmluZCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpXG4gICAgICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBvbkxvYWQsIHRydWUpO1xuICAgICAgICB0aGlzLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEFkYmxvY2sgUGx1cyA8aHR0cHM6Ly9hZGJsb2NrcGx1cy5vcmcvPixcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBBZGJsb2NrIFBsdXMuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyoqIEBtb2R1bGUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVGhlIG1heGltdW0gbnVtYmVyIG9mIHBhdHRlcm5zIHRoYXRcbiAqIGB7QGxpbmsgbW9kdWxlOnBhdHRlcm5zLmNvbXBpbGVQYXR0ZXJucyBjb21waWxlUGF0dGVybnMoKX1gIHdpbGwgY29tcGlsZVxuICogaW50byByZWd1bGFyIGV4cHJlc3Npb25zLlxuICogQHR5cGUge251bWJlcn1cbiAqL1xuY29uc3QgQ09NUElMRV9QQVRURVJOU19NQVggPSAxMDA7XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gbWF0Y2ggdGhlIGBeYCBzdWZmaXggaW4gYW4gb3RoZXJ3aXNlIGxpdGVyYWxcbiAqIHBhdHRlcm4uXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQgc2VwYXJhdG9yUmVnRXhwID0gL1tcXHgwMC1cXHgyNFxceDI2LVxceDJDXFx4MkZcXHgzQS1cXHg0MFxceDVCLVxceDVFXFx4NjBcXHg3Qi1cXHg3Rl0vO1xuXG5sZXQgZmlsdGVyVG9SZWdFeHAgPVxuLyoqXG4gKiBDb252ZXJ0cyBmaWx0ZXIgdGV4dCBpbnRvIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IGFzIGluIEZpbHRlcigpXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHJlZ3VsYXIgZXhwcmVzc2lvbiByZXByZXNlbnRhdGlvbiBvZiBmaWx0ZXIgdGV4dFxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy5maWx0ZXJUb1JlZ0V4cCA9IGZ1bmN0aW9uIGZpbHRlclRvUmVnRXhwKHRleHQpIHtcbiAgLy8gcmVtb3ZlIG11bHRpcGxlIHdpbGRjYXJkc1xuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXCorL2csIFwiKlwiKTtcblxuICAvLyByZW1vdmUgbGVhZGluZyB3aWxkY2FyZFxuICBpZiAodGV4dFswXSA9PSBcIipcIilcbiAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSk7XG5cbiAgLy8gcmVtb3ZlIHRyYWlsaW5nIHdpbGRjYXJkXG4gIGlmICh0ZXh0W3RleHQubGVuZ3RoIC0gMV0gPT0gXCIqXCIpXG4gICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoIC0gMSk7XG5cbiAgcmV0dXJuIHRleHRcbiAgICAvLyByZW1vdmUgYW5jaG9ycyBmb2xsb3dpbmcgc2VwYXJhdG9yIHBsYWNlaG9sZGVyXG4gICAgLnJlcGxhY2UoL1xcXlxcfCQvLCBcIl5cIilcbiAgICAvLyBlc2NhcGUgc3BlY2lhbCBzeW1ib2xzXG4gICAgLnJlcGxhY2UoL1xcVy9nLCBcIlxcXFwkJlwiKVxuICAgIC8vIHJlcGxhY2Ugd2lsZGNhcmRzIGJ5IC4qXG4gICAgLnJlcGxhY2UoL1xcXFxcXCovZywgXCIuKlwiKVxuICAgIC8vIHByb2Nlc3Mgc2VwYXJhdG9yIHBsYWNlaG9sZGVycyAoYWxsIEFOU0kgY2hhcmFjdGVycyBidXQgYWxwaGFudW1lcmljXG4gICAgLy8gY2hhcmFjdGVycyBhbmQgXyUuLSlcbiAgICAucmVwbGFjZSgvXFxcXFxcXi9nLCBgKD86JHtzZXBhcmF0b3JSZWdFeHAuc291cmNlfXwkKWApXG4gICAgLy8gcHJvY2VzcyBleHRlbmRlZCBhbmNob3IgYXQgZXhwcmVzc2lvbiBzdGFydFxuICAgIC5yZXBsYWNlKC9eXFxcXFxcfFxcXFxcXHwvLCBcIl5bXFxcXHdcXFxcLV0rOlxcXFwvKyg/OlteXFxcXC9dK1xcXFwuKT9cIilcbiAgICAvLyBwcm9jZXNzIGFuY2hvciBhdCBleHByZXNzaW9uIHN0YXJ0XG4gICAgLnJlcGxhY2UoL15cXFxcXFx8LywgXCJeXCIpXG4gICAgLy8gcHJvY2VzcyBhbmNob3IgYXQgZXhwcmVzc2lvbiBlbmRcbiAgICAucmVwbGFjZSgvXFxcXFxcfCQvLCBcIiRcIik7XG59O1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIG1hdGNoIHRoZSBgfHxgIHByZWZpeCBpbiBhbiBvdGhlcndpc2UgbGl0ZXJhbFxuICogcGF0dGVybi5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBleHRlbmRlZEFuY2hvclJlZ0V4cCA9IG5ldyBSZWdFeHAoZmlsdGVyVG9SZWdFeHAoXCJ8fFwiKSArIFwiJFwiKTtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIG1hdGNoaW5nIGEga2V5d29yZCBpbiBhIGZpbHRlci5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBrZXl3b3JkUmVnRXhwID0gL1teYS16MC05JSpdW2EtejAtOSVdezIsfSg/PVteYS16MC05JSpdKS87XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBhbGwga2V5d29yZHMgaW4gYSBmaWx0ZXIuXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQgYWxsS2V5d29yZHNSZWdFeHAgPSBuZXcgUmVnRXhwKGtleXdvcmRSZWdFeHAsIFwiZ1wiKTtcblxuLyoqXG4gKiBBIGBDb21waWxlZFBhdHRlcm5zYCBvYmplY3QgcmVwcmVzZW50cyB0aGUgY29tcGlsZWQgdmVyc2lvbiBvZiBtdWx0aXBsZSBVUkxcbiAqIHJlcXVlc3QgcGF0dGVybnMuIEl0IGlzIHJldHVybmVkIGJ5XG4gKiBge0BsaW5rIG1vZHVsZTpwYXR0ZXJucy5jb21waWxlUGF0dGVybnMgY29tcGlsZVBhdHRlcm5zKCl9YC5cbiAqL1xuY2xhc3MgQ29tcGlsZWRQYXR0ZXJucyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9iamVjdCB3aXRoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb25zIGZvciBjYXNlLXNlbnNpdGl2ZVxuICAgKiBhbmQgY2FzZS1pbnNlbnNpdGl2ZSBtYXRjaGluZyByZXNwZWN0aXZlbHkuXG4gICAqIEBwYXJhbSB7P1JlZ0V4cH0gW2Nhc2VTZW5zaXRpdmVdXG4gICAqIEBwYXJhbSB7P1JlZ0V4cH0gW2Nhc2VJbnNlbnNpdGl2ZV1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNhc2VTZW5zaXRpdmUsIGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgIHRoaXMuX2Nhc2VTZW5zaXRpdmUgPSBjYXNlU2Vuc2l0aXZlO1xuICAgIHRoaXMuX2Nhc2VJbnNlbnNpdGl2ZSA9IGNhc2VJbnNlbnNpdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIHRoZSBnaXZlbiBVUkwgcmVxdWVzdCBtYXRjaGVzIHRoZSBwYXR0ZXJucyB1c2VkIHRvIGNyZWF0ZVxuICAgKiB0aGlzIG9iamVjdC5cbiAgICogQHBhcmFtIHttb2R1bGU6dXJsLlVSTFJlcXVlc3R9IHJlcXVlc3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICB0ZXN0KHJlcXVlc3QpIHtcbiAgICByZXR1cm4gKCh0aGlzLl9jYXNlU2Vuc2l0aXZlICYmXG4gICAgICAgICAgICAgdGhpcy5fY2FzZVNlbnNpdGl2ZS50ZXN0KHJlcXVlc3QuaHJlZikpIHx8XG4gICAgICAgICAgICAodGhpcy5fY2FzZUluc2Vuc2l0aXZlICYmXG4gICAgICAgICAgICAgdGhpcy5fY2FzZUluc2Vuc2l0aXZlLnRlc3QocmVxdWVzdC5sb3dlckNhc2VIcmVmKSkpO1xuICB9XG59XG5cbi8qKlxuICogQ29tcGlsZXMgcGF0dGVybnMgZnJvbSB0aGUgZ2l2ZW4gZmlsdGVycyBpbnRvIGEgc2luZ2xlXG4gKiBge0BsaW5rIG1vZHVsZTpwYXR0ZXJuc35Db21waWxlZFBhdHRlcm5zIENvbXBpbGVkUGF0dGVybnN9YCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHttb2R1bGU6ZmlsdGVyQ2xhc3Nlcy5VUkxGaWx0ZXJ8XG4gKiAgICAgICAgIFNldC48bW9kdWxlOmZpbHRlckNsYXNzZXMuVVJMRmlsdGVyPn0gZmlsdGVyc1xuICogICBUaGUgZmlsdGVycy4gSWYgdGhlIG51bWJlciBvZiBmaWx0ZXJzIGV4Y2VlZHNcbiAqICAgYHtAbGluayBtb2R1bGU6cGF0dGVybnN+Q09NUElMRV9QQVRURVJOU19NQVggQ09NUElMRV9QQVRURVJOU19NQVh9YCwgdGhlXG4gKiAgIGZ1bmN0aW9uIHJldHVybnMgYG51bGxgLlxuICpcbiAqIEByZXR1cm5zIHs/bW9kdWxlOnBhdHRlcm5zfkNvbXBpbGVkUGF0dGVybnN9XG4gKlxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy5jb21waWxlUGF0dGVybnMgPSBmdW5jdGlvbiBjb21waWxlUGF0dGVybnMoZmlsdGVycykge1xuICBsZXQgbGlzdCA9IEFycmF5LmlzQXJyYXkoZmlsdGVycykgPyBmaWx0ZXJzIDogW2ZpbHRlcnNdO1xuXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgZmlsdGVycyBpcyB0b28gbGFyZ2UsIGl0IG1heSBjaG9rZSBlc3BlY2lhbGx5IG9uIGxvdy1lbmRcbiAgLy8gcGxhdGZvcm1zLiBBcyBhIHByZWNhdXRpb24sIHdlIHJlZnVzZSB0byBjb21waWxlLiBJZGVhbGx5IHdlIHdvdWxkIGNoZWNrXG4gIC8vIHRoZSBsZW5ndGggb2YgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBzb3VyY2UgcmF0aGVyIHRoYW4gdGhlIG51bWJlciBvZlxuICAvLyBmaWx0ZXJzLCBidXQgdGhpcyBpcyBmYXIgbW9yZSBzdHJhaWdodGZvcndhcmQgYW5kIHByYWN0aWNhbC5cbiAgaWYgKGxpc3QubGVuZ3RoID4gQ09NUElMRV9QQVRURVJOU19NQVgpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgbGV0IGNhc2VTZW5zaXRpdmUgPSBcIlwiO1xuICBsZXQgY2FzZUluc2Vuc2l0aXZlID0gXCJcIjtcblxuICBmb3IgKGxldCBmaWx0ZXIgb2YgZmlsdGVycykge1xuICAgIGxldCBzb3VyY2UgPSBmaWx0ZXIudXJsUGF0dGVybi5yZWdleHBTb3VyY2U7XG5cbiAgICBpZiAoZmlsdGVyLm1hdGNoQ2FzZSlcbiAgICAgIGNhc2VTZW5zaXRpdmUgKz0gc291cmNlICsgXCJ8XCI7XG4gICAgZWxzZVxuICAgICAgY2FzZUluc2Vuc2l0aXZlICs9IHNvdXJjZSArIFwifFwiO1xuICB9XG5cbiAgbGV0IGNhc2VTZW5zaXRpdmVSZWdFeHAgPSBudWxsO1xuICBsZXQgY2FzZUluc2Vuc2l0aXZlUmVnRXhwID0gbnVsbDtcblxuICB0cnkge1xuICAgIGlmIChjYXNlU2Vuc2l0aXZlKVxuICAgICAgY2FzZVNlbnNpdGl2ZVJlZ0V4cCA9IG5ldyBSZWdFeHAoY2FzZVNlbnNpdGl2ZS5zbGljZSgwLCAtMSkpO1xuXG4gICAgaWYgKGNhc2VJbnNlbnNpdGl2ZSlcbiAgICAgIGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCA9IG5ldyBSZWdFeHAoY2FzZUluc2Vuc2l0aXZlLnNsaWNlKDAsIC0xKSk7XG4gIH1cbiAgY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSXQgaXMgcG9zc2libGUgaW4gdGhlb3J5IGZvciB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIGJlIHRvbyBsYXJnZVxuICAgIC8vIGRlc3BpdGUgQ09NUElMRV9QQVRURVJOU19NQVhcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBuZXcgQ29tcGlsZWRQYXR0ZXJucyhjYXNlU2Vuc2l0aXZlUmVnRXhwLCBjYXNlSW5zZW5zaXRpdmVSZWdFeHApO1xufTtcblxuLyoqXG4gKiBQYXR0ZXJucyBmb3IgbWF0Y2hpbmcgYWdhaW5zdCBVUkxzLlxuICpcbiAqIEludGVybmFsbHksIHRoaXMgbWF5IGJlIGEgUmVnRXhwIG9yIG1hdGNoIGRpcmVjdGx5IGFnYWluc3QgdGhlXG4gKiBwYXR0ZXJuIGZvciBzaW1wbGUgbGl0ZXJhbCBwYXR0ZXJucy5cbiAqL1xuZXhwb3J0cy5QYXR0ZXJuID0gY2xhc3MgUGF0dGVybiB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiBwYXR0ZXJuIHRoYXQgcmVxdWVzdHMgVVJMcyBzaG91bGQgYmVcbiAgICogbWF0Y2hlZCBhZ2FpbnN0IGluIGZpbHRlciB0ZXh0IG5vdGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbH0gbWF0Y2hDYXNlIGB0cnVlYCBpZiBjb21wYXJpc29ucyBtdXN0IGJlIGNhc2VcbiAgICogc2Vuc2l0aXZlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXR0ZXJuLCBtYXRjaENhc2UpIHtcbiAgICB0aGlzLm1hdGNoQ2FzZSA9IG1hdGNoQ2FzZSB8fCBmYWxzZTtcblxuICAgIGlmICghdGhpcy5tYXRjaENhc2UpXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gICAgaWYgKHBhdHRlcm4ubGVuZ3RoID49IDIgJiZcbiAgICAgICAgcGF0dGVyblswXSA9PSBcIi9cIiAmJlxuICAgICAgICBwYXR0ZXJuW3BhdHRlcm4ubGVuZ3RoIC0gMV0gPT0gXCIvXCIpIHtcbiAgICAgIC8vIFRoZSBmaWx0ZXIgaXMgYSByZWd1bGFyIGV4cHJlc3Npb24gLSBjb252ZXJ0IGl0IGltbWVkaWF0ZWx5IHRvXG4gICAgICAvLyBjYXRjaCBzeW50YXggZXJyb3JzXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHJpbmcoMSwgcGF0dGVybi5sZW5ndGggLSAxKTtcbiAgICAgIHRoaXMuX3JlZ2V4cCA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gUGF0dGVybnMgbGlrZSAvZm9vL2Jhci8qIGV4aXN0IHNvIHRoYXQgdGhleSBhcmUgbm90IHRyZWF0ZWQgYXMgcmVndWxhclxuICAgICAgLy8gZXhwcmVzc2lvbnMuIFdlIGRyb3AgYW55IHN1cGVyZmx1b3VzIHdpbGRjYXJkcyBoZXJlIHNvIG91clxuICAgICAgLy8gb3B0aW1pemF0aW9ucyBjYW4ga2ljayBpbi5cbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoL15cXCorLywgXCJcIikucmVwbGFjZSgvXFwqKyQvLCBcIlwiKTtcblxuICAgICAgLy8gTm8gbmVlZCB0byBjb252ZXJ0IHRoaXMgZmlsdGVyIHRvIHJlZ3VsYXIgZXhwcmVzc2lvbiB5ZXQsIGRvIGl0IG9uXG4gICAgICAvLyBkZW1hbmRcbiAgICAgIHRoaXMucGF0dGVybiA9IHBhdHRlcm47XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBwYXR0ZXJuIGlzIGEgc3RyaW5nIG9mIGxpdGVyYWwgY2hhcmFjdGVycyB3aXRoXG4gICAqIG5vIHdpbGRjYXJkcyBvciBhbnkgb3RoZXIgc3BlY2lhbCBjaGFyYWN0ZXJzLlxuICAgKlxuICAgKiBJZiB0aGUgcGF0dGVybiBpcyBwcmVmaXhlZCB3aXRoIGEgYHx8YCBvciBzdWZmaXhlZCB3aXRoIGEgYF5gIGJ1dCBvdGhlcndpc2VcbiAgICogY29udGFpbnMgbm8gc3BlY2lhbCBjaGFyYWN0ZXJzLCBpdCBpcyBzdGlsbCBjb25zaWRlcmVkIHRvIGJlIGEgbGl0ZXJhbFxuICAgKiBwYXR0ZXJuLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTGl0ZXJhbFBhdHRlcm4oKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLnBhdHRlcm4gIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICEvWypefF0vLnRlc3QodGhpcy5wYXR0ZXJuLnJlcGxhY2UoL15cXHx7MSwyfS8sIFwiXCIpLnJlcGxhY2UoL1t8Xl0kLywgXCJcIikpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBiZSB1c2VkIHdoZW4gdGVzdGluZyBhZ2FpbnN0IHRoaXMgcGF0dGVybi5cbiAgICpcbiAgICogbnVsbCBpZiB0aGUgcGF0dGVybiBpcyBtYXRjaGVkIHdpdGhvdXQgdXNpbmcgcmVndWxhciBleHByZXNzaW9ucy5cbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gIGdldCByZWdleHAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl9yZWdleHAgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5fcmVnZXhwID0gdGhpcy5pc0xpdGVyYWxQYXR0ZXJuKCkgP1xuICAgICAgICBudWxsIDogbmV3IFJlZ0V4cChmaWx0ZXJUb1JlZ0V4cCh0aGlzLnBhdHRlcm4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlZ2V4cDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXR0ZXJuIGluIHJlZ3VsYXIgZXhwcmVzc2lvbiBub3RhdGlvbi4gVGhpcyB3aWxsIGhhdmUgYSB2YWx1ZVxuICAgKiBldmVuIGlmIGByZWdleHBgIHJldHVybnMgbnVsbC5cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gIGdldCByZWdleHBTb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZ2V4cCA/IHRoaXMuX3JlZ2V4cC5zb3VyY2UgOiBmaWx0ZXJUb1JlZ0V4cCh0aGlzLnBhdHRlcm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBVUkwgcmVxdWVzdCBtYXRjaGVzIHRoaXMgZmlsdGVyJ3MgcGF0dGVybi5cbiAgICogQHBhcmFtIHttb2R1bGU6dXJsLlVSTFJlcXVlc3R9IHJlcXVlc3QgVGhlIFVSTCByZXF1ZXN0IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gYHRydWVgIGlmIHRoZSBVUkwgcmVxdWVzdCBtYXRjaGVzLlxuICAgKi9cbiAgbWF0Y2hlc0xvY2F0aW9uKHJlcXVlc3QpIHtcbiAgICBsZXQgbG9jYXRpb24gPSB0aGlzLm1hdGNoQ2FzZSA/IHJlcXVlc3QuaHJlZiA6IHJlcXVlc3QubG93ZXJDYXNlSHJlZjtcbiAgICBsZXQgcmVnZXhwID0gdGhpcy5yZWdleHA7XG4gICAgaWYgKHJlZ2V4cClcbiAgICAgIHJldHVybiByZWdleHAudGVzdChsb2NhdGlvbik7XG5cbiAgICBsZXQgcGF0dGVybiA9IHRoaXMucGF0dGVybjtcbiAgICBsZXQgc3RhcnRzV2l0aEFuY2hvciA9IHBhdHRlcm5bMF0gPT0gXCJ8XCI7XG4gICAgbGV0IHN0YXJ0c1dpdGhFeHRlbmRlZEFuY2hvciA9IHN0YXJ0c1dpdGhBbmNob3IgJiYgcGF0dGVyblsxXSA9PSBcInxcIjtcbiAgICBsZXQgZW5kc1dpdGhTZXBhcmF0b3IgPSBwYXR0ZXJuW3BhdHRlcm4ubGVuZ3RoIC0gMV0gPT0gXCJeXCI7XG4gICAgbGV0IGVuZHNXaXRoQW5jaG9yID0gIWVuZHNXaXRoU2VwYXJhdG9yICYmXG4gICAgICAgIHBhdHRlcm5bcGF0dGVybi5sZW5ndGggLSAxXSA9PSBcInxcIjtcblxuICAgIGlmIChzdGFydHNXaXRoRXh0ZW5kZWRBbmNob3IpXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMik7XG4gICAgZWxzZSBpZiAoc3RhcnRzV2l0aEFuY2hvcilcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cigxKTtcblxuICAgIGlmIChlbmRzV2l0aFNlcGFyYXRvciB8fCBlbmRzV2l0aEFuY2hvcilcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnNsaWNlKDAsIC0xKTtcblxuICAgIGxldCBpbmRleCA9IGxvY2F0aW9uLmluZGV4T2YocGF0dGVybik7XG5cbiAgICB3aGlsZSAoaW5kZXggIT0gLTEpIHtcbiAgICAgIC8vIFRoZSBcInx8XCIgcHJlZml4IHJlcXVpcmVzIHRoYXQgdGhlIHRleHQgdGhhdCBmb2xsb3dzIGRvZXMgbm90IHN0YXJ0XG4gICAgICAvLyB3aXRoIGEgZm9yd2FyZCBzbGFzaC5cbiAgICAgIGlmICgoc3RhcnRzV2l0aEV4dGVuZGVkQW5jaG9yID9cbiAgICAgICAgICAgbG9jYXRpb25baW5kZXhdICE9IFwiL1wiICYmXG4gICAgICAgICAgIGV4dGVuZGVkQW5jaG9yUmVnRXhwLnRlc3QobG9jYXRpb24uc3Vic3RyaW5nKDAsIGluZGV4KSkgOlxuICAgICAgICAgICBzdGFydHNXaXRoQW5jaG9yID9cbiAgICAgICAgICAgaW5kZXggPT0gMCA6XG4gICAgICAgICAgIHRydWUpICYmXG4gICAgICAgICAgKGVuZHNXaXRoU2VwYXJhdG9yID9cbiAgICAgICAgICAgIWxvY2F0aW9uW2luZGV4ICsgcGF0dGVybi5sZW5ndGhdIHx8XG4gICAgICAgICAgIHNlcGFyYXRvclJlZ0V4cC50ZXN0KGxvY2F0aW9uW2luZGV4ICsgcGF0dGVybi5sZW5ndGhdKSA6XG4gICAgICAgICAgIGVuZHNXaXRoQW5jaG9yID9cbiAgICAgICAgICAgaW5kZXggPT0gbG9jYXRpb24ubGVuZ3RoIC0gcGF0dGVybi5sZW5ndGggOlxuICAgICAgICAgICB0cnVlKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgIGlmIChwYXR0ZXJuID09IFwiXCIpXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICBpbmRleCA9IGxvY2F0aW9uLmluZGV4T2YocGF0dGVybiwgaW5kZXggKyAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHBhdHRlcm4gaGFzIGtleXdvcmRzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaGFzS2V5d29yZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0dGVybiAmJiBrZXl3b3JkUmVnRXhwLnRlc3QodGhpcy5wYXR0ZXJuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwga2V5d29yZHMgdGhhdCBjb3VsZCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwYXR0ZXJuXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICovXG4gIGtleXdvcmRDYW5kaWRhdGVzKCkge1xuICAgIGlmICghdGhpcy5wYXR0ZXJuKVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHRoaXMucGF0dGVybi50b0xvd2VyQ2FzZSgpLm1hdGNoKGFsbEtleXdvcmRzUmVnRXhwKTtcbiAgfVxufTtcbiIsIi8qIHdlYmV4dGVuc2lvbi1wb2x5ZmlsbCAtIHYwLjguMCAtIFR1ZSBBcHIgMjAgMjAyMSAxMToyNzozOCAqL1xuLyogLSotIE1vZGU6IGluZGVudC10YWJzLW1vZGU6IG5pbDsganMtaW5kZW50LWxldmVsOiAyIC0qLSAqL1xuLyogdmltOiBzZXQgc3RzPTIgc3c9MiBldCB0dz04MDogKi9cbi8qIFRoaXMgU291cmNlIENvZGUgRm9ybSBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtcyBvZiB0aGUgTW96aWxsYSBQdWJsaWNcbiAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcbiAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uICovXG5cInVzZSBzdHJpY3RcIjtcblxuaWYgKHR5cGVvZiBicm93c2VyID09PSBcInVuZGVmaW5lZFwiIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihicm93c2VyKSAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICBjb25zdCBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UgPSBcIlRoZSBtZXNzYWdlIHBvcnQgY2xvc2VkIGJlZm9yZSBhIHJlc3BvbnNlIHdhcyByZWNlaXZlZC5cIjtcbiAgY29uc3QgU0VORF9SRVNQT05TRV9ERVBSRUNBVElPTl9XQVJOSU5HID0gXCJSZXR1cm5pbmcgYSBQcm9taXNlIGlzIHRoZSBwcmVmZXJyZWQgd2F5IHRvIHNlbmQgYSByZXBseSBmcm9tIGFuIG9uTWVzc2FnZS9vbk1lc3NhZ2VFeHRlcm5hbCBsaXN0ZW5lciwgYXMgdGhlIHNlbmRSZXNwb25zZSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgc3BlY3MgKFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL01vemlsbGEvQWRkLW9ucy9XZWJFeHRlbnNpb25zL0FQSS9ydW50aW1lL29uTWVzc2FnZSlcIjtcblxuICAvLyBXcmFwcGluZyB0aGUgYnVsayBvZiB0aGlzIHBvbHlmaWxsIGluIGEgb25lLXRpbWUtdXNlIGZ1bmN0aW9uIGlzIGEgbWlub3JcbiAgLy8gb3B0aW1pemF0aW9uIGZvciBGaXJlZm94LiBTaW5jZSBTcGlkZXJtb25rZXkgZG9lcyBub3QgZnVsbHkgcGFyc2UgdGhlXG4gIC8vIGNvbnRlbnRzIG9mIGEgZnVuY3Rpb24gdW50aWwgdGhlIGZpcnN0IHRpbWUgaXQncyBjYWxsZWQsIGFuZCBzaW5jZSBpdCB3aWxsXG4gIC8vIG5ldmVyIGFjdHVhbGx5IG5lZWQgdG8gYmUgY2FsbGVkLCB0aGlzIGFsbG93cyB0aGUgcG9seWZpbGwgdG8gYmUgaW5jbHVkZWRcbiAgLy8gaW4gRmlyZWZveCBuZWFybHkgZm9yIGZyZWUuXG4gIGNvbnN0IHdyYXBBUElzID0gZXh0ZW5zaW9uQVBJcyA9PiB7XG4gICAgLy8gTk9URTogYXBpTWV0YWRhdGEgaXMgYXNzb2NpYXRlZCB0byB0aGUgY29udGVudCBvZiB0aGUgYXBpLW1ldGFkYXRhLmpzb24gZmlsZVxuICAgIC8vIGF0IGJ1aWxkIHRpbWUgYnkgcmVwbGFjaW5nIHRoZSBmb2xsb3dpbmcgXCJpbmNsdWRlXCIgd2l0aCB0aGUgY29udGVudCBvZiB0aGVcbiAgICAvLyBKU09OIGZpbGUuXG4gICAgY29uc3QgYXBpTWV0YWRhdGEgPSB7XG4gICAgICBcImFsYXJtc1wiOiB7XG4gICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiY2xlYXJBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiYm9va21hcmtzXCI6IHtcbiAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldENoaWxkcmVuXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFJlY2VudFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRTdWJUcmVlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFRyZWVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwibW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlVHJlZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJicm93c2VyQWN0aW9uXCI6IHtcbiAgICAgICAgXCJkaXNhYmxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJlbmFibGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcImdldEJhZGdlQmFja2dyb3VuZENvbG9yXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEJhZGdlVGV4dFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRQb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRUaXRsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJvcGVuUG9wdXBcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNldEJhZGdlVGV4dFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0SWNvblwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRQb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0VGl0bGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJicm93c2luZ0RhdGFcIjoge1xuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVDYWNoZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVDb29raWVzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZURvd25sb2Fkc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVGb3JtRGF0YVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVIaXN0b3J5XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUxvY2FsU3RvcmFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVQYXNzd29yZHNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlUGx1Z2luRGF0YVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiY29tbWFuZHNcIjoge1xuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiY29udGV4dE1lbnVzXCI6IHtcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlQWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiY29va2llc1wiOiB7XG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxDb29raWVTdG9yZXNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiZGV2dG9vbHNcIjoge1xuICAgICAgICBcImluc3BlY3RlZFdpbmRvd1wiOiB7XG4gICAgICAgICAgXCJldmFsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDIsXG4gICAgICAgICAgICBcInNpbmdsZUNhbGxiYWNrQXJnXCI6IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInBhbmVsc1wiOiB7XG4gICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDMsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMyxcbiAgICAgICAgICAgIFwic2luZ2xlQ2FsbGJhY2tBcmdcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJlbGVtZW50c1wiOiB7XG4gICAgICAgICAgICBcImNyZWF0ZVNpZGViYXJQYW5lXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJkb3dubG9hZHNcIjoge1xuICAgICAgICBcImNhbmNlbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkb3dubG9hZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJlcmFzZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRGaWxlSWNvblwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJvcGVuXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJwYXVzZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVGaWxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlc3VtZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2hvd1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImV4dGVuc2lvblwiOiB7XG4gICAgICAgIFwiaXNBbGxvd2VkRmlsZVNjaGVtZUFjY2Vzc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJpc0FsbG93ZWRJbmNvZ25pdG9BY2Nlc3NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImhpc3RvcnlcIjoge1xuICAgICAgICBcImFkZFVybFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWxldGVBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVsZXRlUmFuZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVsZXRlVXJsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFZpc2l0c1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImkxOG5cIjoge1xuICAgICAgICBcImRldGVjdExhbmd1YWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFjY2VwdExhbmd1YWdlc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiaWRlbnRpdHlcIjoge1xuICAgICAgICBcImxhdW5jaFdlYkF1dGhGbG93XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJpZGxlXCI6IHtcbiAgICAgICAgXCJxdWVyeVN0YXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJtYW5hZ2VtZW50XCI6IHtcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImdldFNlbGZcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0RW5hYmxlZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1bmluc3RhbGxTZWxmXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJub3RpZmljYXRpb25zXCI6IHtcbiAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImdldFBlcm1pc3Npb25MZXZlbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInBhZ2VBY3Rpb25cIjoge1xuICAgICAgICBcImdldFBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImhpZGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNldEljb25cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0UG9wdXBcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNldFRpdGxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzaG93XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwicGVybWlzc2lvbnNcIjoge1xuICAgICAgICBcImNvbnRhaW5zXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVxdWVzdFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwicnVudGltZVwiOiB7XG4gICAgICAgIFwiZ2V0QmFja2dyb3VuZFBhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UGxhdGZvcm1JbmZvXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcIm9wZW5PcHRpb25zUGFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZXF1ZXN0VXBkYXRlQ2hlY2tcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwic2VuZE1lc3NhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAzXG4gICAgICAgIH0sXG4gICAgICAgIFwic2VuZE5hdGl2ZU1lc3NhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0VW5pbnN0YWxsVVJMXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJzZXNzaW9uc1wiOiB7XG4gICAgICAgIFwiZ2V0RGV2aWNlc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRSZWNlbnRseUNsb3NlZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZXN0b3JlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJzdG9yYWdlXCI6IHtcbiAgICAgICAgXCJsb2NhbFwiOiB7XG4gICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEJ5dGVzSW5Vc2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJtYW5hZ2VkXCI6IHtcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEJ5dGVzSW5Vc2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJzeW5jXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ0YWJzXCI6IHtcbiAgICAgICAgXCJjYXB0dXJlVmlzaWJsZVRhYlwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGlzY2FyZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkdXBsaWNhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZXhlY3V0ZVNjcmlwdFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Q3VycmVudFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRab29tXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFpvb21TZXR0aW5nc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnb0JhY2tcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ29Gb3J3YXJkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImhpZ2hsaWdodFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJpbnNlcnRDU1NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwibW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZWxvYWRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUNTU1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZW5kTWVzc2FnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDNcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRab29tXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInNldFpvb21TZXR0aW5nc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInRvcFNpdGVzXCI6IHtcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIndlYk5hdmlnYXRpb25cIjoge1xuICAgICAgICBcImdldEFsbEZyYW1lc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRGcmFtZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwid2ViUmVxdWVzdFwiOiB7XG4gICAgICAgIFwiaGFuZGxlckJlaGF2aW9yQ2hhbmdlZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwid2luZG93c1wiOiB7XG4gICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Q3VycmVudFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRMYXN0Rm9jdXNlZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChPYmplY3Qua2V5cyhhcGlNZXRhZGF0YSkubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcGktbWV0YWRhdGEuanNvbiBoYXMgbm90IGJlZW4gaW5jbHVkZWQgaW4gYnJvd3Nlci1wb2x5ZmlsbFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIFdlYWtNYXAgc3ViY2xhc3Mgd2hpY2ggY3JlYXRlcyBhbmQgc3RvcmVzIGEgdmFsdWUgZm9yIGFueSBrZXkgd2hpY2ggZG9lc1xuICAgICAqIG5vdCBleGlzdCB3aGVuIGFjY2Vzc2VkLCBidXQgYmVoYXZlcyBleGFjdGx5IGFzIGFuIG9yZGluYXJ5IFdlYWtNYXBcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjcmVhdGVJdGVtXG4gICAgICogICAgICAgIEEgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBjYWxsZWQgaW4gb3JkZXIgdG8gY3JlYXRlIHRoZSB2YWx1ZSBmb3IgYW55XG4gICAgICogICAgICAgIGtleSB3aGljaCBkb2VzIG5vdCBleGlzdCwgdGhlIGZpcnN0IHRpbWUgaXQgaXMgYWNjZXNzZWQuIFRoZVxuICAgICAqICAgICAgICBmdW5jdGlvbiByZWNlaXZlcywgYXMgaXRzIG9ubHkgYXJndW1lbnQsIHRoZSBrZXkgYmVpbmcgY3JlYXRlZC5cbiAgICAgKi9cbiAgICBjbGFzcyBEZWZhdWx0V2Vha01hcCBleHRlbmRzIFdlYWtNYXAge1xuICAgICAgY29uc3RydWN0b3IoY3JlYXRlSXRlbSwgaXRlbXMgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3VwZXIoaXRlbXMpO1xuICAgICAgICB0aGlzLmNyZWF0ZUl0ZW0gPSBjcmVhdGVJdGVtO1xuICAgICAgfVxuXG4gICAgICBnZXQoa2V5KSB7XG4gICAgICAgIGlmICghdGhpcy5oYXMoa2V5KSkge1xuICAgICAgICAgIHRoaXMuc2V0KGtleSwgdGhpcy5jcmVhdGVJdGVtKGtleSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldChrZXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIG9iamVjdCB3aXRoIGEgYHRoZW5gIG1ldGhvZCwgYW5kIGNhblxuICAgICAqIHRoZXJlZm9yZSBiZSBhc3N1bWVkIHRvIGJlaGF2ZSBhcyBhIFByb21pc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB0aGVuYWJsZS5cbiAgICAgKi9cbiAgICBjb25zdCBpc1RoZW5hYmxlID0gdmFsdWUgPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gXCJmdW5jdGlvblwiO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgZnVuY3Rpb24gd2hpY2gsIHdoZW4gY2FsbGVkLCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0XG4gICAgICogdGhlIGdpdmVuIHByb21pc2UgYmFzZWQgb24gaG93IGl0IGlzIGNhbGxlZDpcbiAgICAgKlxuICAgICAqIC0gSWYsIHdoZW4gY2FsbGVkLCBgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yYCBjb250YWlucyBhIG5vbi1udWxsIG9iamVjdCxcbiAgICAgKiAgIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdpdGggdGhhdCB2YWx1ZS5cbiAgICAgKiAtIElmIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBleGFjdGx5IG9uZSBhcmd1bWVudCwgdGhlIHByb21pc2UgaXNcbiAgICAgKiAgIHJlc29sdmVkIHRvIHRoYXQgdmFsdWUuXG4gICAgICogLSBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZVxuICAgICAqICAgZnVuY3Rpb24ncyBhcmd1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvbWlzZVxuICAgICAqICAgICAgICBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgcmVzb2x1dGlvbiBhbmQgcmVqZWN0aW9uIGZ1bmN0aW9ucyBvZiBhXG4gICAgICogICAgICAgIHByb21pc2UuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZXNvbHZlXG4gICAgICogICAgICAgIFRoZSBwcm9taXNlJ3MgcmVzb2x1dGlvbiBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9taXNlLnJlamVjdFxuICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlamVjdGlvbiBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YWRhdGFcbiAgICAgKiAgICAgICAgTWV0YWRhdGEgYWJvdXQgdGhlIHdyYXBwZWQgbWV0aG9kIHdoaWNoIGhhcyBjcmVhdGVkIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICogICAgICAgIFdoZXRoZXIgb3Igbm90IHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggb25seSB0aGUgZmlyc3RcbiAgICAgKiAgICAgICAgYXJndW1lbnQgb2YgdGhlIGNhbGxiYWNrLCBhbHRlcm5hdGl2ZWx5IGFuIGFycmF5IG9mIGFsbCB0aGVcbiAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gaXMgaW52b2tlZCB3aXRoIG9ubHkgYSBzaW5nbGUgYXJndW1lbnQsIHRoYXQgd2lsbCBiZVxuICAgICAqICAgICAgICByZXNvbHZlZCB0byB0aGUgcHJvbWlzZSwgd2hpbGUgYWxsIGFyZ3VtZW50cyB3aWxsIGJlIHJlc29sdmVkIGFzXG4gICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAgICAgKiAgICAgICAgVGhlIGdlbmVyYXRlZCBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdCBtYWtlQ2FsbGJhY2sgPSAocHJvbWlzZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgIHJldHVybiAoLi4uY2FsbGJhY2tBcmdzKSA9PiB7XG4gICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgcHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnIHx8XG4gICAgICAgICAgICAgICAgICAgKGNhbGxiYWNrQXJncy5sZW5ndGggPD0gMSAmJiBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyAhPT0gZmFsc2UpKSB7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJnc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJncyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IHBsdXJhbGl6ZUFyZ3VtZW50cyA9IChudW1BcmdzKSA9PiBudW1BcmdzID09IDEgPyBcImFyZ3VtZW50XCIgOiBcImFyZ3VtZW50c1wiO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24gZm9yIGEgbWV0aG9kIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1ldGFkYXRhLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKiAgICAgICAgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB3aGljaCBpcyBiZWluZyB3cmFwcGVkLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5taW5BcmdzXG4gICAgICogICAgICAgIFRoZSBtaW5pbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbXVzdCBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBmZXdlciB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5tYXhBcmdzXG4gICAgICogICAgICAgIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIG1vcmUgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9uKG9iamVjdCwgLi4uKil9XG4gICAgICogICAgICAgVGhlIGdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBBc3luY0Z1bmN0aW9uID0gKG5hbWUsIG1ldGFkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gYXN5bmNGdW5jdGlvbldyYXBwZXIodGFyZ2V0LCAuLi5hcmdzKSB7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUaGlzIEFQSSBtZXRob2QgaGFzIGN1cnJlbnRseSBubyBjYWxsYmFjayBvbiBDaHJvbWUsIGJ1dCBpdCByZXR1cm4gYSBwcm9taXNlIG9uIEZpcmVmb3gsXG4gICAgICAgICAgICAvLyBhbmQgc28gdGhlIHBvbHlmaWxsIHdpbGwgdHJ5IHRvIGNhbGwgaXQgd2l0aCBhIGNhbGxiYWNrIGZpcnN0LCBhbmQgaXQgd2lsbCBmYWxsYmFja1xuICAgICAgICAgICAgLy8gdG8gbm90IHBhc3NpbmcgdGhlIGNhbGxiYWNrIGlmIHRoZSBmaXJzdCBjYWxsIGZhaWxzLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7cmVzb2x2ZSwgcmVqZWN0fSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGNiRXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGAke25hbWV9IEFQSSBtZXRob2QgZG9lc24ndCBzZWVtIHRvIHN1cHBvcnQgdGhlIGNhbGxiYWNrIHBhcmFtZXRlciwgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsIGNiRXJyb3IpO1xuXG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcblxuICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIEFQSSBtZXRob2QgbWV0YWRhdGEsIHNvIHRoYXQgdGhlIG5leHQgQVBJIGNhbGxzIHdpbGwgbm90IHRyeSB0b1xuICAgICAgICAgICAgICAvLyB1c2UgdGhlIHVuc3VwcG9ydGVkIGNhbGxiYWNrIGFueW1vcmUuXG4gICAgICAgICAgICAgIG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgIG1ldGFkYXRhLm5vQ2FsbGJhY2sgPSB0cnVlO1xuXG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLm5vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7cmVzb2x2ZSwgcmVqZWN0fSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYW4gZXhpc3RpbmcgbWV0aG9kIG9mIHRoZSB0YXJnZXQgb2JqZWN0LCBzbyB0aGF0IGNhbGxzIHRvIGl0IGFyZVxuICAgICAqIGludGVyY2VwdGVkIGJ5IHRoZSBnaXZlbiB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBmdW5jdGlvbiByZWNlaXZlcyxcbiAgICAgKiBhcyBpdHMgZmlyc3QgYXJndW1lbnQsIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YCBvYmplY3QsIGZvbGxvd2VkIGJ5IGVhY2ggb2ZcbiAgICAgKiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAqICAgICAgICBUaGUgb3JpZ2luYWwgdGFyZ2V0IG9iamVjdCB0aGF0IHRoZSB3cmFwcGVkIG1ldGhvZCBiZWxvbmdzIHRvLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZFxuICAgICAqICAgICAgICBUaGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuIFRoaXMgaXMgdXNlZCBhcyB0aGUgdGFyZ2V0IG9mIHRoZSBQcm94eVxuICAgICAqICAgICAgICBvYmplY3Qgd2hpY2ggaXMgY3JlYXRlZCB0byB3cmFwIHRoZSBtZXRob2QuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gd3JhcHBlclxuICAgICAqICAgICAgICBUaGUgd3JhcHBlciBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgYSBkaXJlY3QgaW52b2NhdGlvblxuICAgICAqICAgICAgICBvZiB0aGUgd3JhcHBlZCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJveHk8ZnVuY3Rpb24+fVxuICAgICAqICAgICAgICBBIFByb3h5IG9iamVjdCBmb3IgdGhlIGdpdmVuIG1ldGhvZCwgd2hpY2ggaW52b2tlcyB0aGUgZ2l2ZW4gd3JhcHBlclxuICAgICAqICAgICAgICBtZXRob2QgaW4gaXRzIHBsYWNlLlxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBNZXRob2QgPSAodGFyZ2V0LCBtZXRob2QsIHdyYXBwZXIpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJveHkobWV0aG9kLCB7XG4gICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgIHJldHVybiB3cmFwcGVyLmNhbGwodGhpc09iaiwgdGFyZ2V0LCAuLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgaGFzT3duUHJvcGVydHkgPSBGdW5jdGlvbi5jYWxsLmJpbmQoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhbiBvYmplY3QgaW4gYSBQcm94eSB3aGljaCBpbnRlcmNlcHRzIGFuZCB3cmFwcyBjZXJ0YWluIG1ldGhvZHNcbiAgICAgKiBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHdyYXBwZXJzYCBhbmQgYG1ldGFkYXRhYCBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAqICAgICAgICBUaGUgdGFyZ2V0IG9iamVjdCB0byB3cmFwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFt3cmFwcGVycyA9IHt9XVxuICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBzcGVjaWFsIGNhc2VzLiBBbnlcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gcHJlc2VudCBpbiB0aGlzIG9iamVjdCB0cmVlIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGVcbiAgICAgKiAgICAgICAgbWV0aG9kIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZS4gVGhlc2VcbiAgICAgKiAgICAgICAgd3JhcHBlciBtZXRob2RzIGFyZSBpbnZva2VkIGFzIGRlc2NyaWJlZCBpbiB7QHNlZSB3cmFwTWV0aG9kfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbbWV0YWRhdGEgPSB7fV1cbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyBtZXRhZGF0YSB1c2VkIHRvIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVcbiAgICAgKiAgICAgICAgUHJvbWlzZS1iYXNlZCB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYXN5bmNocm9ub3VzLiBBbnkgZnVuY3Rpb24gaW5cbiAgICAgKiAgICAgICAgdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlIHdoaWNoIGhhcyBhIGNvcnJlc3BvbmRpbmcgbWV0YWRhdGEgb2JqZWN0XG4gICAgICogICAgICAgIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgbWV0YWRhdGFgIHRyZWUgaXMgcmVwbGFjZWQgd2l0aCBhblxuICAgICAqICAgICAgICBhdXRvbWF0aWNhbGx5LWdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLCBhcyBkZXNjcmliZWQgaW5cbiAgICAgKiAgICAgICAge0BzZWUgd3JhcEFzeW5jRnVuY3Rpb259XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJveHk8b2JqZWN0Pn1cbiAgICAgKi9cbiAgICBjb25zdCB3cmFwT2JqZWN0ID0gKHRhcmdldCwgd3JhcHBlcnMgPSB7fSwgbWV0YWRhdGEgPSB7fSkgPT4ge1xuICAgICAgbGV0IGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIGxldCBoYW5kbGVycyA9IHtcbiAgICAgICAgaGFzKHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0IHx8IHByb3AgaW4gY2FjaGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0KHByb3h5VGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEocHJvcCBpbiB0YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB2YWx1ZSA9IHRhcmdldFtwcm9wXTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBvYmplY3QuIENoZWNrIGlmIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgIC8vIGFueSB3cmFwcGluZy5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3cmFwcGVyc1twcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzcGVjaWFsLWNhc2Ugd3JhcHBlciBmb3IgdGhpcyBtZXRob2QuXG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcnNbcHJvcF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBhc3luYyBtZXRob2QgdGhhdCB3ZSBoYXZlIG1ldGFkYXRhIGZvci4gQ3JlYXRlIGFcbiAgICAgICAgICAgICAgLy8gUHJvbWlzZSB3cmFwcGVyIGZvciBpdC5cbiAgICAgICAgICAgICAgbGV0IHdyYXBwZXIgPSB3cmFwQXN5bmNGdW5jdGlvbihwcm9wLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIHRoYXQgd2UgZG9uJ3Qga25vdyBvciBjYXJlIGFib3V0LiBSZXR1cm4gdGhlXG4gICAgICAgICAgICAgIC8vIG9yaWdpbmFsIG1ldGhvZCwgYm91bmQgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgKGhhc093blByb3BlcnR5KHdyYXBwZXJzLCBwcm9wKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgd2UgbmVlZCB0byBkbyBzb21lIHdyYXBwaW5nIGZvciB0aGUgY2hpbGRyZW5cbiAgICAgICAgICAgIC8vIG9mLiBDcmVhdGUgYSBzdWItb2JqZWN0IHdyYXBwZXIgZm9yIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGNoaWxkXG4gICAgICAgICAgICAvLyBtZXRhZGF0YS5cbiAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBcIipcIikpIHtcbiAgICAgICAgICAgIC8vIFdyYXAgYWxsIHByb3BlcnRpZXMgaW4gKiBuYW1lc3BhY2UuXG4gICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtcIipcIl0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueSB3cmFwcGluZyBmb3IgdGhpcyBwcm9wZXJ0eSxcbiAgICAgICAgICAgIC8vIHNvIGp1c3QgZm9yd2FyZCBhbGwgYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwge1xuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0KHByb3h5VGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wLCBkZXNjKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIGRlc2MpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoY2FjaGUsIHByb3ApO1xuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgLy8gUGVyIGNvbnRyYWN0IG9mIHRoZSBQcm94eSBBUEksIHRoZSBcImdldFwiIHByb3h5IGhhbmRsZXIgbXVzdCByZXR1cm4gdGhlXG4gICAgICAvLyBvcmlnaW5hbCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGlmIHRoYXQgdmFsdWUgaXMgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZFxuICAgICAgLy8gbm9uLWNvbmZpZ3VyYWJsZS4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlXG4gICAgICAvLyBwcm90b3R5cGUgc2V0IHRvIGB0YXJnZXRgIGluc3RlYWQgb2YgdXNpbmcgYHRhcmdldGAgZGlyZWN0bHkuXG4gICAgICAvLyBPdGhlcndpc2Ugd2UgY2Fubm90IHJldHVybiBhIGN1c3RvbSBvYmplY3QgZm9yIEFQSXMgdGhhdFxuICAgICAgLy8gYXJlIGRlY2xhcmVkIHJlYWQtb25seSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSwgc3VjaCBhcyBgY2hyb21lLmRldnRvb2xzYC5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgcHJveHkgaGFuZGxlcnMgdGhlbXNlbHZlcyB3aWxsIHN0aWxsIHVzZSB0aGUgb3JpZ2luYWwgYHRhcmdldGBcbiAgICAgIC8vIGluc3RlYWQgb2YgdGhlIGBwcm94eVRhcmdldGAsIHNvIHRoYXQgdGhlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXJlXG4gICAgICAvLyBkZXJlZmVyZW5jZWQgdmlhIHRoZSBvcmlnaW5hbCB0YXJnZXRzLlxuICAgICAgbGV0IHByb3h5VGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZSh0YXJnZXQpO1xuICAgICAgcmV0dXJuIG5ldyBQcm94eShwcm94eVRhcmdldCwgaGFuZGxlcnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2V0IG9mIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBvYmplY3QsIHdoaWNoIGhhbmRsZXNcbiAgICAgKiB3cmFwcGluZyBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCB0aG9zZSBtZXNzYWdlcyBhcmUgcGFzc2VkLlxuICAgICAqXG4gICAgICogQSBzaW5nbGUgd3JhcHBlciBpcyBjcmVhdGVkIGZvciBlYWNoIGxpc3RlbmVyIGZ1bmN0aW9uLCBhbmQgc3RvcmVkIGluIGFcbiAgICAgKiBtYXAuIFN1YnNlcXVlbnQgY2FsbHMgdG8gYGFkZExpc3RlbmVyYCwgYGhhc0xpc3RlbmVyYCwgb3IgYHJlbW92ZUxpc3RlbmVyYFxuICAgICAqIHJldHJpZXZlIHRoZSBvcmlnaW5hbCB3cmFwcGVyLCBzbyB0aGF0ICBhdHRlbXB0cyB0byByZW1vdmUgYVxuICAgICAqIHByZXZpb3VzbHktYWRkZWQgbGlzdGVuZXIgd29yayBhcyBleHBlY3RlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RGVmYXVsdFdlYWtNYXA8ZnVuY3Rpb24sIGZ1bmN0aW9uPn0gd3JhcHBlck1hcFxuICAgICAqICAgICAgICBBIERlZmF1bHRXZWFrTWFwIG9iamVjdCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgYXBwcm9wcmlhdGUgd3JhcHBlclxuICAgICAqICAgICAgICBmb3IgYSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiB3aGVuIG9uZSBkb2VzIG5vdCBleGlzdCwgYW5kIHJldHJpZXZlXG4gICAgICogICAgICAgIGFuIGV4aXN0aW5nIG9uZSB3aGVuIGl0IGRvZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBFdmVudCA9IHdyYXBwZXJNYXAgPT4gKHtcbiAgICAgIGFkZExpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIsIC4uLmFyZ3MpIHtcbiAgICAgICAgdGFyZ2V0LmFkZExpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSwgLi4uYXJncyk7XG4gICAgICB9LFxuXG4gICAgICBoYXNMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuaGFzTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZUxpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIG9uUmVxdWVzdEZpbmlzaGVkIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgd2lsbCByZXR1cm4gYVxuICAgICAgICogYGdldENvbnRlbnQoKWAgcHJvcGVydHkgd2hpY2ggcmV0dXJucyBhIGBQcm9taXNlYCByYXRoZXIgdGhhbiB1c2luZyBhXG4gICAgICAgKiBjYWxsYmFjayBBUEkuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICAgICAgICogICAgICAgIFRoZSBIQVIgZW50cnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbmV0d29yayByZXF1ZXN0LlxuICAgICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gb25SZXF1ZXN0RmluaXNoZWQocmVxKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRSZXEgPSB3cmFwT2JqZWN0KHJlcSwge30gLyogd3JhcHBlcnMgKi8sIHtcbiAgICAgICAgICBnZXRDb250ZW50OiB7XG4gICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbGlzdGVuZXIod3JhcHBlZFJlcSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gS2VlcCB0cmFjayBpZiB0aGUgZGVwcmVjYXRpb24gd2FybmluZyBoYXMgYmVlbiBsb2dnZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBsZXQgbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nID0gZmFsc2U7XG5cbiAgICBjb25zdCBvbk1lc3NhZ2VXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGEgbWVzc2FnZSBsaXN0ZW5lciBmdW5jdGlvbiBzbyB0aGF0IGl0IG1heSBzZW5kIHJlc3BvbnNlcyBiYXNlZCBvblxuICAgICAgICogaXRzIHJldHVybiB2YWx1ZSwgcmF0aGVyIHRoYW4gYnkgcmV0dXJuaW5nIGEgc2VudGluZWwgdmFsdWUgYW5kIGNhbGxpbmcgYVxuICAgICAgICogY2FsbGJhY2suIElmIHRoZSBsaXN0ZW5lciBmdW5jdGlvbiByZXR1cm5zIGEgUHJvbWlzZSwgdGhlIHJlc3BvbnNlIGlzXG4gICAgICAgKiBzZW50IHdoZW4gdGhlIHByb21pc2UgZWl0aGVyIHJlc29sdmVzIG9yIHJlamVjdHMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHsqfSBtZXNzYWdlXG4gICAgICAgKiAgICAgICAgVGhlIG1lc3NhZ2Ugc2VudCBieSB0aGUgb3RoZXIgZW5kIG9mIHRoZSBjaGFubmVsLlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHNlbmRlclxuICAgICAgICogICAgICAgIERldGFpbHMgYWJvdXQgdGhlIHNlbmRlciBvZiB0aGUgbWVzc2FnZS5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oKil9IHNlbmRSZXNwb25zZVxuICAgICAgICogICAgICAgIEEgY2FsbGJhY2sgd2hpY2gsIHdoZW4gY2FsbGVkIHdpdGggYW4gYXJiaXRyYXJ5IGFyZ3VtZW50LCBzZW5kc1xuICAgICAgICogICAgICAgIHRoYXQgdmFsdWUgYXMgYSByZXNwb25zZS5cbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICogICAgICAgIFRydWUgaWYgdGhlIHdyYXBwZWQgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCB3aGljaCB3aWxsIGxhdGVyXG4gICAgICAgKiAgICAgICAgeWllbGQgYSByZXNwb25zZS4gRmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gb25NZXNzYWdlKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgIGxldCBkaWRDYWxsU2VuZFJlc3BvbnNlID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IHdyYXBwZWRTZW5kUmVzcG9uc2U7XG4gICAgICAgIGxldCBzZW5kUmVzcG9uc2VQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgd3JhcHBlZFNlbmRSZXNwb25zZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoIWxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oU0VORF9SRVNQT05TRV9ERVBSRUNBVElPTl9XQVJOSU5HLCBuZXcgRXJyb3IoKS5zdGFjayk7XG4gICAgICAgICAgICAgIGxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaWRDYWxsU2VuZFJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gbGlzdGVuZXIobWVzc2FnZSwgc2VuZGVyLCB3cmFwcGVkU2VuZFJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgcmVzdWx0ID0gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzUmVzdWx0VGhlbmFibGUgPSByZXN1bHQgIT09IHRydWUgJiYgaXNUaGVuYWJsZShyZXN1bHQpO1xuXG4gICAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciBkaWRuJ3QgcmV0dXJuZWQgdHJ1ZSBvciBhIFByb21pc2UsIG9yIGNhbGxlZFxuICAgICAgICAvLyB3cmFwcGVkU2VuZFJlc3BvbnNlIHN5bmNocm9ub3VzbHksIHdlIGNhbiBleGl0IGVhcmxpZXJcbiAgICAgICAgLy8gYmVjYXVzZSB0aGVyZSB3aWxsIGJlIG5vIHJlc3BvbnNlIHNlbnQgZnJvbSB0aGlzIGxpc3RlbmVyLlxuICAgICAgICBpZiAocmVzdWx0ICE9PSB0cnVlICYmICFpc1Jlc3VsdFRoZW5hYmxlICYmICFkaWRDYWxsU2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQSBzbWFsbCBoZWxwZXIgdG8gc2VuZCB0aGUgbWVzc2FnZSBpZiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgICAvLyBhbmQgYW4gZXJyb3IgaWYgdGhlIHByb21pc2UgcmVqZWN0cyAoYSB3cmFwcGVkIHNlbmRNZXNzYWdlIGhhc1xuICAgICAgICAvLyB0byB0cmFuc2xhdGUgdGhlIG1lc3NhZ2UgaW50byBhIHJlc29sdmVkIHByb21pc2Ugb3IgYSByZWplY3RlZFxuICAgICAgICAvLyBwcm9taXNlKS5cbiAgICAgICAgY29uc3Qgc2VuZFByb21pc2VkUmVzdWx0ID0gKHByb21pc2UpID0+IHtcbiAgICAgICAgICBwcm9taXNlLnRoZW4obXNnID0+IHtcbiAgICAgICAgICAgIC8vIHNlbmQgdGhlIG1lc3NhZ2UgdmFsdWUuXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UobXNnKTtcbiAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAvLyBTZW5kIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXJyb3IgaWYgdGhlIHJlamVjdGVkIHZhbHVlXG4gICAgICAgICAgICAvLyBpcyBhbiBpbnN0YW5jZSBvZiBlcnJvciwgb3IgdGhlIG9iamVjdCBpdHNlbGYgb3RoZXJ3aXNlLlxuICAgICAgICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICAgICAgICBpZiAoZXJyb3IgJiYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgfHxcbiAgICAgICAgICAgICAgICB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gXCJBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgIF9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXzogdHJ1ZSxcbiAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAvLyBQcmludCBhbiBlcnJvciBvbiB0aGUgY29uc29sZSBpZiB1bmFibGUgdG8gc2VuZCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNlbmQgb25NZXNzYWdlIHJlamVjdGVkIHJlcGx5XCIsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgc2VuZCB0aGUgcmVzb2x2ZWQgdmFsdWUgYXMgYVxuICAgICAgICAvLyByZXN1bHQsIG90aGVyd2lzZSB3YWl0IHRoZSBwcm9taXNlIHJlbGF0ZWQgdG8gdGhlIHdyYXBwZWRTZW5kUmVzcG9uc2VcbiAgICAgICAgLy8gY2FsbGJhY2sgdG8gcmVzb2x2ZSBhbmQgc2VuZCBpdCBhcyBhIHJlc3BvbnNlLlxuICAgICAgICBpZiAoaXNSZXN1bHRUaGVuYWJsZSkge1xuICAgICAgICAgIHNlbmRQcm9taXNlZFJlc3VsdChyZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbmRQcm9taXNlZFJlc3VsdChzZW5kUmVzcG9uc2VQcm9taXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldCBDaHJvbWUga25vdyB0aGF0IHRoZSBsaXN0ZW5lciBpcyByZXBseWluZy5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2sgPSAoe3JlamVjdCwgcmVzb2x2ZX0sIHJlcGx5KSA9PiB7XG4gICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAvLyBEZXRlY3Qgd2hlbiBub25lIG9mIHRoZSBsaXN0ZW5lcnMgcmVwbGllZCB0byB0aGUgc2VuZE1lc3NhZ2UgY2FsbCBhbmQgcmVzb2x2ZVxuICAgICAgICAvLyB0aGUgcHJvbWlzZSB0byB1bmRlZmluZWQgYXMgaW4gRmlyZWZveC5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9pc3N1ZXMvMTMwXG4gICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgPT09IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSkge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJlcGx5ICYmIHJlcGx5Ll9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXykge1xuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGludG9cbiAgICAgICAgLy8gYW4gRXJyb3IgaW5zdGFuY2UuXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVwbHkubWVzc2FnZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShyZXBseSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZSA9IChuYW1lLCBtZXRhZGF0YSwgYXBpTmFtZXNwYWNlT2JqLCAuLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPCBtZXRhZGF0YS5taW5BcmdzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA+IG1ldGFkYXRhLm1heEFyZ3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB3cmFwcGVkQ2IgPSB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjay5iaW5kKG51bGwsIHtyZXNvbHZlLCByZWplY3R9KTtcbiAgICAgICAgYXJncy5wdXNoKHdyYXBwZWRDYik7XG4gICAgICAgIGFwaU5hbWVzcGFjZU9iai5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBzdGF0aWNXcmFwcGVycyA9IHtcbiAgICAgIGRldnRvb2xzOiB7XG4gICAgICAgIG5ldHdvcms6IHtcbiAgICAgICAgICBvblJlcXVlc3RGaW5pc2hlZDogd3JhcEV2ZW50KG9uUmVxdWVzdEZpbmlzaGVkV3JhcHBlcnMpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHJ1bnRpbWU6IHtcbiAgICAgICAgb25NZXNzYWdlOiB3cmFwRXZlbnQob25NZXNzYWdlV3JhcHBlcnMpLFxuICAgICAgICBvbk1lc3NhZ2VFeHRlcm5hbDogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgc2VuZE1lc3NhZ2U6IHdyYXBwZWRTZW5kTWVzc2FnZS5iaW5kKG51bGwsIFwic2VuZE1lc3NhZ2VcIiwge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDN9KSxcbiAgICAgIH0sXG4gICAgICB0YWJzOiB7XG4gICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHttaW5BcmdzOiAyLCBtYXhBcmdzOiAzfSksXG4gICAgICB9LFxuICAgIH07XG4gICAgY29uc3Qgc2V0dGluZ01ldGFkYXRhID0ge1xuICAgICAgY2xlYXI6IHttaW5BcmdzOiAxLCBtYXhBcmdzOiAxfSxcbiAgICAgIGdldDoge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDF9LFxuICAgICAgc2V0OiB7bWluQXJnczogMSwgbWF4QXJnczogMX0sXG4gICAgfTtcbiAgICBhcGlNZXRhZGF0YS5wcml2YWN5ID0ge1xuICAgICAgbmV0d29yazoge1wiKlwiOiBzZXR0aW5nTWV0YWRhdGF9LFxuICAgICAgc2VydmljZXM6IHtcIipcIjogc2V0dGluZ01ldGFkYXRhfSxcbiAgICAgIHdlYnNpdGVzOiB7XCIqXCI6IHNldHRpbmdNZXRhZGF0YX0sXG4gICAgfTtcblxuICAgIHJldHVybiB3cmFwT2JqZWN0KGV4dGVuc2lvbkFQSXMsIHN0YXRpY1dyYXBwZXJzLCBhcGlNZXRhZGF0YSk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBjaHJvbWUgIT0gXCJvYmplY3RcIiB8fCAhY2hyb21lIHx8ICFjaHJvbWUucnVudGltZSB8fCAhY2hyb21lLnJ1bnRpbWUuaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHNjcmlwdCBzaG91bGQgb25seSBiZSBsb2FkZWQgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cIik7XG4gIH1cblxuICAvLyBUaGUgYnVpbGQgcHJvY2VzcyBhZGRzIGEgVU1EIHdyYXBwZXIgYXJvdW5kIHRoaXMgZmlsZSwgd2hpY2ggbWFrZXMgdGhlXG4gIC8vIGBtb2R1bGVgIHZhcmlhYmxlIGF2YWlsYWJsZS5cbiAgbW9kdWxlLmV4cG9ydHMgPSB3cmFwQVBJcyhjaHJvbWUpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBicm93c2VyO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcblxuY29uc3QgTUFYX0VSUk9SX1RIUkVTSE9MRCA9IDMwO1xuY29uc3QgTUFYX1FVRVVFRF9FVkVOVFMgPSAyMDtcbmNvbnN0IEVWRU5UX0lOVEVSVkFMX01TID0gMTAwO1xuXG5sZXQgZXJyb3JDb3VudCA9IDA7XG5sZXQgZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwgPSBudWxsO1xubGV0IGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MgPSBmYWxzZTtcbmxldCBldmVudFF1ZXVlID0gW107XG5cbmZ1bmN0aW9uIGlzRXZlbnRUcnVzdGVkKGV2ZW50KSB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZXZlbnQpID09PSBDdXN0b21FdmVudC5wcm90b3R5cGUgJiZcbiAgICAhT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZXZlbnQsIFwiZGV0YWlsXCIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhbGxvd2xpc3REb21haW4oZXZlbnQpIHtcbiAgaWYgKCFpc0V2ZW50VHJ1c3RlZChldmVudCkpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJld2U6YWxsb3dsaXN0LXBhZ2VcIixcbiAgICAgIHRpbWVzdGFtcDogZXZlbnQuZGV0YWlsLnRpbWVzdGFtcCxcbiAgICAgIHNpZ25hdHVyZTogZXZlbnQuZGV0YWlsLnNpZ25hdHVyZVxuICAgIH0pXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NOZXh0RXZlbnQoKSB7XG4gIGlmIChldmVudFByb2Nlc3NpbmdJblByb2dyZXNzKVxuICAgIHJldHVybjtcblxuICB0cnkge1xuICAgIGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIGxldCBldmVudCA9IGV2ZW50UXVldWUuc2hpZnQoKTtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBhbGxvd2xpc3RpbmdSZXN1bHQgPSBhd2FpdCBhbGxvd2xpc3REb21haW4oZXZlbnQpO1xuICAgICAgICBpZiAoYWxsb3dsaXN0aW5nUmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJkb21haW5fYWxsb3dsaXN0aW5nX3N1Y2Nlc3NcIikpO1xuICAgICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRvbWFpbiBhbGxvd2xpc3RpbmcgcmVqZWN0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yQ291bnQrKztcbiAgICAgICAgaWYgKGVycm9yQ291bnQgPj0gTUFYX0VSUk9SX1RIUkVTSE9MRClcbiAgICAgICAgICBzdG9wT25lQ2xpY2tBbGxvd2xpc3RpbmcoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWV2ZW50UXVldWUubGVuZ3RoKVxuICAgICAgc3RvcFByb2Nlc3NpbmdJbnRlcnZhbCgpO1xuICB9XG4gIGZpbmFsbHkge1xuICAgIGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QoZXZlbnQpIHtcbiAgaWYgKGV2ZW50UXVldWUubGVuZ3RoID49IE1BWF9RVUVVRURfRVZFTlRTKVxuICAgIHJldHVybjtcblxuICBldmVudFF1ZXVlLnB1c2goZXZlbnQpO1xuICBzdGFydFByb2Nlc3NpbmdJbnRlcnZhbCgpO1xufVxuXG5mdW5jdGlvbiBzdGFydFByb2Nlc3NpbmdJbnRlcnZhbCgpIHtcbiAgaWYgKCFldmVudFByb2Nlc3NpbmdJbnRlcnZhbCkge1xuICAgIHByb2Nlc3NOZXh0RXZlbnQoKTtcbiAgICBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKHByb2Nlc3NOZXh0RXZlbnQsIEVWRU5UX0lOVEVSVkFMX01TKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdG9wUHJvY2Vzc2luZ0ludGVydmFsKCkge1xuICBjbGVhckludGVydmFsKGV2ZW50UHJvY2Vzc2luZ0ludGVydmFsKTtcbiAgZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcE9uZUNsaWNrQWxsb3dsaXN0aW5nKCkge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZG9tYWluX2FsbG93bGlzdGluZ19yZXF1ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Eb21haW5BbGxvd2xpc3RpbmdSZXF1ZXN0LCB0cnVlKTtcbiAgZXZlbnRRdWV1ZSA9IFtdO1xuICBzdG9wUHJvY2Vzc2luZ0ludGVydmFsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydE9uZUNsaWNrQWxsb3dsaXN0aW5nKCkge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZG9tYWluX2FsbG93bGlzdGluZ19yZXF1ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Eb21haW5BbGxvd2xpc3RpbmdSZXF1ZXN0LCB0cnVlKTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5cbmxldCBjb2xsYXBzZWRTZWxlY3RvcnMgPSBuZXcgU2V0KCk7XG5sZXQgb2JzZXJ2ZXJzID0gbmV3IFdlYWtNYXAoKTtcblxuZnVuY3Rpb24gZ2V0VVJMRnJvbUVsZW1lbnQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJvYmplY3RcIikge1xuICAgIGlmIChlbGVtZW50LmRhdGEpXG4gICAgICByZXR1cm4gZWxlbWVudC5kYXRhO1xuXG4gICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkLmxvY2FsTmFtZSA9PSBcInBhcmFtXCIgJiYgY2hpbGQubmFtZSA9PSBcIm1vdmllXCIgJiYgY2hpbGQudmFsdWUpXG4gICAgICAgIHJldHVybiBuZXcgVVJMKGNoaWxkLnZhbHVlLCBkb2N1bWVudC5iYXNlVVJJKS5ocmVmO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQuY3VycmVudFNyYyB8fCBlbGVtZW50LnNyYztcbn1cblxuZnVuY3Rpb24gZ2V0U2VsZWN0b3JGb3JCbG9ja2VkRWxlbWVudChlbGVtZW50KSB7XG4gIC8vIFNldHRpbmcgdGhlIFwiZGlzcGxheVwiIENTUyBwcm9wZXJ0eSB0byBcIm5vbmVcIiBkb2Vzbid0IGhhdmUgYW55IGVmZmVjdCBvblxuICAvLyA8ZnJhbWU+IGVsZW1lbnRzIChpbiBmcmFtZXNldHMpLiBTbyB3ZSBoYXZlIHRvIGhpZGUgaXQgaW5saW5lIHRocm91Z2hcbiAgLy8gdGhlIFwidmlzaWJpbGl0eVwiIENTUyBwcm9wZXJ0eS5cbiAgaWYgKGVsZW1lbnQubG9jYWxOYW1lID09IFwiZnJhbWVcIilcbiAgICByZXR1cm4gbnVsbDtcblxuICAvLyBJZiB0aGUgPHZpZGVvPiBvciA8YXVkaW8+IGVsZW1lbnQgY29udGFpbnMgYW55IDxzb3VyY2U+IGNoaWxkcmVuLFxuICAvLyB3ZSBjYW5ub3QgYWRkcmVzcyBpdCBpbiBDU1MgYnkgdGhlIHNvdXJjZSBVUkw7IGluIHRoYXQgY2FzZSB3ZVxuICAvLyBkb24ndCBcImNvbGxhcHNlXCIgaXQgdXNpbmcgYSBDU1Mgc2VsZWN0b3IgYnV0IHJhdGhlciBoaWRlIGl0IGRpcmVjdGx5IGJ5XG4gIC8vIHNldHRpbmcgdGhlIHN0eWxlPVwiLi4uXCIgYXR0cmlidXRlLlxuICBpZiAoZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJ2aWRlb1wiIHx8IGVsZW1lbnQubG9jYWxOYW1lID09IFwiYXVkaW9cIikge1xuICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChjaGlsZC5sb2NhbE5hbWUgPT0gXCJzb3VyY2VcIilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgbGV0IHNlbGVjdG9yID0gXCJcIjtcbiAgZm9yIChsZXQgYXR0ciBvZiBbXCJzcmNcIiwgXCJzcmNzZXRcIl0pIHtcbiAgICBsZXQgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgICBpZiAodmFsdWUgJiYgYXR0ciBpbiBlbGVtZW50KVxuICAgICAgc2VsZWN0b3IgKz0gXCJbXCIgKyBhdHRyICsgXCI9XCIgKyBDU1MuZXNjYXBlKHZhbHVlKSArIFwiXVwiO1xuICB9XG5cbiAgcmV0dXJuIHNlbGVjdG9yID8gZWxlbWVudC5sb2NhbE5hbWUgKyBzZWxlY3RvciA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaWRlRWxlbWVudChlbGVtZW50LCBwcm9wZXJ0aWVzKSB7XG4gIGxldCB7c3R5bGV9ID0gZWxlbWVudDtcblxuICBpZiAoIXByb3BlcnRpZXMpIHtcbiAgICBpZiAoZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJmcmFtZVwiKVxuICAgICAgcHJvcGVydGllcyA9IFtbXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCJdXTtcbiAgICBlbHNlXG4gICAgICBwcm9wZXJ0aWVzID0gW1tcImRpc3BsYXlcIiwgXCJub25lXCJdXTtcbiAgfVxuXG4gIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBwcm9wZXJ0aWVzKVxuICAgIHN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuXG4gIGlmIChvYnNlcnZlcnMuaGFzKGVsZW1lbnQpKVxuICAgIG9ic2VydmVycy5nZXQoZWxlbWVudCkuZGlzY29ubmVjdCgpO1xuXG4gIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgcHJvcGVydGllcykge1xuICAgICAgaWYgKHN0eWxlLmdldFByb3BlcnR5VmFsdWUoa2V5KSAhPSB2YWx1ZSB8fFxuICAgICAgICAgIHN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkoa2V5KSAhPSBcImltcG9ydGFudFwiKVxuICAgICAgICBzdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBcImltcG9ydGFudFwiKTtcbiAgICB9XG4gIH0pO1xuICBvYnNlcnZlci5vYnNlcnZlKFxuICAgIGVsZW1lbnQsIHtcbiAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtcInN0eWxlXCJdXG4gICAgfVxuICApO1xuICBvYnNlcnZlcnMuc2V0KGVsZW1lbnQsIG9ic2VydmVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuaGlkZUVsZW1lbnQoZWxlbWVudCkge1xuICBsZXQgb2JzZXJ2ZXIgPSBvYnNlcnZlcnMuZ2V0KGVsZW1lbnQpO1xuICBpZiAob2JzZXJ2ZXIpIHtcbiAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgb2JzZXJ2ZXJzLmRlbGV0ZShlbGVtZW50KTtcbiAgfVxuXG4gIGxldCBwcm9wZXJ0eSA9IGVsZW1lbnQubG9jYWxOYW1lID09IFwiZnJhbWVcIiA/IFwidmlzaWJpbGl0eVwiIDogXCJkaXNwbGF5XCI7XG4gIGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkocHJvcGVydHkpO1xufVxuXG5mdW5jdGlvbiBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCkge1xuICBsZXQgc2VsZWN0b3IgPSBnZXRTZWxlY3RvckZvckJsb2NrZWRFbGVtZW50KGVsZW1lbnQpO1xuICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgaGlkZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb2xsYXBzZWRTZWxlY3RvcnMuaGFzKHNlbGVjdG9yKSkge1xuICAgIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogXCJld2U6aW5qZWN0LWNzc1wiLFxuICAgICAgICBzZWxlY3RvclxuICAgICAgfSlcbiAgICApO1xuICAgIGNvbGxhcHNlZFNlbGVjdG9ycy5hZGQoc2VsZWN0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhpZGVJbkFib3V0QmxhbmtGcmFtZXMoc2VsZWN0b3IsIHVybHMpIHtcbiAgLy8gUmVzb3VyY2VzIChlLmcuIGltYWdlcykgbG9hZGVkIGludG8gYWJvdXQ6YmxhbmsgZnJhbWVzXG4gIC8vIGFyZSAoc29tZXRpbWVzKSBsb2FkZWQgd2l0aCB0aGUgZnJhbWVJZCBvZiB0aGUgbWFpbl9mcmFtZS5cbiAgZm9yIChsZXQgZnJhbWUgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVtzcmM9J2Fib3V0OmJsYW5rJ11cIikpIHtcbiAgICBpZiAoIWZyYW1lLmNvbnRlbnREb2N1bWVudClcbiAgICAgIGNvbnRpbnVlO1xuXG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiBmcmFtZS5jb250ZW50RG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIHtcbiAgICAgIC8vIFVzZSBoaWRlRWxlbWVudCwgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBjb3JyZWN0IGZyYW1lSWRcbiAgICAgIC8vIGZvciB0aGUgXCJld2U6aW5qZWN0LWNzc1wiIG1lc3NhZ2UuXG4gICAgICBpZiAodXJscy5oYXMoZ2V0VVJMRnJvbUVsZW1lbnQoZWxlbWVudCkpKVxuICAgICAgICBoaWRlRWxlbWVudChlbGVtZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0RWxlbWVudENvbGxhcHNpbmcoKSB7XG4gIGxldCBkZWZlcnJlZCA9IG51bGw7XG5cbiAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyKSA9PiB7XG4gICAgaWYgKCFtZXNzYWdlIHx8IG1lc3NhZ2UudHlwZSAhPSBcImV3ZTpjb2xsYXBzZVwiKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgZGVmZXJyZWQgPSBuZXcgTWFwKCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgICAvLyBVbmRlciBzb21lIGNvbmRpdGlvbnMgYSBob3N0aWxlIHNjcmlwdCBjb3VsZCB0cnkgdG8gdHJpZ2dlclxuICAgICAgICAgIC8vIHRoZSBldmVudCBhZ2Fpbi4gU2luY2Ugd2Ugc2V0IGRlZmVycmVkIHRvIGBudWxsYCwgdGhlblxuICAgICAgICAgIC8vIHdlIGFzc3VtZSB0aGF0IHdlIHNob3VsZCBqdXN0IHJldHVybiBpbnN0ZWFkIG9mIHRocm93aW5nXG4gICAgICAgICAgLy8gYSBUeXBlRXJyb3IuXG4gICAgICAgICAgaWYgKCFkZWZlcnJlZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIGZvciAobGV0IFtzZWxlY3RvciwgdXJsc10gb2YgZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgaWYgKHVybHMuaGFzKGdldFVSTEZyb21FbGVtZW50KGVsZW1lbnQpKSlcbiAgICAgICAgICAgICAgICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhpZGVJbkFib3V0QmxhbmtGcmFtZXMoc2VsZWN0b3IsIHVybHMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlZmVycmVkID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB1cmxzID0gZGVmZXJyZWQuZ2V0KG1lc3NhZ2Uuc2VsZWN0b3IpIHx8IG5ldyBTZXQoKTtcbiAgICAgIGRlZmVycmVkLnNldChtZXNzYWdlLnNlbGVjdG9yLCB1cmxzKTtcbiAgICAgIHVybHMuYWRkKG1lc3NhZ2UudXJsKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobWVzc2FnZS5zZWxlY3RvcikpIHtcbiAgICAgICAgaWYgKGdldFVSTEZyb21FbGVtZW50KGVsZW1lbnQpID09IG1lc3NhZ2UudXJsKVxuICAgICAgICAgIGNvbGxhcHNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhtZXNzYWdlLnNlbGVjdG9yLCBuZXcgU2V0KFttZXNzYWdlLnVybF0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRIaWRpbmdUcmFjZXIge1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMpIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IG5ldyBNYXAoc2VsZWN0b3JzKTtcblxuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy50cmFjZSgpLCAxMDAwKTtcbiAgICB9KTtcblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwibG9hZGluZ1wiKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4gdGhpcy50cmFjZSgpKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnRyYWNlKCk7XG4gIH1cblxuICBsb2coZmlsdGVycywgc2VsZWN0b3JzID0gW10pIHtcbiAgICBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICB7dHlwZTogXCJld2U6dHJhY2UtZWxlbS1oaWRlXCIsIGZpbHRlcnMsIHNlbGVjdG9yc31cbiAgICApKTtcbiAgfVxuXG4gIHRyYWNlKCkge1xuICAgIGxldCBmaWx0ZXJzID0gW107XG4gICAgbGV0IHNlbGVjdG9ycyA9IFtdO1xuXG4gICAgZm9yIChsZXQgW3NlbGVjdG9yLCBmaWx0ZXJdIG9mIHRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZGVsZXRlKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGZpbHRlcilcbiAgICAgICAgICBmaWx0ZXJzLnB1c2goZmlsdGVyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdG9ycy5wdXNoKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmlsdGVycy5sZW5ndGggPiAwIHx8IHNlbGVjdG9ycy5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5sb2coZmlsdGVycywgc2VsZWN0b3JzKTtcblxuICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwge2NoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWV9KTtcbiAgfVxufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcblxuY29uc3QgQUxMT1dFRF9ET01BSU5TID0gbmV3IFNldChbXG4gIFwiYWJwY2hpbmEub3JnXCIsXG4gIFwiYWJwaW5kby5ibG9nc3BvdC5jb21cIixcbiAgXCJhYnB2bi5jb21cIixcbiAgXCJhZGJsb2NrLmVlXCIsXG4gIFwiYWRibG9jay5nYXJkYXIubmV0XCIsXG4gIFwiYWRibG9ja3BsdXMubWVcIixcbiAgXCJhZGJsb2NrcGx1cy5vcmdcIixcbiAgXCJjb21tZW50Y2FtYXJjaGUubmV0XCIsXG4gIFwiZHJvaXQtZmluYW5jZXMuY29tbWVudGNhbWFyY2hlLmNvbVwiLFxuICBcImVhc3lsaXN0LnRvXCIsXG4gIFwiZXllby5jb21cIixcbiAgXCJmYW5ib3kuY28ubnpcIixcbiAgXCJmaWx0ZXJsaXN0cy5jb21cIixcbiAgXCJmb3J1bXMubGFuaWsudXNcIixcbiAgXCJnaXRlZS5jb21cIixcbiAgXCJnaXRlZS5pb1wiLFxuICBcImdpdGh1Yi5jb21cIixcbiAgXCJnaXRodWIuaW9cIixcbiAgXCJnaXRsYWIuY29tXCIsXG4gIFwiZ2l0bGFiLmlvXCIsXG4gIFwiZ3VydWQuZWVcIixcbiAgXCJodWdvbGVzY2FyZ290LmNvbVwiLFxuICBcImktZG9udC1jYXJlLWFib3V0LWNvb2tpZXMuZXVcIixcbiAgXCJqb3VybmFsZGVzZmVtbWVzLmZyXCIsXG4gIFwiam91cm5hbGR1bmV0LmNvbVwiLFxuICBcImxpbnRlcm5hdXRlLmNvbVwiLFxuICBcInNwYW00MDQuY29tXCIsXG4gIFwic3RhbmV2Lm9yZ1wiLFxuICBcInZvaWQuZ3JcIixcbiAgXCJ4ZmlsZXMubm9hZHMuaXRcIixcbiAgXCJ6b3NvLnJvXCJcbl0pO1xuXG5mdW5jdGlvbiBpc0RvbWFpbkFsbG93ZWQoZG9tYWluKSB7XG4gIGlmIChkb21haW4uZW5kc1dpdGgoXCIuXCIpKVxuICAgIGRvbWFpbiA9IGRvbWFpbi5zdWJzdHJpbmcoMCwgZG9tYWluLmxlbmd0aCAtIDEpO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgaWYgKEFMTE9XRURfRE9NQUlOUy5oYXMoZG9tYWluKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGxldCBpbmRleCA9IGRvbWFpbi5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgZG9tYWluID0gZG9tYWluLnN1YnN0cihpbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpYmVMaW5rc0VuYWJsZWQodXJsKSB7XG4gIGxldCB7cHJvdG9jb2wsIGhvc3RuYW1lfSA9IG5ldyBVUkwodXJsKTtcbiAgcmV0dXJuIGhvc3RuYW1lID09IFwibG9jYWxob3N0XCIgfHxcbiAgICBwcm90b2NvbCA9PSBcImh0dHBzOlwiICYmIGlzRG9tYWluQWxsb3dlZChob3N0bmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVTdWJzY3JpYmVMaW5rcygpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHtcbiAgICBpZiAoZXZlbnQuYnV0dG9uID09IDIgfHwgIWV2ZW50LmlzVHJ1c3RlZClcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBsaW5rID0gZXZlbnQudGFyZ2V0O1xuICAgIHdoaWxlICghKGxpbmsgaW5zdGFuY2VvZiBIVE1MQW5jaG9yRWxlbWVudCkpIHtcbiAgICAgIGxpbmsgPSBsaW5rLnBhcmVudE5vZGU7XG5cbiAgICAgIGlmICghbGluaylcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBxdWVyeVN0cmluZyA9IG51bGw7XG4gICAgaWYgKGxpbmsucHJvdG9jb2wgPT0gXCJodHRwOlwiIHx8IGxpbmsucHJvdG9jb2wgPT0gXCJodHRwczpcIikge1xuICAgICAgaWYgKGxpbmsuaG9zdCA9PSBcInN1YnNjcmliZS5hZGJsb2NrcGx1cy5vcmdcIiAmJiBsaW5rLnBhdGhuYW1lID09IFwiL1wiKVxuICAgICAgICBxdWVyeVN0cmluZyA9IGxpbmsuc2VhcmNoLnN1YnN0cigxKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBGaXJlZm94IGRvZXNuJ3Qgc2VlbSB0byBwb3B1bGF0ZSB0aGUgXCJzZWFyY2hcIiBwcm9wZXJ0eSBmb3JcbiAgICAgIC8vIGxpbmtzIHdpdGggbm9uLXN0YW5kYXJkIFVSTCBzY2hlbWVzIHNvIHdlIG5lZWQgdG8gZXh0cmFjdCB0aGUgcXVlcnlcbiAgICAgIC8vIHN0cmluZyBtYW51YWxseS5cbiAgICAgIGxldCBtYXRjaCA9IC9eYWJwOlxcLypzdWJzY3JpYmVcXC8qXFw/KC4qKS9pLmV4ZWMobGluay5ocmVmKTtcbiAgICAgIGlmIChtYXRjaClcbiAgICAgICAgcXVlcnlTdHJpbmcgPSBtYXRjaFsxXTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5U3RyaW5nKVxuICAgICAgcmV0dXJuO1xuXG4gICAgbGV0IHRpdGxlID0gbnVsbDtcbiAgICBsZXQgdXJsID0gbnVsbDtcbiAgICBmb3IgKGxldCBwYXJhbSBvZiBxdWVyeVN0cmluZy5zcGxpdChcIiZcIikpIHtcbiAgICAgIGxldCBwYXJ0cyA9IHBhcmFtLnNwbGl0KFwiPVwiLCAyKTtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT0gMiB8fCAhL1xcUy8udGVzdChwYXJ0c1sxXSkpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgc3dpdGNoIChwYXJ0c1swXSkge1xuICAgICAgICBjYXNlIFwidGl0bGVcIjpcbiAgICAgICAgICB0aXRsZSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsb2NhdGlvblwiOlxuICAgICAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdXJsKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCF0aXRsZSlcbiAgICAgIHRpdGxlID0gdXJsO1xuXG4gICAgdGl0bGUgPSB0aXRsZS50cmltKCk7XG4gICAgdXJsID0gdXJsLnRyaW0oKTtcbiAgICBpZiAoIS9eKGh0dHBzP3xmdHApOi8udGVzdCh1cmwpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6IFwiZXdlOnN1YnNjcmliZS1saW5rLWNsaWNrZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsIHVybH0pXG4gICAgKTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sIHRydWUpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmNvbnN0IEVSUk9SX05PX0NPTk5FQ1RJT04gPSBcIkNvdWxkIG5vdCBlc3RhYmxpc2ggY29ubmVjdGlvbi4gXCIgK1xuICAgICAgXCJSZWNlaXZpbmcgZW5kIGRvZXMgbm90IGV4aXN0LlwiO1xuY29uc3QgRVJST1JfQ0xPU0VEX0NPTk5FQ1RJT04gPSBcIkEgbGlzdGVuZXIgaW5kaWNhdGVkIGFuIGFzeW5jaHJvbm91cyBcIiArXG4gICAgICBcInJlc3BvbnNlIGJ5IHJldHVybmluZyB0cnVlLCBidXQgdGhlIG1lc3NhZ2UgY2hhbm5lbCBjbG9zZWQgYmVmb3JlIGEgXCIgK1xuICAgICAgXCJyZXNwb25zZSB3YXMgcmVjZWl2ZWRcIjtcblxuZXhwb3J0IGNvbnN0IEVSUk9SX0RVUExJQ0FURV9GSUxURVJTID0gXCJzdG9yYWdlX2R1cGxpY2F0ZV9maWx0ZXJzXCI7XG5leHBvcnQgY29uc3QgRVJST1JfRklMVEVSX05PVF9GT1VORCA9IFwiZmlsdGVyX25vdF9mb3VuZFwiO1xuZXhwb3J0IGNvbnN0IEVSUk9SX1RPT19NQU5ZX0ZJTFRFUlMgPSBcInRvb19tYW55X2ZpbHRlcnNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKHByb21pc2UpIHtcbiAgcmV0dXJuIHByb21pc2UuY2F0Y2goZXJyb3IgPT4ge1xuICAgIGlmICh0eXBlb2YgZXJyb3IgPT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAoZXJyb3IubWVzc2FnZSA9PSBFUlJPUl9OT19DT05ORUNUSU9OIHx8XG4gICAgICAgICBlcnJvci5tZXNzYWdlID09IEVSUk9SX0NMT1NFRF9DT05ORUNUSU9OKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRocm93IGVycm9yO1xuICB9KTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcblxuaW1wb3J0IHtFbGVtSGlkZUVtdWxhdGlvbn1cbiAgZnJvbSBcImFkYmxvY2twbHVzY29yZS9saWIvY29udGVudC9lbGVtSGlkZUVtdWxhdGlvbi5qc1wiO1xuXG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQge3N0YXJ0RWxlbWVudENvbGxhcHNpbmcsIGhpZGVFbGVtZW50LCB1bmhpZGVFbGVtZW50fVxuICBmcm9tIFwiLi9lbGVtZW50LWNvbGxhcHNpbmcuanNcIjtcbmltcG9ydCB7c3RhcnRPbmVDbGlja0FsbG93bGlzdGluZ30gZnJvbSBcIi4vYWxsb3dsaXN0aW5nLmpzXCI7XG5pbXBvcnQge0VsZW1lbnRIaWRpbmdUcmFjZXJ9IGZyb20gXCIuL2VsZW1lbnQtaGlkaW5nLXRyYWNlci5qc1wiO1xuaW1wb3J0IHtzdWJzY3JpYmVMaW5rc0VuYWJsZWQsIGhhbmRsZVN1YnNjcmliZUxpbmtzfSBmcm9tIFwiLi9zdWJzY3JpYmUtbGlua3MuanNcIjtcblxuYXN5bmMgZnVuY3Rpb24gaW5pdENvbnRlbnRGZWF0dXJlcygpIHtcbiAgaWYgKHN1YnNjcmliZUxpbmtzRW5hYmxlZCh3aW5kb3cubG9jYXRpb24uaHJlZikpXG4gICAgaGFuZGxlU3Vic2NyaWJlTGlua3MoKTtcblxuICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6IFwiZXdlOmNvbnRlbnQtaGVsbG9cIn0pXG4gICk7XG5cbiAgaWYgKCFyZXNwb25zZSlcbiAgICByZXR1cm47XG5cbiAgbGV0IHRyYWNlcjtcbiAgaWYgKHJlc3BvbnNlLnRyYWNlZFNlbGVjdG9ycylcbiAgICB0cmFjZXIgPSBuZXcgRWxlbWVudEhpZGluZ1RyYWNlcihyZXNwb25zZS50cmFjZWRTZWxlY3RvcnMpO1xuXG4gIGlmIChyZXNwb25zZS5lbXVsYXRlZFBhdHRlcm5zLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgZWxlbUhpZGVFbXVsYXRpb24gPSBuZXcgRWxlbUhpZGVFbXVsYXRpb24oKGVsZW1lbnRzLCBmaWx0ZXJzKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxuICAgICAgICBoaWRlRWxlbWVudChlbGVtZW50LCByZXNwb25zZS5jc3NQcm9wZXJ0aWVzKTtcblxuICAgICAgaWYgKHRyYWNlcilcbiAgICAgICAgdHJhY2VyLmxvZyhmaWx0ZXJzKTtcbiAgICB9LCBlbGVtZW50cyA9PiB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxuICAgICAgICB1bmhpZGVFbGVtZW50KGVsZW1lbnQpO1xuICAgIH0pO1xuICAgIGVsZW1IaWRlRW11bGF0aW9uLmFwcGx5KHJlc3BvbnNlLmVtdWxhdGVkUGF0dGVybnMpO1xuICB9XG59XG5cbnN0YXJ0RWxlbWVudENvbGxhcHNpbmcoKTtcbnN0YXJ0T25lQ2xpY2tBbGxvd2xpc3RpbmcoKTtcbmluaXRDb250ZW50RmVhdHVyZXMoKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=