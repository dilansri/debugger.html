const CodeMirror = require("codemirror");

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/htmlmixed/htmlmixed");
require("../lib/codemirror-mozilla.css");
require("codemirror/addon/search/searchcursor");

// Maximum allowed margin (in number of lines) from top or bottom of the editor
// while shifting to a line which was initially out of view.
const MAX_VERTICAL_OFFSET = 3;

class SourceEditor {
  constructor(opts) {
    this.opts = opts;
  }

  appendToLocalElement(node) {
    this.editor = CodeMirror(node, this.opts);
  }

  destroy() {
    // No need to do anything.
  }

  get codeMirror() {
    return this.editor;
  }

  setText(str) {
    this.editor.setValue(str);
  }

  getText() {
    return this.editor.getValue();
  }

  setMode(value) {
    this.editor.setOption("mode", value);
  }

  /**
   * Replaces the current document with a new source document
   */
  replaceDocument(doc) {
    this.editor.swapDoc(doc);
  }

  /**
   * Creates a CodeMirror Document
   * @returns CodeMirror.Doc
   */
  createDocument() {
    return new CodeMirror.Doc("");
  }

  /**
   * Aligns the provided line to either "top", "center" or "bottom" of the
   * editor view with a maximum margin of MAX_VERTICAL_OFFSET lines from top or
   * bottom.
   */
  alignLine(line, align = "top") {
    let cm = this.editor;
    let from = cm.lineAtHeight(0, "page");
    let to = cm.lineAtHeight(cm.getWrapperElement().clientHeight, "page");
    let linesVisible = to - from;
    let halfVisible = Math.round(linesVisible / 2);

    // If the target line is in view, skip the vertical alignment part.
    if (line <= to && line >= from) {
      return;
    }

    // Setting the offset so that the line always falls in the upper half
    // of visible lines (lower half for bottom aligned).
    // MAX_VERTICAL_OFFSET is the maximum allowed value.
    let offset = Math.min(halfVisible, MAX_VERTICAL_OFFSET);

    let topLine = {
      "center": Math.max(line - halfVisible, 0),
      "bottom": Math.max(line - linesVisible + offset, 0),
      "top": Math.max(line - offset, 0)
    }[align || "top"] || offset;

    // Bringing down the topLine to total lines in the editor if exceeding.
    topLine = Math.min(topLine, cm.lineCount());
    this.setFirstVisibleLine(topLine);
  }

  /**
   * Scrolls the view such that the given line number is the first visible line.
   */
  setFirstVisibleLine(line) {
    let { top } = this.editor.charCoords({ line: line, ch: 0 }, "local");
    this.editor.scrollTo(0, top);
  }
}

module.exports = SourceEditor;
