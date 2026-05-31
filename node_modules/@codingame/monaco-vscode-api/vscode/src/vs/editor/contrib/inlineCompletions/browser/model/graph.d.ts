export declare class DirectedGraph<T> {
    private readonly _nodes;
    private readonly _outgoingEdges;
    static from<T>(nodes: readonly T[], getOutgoing: (node: T) => readonly T[]): DirectedGraph<T>;
    /**
     * After this, the graph is guaranteed to have no cycles.
     */
    removeCycles(): {
        foundCycles: T[];
    };
    getOutgoing(node: T): readonly T[];
}
