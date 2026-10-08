import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { addOns, designs, fillings, flavors, sizes } from "../data";
import { api, getApiError } from "../api";
import { useCakes } from "../hooks/useCakes";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { usePageTitle } from "../hooks/usePageTitle";
import { useModal } from "../components/Modal";

const priceOf = (items: { name: string; price: number }[], name: string) =>
  items.find((item) => item.name === name)?.price ?? 0;

export default function OrderSummary() {
  usePageTitle("Order Summary");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { show } = useModal();
  const { cakes, loading, error: cakesError } = useCakes();
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const cake = cakes.find((item) => item.id === params.get("cake")) ?? cakes[0];
  const selectedAddOns = params.get("addons")?.split(",").filter(Boolean) ?? [];
  const subtotal = Number(params.get("subtotal") ?? 0);
  const discount = Number(params.get("discount") ?? 0);
  const total = Number(params.get("total") ?? Math.max(0, subtotal - discount));
  const promo = params.get("promo") ?? "";
  const pickupDate = params.get("pickupDate") ?? "";

  const lines = [
    [params.get("size") ?? "6-inch", priceOf(sizes, params.get("size") ?? "6-inch")],
    [params.get("flavor") ?? "Vanilla", priceOf(flavors, params.get("flavor") ?? "Vanilla")],
    [params.get("filling") ?? "None", priceOf(fillings, params.get("filling") ?? "None")],
    [params.get("design") ?? "Minimalist", priceOf(designs, params.get("design") ?? "Minimalist")],
    ...selectedAddOns.map((name) => [name, priceOf(addOns, name)]),
  ] as [string, number][];

  const placeOrder = () =>
    show({
      title: "Place this order?",
      message: `We’ll reserve ${pickupDate} for your ${cake?.name} and submit it for bakery confirmation.`,
      confirmLabel: "Place order",
      onConfirm: async () => {
        if (!cake) return;
        setError("");
        setPlacing(true);
        try {
          const { data } = await api.post("/orders", {
            pickupDate,
            specialInstructions: params.get("instructions") ?? "",
            configuration: {
              cakeId: cake.id,
              size: params.get("size"),
              flavor: params.get("flavor"),
              filling: params.get("filling"),
              design: params.get("design"),
              addOns: selectedAddOns,
              promoCode: promo,
            },
          });
          navigate(`/confirmation?order=${data.order.id}`);
        } catch (e) {
          setError(getApiError(e, "We couldn't place your order."));
        } finally {
          setPlacing(false);
        }
      },
    });

  if (loading) {
    return (
      <section className="py-14">
        <div className="page-shell">
          <LoadingState />
        </div>
      </section>
    );
  }

  if (cakesError || !cake) {
    return (
      <section className="py-14">
        <div className="page-shell">
          <ErrorState message={cakesError || "We couldn't find that cake configuration."} />
          <Link to="/customize" className="btn-secondary mt-6 inline-flex">
            Back to customize
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14">
      <div className="page-shell">
        <div className="max-w-2xl">
          <p className="section-label">ALMOST THERE</p>
          <h1 className="mt-3 font-display text-5xl">Review your order.</h1>
          <p className="mt-4 text-[#786a76]">Check the details before submitting your cake order.</p>
        </div>
        {error && <p className="error-text mt-6">{error}</p>}
        <div className="mt-10 grid gap-7 lg:grid-cols-[1fr_380px]">
          <div className="soft-card p-7">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="h-32 w-full overflow-hidden rounded-[18px] bg-[#f9e3eb] sm:w-40">
                <img src={cake.image} alt={cake.name} className="h-full w-full object-contain p-3" />
              </div>
              <div>
                <p className="section-label">{cake.category}</p>
                <h2 className="mt-1 font-display text-3xl">{cake.name}</h2>
                <p className="mt-2 text-sm text-[#786a76]">
                  Pickup date: <strong>{pickupDate}</strong>
                </p>
              </div>
            </div>
            <div className="mt-8 border-t border-[#eadde2] pt-6">
              <h3 className="text-sm font-bold">Cake configuration</h3>
              <div className="mt-4 space-y-3">
                {lines.map(([name, price]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-[#786a76]">{name}</span>
                    <span>₱{price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            {params.get("instructions") && (
              <div className="mt-7 rounded-[18px] bg-[#fff1f5] p-5">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-[#9a6246]">Special instructions</p>
                <p className="mt-2 text-sm leading-6">{params.get("instructions")}</p>
              </div>
            )}
          </div>
          <aside className="h-fit rounded-[24px] bg-[#332532] p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f3b7cf]">Order total</p>
            <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Pickup</span>
                <span>{pickupDate}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#f4c3d6]">
                  <span>Discount {promo && `· ${promo}`}</span>
                  <span>-₱{discount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₱{total.toLocaleString()}</span>
            </div>
            <button
              disabled={placing || !pickupDate}
              onClick={placeOrder}
              className="mt-7 w-full rounded-full bg-[#e7a8be] px-5 py-3 font-bold text-[#332532] disabled:opacity-50"
            >
              {placing ? "Submitting…" : "Place order"}
            </button>
            <Link to="/customize" className="mt-3 block text-center text-xs text-white/60">
              Edit customization
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
