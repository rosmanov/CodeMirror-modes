/**
* @file bbcode.js
* @brief BBCode mode for CodeMirror<http://codemirror.net/>
* @author Ruslan Osmanov <rrosmanov@gmail.com>
* @version 1.0
* @date 12.10.2013
*/

CodeMirror.defineMode("bbcode", function(config) {
  var settings, reTags, reUnaryTags, reTagsWithVal, reLink, openTags = [], m;

  settings = {
    bbCodeTags: "b i u s img quote code list table  tr td",
    bbCodeUnaryTags: "* :-) hr cut",
    bbCodeTagsWithVal: "size color url",
    bbCodeErrors: true
  };

  if (config.hasOwnProperty("bbCodeTags")) {
    settings.bbCodeTags = config.bbCodeTags;
  }
  if (config.hasOwnProperty("bbCodeUnaryTags")) {
    settings.bbCodeUnaryTags = config.bbCodeUnaryTags;
  }
  if (config.hasOwnProperty("bbCodeTagsWithVal")) {
    settings.bbCodeTagsWithVal = config.bbCodeTagsWithVal;
  }
  if (config.hasOwnProperty("bbCodeErrors")) {
    settings.bbCodeErrors = config.bbCodeErrors;
  }
  if (settings.bbCodeTagsWithVal) {
    settings.bbCodeTags += " " + settings.bbCodeTagsWithVal;
  }

  function escapeRegEx(s) {
    return s.replace(/([\:\-\)\(\*\+\?\[\]])/g, '\\$1');
  }

  reTags = new RegExp("^\\[(\\/)?(" + escapeRegEx(settings.bbCodeTags).split(" ").join("|") + ")\\]");
  reUnaryTags = new RegExp("^\\[(" + escapeRegEx(settings.bbCodeUnaryTags).split(" ").join("|") + ")\\]");
  reTagsWithVal = new RegExp("^\\[(" + escapeRegEx(settings.bbCodeTagsWithVal).split(" ").join("|") + ")(?:[^\\]]*)\\]");
  reLink = /^(?:https?|s?ftp)\:\/\/[^\s\[\]]+/;

  var tokenizer = function (stream) {
    if (stream.eatSpace()) return null;

    if (stream.match('[', false)) {
      stream.eatWhile(/[^\[]/);

      if (m = stream.match(reTags, true)) {
        if (settings.bbCodeErrors) {
          if (m[1] == '/') {
            if (openTags.length && openTags[openTags.length - 1] != m[2]) {
              return "error";
            }
            openTags.pop(m[2]);
          } else {
            openTags.push(m[2]);
          }
        }
        return "keyword";
      }

      if (m = stream.match(reUnaryTags, true)) {
        return "atom";
      }

      if (m = stream.match(reTagsWithVal, true)) {
        if (settings.bbCodeErrors) {
          openTags.push(m[1]);
        }
        return "keyword";
      }
    } else if (stream.match(reLink, true)) {
      return "link";
    }

    stream.next();
    return null;
  };

  return {
    startState: function() {
      return {
        tokenize: tokenizer,
        mode: "bbcode"
      };
    },
    copyState: function(state) {
      return {
        tokenize: state.tokenize,
        mode: state.mode
      };
    },
    token: function(stream, state) {
      return tokenizer(stream, state);
    }
  };
});

CodeMirror.defineMIME("text/x-bbcode", "bbcode");
// vim: et ts=2 sts=2 sw=2
