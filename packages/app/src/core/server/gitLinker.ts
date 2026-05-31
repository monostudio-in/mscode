// core/server/gitLinker.ts 
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/core/server/supabaseClient';

/**
 * Initializes the deep link listener for handling authentication callbacks.
 * * This function should be invoked once during the Matrix Studio app's initialization phase.
 * It listens for incoming deep links (e.g., OAuth redirects) and processes the authentication
 * payload using either the Implicit flow (hash fragments) or the PKCE flow (query parameters) 
 * to establish a Supabase session.
 * * @example
 * ```ts
 * // In your main entry file (e.g., App.tsx or main.ts)
 * setupAuthDeepLinkListener();
 * ```
 */
export const setupAuthDeepLinkListener = () => {
  App.addListener('appUrlOpen', async (event) => {
    // Verify if the incoming URL matches the designated auth callback scheme
    if (event.url.includes('mscode://auth/callback')) {
      
      // 1. Close the Capacitor in-app browser to return the user to the app interface
      await Browser.close();

      // 2. Parse the URL to extract the authentication Token or Code
      const hashIndex = event.url.indexOf('#');
      const queryIndex = event.url.indexOf('?');

      try {
        // [Flow A] Implicit Flow: Tokens are returned in the URL Hash (#)
        if (hashIndex !== -1) {
          const hashFragment = event.url.substring(hashIndex + 1);
          const hashParams = new URLSearchParams(hashFragment);
          
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Manually provision the Supabase session using the extracted tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (error) throw error;
            console.log('✅ Successfully logged in via Hash tokens!');
          }
        } 
        // [Flow B] PKCE Flow: Auth code is returned in the URL Query (?) (Supabase v2 default)
        else if (queryIndex !== -1) {
          const queryFragment = event.url.substring(queryIndex + 1);
          const queryParams = new URLSearchParams(queryFragment);
          const code = queryParams.get('code');

          if (code) {
            // Exchange the authorization code for a secure session
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            console.log('✅ Successfully logged in via PKCE Code!');
          }
        }
      } catch (error: any) {
        console.error('❌ Supabase session setup failed:', error.message);
      }
    }
  });
};
