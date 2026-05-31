

function serializeEnvironmentVariableCollection(collection) {
    return [...collection.entries()];
}
function serializeEnvironmentDescriptionMap(descriptionMap) {
    return descriptionMap ? [...descriptionMap.entries()] : [];
}
function deserializeEnvironmentVariableCollection(serializedCollection) {
    return ( new Map(serializedCollection));
}
function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
    return ( new Map(serializableEnvironmentDescription ?? []));
}
function serializeEnvironmentVariableCollections(collections) {
    return ( Array.from(collections.entries()).map(e => {
        return [
            e[0],
            serializeEnvironmentVariableCollection(e[1].map),
            serializeEnvironmentDescriptionMap(e[1].descriptionMap)
        ];
    }));
}
function deserializeEnvironmentVariableCollections(serializedCollection) {
    return ( new Map(( serializedCollection.map(e => {
        return [e[0], {
            map: deserializeEnvironmentVariableCollection(e[1]),
            descriptionMap: deserializeEnvironmentDescriptionMap(e[2])
        }];
    }))));
}

export { deserializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollection, deserializeEnvironmentVariableCollections, serializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollection, serializeEnvironmentVariableCollections };
