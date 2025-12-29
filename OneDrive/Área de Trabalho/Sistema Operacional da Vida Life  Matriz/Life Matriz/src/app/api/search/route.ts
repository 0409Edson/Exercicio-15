import { NextRequest, NextResponse } from 'next/server';

// SerpAPI for real Google search results
// Get your free API key at: https://serpapi.com (100 free searches/month)
const SERPAPI_KEY = process.env.SERPAPI_KEY;

interface SearchParams {
    category: 'flights' | 'products' | 'hotels';
    query: string;
}

export async function POST(request: NextRequest) {
    try {
        const { category, query }: SearchParams = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Check if API key is configured
        if (!SERPAPI_KEY) {
            console.log('SerpAPI key not configured, returning mock data');
            return NextResponse.json({
                results: getMockResults(category, query),
                mock: true,
                message: 'Configure SERPAPI_KEY no .env.local para buscas reais'
            });
        }

        let results;

        switch (category) {
            case 'products':
                results = await searchProducts(query);
                break;
            case 'flights':
                results = await searchFlights(query);
                break;
            case 'hotels':
                results = await searchHotels(query);
                break;
            default:
                results = await searchProducts(query);
        }

        return NextResponse.json({ results, mock: false });

    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({
            error: error.message,
            results: [],
        }, { status: 500 });
    }
}

// Search Products using Google Shopping
async function searchProducts(query: string) {
    const params = new URLSearchParams({
        engine: 'google_shopping',
        q: query,
        location: 'Brazil',
        hl: 'pt',
        gl: 'br',
        api_key: SERPAPI_KEY!,
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    // Transform results to our format
    return (data.shopping_results || []).slice(0, 6).map((item: any, index: number) => ({
        id: String(index + 1),
        provider: item.source || 'Loja',
        title: item.title,
        description: item.snippet || '',
        price: item.extracted_price || 0,
        currency: 'R$',
        url: item.link,
        image: item.thumbnail,
        rating: item.rating,
        reviews: item.reviews,
        isBestDeal: index === 0,
    }));
}

// Search Flights using Google Flights
async function searchFlights(query: string) {
    // Parse query to extract origin, destination, date
    // Example: "São Paulo para Lisboa março"
    const parts = query.toLowerCase();

    let departure = 'GRU'; // Default São Paulo
    let arrival = 'LIS'; // Default Lisboa

    // Try to detect cities
    if (parts.includes('são paulo') || parts.includes('sao paulo')) departure = 'GRU';
    if (parts.includes('rio')) departure = 'GIG';
    if (parts.includes('brasília') || parts.includes('brasilia')) departure = 'BSB';

    if (parts.includes('lisboa')) arrival = 'LIS';
    if (parts.includes('paris')) arrival = 'CDG';
    if (parts.includes('londres')) arrival = 'LHR';
    if (parts.includes('madrid')) arrival = 'MAD';
    if (parts.includes('nova york') || parts.includes('new york')) arrival = 'JFK';
    if (parts.includes('miami')) arrival = 'MIA';
    if (parts.includes('orlando')) arrival = 'MCO';

    // Get date (default: 30 days from now)
    const outboundDate = new Date();
    outboundDate.setDate(outboundDate.getDate() + 30);
    const returnDate = new Date(outboundDate);
    returnDate.setDate(returnDate.getDate() + 7);

    const params = new URLSearchParams({
        engine: 'google_flights',
        departure_id: departure,
        arrival_id: arrival,
        outbound_date: outboundDate.toISOString().split('T')[0],
        return_date: returnDate.toISOString().split('T')[0],
        currency: 'BRL',
        hl: 'pt',
        gl: 'br',
        api_key: SERPAPI_KEY!,
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    // Get best flights
    const flights = data.best_flights || data.other_flights || [];

    return flights.slice(0, 5).map((flight: any, index: number) => {
        const firstLeg = flight.flights?.[0] || {};
        return {
            id: String(index + 1),
            provider: firstLeg.airline || 'Companhia Aérea',
            title: `${departure} → ${arrival}`,
            description: `${firstLeg.duration ? `${Math.floor(firstLeg.duration / 60)}h${firstLeg.duration % 60}min` : ''} • ${flight.flights?.length > 1 ? `${flight.flights.length - 1} escala(s)` : 'Voo direto'} • ${firstLeg.travel_class || 'Econômica'}`,
            price: flight.price || 0,
            currency: 'R$',
            departureTime: firstLeg.departure_airport?.time,
            arrivalTime: firstLeg.arrival_airport?.time,
            airline: firstLeg.airline,
            airlineLogo: firstLeg.airline_logo,
            isBestDeal: index === 0,
            url: data.search_metadata?.google_flights_url,
        };
    });
}

// Search Hotels
async function searchHotels(query: string) {
    const params = new URLSearchParams({
        engine: 'google_hotels',
        q: query,
        check_in_date: getDateString(7), // 7 days from now
        check_out_date: getDateString(10), // 10 days from now
        currency: 'BRL',
        hl: 'pt',
        gl: 'br',
        api_key: SERPAPI_KEY!,
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return (data.properties || []).slice(0, 6).map((hotel: any, index: number) => ({
        id: String(index + 1),
        provider: hotel.type || 'Hotel',
        title: hotel.name,
        description: `${hotel.hotel_class ? `${hotel.hotel_class} estrelas` : ''} • ${hotel.neighborhood || hotel.description || ''}`,
        price: hotel.rate_per_night?.extracted_lowest || hotel.total_rate?.extracted_lowest || 0,
        currency: 'R$',
        url: hotel.link,
        image: hotel.images?.[0]?.thumbnail,
        rating: hotel.overall_rating,
        reviews: hotel.reviews,
        amenities: hotel.amenities?.slice(0, 4),
        isBestDeal: index === 0,
    }));
}

function getDateString(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}

// Mock results when API key is not configured
function getMockResults(category: string, query: string) {
    if (category === 'products') {
        return [
            {
                id: '1',
                provider: 'Amazon',
                title: query,
                description: 'Produto encontrado - Configure SERPAPI_KEY para preços reais',
                price: 0,
                currency: 'R$',
                isBestDeal: true,
                mock: true,
            }
        ];
    }

    if (category === 'flights') {
        return [
            {
                id: '1',
                provider: 'LifeOS',
                title: 'Configure a API para buscar voos',
                description: 'Adicione SERPAPI_KEY no arquivo .env.local',
                price: 0,
                currency: 'R$',
                mock: true,
            }
        ];
    }

    return [
        {
            id: '1',
            provider: 'LifeOS',
            title: 'Configure a API',
            description: 'Adicione SERPAPI_KEY no arquivo .env.local para buscas reais',
            mock: true,
        }
    ];
}
