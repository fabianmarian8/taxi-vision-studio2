import { fetchGoogleReviews, transformReview } from '@/lib/google-reviews';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface GoogleReviewsSectionProps {
  placeId: string;
  serviceName: string;
  googleMapsUrl?: string;
}

export async function GoogleReviewsSection({ placeId, serviceName, googleMapsUrl }: GoogleReviewsSectionProps) {
  const result = await fetchGoogleReviews(placeId);

  // If fetch failed or no reviews, don't render anything
  if (!result.success || !result.data || result.data.user_ratings_total === 0) {
    return null;
  }

  const { rating, user_ratings_total, reviews } = result.data;
  const transformedReviews = reviews?.map(transformReview) || [];

  // Sklonenie pre "recenzia"
  const getReviewWord = (count: number) => {
    if (count === 1) return 'recenzia';
    if (count >= 2 && count <= 4) return 'recenzie';
    return 'recenzií';
  };

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            Hodnotenia zákazníkov
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-2xl font-black text-foreground">
              {rating.toFixed(1)}
            </span>
            <span className="text-foreground/60">
              ({user_ratings_total} {getReviewWord(user_ratings_total)})
            </span>
          </div>
        </div>

        {/* Reviews */}
        {transformedReviews.length > 0 && (
          <div className="space-y-4 mb-8">
            {transformedReviews.map((review, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {review.profilePhoto ? (
                      <img
                        src={review.profilePhoto}
                        alt={review.author}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-lg">
                          {review.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-foreground">{review.author}</span>
                        <span className="text-sm text-foreground/70">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      {review.text && (
                        <p className="text-foreground/80 leading-relaxed">
                          "{review.text}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Link to Google */}
        <div className="text-center">
          <a
            href={googleMapsUrl || `https://www.google.com/maps/place/?q=place_id:${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-foreground/20 hover:border-purple-500 text-foreground font-bold px-6 py-3 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Zobraziť profil na Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
