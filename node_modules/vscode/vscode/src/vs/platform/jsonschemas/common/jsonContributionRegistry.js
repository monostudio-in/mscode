
import { Emitter } from '../../../base/common/event.js';
import { getCompressedContent } from '../../../base/common/jsonSchema.js';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { Registry } from '../../registry/common/platform.js';

const Extensions = {
    JSONContribution: "base.contributions.json"
};
function normalizeId(id) {
    if (id.length > 0 && id.charAt(id.length - 1) === "#") {
        return id.substring(0, id.length - 1);
    }
    return id;
}
class JSONContributionRegistry extends Disposable {
    constructor() {
        super(...arguments);
        this.schemasById = {};
        this.schemaAssociations = {};
        this._onDidChangeSchema = this._register(( new Emitter()));
        this.onDidChangeSchema = this._onDidChangeSchema.event;
        this._onDidChangeSchemaAssociations = this._register(( new Emitter()));
        this.onDidChangeSchemaAssociations = this._onDidChangeSchemaAssociations.event;
    }
    registerSchema(uri, unresolvedSchemaContent, store) {
        const normalizedUri = normalizeId(uri);
        this.schemasById[normalizedUri] = unresolvedSchemaContent;
        this._onDidChangeSchema.fire(uri);
        if (store) {
            store.add(toDisposable(() => {
                delete this.schemasById[normalizedUri];
                this._onDidChangeSchema.fire(uri);
            }));
        }
    }
    registerSchemaAssociation(uri, glob) {
        const normalizedUri = normalizeId(uri);
        if (!this.schemaAssociations[normalizedUri]) {
            this.schemaAssociations[normalizedUri] = [];
        }
        if (!this.schemaAssociations[normalizedUri].includes(glob)) {
            this.schemaAssociations[normalizedUri].push(glob);
            this._onDidChangeSchemaAssociations.fire();
        }
        return toDisposable(() => {
            const associations = this.schemaAssociations[normalizedUri];
            if (associations) {
                const index = associations.indexOf(glob);
                if (index !== -1) {
                    associations.splice(index, 1);
                    if (associations.length === 0) {
                        delete this.schemaAssociations[normalizedUri];
                    }
                    this._onDidChangeSchemaAssociations.fire();
                }
            }
        });
    }
    notifySchemaChanged(uri) {
        this._onDidChangeSchema.fire(uri);
    }
    getSchemaContributions() {
        return {
            schemas: this.schemasById
        };
    }
    getSchemaContent(uri) {
        const schema = this.schemasById[uri];
        return schema ? getCompressedContent(schema) : undefined;
    }
    hasSchemaContent(uri) {
        return !!this.schemasById[uri];
    }
    getSchemaAssociations() {
        return this.schemaAssociations;
    }
}
const jsonContributionRegistry = ( new JSONContributionRegistry());
Registry.add(Extensions.JSONContribution, jsonContributionRegistry);

export { Extensions };
