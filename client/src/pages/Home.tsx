import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CakeCard from "../components/CakeCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { occasions } from "../data";
import type { Promotion } from "../types";
import { api, getApiError } from "../api";
import { useCakes } from "../hooks/useCakes";
import { usePageTitle } from "../hooks/usePageTitle";

const highlights = [
  ["01", "Build it your way", "Choose the cake size, flavor, filling, design, and little extras that fit your celebration."],
  ["02", "Know the price", "Your selected options are combined into a live estimated total before you place the order."],
  ["03", "Pick your date", "Available pickup dates reflect daily production capacity, helping avoid overbooked days."],
];

export default function Home() {
  usePageTitle("Home");
  const { cakes, loading, error } = useCakes();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    api
      .get("/promotions?active=true")
      .then(({ data }) => setPromotions(data.promotions))
      .catch((err) => setPromoError(getApiError(err, "Could not load promotions.")));
  }, []);

  const popular = cakes.filter((cake) => cake.popular).slice(0, 6);

  return (
    <>
      <section className="hero-surface">
        <div className="page-shell grid min-h-[620px] items-center gap-10 py-16 md:grid-cols-[1.05fr_.95fr] md:py-20">
          <div className="relative z-10">
            <span className="eyebrow-chip">custom cakes · soft details · made for you</span>
            <p className="section-label mt-8">YOUR CELEBRATION, YOUR WAY</p>
            <h1 className="mt-4 max-w-2xl font-display text-[42px] leading-[.96] tracking-[-0.055em] sm:text-[58px] md:text-[82px]">
              a cake that feels
              <br />
              <span className="italic text-[#d98daa]">like you.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#786a76] md:text-lg">
              Start with a cake you love, customize the details, choose a pickup date, and see your estimated price before you order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/customize" className="btn-primary">Start customizing →</Link>
              <Link to="/cakes" className="btn-secondary">Browse the collection</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-[#786a76]">
              <span>Live price calculation</span>
              <span>Pickup availability</span>
              <span>Order tracking</span>
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center">
            <div className="pastel-orb h-[360px] w-[360px] bg-[#e4eee0] md:h-[430px] md:w-[430px]" />
            <div className="pastel-orb h-[260px] w-[260px] bg-[#f9dce7] shadow-[0_30px_80px_rgba(217,141,170,.18)]" />
            <div className="pastel-orb h-[155px] w-[155px] bg-[#eee9f8]" />
            <div className="absolute left-[8%] top-[14%] h-4 w-4 rounded-full bg-[#f3d99a]" />
            <div className="absolute right-[11%] top-[26%] h-3 w-3 rounded-full bg-[#a99ad9]" />
            <div className="absolute bottom-[15%] left-[17%] h-2 w-2 rounded-full bg-[#d98daa]" />
            <div className="relative z-10 w-[270px] rotate-[-3deg] rounded-[30px] border border-white/70 bg-[#fffdfb]/85 p-7 text-center shadow-[0_25px_70px_rgba(72,45,64,.10)] backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b45f7e]">Cakette studio</p>
              <p className="mt-4 font-display text-4xl leading-tight">made around your moment</p>
              <div className="mx-auto mt-5 h-px w-14 bg-[#d98daa]" />
              <p className="mt-4 text-xs leading-5 text-[#786a76]">Choose a base. Add your details. Let the celebration take shape.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-line bg-[#fffdfb] py-3">
        <div className="page-shell flex flex-wrap justify-between gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#8a7380]">
          <span>custom sizes</span><span>pastel designs</span><span>fresh fillings</span><span>scheduled pickup</span><span>personal touches</span>
        </div>
      </div>

      <section className="bg-[#fffdfb] py-20 md:py-24">
        <div className="page-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="section-label">A LITTLE SWEETNESS</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight md:text-5xl">Start with a cake, then make it yours.</h2>
            </div>
            <Link to="/cakes" className="text-sm font-bold text-[#a99ad9]">See all cakes →</Link>
          </div>
          <div className="mt-10">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : popular.length === 0 ? (
              <div className="soft-card p-12 text-center">
                <h2 className="font-display text-3xl">No popular cakes yet.</h2>
                <p className="mt-2 text-sm text-[#786a76]">Browse the full collection to start customizing.</p>
                <Link to="/cakes" className="btn-secondary mt-6 inline-flex">
                  Browse cakes
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {popular.map((cake) => (
                  <CakeCard key={cake.id} cake={cake} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f9e3eb] py-20">
        <div className="page-shell grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="section-label">CHOOSE THE MOOD</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">What are we celebrating?</h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#765d6d]">
              Browse by occasion, then use the customizer to turn the starting design into something personal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {occasions.map((occasion, index) => (
              <Link key={occasion} to="/cakes" className="rounded-[22px] border border-white/70 bg-[#fffdfb]/75 p-5 transition hover:-translate-y-1 hover:bg-white">
                <span className="text-[10px] font-bold tracking-[.15em] text-[#b45f7e]">0{index + 1}</span>
                <p className="mt-7 font-display text-xl">{occasion}</p>
                <p className="mt-2 text-xs text-[#786a76]">Explore designs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff8f5] py-20 md:py-24">
        <div className="page-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="section-label">CURRENT PROMOTIONS</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">A little extra sweetness.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#786a76]">Use an eligible code during customization. The system checks the minimum order and calculates the discount automatically.</p>
            </div>
            <Link to="/promotions" className="text-sm font-bold text-[#a05f7b]">View all offers →</Link>
          </div>
          <div className="mt-9">
            {promoError ? (
              <ErrorState message={promoError} />
            ) : promotions.length === 0 ? (
              <div className="soft-card p-10 text-center">
                <h3 className="font-display text-2xl">No active promotions right now.</h3>
                <p className="mt-2 text-sm text-[#786a76]">You can still customize a cake at full price.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {promotions.slice(0, 3).map((promo) => (
                  <Link
                    key={promo.id || promo.code}
                    to={`/customize?promo=${promo.code}`}
                    className="soft-card group p-6 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a05f7b]">{promo.code}</p>
                        <h3 className="mt-2 font-display text-2xl">{promo.title}</h3>
                      </div>
                      <span className="rounded-full bg-[#332532] px-3 py-1 text-[10px] font-bold text-white">
                        {promo.label}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#786a76]">{promo.description}</p>
                    <p className="mt-5 text-xs font-bold text-[#a05f7b]">
                      Minimum ₱{promo.minimum.toLocaleString()} · Use offer →
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="page-shell">
          <div className="max-w-2xl">
            <p className="section-label">THE CAKETTE FLOW</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Simple from idea to pickup.</h2>
            <p className="mt-4 text-sm leading-6 text-[#786a76]">The system handles the details that normally make custom ordering feel complicated.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map(([number, title, text]) => (
              <div key={number} className="soft-card p-7">
                <span className="text-xs font-bold tracking-[.15em] text-[#b45f7e]">{number}</span>
                <h3 className="mt-4 font-display text-3xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#786a76]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="page-shell">
          <div className="pastel-panel-lilac overflow-hidden rounded-[32px] p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="section-label">READY WHEN YOU ARE</p>
                <h2 className="mt-3 max-w-2xl font-display text-4xl md:text-5xl">Your next celebration can start with one choice.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#665b76]">Pick a starting cake and use the builder to experiment with flavors, designs, and finishing touches.</p>
              </div>
              <Link to="/customize" className="btn-primary">Build my cake →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
