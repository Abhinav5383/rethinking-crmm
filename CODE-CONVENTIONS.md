# Some Conventions to follow

## Naming conventions
- Functions and regular variables should be named in camelCase
    ```typescript
    // const check_if_search_result_cache_is_valid = () => {
    const checkIfSearchResultCacheIsValid = ( ... ) => { ... };
    const isSearchResultCacheInvalid = checkIfSearchResultCacheIsValid( ... );
    ```

- All config variables and magic numbers must be in UPPERCASE and separated by underscores (`_`)
    ```typescript
    const USERNAME_MAX_LENGTH = 32;
    const SEARCH_DB_SYNC_INTERVAL_MS = 300_000;
    ```
- Try to always `export` things at the bottom of file rather than exporting them individually and if possible add comments for each exported thing explaining what that is used for and in which kind of files
    ```typescript
    export {
        getUserSession,  // Used in the middleware to add user session details to the request context
        ...
    }
    ```

- Make sure to add comments when doing complex or hacky things if possible with examples
