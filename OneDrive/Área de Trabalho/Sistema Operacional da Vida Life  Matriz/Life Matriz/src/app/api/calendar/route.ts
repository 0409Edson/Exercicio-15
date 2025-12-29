import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/calendar/callback`
    : 'http://localhost:3000/api/calendar/callback';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
        case 'auth':
            return handleAuth();
        case 'events':
            return handleGetEvents(request);
        default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { action } = body;

    switch (action) {
        case 'create':
            return handleCreateEvent(request, body);
        case 'refresh':
            return handleRefreshToken(body);
        default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
}

// Generate OAuth URL
function handleAuth() {
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({
            error: 'Google Calendar not configured',
            message: 'Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local',
            setupUrl: 'https://console.cloud.google.com/apis/credentials',
        }, { status: 400 });
    }

    const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
    ];

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return NextResponse.json({ authUrl: authUrl.toString() });
}

// Get calendar events
async function handleGetEvents(request: NextRequest) {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
        return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    try {
        const now = new Date();
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=50`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        const events = (data.items || []).map((event: any) => ({
            id: event.id,
            title: event.summary,
            description: event.description,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            location: event.location,
            allDay: !event.start?.dateTime,
            color: event.colorId,
            link: event.htmlLink,
        }));

        return NextResponse.json({ events });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Create new event
async function handleCreateEvent(request: NextRequest, body: any) {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
        return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const { title, description, start, end, location } = body;

    try {
        const response = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary: title,
                    description,
                    location,
                    start: {
                        dateTime: new Date(start).toISOString(),
                        timeZone: 'America/Sao_Paulo',
                    },
                    end: {
                        dateTime: new Date(end).toISOString(),
                        timeZone: 'America/Sao_Paulo',
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to create event');
        }

        const event = await response.json();

        return NextResponse.json({
            success: true,
            event: {
                id: event.id,
                title: event.summary,
                link: event.htmlLink,
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Refresh access token
async function handleRefreshToken(body: any) {
    const { refreshToken } = body;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return NextResponse.json({ error: 'Not configured' }, { status: 400 });
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();

        return NextResponse.json({
            accessToken: data.access_token,
            expiresIn: data.expires_in,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
