## A rough idea for auth implementation

```
auth/
├── sign-in/
│   └── index.ts
├── sign-up/
│   └── index.ts
├── auth-providers/
│   ├── github.ts
│   ├── discord.ts
│   ├── gitlab.ts
│   ├── google.ts
│   └── credential.ts
├── user.ts
└── session.ts
```

## Sign-in flow
- ### oAuth
    - User clicks the oAuth provider signIn widget
    - The client makes a request to `/api/auth/v1/get-oauth-url/:authProvider`
    - The server will GENERATE OAUTH URL and return that in response
        ```typescript
        return ctx.json({ oAuthUrl: generatedOAuthUrl }, HTTP_CODES.success);
        ```
    - The client will redirect the user to `oAuthUrl`
    - The user gets redirected back to `/auth/callback/:authProvider` after a successful authorization from the oAuthProvider with the `tokenExchangeCode` and the `csrfState` parameter
    - If the `csrfState` matches the code is sent to `/api/auth/v1/signin/:authProvider` for the user to be signedIn finally

- ### Credential
    - The user enters their signin credentials and presses the signin button
    - The data is sent to `/api/auth/v1/signin/:authProvider` ("credential" is authProvider here)

- The server receives a request on the signin endpoint
- The signin request is handled by a `signInRequestHandler`
- It passes down the data to the respective auth provider to GET USER PROFILE DATA
    ```typescript
    const userProfile: SignInProfileData = await getGithubUserProfile(ctx);
    ```
- If the provider returns valid data it continues else returns a `HTTP_CODES.badRequest` status code
- The validated profile data is then passed to `createUserSession` to CREATE USER SESSION
    ```typescript
    const sessionCreationResult = await createUserSession(ctx, userProfile);
    ```
- If there's something unusual about the signin the `createUserSession` function will create a SESSION with `UNVERIFIED` status in the db and redirect the user to `/auth/verify-signin` and send a `securityCode` on the account's email address
- If the user doesn't successfully verify the session within 12 hours of session creation, it will be deleted by the background job DELETE EXPIRED UNVERIFIED SESSIONS
- If the user closes the page without verifying, they will automatically be redirected to the verification page till an unverified session that is not expired exists in the cookie, unverified sessions will be treated the same as not-logged in all the places, that session cannot access any private user data.
- On successful verification the session will be updated to verified giving that user access the the account data
