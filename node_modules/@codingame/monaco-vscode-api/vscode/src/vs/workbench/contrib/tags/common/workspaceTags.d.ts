export type Tags = {
    [index: string]: boolean | number | string | undefined;
};
export declare function getHashedRemotesFromConfig(text: string, stripEndingDotGit: boolean | undefined, sha1Hex: (str: string) => Promise<string>): Promise<string[]>;
