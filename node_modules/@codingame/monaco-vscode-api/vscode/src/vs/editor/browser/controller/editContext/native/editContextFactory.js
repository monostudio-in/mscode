

var EditContext;
(function (EditContext) {
    function create(window, options) {
        return new window.EditContext(options);
    }
    EditContext.create = create;
})(EditContext || (EditContext = {}));

export { EditContext };
