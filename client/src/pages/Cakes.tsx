import { useEffect, useMemo, useState } from "react";
import CakeCard from "../components/CakeCard";
import SectionHeading from "../components/SectionHeading";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { api, getApiError } from "../api";
import { mapCake } from "../hooks/useCakes";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Cake } from "../types";

const sortMap: Record<string, string> = {
  featured: "newest",
  low: "priceAsc",
  high: "priceDesc",
  name: "name",
};

export default function Cakes() {
  usePageTitle("Cake Collection");
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    api
      .get("/cakes")
      .then(({ data }) => {
        const all = (data.cakes as Parameters<typeof mapCake>[0][]).map(mapCake);
        setCategories(["All", ...new Set(all.map((cake) => cake.category))]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category !== "All") params.set("category", category);
    params.set("sort", sortMap[sort] || "name");

    api
      .get(`/cakes/search?${params.toString()}`, { signal: controller.signal })
      .then(({ data }) => {
        let results = (data.cakes as Parameters<typeof mapCake>[0][]).map(mapCake);
        if (sort === "featured") {
          results = [...results].sort((a, b) => Number(b.popular) - Number(a.popular));
        }
        setCakes(results);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(getApiError(err, "We couldn't search the cake menu."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, category, sort]);

  const minPrice = useMemo(
    () => (cakes.length ? Math.min(...cakes.map((cake) => cake.basePrice)) : 0),
    [cakes]
  );

  return (
    <section className="py-14 md:py-16">
      <div className="page-shell">
        <SectionHeading
          eyebrow="THE COLLECTION"
          title="Find a starting point that feels like you."
          description="Search by name, filter by collection, and sort by price or popularity."
        />

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          <div className="soft-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b45f7e]">Matching cakes</p>
            <p className="mt-2 font-display text-3xl">{loading ? "…" : cakes.length}</p>
          </div>
          <div className="soft-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b45f7e]">Customization</p>
            <p className="mt-2 font-display text-3xl">5+ options</p>
          </div>
          <div className="soft-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b45f7e]">Price range</p>
            <p className="mt-2 font-display text-3xl">
              {loading ? "…" : `₱${minPrice.toLocaleString()}+`}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-[26px] border border-[#eadde2] bg-[#fffdfb] p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by cake, flavor, or collection..."
              className="input"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input md:w-48">
              <option value="featured">Featured first</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                  category === item
                    ? "bg-[#332532] text-white"
                    : "border border-[#e4d6dd] bg-[#fff8f5] text-[#594d5b] hover:bg-[#f9e3eb]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-10">
            <LoadingState />
          </div>
        ) : error ? (
          <div className="mt-10">
            <ErrorState message={error} />
          </div>
        ) : (
          <>
            <div className="mt-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold">{cakes.length} cakes</p>
                <p className="mt-1 text-xs text-[#786a76]">
                  Select a design to see details and customize it.
                </p>
              </div>
              <span className="hidden text-xs text-[#786a76] sm:block">
                Live catalog results
              </span>
            </div>

            <div className="mt-5">
              {cakes.length === 0 ? (
                <div className="soft-card p-14 text-center">
                  <p className="section-label">NOTHING FOUND</p>
                  <h2 className="mt-3 font-display text-3xl">Try another search.</h2>
                  <p className="mt-2 text-sm text-[#786a76]">
                    Clear the search or choose another collection.
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                    }}
                    className="btn-secondary mt-6"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {cakes.map((cake) => (
                    <CakeCard key={cake.id} cake={cake} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
