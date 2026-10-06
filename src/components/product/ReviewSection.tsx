import React, { useState } from "react";
import { ProductReview } from "@/src/types";
import { RatingStars } from "@/src/components/common/RatingStars";
import { formatDate } from "@/src/lib/utils/formatters";
import { useToast } from "@/src/context/ToastContext";
import { Star, ThumbsUp, CheckCircle, Plus, MessageSquare, X } from "lucide-react";

interface ReviewSectionProps {
  productId: string;
  initialReviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  initialReviews,
  averageRating,
  totalReviews,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [helpfulMap, setHelpfulMap] = useState<{ [id: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Review form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleHelpful = (id: string) => {
    if (helpfulMap[id]) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
    setHelpfulMap((prev) => ({ ...prev, [id]: true }));
    showToast("Thank you for your feedback!", "info");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !title.trim()) {
      showToast("Please complete all required fields.", "error");
      return;
    }

    const newReview: ProductReview = {
      id: `rev_${Date.now()}`,
      productId,
      userName: name.trim(),
      userCity: city.trim() || "Pakistan",
      rating,
      date: new Date().toISOString().split("T")[0],
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    setReviews([newReview, ...reviews]);
    showToast("Review submitted successfully! Thank you for sharing.", "success");
    setIsModalOpen(false);
    setName("");
    setCity("");
    setTitle("");
    setComment("");
  };

  // Mock rating breakdown
  const distribution = [
    { stars: 5, percentage: 78 },
    { stars: 4, percentage: 16 },
    { stars: 3, percentage: 4 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Summary Block */}
      <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Big Score */}
          <div className="md:col-span-4 text-center md:text-left md:border-r border-stone-200 md:pr-8">
            <div className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight mb-2">
              {averageRating.toFixed(1)}
              <span className="text-xl sm:text-2xl text-stone-400 font-medium"> / 5.0</span>
            </div>
            <div className="flex justify-center md:justify-start mb-2">
              <RatingStars rating={averageRating} size="md" />
            </div>
            <p className="text-xs text-stone-500">
              Based on {totalReviews + (reviews.length - initialReviews.length)} verified reviews
            </p>
            <div className="mt-2 text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded inline-block">
              Demo sample reviews · Live customer reviews will connect to Supabase
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 w-full sm:w-auto px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Bars */}
          <div className="md:col-span-8 space-y-2">
            {distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-stone-600 font-medium text-right shrink-0">
                  {d.stars} Star
                </span>
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-stone-400 text-right">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-xl border border-stone-200 bg-white space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-stone-900">{rev.userName}</span>
                  {rev.userCity && (
                    <span className="text-xs text-stone-400">({rev.userCity})</span>
                  )}
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                <RatingStars rating={rev.rating} size="sm" />
              </div>

              <span className="text-xs text-stone-400">{formatDate(rev.date)}</span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-1">{rev.title}</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rev.comment}</p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-stone-400">
              <span>Was this review helpful?</span>
              <button
                onClick={() => handleHelpful(rev.id)}
                disabled={helpfulMap[rev.id]}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  helpfulMap[rev.id]
                    ? "bg-stone-100 text-stone-900 border-stone-300"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Yes ({rev.helpfulCount})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10 border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Write Your Review</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-stone-600 ml-2">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asad Ali"
                    required
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    City (Pakistan)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent sound and build quality"
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Detailed Review *
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other shoppers in Pakistan what you loved about this product..."
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
