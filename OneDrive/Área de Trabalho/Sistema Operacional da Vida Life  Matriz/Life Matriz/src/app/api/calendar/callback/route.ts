import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/calendar/callback`
    : 'http://localhost:3000/api/calendar/callback';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/calendar?error=access_denied', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/calendar?error=no_code', request.url));
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return NextResponse.redirect(new URL('/calendar?error=not_configured', request.url));
    }

    try {
        // Exchange code for tokens
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            throw new Error('Token exchange failed');
        }

        const data = await response.json();

        // Redirect to calendar page with tokens in hash (client-side only)
        const callbackUrl = new URL('/calendar', request.url);
        callbackUrl.hash = `access_token=${data.access_token}&refresh_token=${data.refresh_token || ''}&expires_in=${data.expires_in}`;

        return NextResponse.redirect(callbackUrl);

    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(new URL('/calendar?error=token_error', request.url));
    }
}
