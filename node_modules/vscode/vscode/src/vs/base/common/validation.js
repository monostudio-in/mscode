
import { mapFilter } from './arrays.js';

class ValidatorBase {
    validateOrThrow(content) {
        const result = this.validate(content);
        if (result.error) {
            throw ( new Error(result.error.message));
        }
        return result.content;
    }
}
class TypeofValidator extends ValidatorBase {
    constructor(type) {
        super();
        this.type = type;
    }
    validate(content) {
        if (typeof content !== this.type) {
            return {
                content: undefined,
                error: {
                    message: `Expected ${this.type}, but got ${typeof content}`
                }
            };
        }
        return {
            content: content,
            error: undefined
        };
    }
    getJSONSchema() {
        return {
            type: this.type
        };
    }
}
const vStringValidator = ( new TypeofValidator("string"));
function vString() {
    return vStringValidator;
}
const vNumberValidator = ( new TypeofValidator("number"));
function vNumber() {
    return vNumberValidator;
}
const vBooleanValidator = ( new TypeofValidator("boolean"));
function vBoolean() {
    return vBooleanValidator;
}
const vObjAnyValidator = ( new TypeofValidator("object"));
function vObjAny() {
    return vObjAnyValidator;
}
class UncheckedValidator extends ValidatorBase {
    validate(content) {
        return {
            content: content,
            error: undefined
        };
    }
    getJSONSchema() {
        return {};
    }
}
function vUnchecked() {
    return ( new UncheckedValidator());
}
class UndefinedValidator extends ValidatorBase {
    validate(content) {
        if (content !== undefined) {
            return {
                content: undefined,
                error: {
                    message: `Expected undefined, but got ${typeof content}`
                }
            };
        }
        return {
            content: undefined,
            error: undefined
        };
    }
    getJSONSchema() {
        return {};
    }
}
function vUndefined() {
    return ( new UndefinedValidator());
}
class Optional {
    constructor(validator) {
        this.validator = validator;
    }
}
function vOptionalProp(validator) {
    return ( new Optional(validator));
}
class ObjValidator extends ValidatorBase {
    constructor(properties) {
        super();
        this.properties = properties;
    }
    validate(content) {
        if (typeof content !== "object" || content === null) {
            return {
                content: undefined,
                error: {
                    message: "Expected object"
                }
            };
        }
        const result = {};
        for (const key in this.properties) {
            const prop = this.properties[key];
            const fieldValue = content[key];
            const isOptional = prop instanceof Optional;
            const validator = isOptional ? prop.validator : prop;
            if (isOptional && fieldValue === undefined) {
                continue;
            }
            const {
                content: value,
                error
            } = validator.validate(fieldValue);
            if (error) {
                return {
                    content: undefined,
                    error: {
                        message: `Error in property '${key}': ${error.message}`
                    }
                };
            }
            result[key] = value;
        }
        return {
            content: result,
            error: undefined
        };
    }
    getJSONSchema() {
        const requiredFields = [];
        const schemaProperties = {};
        for (const [key, prop] of Object.entries(this.properties)) {
            const isOptional = prop instanceof Optional;
            const validator = isOptional ? prop.validator : prop;
            schemaProperties[key] = validator.getJSONSchema();
            if (!isOptional) {
                requiredFields.push(key);
            }
        }
        const schema = {
            type: "object",
            properties: schemaProperties,
            ...(requiredFields.length > 0 ? {
                required: requiredFields
            } : {})
        };
        return schema;
    }
}
function vObj(properties) {
    return ( new ObjValidator(properties));
}
class ArrayValidator extends ValidatorBase {
    constructor(validator) {
        super();
        this.validator = validator;
    }
    validate(content) {
        if (!Array.isArray(content)) {
            return {
                content: undefined,
                error: {
                    message: "Expected array"
                }
            };
        }
        const result = [];
        for (let i = 0; i < content.length; i++) {
            const {
                content: value,
                error
            } = this.validator.validate(content[i]);
            if (error) {
                return {
                    content: undefined,
                    error: {
                        message: `Error in element ${i}: ${error.message}`
                    }
                };
            }
            result.push(value);
        }
        return {
            content: result,
            error: undefined
        };
    }
    getJSONSchema() {
        return {
            type: "array",
            items: this.validator.getJSONSchema()
        };
    }
}
function vArray(validator) {
    return ( new ArrayValidator(validator));
}
class UnionValidator extends ValidatorBase {
    constructor(validators) {
        super();
        this.validators = validators;
    }
    validate(content) {
        let lastError;
        for (const validator of this.validators) {
            const {
                content: value,
                error
            } = validator.validate(content);
            if (!error) {
                return {
                    content: value,
                    error: undefined
                };
            }
            lastError = error;
        }
        return {
            content: undefined,
            error: lastError
        };
    }
    getJSONSchema() {
        return {
            oneOf: mapFilter(this.validators, validator => {
                if (validator instanceof UndefinedValidator) {
                    return undefined;
                }
                return validator.getJSONSchema();
            })
        };
    }
}
function vUnion(...validators) {
    return ( new UnionValidator(validators));
}
class UseRefSchemaValidator extends ValidatorBase {
    constructor(_ref, _validator) {
        super();
        this._ref = _ref;
        this._validator = _validator;
    }
    validate(content) {
        return this._validator.validate(content);
    }
    getJSONSchema() {
        return {
            $ref: this._ref
        };
    }
}
function vWithJsonSchemaRef(ref, validator) {
    return ( new UseRefSchemaValidator(ref, validator));
}

export { Optional, ValidatorBase, vArray, vBoolean, vNumber, vObj, vObjAny, vOptionalProp, vString, vUnchecked, vUndefined, vUnion, vWithJsonSchemaRef };
