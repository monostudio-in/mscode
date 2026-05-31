
import { asPromise } from '../../../base/common/async.js';
import '../../../base/common/errors.js';
import { MutableDisposable, DisposableStore } from '../../../base/common/lifecycle.js';
import '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { MarshalledId } from '../../../base/common/marshallingIds.js';
import { URI } from '../../../base/common/uri.js';
import { CommentThreadCollapsibleState, CommentThreadState as CommentThreadState$1, CommentThreadApplicability as CommentThreadApplicability$1 } from '../../../editor/common/languages.js';
import { ExtensionIdentifierMap } from '../../../platform/extensions/common/extensions.js';
import { Range, MarkdownString as MarkdownString$1, pathOrURIToURI } from './extHostTypeConverters.js';
import { CommentThreadFocus, CommentThreadCollapsibleState as CommentThreadCollapsibleState$1, CommentThreadState, CommentThreadApplicability } from './extHostTypes.js';
import { MainContext } from './extHost.protocol.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { MarkdownString } from './extHostTypes/markdownString.js';

function createExtHostComments(mainContext, commands, documents) {
    const proxy = ( mainContext.getProxy(MainContext.MainThreadComments));
    class ExtHostCommentsImpl {
        static {
            this.handlePool = 0;
        }
        constructor() {
            this._commentControllers = ( new Map());
            this._commentControllersByExtension = ( new ExtensionIdentifierMap());
            commands.registerArgumentProcessor({
                processArgument: arg => {
                    if (arg && arg.$mid === MarshalledId.CommentController) {
                        const commentController = this._commentControllers.get(arg.handle);
                        if (!commentController) {
                            return arg;
                        }
                        return commentController.value;
                    } else if (arg && arg.$mid === MarshalledId.CommentThread) {
                        const marshalledCommentThread = arg;
                        const commentController = this._commentControllers.get(marshalledCommentThread.commentControlHandle);
                        if (!commentController) {
                            return marshalledCommentThread;
                        }
                        const commentThread = commentController.getCommentThread(marshalledCommentThread.commentThreadHandle);
                        if (!commentThread) {
                            return marshalledCommentThread;
                        }
                        return commentThread.value;
                    } else if (arg && (arg.$mid === MarshalledId.CommentThreadReply || arg.$mid === MarshalledId.CommentThreadInstance)) {
                        const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
                        if (!commentController) {
                            return arg;
                        }
                        const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                        if (!commentThread) {
                            return arg;
                        }
                        if (arg.$mid === MarshalledId.CommentThreadInstance) {
                            return commentThread.value;
                        }
                        return {
                            thread: commentThread.value,
                            text: arg.text
                        };
                    } else if (arg && arg.$mid === MarshalledId.CommentNode) {
                        const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
                        if (!commentController) {
                            return arg;
                        }
                        const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                        if (!commentThread) {
                            return arg;
                        }
                        const commentUniqueId = arg.commentUniqueId;
                        const comment = commentThread.getCommentByUniqueId(commentUniqueId);
                        if (!comment) {
                            return arg;
                        }
                        return comment;
                    } else if (arg && arg.$mid === MarshalledId.CommentThreadNode) {
                        const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
                        if (!commentController) {
                            return arg;
                        }
                        const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                        if (!commentThread) {
                            return arg;
                        }
                        const body = arg.text;
                        const commentUniqueId = arg.commentUniqueId;
                        const comment = commentThread.getCommentByUniqueId(commentUniqueId);
                        if (!comment) {
                            return arg;
                        }
                        if (typeof comment.body === "string") {
                            comment.body = body;
                        } else {
                            comment.body = new MarkdownString(body);
                        }
                        return comment;
                    }
                    return arg;
                }
            });
        }
        createCommentController(extension, id, label) {
            const handle = ExtHostCommentsImpl.handlePool++;
            const commentController = ( new ExtHostCommentController(extension, handle, id, label));
            this._commentControllers.set(commentController.handle, commentController);
            const commentControllers = this._commentControllersByExtension.get(extension.identifier) || [];
            commentControllers.push(commentController);
            this._commentControllersByExtension.set(extension.identifier, commentControllers);
            return commentController.value;
        }
        async $createCommentThreadTemplate(commentControllerHandle, uriComponents, range, editorId) {
            const commentController = this._commentControllers.get(commentControllerHandle);
            if (!commentController) {
                return;
            }
            commentController.$createCommentThreadTemplate(uriComponents, range, editorId);
        }
        async $setActiveComment(controllerHandle, commentInfo) {
            const commentController = this._commentControllers.get(controllerHandle);
            if (!commentController) {
                return;
            }
            commentController.$setActiveComment(commentInfo ?? undefined);
        }
        async $updateCommentThreadTemplate(commentControllerHandle, threadHandle, range) {
            const commentController = this._commentControllers.get(commentControllerHandle);
            if (!commentController) {
                return;
            }
            commentController.$updateCommentThreadTemplate(threadHandle, range);
        }
        $deleteCommentThread(commentControllerHandle, commentThreadHandle) {
            const commentController = this._commentControllers.get(commentControllerHandle);
            commentController?.$deleteCommentThread(commentThreadHandle);
        }
        async $updateCommentThread(commentControllerHandle, commentThreadHandle, changes) {
            const commentController = this._commentControllers.get(commentControllerHandle);
            commentController?.$updateCommentThread(commentThreadHandle, changes);
        }
        async $provideCommentingRanges(commentControllerHandle, uriComponents, token) {
            const commentController = this._commentControllers.get(commentControllerHandle);
            if (!commentController || !commentController.commentingRangeProvider) {
                return Promise.resolve(undefined);
            }
            const document = await documents.ensureDocumentData(URI.revive(uriComponents));
            return asPromise(async () => {
                const rangesResult = await commentController.commentingRangeProvider?.provideCommentingRanges(document.document, token);
                let ranges;
                if (Array.isArray(rangesResult)) {
                    ranges = {
                        ranges: rangesResult,
                        fileComments: false
                    };
                } else if (rangesResult) {
                    ranges = {
                        ranges: rangesResult.ranges || [],
                        fileComments: rangesResult.enableFileComments || false
                    };
                } else {
                    ranges = rangesResult ?? undefined;
                }
                return ranges;
            }).then(ranges => {
                let convertedResult = undefined;
                if (ranges) {
                    convertedResult = {
                        ranges: ( ranges.ranges.map(x => Range.from(x))),
                        fileComments: ranges.fileComments
                    };
                }
                return convertedResult;
            });
        }
        $toggleReaction(commentControllerHandle, threadHandle, uri, comment, reaction) {
            const commentController = this._commentControllers.get(commentControllerHandle);
            if (!commentController || !commentController.reactionHandler) {
                return Promise.resolve(undefined);
            }
            return asPromise(() => {
                const commentThread = commentController.getCommentThread(threadHandle);
                if (commentThread) {
                    const vscodeComment = commentThread.getCommentByUniqueId(comment.uniqueIdInThread);
                    if (commentController !== undefined && vscodeComment) {
                        if (commentController.reactionHandler) {
                            return commentController.reactionHandler(vscodeComment, convertFromReaction(reaction));
                        }
                    }
                }
                return Promise.resolve(undefined);
            });
        }
    }
    class ExtHostCommentThread {
        static {
            this._handlePool = 0;
        }
        set threadId(id) {
            this._id = id;
        }
        get threadId() {
            return this._id;
        }
        get id() {
            return this._id;
        }
        get resource() {
            return this._uri;
        }
        get uri() {
            return this._uri;
        }
        set range(range) {
            if (((range === undefined) !== (this._range === undefined)) || (!range || !this._range || !range.isEqual(this._range))) {
                this._range = range;
                this.modifications.range = range;
                this._onDidUpdateCommentThread.fire();
            }
        }
        get range() {
            return this._range;
        }
        set canReply(state) {
            if (this._canReply !== state) {
                this._canReply = state;
                this.modifications.canReply = state;
                this._onDidUpdateCommentThread.fire();
            }
        }
        get canReply() {
            return this._canReply;
        }
        get label() {
            return this._label;
        }
        set label(label) {
            this._label = label;
            this.modifications.label = label;
            this._onDidUpdateCommentThread.fire();
        }
        get contextValue() {
            return this._contextValue;
        }
        set contextValue(context) {
            this._contextValue = context;
            this.modifications.contextValue = context;
            this._onDidUpdateCommentThread.fire();
        }
        get comments() {
            return this._comments;
        }
        set comments(newComments) {
            this._comments = newComments;
            this.modifications.comments = newComments;
            this._onDidUpdateCommentThread.fire();
        }
        get collapsibleState() {
            return this._collapseState;
        }
        set collapsibleState(newState) {
            if (this._collapseState === newState) {
                return;
            }
            this._collapseState = newState;
            this.modifications.collapsibleState = newState;
            this._onDidUpdateCommentThread.fire();
        }
        get state() {
            return this._state;
        }
        set state(newState) {
            this._state = newState;
            if (typeof newState === "object") {
                checkProposedApiEnabled(this.extensionDescription, "commentThreadApplicability");
                this.modifications.state = newState.resolved;
                this.modifications.applicability = newState.applicability;
            } else {
                this.modifications.state = newState;
            }
            this._onDidUpdateCommentThread.fire();
        }
        get isDisposed() {
            return this._isDiposed;
        }
        constructor(
            commentControllerId,
            _commentControllerHandle,
            _id,
            _uri,
            _range,
            _comments,
            extensionDescription,
            _isTemplate,
            editorId
        ) {
            this._commentControllerHandle = _commentControllerHandle;
            this._id = _id;
            this._uri = _uri;
            this._range = _range;
            this._comments = _comments;
            this.extensionDescription = extensionDescription;
            this._isTemplate = _isTemplate;
            this.handle = ExtHostCommentThread._handlePool++;
            this.commentHandle = 0;
            this.modifications = Object.create(null);
            this._onDidUpdateCommentThread = ( new Emitter());
            this.onDidUpdateCommentThread = this._onDidUpdateCommentThread.event;
            this._canReply = true;
            this._commentsMap = ( new Map());
            this._acceptInputDisposables = ( new MutableDisposable());
            this._acceptInputDisposables.value = ( new DisposableStore());
            if (this._id === undefined) {
                this._id = `${commentControllerId}.${this.handle}`;
            }
            proxy.$createCommentThread(
                _commentControllerHandle,
                this.handle,
                this._id,
                this._uri,
                Range.from(this._range),
                ( this._comments.map(
                    cmt => convertToDTOComment(this, cmt, this._commentsMap, this.extensionDescription)
                )),
                extensionDescription.identifier,
                this._isTemplate,
                editorId
            );
            this._localDisposables = [];
            this._isDiposed = false;
            this._localDisposables.push(this.onDidUpdateCommentThread(() => {
                this.eventuallyUpdateCommentThread();
            }));
            this._localDisposables.push({
                dispose: () => {
                    proxy.$deleteCommentThread(_commentControllerHandle, this.handle);
                }
            });
            const that = this;
            this.value = {
                get uri() {
                    return that.uri;
                },
                get range() {
                    return that.range;
                },
                set range(value) {
                    that.range = value;
                },
                get comments() {
                    return that.comments;
                },
                set comments(value) {
                    that.comments = value;
                },
                get collapsibleState() {
                    return that.collapsibleState;
                },
                set collapsibleState(value) {
                    that.collapsibleState = value;
                },
                get canReply() {
                    return that.canReply;
                },
                set canReply(state) {
                    that.canReply = state;
                },
                get contextValue() {
                    return that.contextValue;
                },
                set contextValue(value) {
                    that.contextValue = value;
                },
                get label() {
                    return that.label;
                },
                set label(value) {
                    that.label = value;
                },
                get state() {
                    return that.state;
                },
                set state(value) {
                    that.state = value;
                },
                reveal: (comment, options) => that.reveal(comment, options),
                hide: () => that.hide(),
                dispose: () => {
                    that.dispose();
                }
            };
        }
        updateIsTemplate() {
            if (this._isTemplate) {
                this._isTemplate = false;
                this.modifications.isTemplate = false;
            }
        }
        eventuallyUpdateCommentThread() {
            if (this._isDiposed) {
                return;
            }
            this.updateIsTemplate();
            if (!this._acceptInputDisposables.value) {
                this._acceptInputDisposables.value = ( new DisposableStore());
            }
            const modified = value => Object.prototype.hasOwnProperty.call(this.modifications, value);
            const formattedModifications = {};
            if (modified("range")) {
                formattedModifications.range = Range.from(this._range);
            }
            if (modified("label")) {
                formattedModifications.label = this.label;
            }
            if (modified("contextValue")) {
                formattedModifications.contextValue = this.contextValue ?? null;
            }
            if (modified("comments")) {
                formattedModifications.comments = ( this._comments.map(
                    cmt => convertToDTOComment(this, cmt, this._commentsMap, this.extensionDescription)
                ));
            }
            if (modified("collapsibleState")) {
                formattedModifications.collapseState = convertToCollapsibleState(this._collapseState);
            }
            if (modified("canReply")) {
                formattedModifications.canReply = this.canReply;
            }
            if (modified("state")) {
                formattedModifications.state = convertToState(this._state);
            }
            if (modified("applicability")) {
                formattedModifications.applicability = convertToRelevance(this._state);
            }
            if (modified("isTemplate")) {
                formattedModifications.isTemplate = this._isTemplate;
            }
            this.modifications = {};
            proxy.$updateCommentThread(
                this._commentControllerHandle,
                this.handle,
                this._id,
                this._uri,
                formattedModifications
            );
        }
        getCommentByUniqueId(uniqueId) {
            for (const key of this._commentsMap) {
                const comment = key[0];
                const id = key[1];
                if (uniqueId === id) {
                    return comment;
                }
            }
            return;
        }
        async reveal(commentOrOptions, options) {
            checkProposedApiEnabled(this.extensionDescription, "commentReveal");
            let comment;
            if (commentOrOptions && commentOrOptions.body !== undefined) {
                comment = commentOrOptions;
            } else {
                options = options ?? commentOrOptions;
            }
            let commentToReveal = comment ? this._commentsMap.get(comment) : undefined;
            commentToReveal ??= this._commentsMap.get(this._comments[0]);
            let preserveFocus = true;
            let focusReply = false;
            if (options?.focus === CommentThreadFocus.Reply) {
                focusReply = true;
                preserveFocus = false;
            } else if (options?.focus === CommentThreadFocus.Comment) {
                preserveFocus = false;
            }
            return proxy.$revealCommentThread(this._commentControllerHandle, this.handle, commentToReveal, {
                preserveFocus,
                focusReply
            });
        }
        async hide() {
            return proxy.$hideCommentThread(this._commentControllerHandle, this.handle);
        }
        dispose() {
            this._isDiposed = true;
            this._acceptInputDisposables.dispose();
            this._onDidUpdateCommentThread.dispose();
            this._localDisposables.forEach(disposable => disposable.dispose());
        }
    }
    class ExtHostCommentController {
        get id() {
            return this._id;
        }
        get label() {
            return this._label;
        }
        get handle() {
            return this._handle;
        }
        get commentingRangeProvider() {
            return this._commentingRangeProvider;
        }
        set commentingRangeProvider(provider) {
            this._commentingRangeProvider = provider;
            if (provider?.resourceHints) {
                checkProposedApiEnabled(this._extension, "commentingRangeHint");
            }
            proxy.$updateCommentingRanges(this.handle, provider?.resourceHints);
        }
        get reactionHandler() {
            return this._reactionHandler;
        }
        set reactionHandler(handler) {
            this._reactionHandler = handler;
            proxy.$updateCommentControllerFeatures(this.handle, {
                reactionHandler: !!handler
            });
        }
        get options() {
            return this._options;
        }
        set options(options) {
            this._options = options;
            proxy.$updateCommentControllerFeatures(this.handle, {
                options: this._options
            });
        }
        get activeComment() {
            checkProposedApiEnabled(this._extension, "activeComment");
            return this._activeComment;
        }
        get activeCommentThread() {
            checkProposedApiEnabled(this._extension, "activeComment");
            return this._activeThread?.value;
        }
        constructor(_extension, _handle, _id, _label) {
            this._extension = _extension;
            this._handle = _handle;
            this._id = _id;
            this._label = _label;
            this._threads = ( new Map());
            proxy.$registerCommentController(this.handle, _id, _label, this._extension.identifier.value);
            const that = this;
            this.value = ( Object.freeze({
                id: that.id,
                label: that.label,
                get options() {
                    return that.options;
                },
                set options(options) {
                    that.options = options;
                },
                get commentingRangeProvider() {
                    return that.commentingRangeProvider;
                },
                set commentingRangeProvider(commentingRangeProvider) {
                    that.commentingRangeProvider = commentingRangeProvider;
                },
                get reactionHandler() {
                    return that.reactionHandler;
                },
                set reactionHandler(handler) {
                    that.reactionHandler = handler;
                },
                get activeCommentThread() {
                    return that.activeCommentThread;
                },
                createCommentThread(uri, range, comments) {
                    return that.createCommentThread(uri, range, comments).value;
                },
                dispose: () => {
                    that.dispose();
                }
            }));
            this._localDisposables = [];
            this._localDisposables.push({
                dispose: () => {
                    proxy.$unregisterCommentController(this.handle);
                }
            });
        }
        createCommentThread(resource, range, comments) {
            const commentThread = ( new ExtHostCommentThread(
                this.id,
                this.handle,
                undefined,
                resource,
                range,
                comments,
                this._extension,
                false
            ));
            this._threads.set(commentThread.handle, commentThread);
            return commentThread;
        }
        $setActiveComment(commentInfo) {
            if (!commentInfo) {
                this._activeComment = undefined;
                this._activeThread = undefined;
                return;
            }
            const thread = this._threads.get(commentInfo.commentThreadHandle);
            if (thread) {
                this._activeComment = commentInfo.uniqueIdInThread ? thread.getCommentByUniqueId(commentInfo.uniqueIdInThread) : undefined;
                this._activeThread = thread;
            }
        }
        $createCommentThreadTemplate(uriComponents, range, editorId) {
            const commentThread = ( new ExtHostCommentThread(
                this.id,
                this.handle,
                undefined,
                URI.revive(uriComponents),
                Range.to(range),
                [],
                this._extension,
                true,
                editorId
            ));
            commentThread.collapsibleState = CommentThreadCollapsibleState.Expanded;
            this._threads.set(commentThread.handle, commentThread);
            return commentThread;
        }
        $updateCommentThreadTemplate(threadHandle, range) {
            const thread = this._threads.get(threadHandle);
            if (thread) {
                thread.range = Range.to(range);
            }
        }
        $updateCommentThread(threadHandle, changes) {
            const thread = this._threads.get(threadHandle);
            if (!thread) {
                return;
            }
            const modified = value => Object.prototype.hasOwnProperty.call(changes, value);
            if (modified("collapseState")) {
                thread.collapsibleState = convertToCollapsibleState(changes.collapseState);
            }
        }
        $deleteCommentThread(threadHandle) {
            const thread = this._threads.get(threadHandle);
            thread?.dispose();
            this._threads.delete(threadHandle);
        }
        getCommentThread(handle) {
            return this._threads.get(handle);
        }
        dispose() {
            this._threads.forEach(value => {
                value.dispose();
            });
            this._localDisposables.forEach(disposable => disposable.dispose());
        }
    }
    function convertToDTOComment(thread, vscodeComment, commentsMap, extension) {
        let commentUniqueId = commentsMap.get(vscodeComment);
        if (!commentUniqueId) {
            commentUniqueId = ++thread.commentHandle;
            commentsMap.set(vscodeComment, commentUniqueId);
        }
        if (vscodeComment.state !== undefined) {
            checkProposedApiEnabled(extension, "commentsDraftState");
        }
        if (vscodeComment.reactions?.some(reaction => reaction.reactors !== undefined)) {
            checkProposedApiEnabled(extension, "commentReactor");
        }
        return {
            mode: vscodeComment.mode,
            contextValue: vscodeComment.contextValue,
            uniqueIdInThread: commentUniqueId,
            body: (typeof vscodeComment.body === "string") ? vscodeComment.body : MarkdownString$1.from(vscodeComment.body),
            userName: vscodeComment.author.name,
            userIconPath: vscodeComment.author.iconPath,
            label: vscodeComment.label,
            commentReactions: vscodeComment.reactions ? ( vscodeComment.reactions.map(reaction => convertToReaction(reaction))) : undefined,
            state: vscodeComment.state,
            timestamp: vscodeComment.timestamp?.toJSON()
        };
    }
    function convertToReaction(reaction) {
        return {
            label: reaction.label,
            iconPath: reaction.iconPath ? pathOrURIToURI(reaction.iconPath) : undefined,
            count: reaction.count,
            hasReacted: reaction.authorHasReacted,
            reactors: ((reaction.reactors && (reaction.reactors.length > 0) && (typeof reaction.reactors[0] !== "string")) ? ( reaction.reactors.map(reactor => reactor.name)) : reaction.reactors)
        };
    }
    function convertFromReaction(reaction) {
        return {
            label: reaction.label || "",
            count: reaction.count || 0,
            iconPath: reaction.iconPath ? URI.revive(reaction.iconPath) : "",
            authorHasReacted: reaction.hasReacted || false,
            reactors: reaction.reactors?.map(reactor => ({
                name: reactor
            }))
        };
    }
    function convertToCollapsibleState(kind) {
        if (kind !== undefined) {
            switch (kind) {
            case CommentThreadCollapsibleState$1.Expanded:
                return CommentThreadCollapsibleState.Expanded;
            case CommentThreadCollapsibleState$1.Collapsed:
                return CommentThreadCollapsibleState.Collapsed;
            }
        }
        return CommentThreadCollapsibleState.Collapsed;
    }
    function convertToState(kind) {
        let resolvedKind;
        if (typeof kind === "object") {
            resolvedKind = kind.resolved;
        } else {
            resolvedKind = kind;
        }
        if (resolvedKind !== undefined) {
            switch (resolvedKind) {
            case CommentThreadState.Unresolved:
                return CommentThreadState$1.Unresolved;
            case CommentThreadState.Resolved:
                return CommentThreadState$1.Resolved;
            }
        }
        return CommentThreadState$1.Unresolved;
    }
    function convertToRelevance(kind) {
        let applicabilityKind = undefined;
        if (typeof kind === "object") {
            applicabilityKind = kind.applicability;
        }
        if (applicabilityKind !== undefined) {
            switch (applicabilityKind) {
            case CommentThreadApplicability.Current:
                return CommentThreadApplicability$1.Current;
            case CommentThreadApplicability.Outdated:
                return CommentThreadApplicability$1.Outdated;
            }
        }
        return CommentThreadApplicability$1.Current;
    }
    return ( new ExtHostCommentsImpl());
}

export { createExtHostComments };
