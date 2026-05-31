// src/features/editor/monaco/monacoOptions.ts
//
// Responsibility: Convert settingsStore values → Monaco IEditorOptions.
// Keep ALL Monaco option keys here — never hardcode them in CodeEditor.tsx.
// Adding a new setting = add one line here.

import type * as Monaco from 'monaco-editor';

type Settings = Record<string, any>;

export function buildMonacoOptions(settings: Settings): Monaco.editor.IEditorOptions {
  return {
    // ── Font ───────────────────────────────────────────────────────────
    fontSize:               settings['editor.fontSize']       ?? 14,
    fontFamily:             settings['editor.fontFamily']     ?? "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
    fontWeight:             settings['editor.fontWeight']     ?? 'normal',
    fontLigatures:          settings['editor.fontLigatures']  ?? true,
    letterSpacing:          settings['editor.letterSpacing']  ?? 0,
    lineHeight:             settings['editor.lineHeight']     ?? 0,

    // ── Cursor ─────────────────────────────────────────────────────────
    cursorStyle:                settings['editor.cursorStyle']               ?? 'line',
    cursorBlinking:             settings['editor.cursorBlinking']            ?? 'blink',
    cursorWidth:                settings['editor.cursorWidth']               ?? 2,
    cursorSurroundingLines:     settings['editor.cursorSurroundingLines']    ?? 0,
    cursorSurroundingLinesStyle:settings['editor.cursorSurroundingLinesStyle'] ?? 'default',
    cursorSmoothCaretAnimation: settings['editor.cursorSmoothCaretAnimation'] ?? 'off',
    multiCursorModifier:        settings['editor.multiCursorModifier']       ?? 'alt',
    multiCursorPaste:           settings['editor.multiCursorPaste']          ?? 'spread',

    // ── Display & Typography ───────────────────────────────────────────
    lineNumbers:              settings['editor.lineNumbers']              ?? 'on',
    lineDecorationsWidth:     settings['editor.lineDecorationsWidth']     ?? 10,
    wordWrap:                 settings['editor.wordWrap']                 ?? 'off',
    wordWrapColumn:           settings['editor.wordWrapColumn']           ?? 80,
    wrappingIndent:           settings['editor.wrappingIndent']           ?? 'same',
    wordWrapBreakAfterCharacters: settings['editor.wordWrapBreakAfterCharacters'] ?? ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョ・。',
    renderWhitespace:         settings['editor.renderWhitespace']         ?? 'selection',
    experimentalWhitespaceRendering: settings['editor.experimentalWhitespaceRendering'] ?? 'svg',
    renderControlCharacters:  settings['editor.renderControlCharacters']  ?? true,
    renderLineHighlight:      settings['editor.renderLineHighlight']      ?? 'line',
    renderLineHighlightOnlyWhenFocus: settings['editor.renderLineHighlightOnlyWhenFocus'] ?? false,
    occurrencesHighlight:     settings['editor.occurrencesHighlight']     ?? 'singleFile', 
    selectionHighlight:       settings['editor.selectionHighlight']       ?? true,
    matchBrackets:            settings['editor.matchBrackets']            ?? 'always',
    
    bracketPairColorization: {
      enabled: settings['editor.bracketPairColorization.enabled'] ?? true,
      independentColorPoolPerBracketType: settings['editor.bracketPairColorization.independentColorPoolPerBracketType'] ?? false,
    },
    
    guides: {
      indentation:              settings['editor.guides.indentation']              ?? true,
      highlightActiveIndentation: settings['editor.guides.highlightActiveIndentation'] ?? true,
      bracketPairs:             settings['editor.guides.bracketPairs']             ?? false,
      bracketPairsHorizontal:   settings['editor.guides.bracketPairsHorizontal']   ?? 'active',
    },
    
    rulers:                   parseRulers(settings['editor.rulers']),
    
    padding: {
      top:    settings['editor.padding.top']    ?? 0,
      bottom: settings['editor.padding.bottom'] ?? 0,
    },
    
    ...({
      semanticHighlighting: {
        enabled: settings['editor.semanticHighlighting.enabled'] ?? 'configuredByTheme',
      }
    } as any),
    
    unicodeHighlight: {
      ambiguousCharacters: settings['editor.unicodeHighlight.ambiguousCharacters'] ?? true,
      invisibleCharacters: settings['editor.unicodeHighlight.invisibleCharacters'] ?? true,
      nonBasicASCII:       settings['editor.unicodeHighlight.nonBasicASCII']       ?? 'inUntrustedWorkspace',
      includeComments:     settings['editor.unicodeHighlight.includeComments']     ?? 'inUntrustedWorkspace',
      includeStrings:      settings['editor.unicodeHighlight.includeStrings']      ?? 'true',
    },
    
    showDeprecated: settings['editor.showDeprecated'] ?? true,
    showUnused:     settings['editor.showUnused']     ?? true,

    // ── Folding ────────────────────────────────────────────────────────
    folding:                  settings['editor.folding']                 ?? true,
    foldingStrategy:          settings['editor.foldingStrategy']         ?? 'auto',
    foldingHighlight:         settings['editor.foldingHighlight']        ?? true,
    foldingImportsByDefault:  settings['editor.foldingImportsByDefault'] ?? false,
    foldingMaximumRegions:    settings['editor.foldingMaximumRegions']   ?? 5000,
    showFoldingControls:      settings['editor.showFoldingControls']     ?? 'mouseover',

    // ── Glyph Margin ───────────────────────────────────────────────────
    glyphMargin:              settings['editor.glyphMargin']             ?? true,

    // ── Scrollbar ──────────────────────────────────────────────────────
    scrollbar: {
      vertical:                 'hidden',
      horizontal:               'hidden',
      verticalScrollbarSize:    settings['editor.scrollbar.verticalScrollbarSize']   ?? 10,
      horizontalScrollbarSize:  settings['editor.scrollbar.horizontalScrollbarSize'] ?? 10,
      scrollByPage:             settings['editor.scrollbar.scrollByPage']            ?? false,
      alwaysConsumeMouseWheel:  settings['editor.scrollbar.alwaysConsumeMouseWheel'] ?? true,
      useShadows:               settings['editor.scrollbar.useShadows']              ?? true,
      verticalHasArrows:        settings['editor.scrollbar.verticalHasArrows']       ?? false,
      horizontalHasArrows:      settings['editor.scrollbar.horizontalHasArrows']     ?? false,
      arrowSize:                settings['editor.scrollbar.arrowSize']               ?? 11,
    },
    smoothScrolling:             settings['editor.smoothScrolling']             ?? false,
    fastScrollSensitivity:       settings['editor.fastScrollSensitivity']       ?? 5,
    mouseWheelScrollSensitivity: settings['editor.mouseWheelScrollSensitivity'] ?? 1,
    scrollBeyondLastLine:        settings['editor.scrollBeyondLastLine']        ?? true,
    scrollBeyondLastColumn:      settings['editor.scrollBeyondLastColumn']      ?? 5,
    scrollPredominantAxis:       settings['editor.scrollPredominantAxis']       ?? true,

    // ── Minimap ────────────────────────────────────────────────────────
    minimap: {
      enabled:          settings['editor.minimap.enabled']          ?? false,
      autohide:         settings['editor.minimap.autohide']         ?? false,
      side:             settings['editor.minimap.side']             ?? 'right',
      size:             settings['editor.minimap.size']             ?? 'proportional',
      showSlider:       settings['editor.minimap.showSlider']       ?? 'mouseover',
      renderCharacters: settings['editor.minimap.renderCharacters'] ?? true,
      maxColumn:        settings['editor.minimap.maxColumn']        ?? 120,
      scale:            Number(settings['editor.minimap.scale']     ?? 1),
    },

    // ── Editing & Performance ──────────────────────────────────────────
    autoClosingBrackets:        settings['editor.autoClosingBrackets']        ?? 'languageDefined',
    autoClosingQuotes:          settings['editor.autoClosingQuotes']          ?? 'languageDefined',
    autoClosingDelete:          settings['editor.autoClosingDelete']          ?? 'auto',
    autoClosingOvertype:        settings['editor.autoClosingOvertype']        ?? 'auto',
    autoSurround:               settings['editor.autoSurround']               ?? 'languageDefined',
    dragAndDrop:                settings['editor.dragAndDrop']                ?? true,
    readOnly:                   settings['editor.readOnly']                   ?? false,
    wordSeparators:             settings['editor.wordSeparators']             ?? '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?',
    columnSelection:            settings['editor.columnSelection']            ?? false,
    linkedEditing:              settings['editor.linkedEditing']              ?? false,
    emptySelectionClipboard:    settings['editor.emptySelectionClipboard']    ?? true,
    copyWithSyntaxHighlighting: settings['editor.copyWithSyntaxHighlighting'] ?? true,

    largeFileOptimizations:     settings['editor.largeFileOptimizations']     ?? true,
    maxTokenizationLineLength:  settings['editor.maxTokenizationLineLength']  ?? 20000,
    stopRenderingLineAfter:     settings['editor.stopRenderingLineAfter']     ?? 10000,

    // ── Suggestions & IntelliSense ─────────────────────────────────────
    quickSuggestions:             settings['editor.quickSuggestions']             ?? 'on',
    quickSuggestionsDelay:        settings['editor.quickSuggestionsDelay']        ?? 10,
    acceptSuggestionOnCommitCharacter: settings['editor.acceptSuggestionOnCommitCharacter'] ?? true,
    acceptSuggestionOnEnter:      settings['editor.acceptSuggestionOnEnter']      ?? 'on',
    suggestOnTriggerCharacters:   settings['editor.suggestOnTriggerCharacters']   ?? true,
    suggestSelection:             settings['editor.suggestSelection']             ?? 'first',
    suggestFontSize:              settings['editor.suggestFontSize']              ?? 0,
    suggestLineHeight:            settings['editor.suggestLineHeight']            ?? 0,
    suggestMatchOnWordStartOnly:  settings['editor.suggestMatchOnWordStartOnly']  ?? true,
    wordBasedSuggestions:         settings['editor.wordBasedSuggestions']         ?? 'matchingDocuments',
    wordBasedSuggestionsOnlySameLanguage: settings['editor.wordBasedSuggestionsOnlySameLanguage'] ?? false,
    
    suggest: {
      insertMode:             settings['editor.suggest.insertMode']             ?? 'insert',
      filterGraceful:         settings['editor.suggest.filterGraceful']         ?? true,
      localityBonus:          settings['editor.suggest.localityBonus']          ?? false,
      shareSuggestSelections: settings['editor.suggest.shareSuggestSelections'] ?? false,
      preview:                settings['editor.suggest.preview']                ?? false,
      previewMode:            settings['editor.suggest.previewMode']            ?? 'subwordSmart',
      showIcons:              settings['editor.suggest.showIcons']              ?? true,
      showStatusBar:          settings['editor.suggest.showStatusBar']          ?? false,
      showMethods:            settings['editor.suggest.showMethods']            ?? true,
      showFunctions:          settings['editor.suggest.showFunctions']          ?? true,
      showConstructors:       settings['editor.suggest.showConstructors']       ?? true,
      showFields:             settings['editor.suggest.showFields']             ?? true,
      showVariables:          settings['editor.suggest.showVariables']          ?? true,
      showClasses:            settings['editor.suggest.showClasses']            ?? true,
      showStructs:            settings['editor.suggest.showStructs']            ?? true,
      showInterfaces:         settings['editor.suggest.showInterfaces']         ?? true,
      showModules:            settings['editor.suggest.showModules']            ?? true,
      showProperties:         settings['editor.suggest.showProperties']         ?? true,
      showEvents:             settings['editor.suggest.showEvents']             ?? true,
      showOperators:          settings['editor.suggest.showOperators']          ?? true,
      showUnits:              settings['editor.suggest.showUnits']              ?? true,
      showValues:             settings['editor.suggest.showValues']             ?? true,
      showConstants:          settings['editor.suggest.showConstants']          ?? true,
      showEnums:              settings['editor.suggest.showEnums']              ?? true,
      showEnumMembers:        settings['editor.suggest.showEnumMembers']        ?? true,
      showKeywords:           settings['editor.suggest.showKeywords']           ?? true,
      showWords:              settings['editor.suggest.showWords']              ?? true,
      showColors:             settings['editor.suggest.showColors']             ?? true,
      showFiles:              settings['editor.suggest.showFiles']              ?? true,
      showReferences:         settings['editor.suggest.showReferences']         ?? true,
      showFolders:            settings['editor.suggest.showFolders']            ?? true,
      showTypeParameters:     settings['editor.suggest.showTypeParameters']     ?? true,
      showSnippets:           settings['editor.suggest.showSnippets']           ?? true,
      showUsers:              settings['editor.suggest.showUsers']              ?? true,
      showIssues:             settings['editor.suggest.showIssues']             ?? true,
    },

    snippetSuggestions:           settings['editor.snippetSuggestions']           ?? 'inline',
    tabCompletion:                settings['editor.tabCompletion']                ?? 'off',
    
    parameterHints: {
      enabled: settings['editor.parameterHints.enabled'] ?? true,
      cycle:   settings['editor.parameterHints.cycle']   ?? false,
    },
    
    hover: {
      enabled:     settings['editor.hover.enabled']     ?? true,
      delay:       settings['editor.hover.delay']       ?? 300,
      sticky:      settings['editor.hover.sticky']      ?? true,
      above:       settings['editor.hover.above']       ?? true,
      hidingDelay: settings['editor.hover.hidingDelay'] ?? 300,
    },
    
    inlayHints: {
      enabled:    settings['editor.inlayHints.enabled']    ?? 'on',
      fontSize:   settings['editor.inlayHints.fontSize']   ?? 0,
      fontFamily: settings['editor.inlayHints.fontFamily'] ?? '',
      padding:    settings['editor.inlayHints.padding']    ?? false,
    },
    
    codeLens:           settings['editor.codeLens']           ?? true,
    codeLensFontFamily: settings['editor.codeLensFontFamily'] ?? '',
    codeLensFontSize:   settings['editor.codeLensFontSize']   ?? 0,

    lightbulb: {
      enabled: settings['editor.lightbulb.enabled'] ?? 'onCode',
    },

    // ── Find ───────────────────────────────────────────────────────────
    find: {
      cursorMoveOnType:              settings['editor.find.cursorMoveOnType']              ?? true,
      seedSearchStringFromSelection: settings['editor.find.seedSearchStringFromSelection'] ?? 'always',
      autoFindInSelection:           settings['editor.find.autoFindInSelection']           ?? 'never',
      addExtraSpaceOnTop:            settings['editor.find.addExtraSpaceOnTop']            ?? true,
      loop:                          settings['editor.find.loop']                          ?? true,
    },
    
    // ── Sticky Scroll ──────────────────────────────────────────────────
    stickyScroll: {
      enabled:          settings['editor.stickyScroll.enabled']          ?? false,
      maxLineCount:     settings['editor.stickyScroll.maxLineCount']     ?? 5,
      defaultModel:     settings['editor.stickyScroll.defaultModel']     ?? 'outlineModel',
      scrollWithEditor: settings['editor.stickyScroll.scrollWithEditor'] ?? true,
    },

    // ── Touch & Mobile Optimization (always fixed) ─────────────────────────
    // These are intentionally NOT in settingsSchema — they are required
    // for our custom touch system to function correctly and prevent GPU crash.
    // contextmenu: false,   // We handle context menu via long-press manually
    contextmenu: settings['editor.contextMenuStyle'] === 'native',
    ...({
      disableLayerHinting: true,          // Older Monaco Layer Optimization
      experimentalGpuAcceleration: 'off', // Modern Monaco Layer Optimization
    } as any),
    
    // ── Gutter & Margin Optimization for Mobile ──────────────────────────
    // By default takes 5 , but i did 3
    lineNumbersMinChars: 3, 
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "80, 120" string → [80, 120] for Monaco rulers */
function parseRulers(raw: string | number[]): number[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));
}