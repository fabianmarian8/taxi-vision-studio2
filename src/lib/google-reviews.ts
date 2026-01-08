/**
 * Google Places API - Fetch reviews for a business
 *
 * This module provides server-side fetching of Google Business reviews.
 * Reviews are cached via Next.js ISR (revalidate weekly).
 */

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GooglePlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
}

export interface FetchReviewsResult {
  success: boolean;
  data?: GooglePlaceDetails;
  error?: string;
}

/**
 * Fetches reviews from Google Places API
 * @param placeId - The Google Place ID for the business
 * @returns Object with reviews data or error
 */
export async function fetchGoogleReviews(placeId: string): Promise<FetchReviewsResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not configured');
    return {
      success: false,
      error: 'API key not configured'
    };
  }

  if (!placeId) {
    return {
      success: false,
      error: 'Place ID not provided'
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=sk`;

    const response = await fetch(url, {
      next: { revalidate: 604800 } // Cache for 1 week (ISR)
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status}`);
    }

    return {
      success: true,
      data: {
        name: data.result.name,
        rating: data.result.rating || 0,
        user_ratings_total: data.result.user_ratings_total || 0,
        reviews: data.result.reviews || []
      }
    };
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transform Google review to our internal format
 */
export function transformReview(review: GoogleReview) {
  return {
    author: review.author_name,
    rating: review.rating,
    text: review.text,
    date: review.relative_time_description,
    profilePhoto: review.profile_photo_url
  };
}
