# Some Conventions to follow

## Naming conventions
- Functions and regular variables should be named in camelCase
    ```typescript
    const checkIfSearchResultCacheIsValid = ( ... ) => { ... };
    const isSearchResultCacheValid = checkIfSearchResultCacheIsValid( ... );
    ```

- All config variables and magic numbers must be in UPPERCASE and separated by underscores (`_`)
    ```typescript
    const USERNAME_MAX_LENGTH = 32;
    const SEARCHDB_SYNC_INTERVAL_MS = 300_000;
    ```

- Make sure to add comments when doing complex or hacky things if possible with examples
