export declare const PROTECTED_DATABASE_NAMES: readonly string[];
export declare const OWNERSHIP_TABLE = "kg_test_database_ownership";
export type OwnershipRefusal = 'NO_DATABASE_URL' | 'PROTECTED_DATABASE' | 'NAME_NOT_DISPOSABLE' | 'OWNED_BY_ANOTHER_SUITE' | 'UNCLAIMED_DATABASE' | 'CONNECTION_FAILED';
export declare const INITIALIZE_OWNERSHIP_ENV = "KG_TEST_DB_INITIALIZE_OWNERSHIP";
export declare class DatabaseOwnershipRefused extends Error {
    readonly refusal: OwnershipRefusal;
    readonly database: string;
    constructor(refusal: OwnershipRefusal, database: string, detail: string);
}
export interface OwnershipClaim {
    database: string;
    host: string;
    suite: string;
    token: string;
    claimedAt: string;
    freshlyClaimed: boolean;
}
export declare function claimDatabaseOwnership(input: {
    suite: string;
    databaseUrl?: string | undefined;
    allowReclaim?: boolean;
    initializeOwnership?: boolean;
}): Promise<OwnershipClaim>;
export declare function inspectDatabaseOwnership(databaseUrl: string): Promise<{
    database: string;
    markerPresent: boolean;
    ownerSuite: string | null;
}>;
export declare function runOwnedMutatingSuite(input: {
    suite: string;
    databaseUrl?: string | undefined;
    allowReclaim?: boolean;
    initializeOwnership?: boolean;
    body: (claim: OwnershipClaim) => Promise<void>;
}): Promise<void>;
