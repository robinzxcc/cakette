import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getApiError } from "../api";
import { useCakes } from "../hooks/useCakes";
import { useAuth } from "../auth";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useModal } from "../components/Modal";
import { usePageTitle } from "../hooks/usePageTitle";
import { Link } from "react-router-dom";

type Review = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  cake?: { name?: string; slug?: string } | string;
  customer?: { name?: string } | string;
};

type Ranking = {
  cakeId: string;
  cakeName: string;
  cakeSlug?: string;
  averageRating: number;
  reviewCount: number;
};

const schema = z.object({
  cakeId: z.string().min(1, "Select a cake"),
  rating: z.number().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Reviews() {
  usePageTitle("Reviews");
  const { user } = useAuth();
  const { cakes } = useCakes();
  const { show } = useModal();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { cakeId: "", rating: 5, title: "", comment: "" },
  });

  const load = () =>
    Promise.all([api.get("/reviews"), api.get("/reviews/stats/by-cake")])
      .then(([reviewRes, rankingRes]) => {
        setReviews(reviewRes.data.reviews);
        setRankings(rankingRes.data.rankings);
      })
      .catch((err) => setError(getApiError(err, "Could not load reviews.")));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setFormError("");
    try {
      await api.post("/reviews", values);
      reset({ cakeId: "", rating: 5, title: "", comment: "" });
      show({ title: "Review posted", message: "Thanks for sharing your cake experience." });
      await load();
    } catch (err) {
      setFormError(getApiError(err, "Could not post review."));
    }
  };

  const cakeName = (review: Review) => {
    if (typeof review.cake === "object" && review.cake?.name) return review.cake.name;
    return "Cake";
  };

  return (
    <section className="py-14">
      <div className="page-shell">
        <p className="section-label">SWEET FEEDBACK</p>
        <h1 className="mt-3 font-display text-5xl">Cake reviews.</h1>
        <p className="mt-4 max-w-2xl text-[#786a76]">
          Share what you loved, and see which cakes customers rate highest.
        </p>

        {loading ? (
          <div className="mt-10">
            <LoadingState />
          </div>
        ) : error ? (
          <div className="mt-10">
            <ErrorState message={error} />
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="soft-card p-10 text-center">
                  <h2 className="font-display text-3xl">No reviews yet.</h2>
                  <p className="mt-2 text-sm text-[#786a76]">Be the first to leave feedback after an order.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="soft-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-display text-2xl">{review.title}</h2>
                      <span className="rounded-full bg-[#fff1f5] px-3 py-1 text-xs font-bold">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#786a76]">{cakeName(review)}</p>
                    <p className="mt-4 text-sm leading-6 text-[#594d5b]">{review.comment}</p>
                  </article>
                ))
              )}
            </div>

            <aside className="space-y-6">
              <div className="soft-card p-6">
                <h2 className="font-display text-3xl">Top ranked</h2>
                <div className="mt-5 space-y-3">
                  {rankings.length === 0 ? (
                    <p className="text-sm text-[#786a76]">Rankings appear once reviews are approved.</p>
                  ) : (
                    rankings.map((item) => (
                      <div key={item.cakeId} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-bold">{item.cakeName}</p>
                          <p className="text-xs text-[#786a76]">{item.reviewCount} reviews</p>
                        </div>
                        <strong>{item.averageRating}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="soft-card p-6">
                <h2 className="font-display text-3xl">Write a review</h2>
                {!user ? (
                  <p className="mt-4 text-sm text-[#786a76]">
                    <Link to="/login" className="font-bold text-[#a05f7b]">
                      Log in
                    </Link>{" "}
                    to leave a review.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                    {formError && <ErrorState message={formError} />}
                    <div>
                      <label className="label">Cake</label>
                      <select className="input" {...register("cakeId")}>
                        <option value="">Select a cake</option>
                        {cakes.map((cake) => (
                          <option key={cake.id} value={cake.id}>
                            {cake.name}
                          </option>
                        ))}
                      </select>
                      {errors.cakeId && <p className="error-text">{errors.cakeId.message}</p>}
                    </div>
                    <div>
                      <label className="label">Rating</label>
                      <input className="input" type="number" min={1} max={5} {...register("rating", { valueAsNumber: true })} />
                      {errors.rating && <p className="error-text">{errors.rating.message}</p>}
                    </div>
                    <div>
                      <label className="label">Title</label>
                      <input className="input" {...register("title")} />
                      {errors.title && <p className="error-text">{errors.title.message}</p>}
                    </div>
                    <div>
                      <label className="label">Comment</label>
                      <textarea className="input min-h-24" {...register("comment")} />
                      {errors.comment && <p className="error-text">{errors.comment.message}</p>}
                    </div>
                    <button disabled={!isValid} className="btn-primary w-full disabled:opacity-60">
                      Post review
                    </button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
