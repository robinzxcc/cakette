import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getApiError } from "../api";
import type { Promotion } from "../types";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useModal } from "../components/Modal";
import { usePageTitle } from "../hooks/usePageTitle";

const schema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(/^[A-Z0-9]+$/, "Use uppercase letters and numbers only"),
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(300),
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(1).max(10000),
  minimum: z.number().min(0),
  label: z.string().min(1).max(40),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  code: "",
  title: "",
  description: "",
  type: "percent",
  value: 10,
  minimum: 800,
  label: "10% OFF",
  active: true,
};

type PromoRow = Promotion & { _id?: string; expired?: boolean };

export default function ManagePromotions() {
  usePageTitle("Manage Promotions");
  const { show } = useModal();
  const [promotions, setPromotions] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: emptyValues,
  });

  const reload = () => {
    setLoading(true);
    setError("");
    return api
      .get("/promotions")
      .then(({ data }) => setPromotions(data.promotions))
      .catch((err) => setError(getApiError(err, "Could not load promotions.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setFormError("");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/promotions/${editingId}`, values);
        show({ title: "Promotion updated", message: `${values.code} was saved.` });
      } else {
        await api.post("/promotions", values);
        show({ title: "Promotion created", message: `${values.code} is ready to use.` });
      }
      setEditingId(null);
      reset(emptyValues);
      await reload();
    } catch (err) {
      setFormError(getApiError(err, "Could not save promotion."));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (promo: PromoRow) => {
    if (!promo._id) return;
    setEditingId(promo._id);
    reset({
      code: promo.code,
      title: promo.title,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      minimum: promo.minimum,
      label: promo.label,
      active: promo.active,
    });
  };

  const removePromo = (promo: PromoRow) => {
    if (!promo._id) return;
    show({
      title: `Delete ${promo.code}?`,
      message: "Customers will no longer be able to apply this code.",
      confirmLabel: "Delete promotion",
      tone: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/promotions/${promo._id}`);
          show({ title: "Promotion deleted", message: `${promo.code} was removed.` });
          if (editingId === promo._id) setEditingId(null);
          await reload();
        } catch (err) {
          setFormError(getApiError(err, "Could not delete promotion."));
        }
      },
    });
  };

  return (
    <section className="py-14">
      <div className="page-shell">
        <p className="section-label">STUDIO TOOLS</p>
        <h1 className="mt-3 font-display text-5xl">Manage promotions.</h1>
        <p className="mt-4 max-w-2xl text-[#786a76]">
          Create and update promo codes, set minimum spend, and turn offers on or off.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="soft-card space-y-4 p-6">
            <h2 className="font-display text-3xl">{editingId ? "Edit promotion" : "Add promotion"}</h2>
            {formError && <ErrorState message={formError} />}
            <div>
              <label className="label">Code</label>
              <input
                className="input uppercase"
                {...register("code", {
                  setValueAs: (v) => String(v || "").toUpperCase(),
                })}
                disabled={Boolean(editingId)}
              />
              {errors.code && <p className="error-text">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" {...register("title")} />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-24" {...register("description")} />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Type</label>
                <select className="input" {...register("type")}>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input className="input" type="number" {...register("value", { valueAsNumber: true })} />
                {errors.value && <p className="error-text">{errors.value.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Minimum subtotal</label>
                <input className="input" type="number" {...register("minimum", { valueAsNumber: true })} />
                {errors.minimum && <p className="error-text">{errors.minimum.message}</p>}
              </div>
              <div>
                <label className="label">Badge label</label>
                <input className="input" {...register("label")} />
                {errors.label && <p className="error-text">{errors.label.message}</p>}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("active")} /> Active
            </label>
            <div className="flex flex-wrap gap-3">
              <button disabled={!isValid || saving} className="btn-primary disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Update promotion" : "Create promotion"}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); reset(emptyValues); }}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <div>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : promotions.length === 0 ? (
              <div className="soft-card p-10 text-center">
                <h2 className="font-display text-3xl">No promotions yet.</h2>
              </div>
            ) : (
              <div className="space-y-3">
                {promotions.map((promo) => (
                  <div key={promo._id || promo.code} className="soft-card flex flex-wrap items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-display text-2xl">{promo.code}</p>
                      <p className="mt-1 text-xs text-[#786a76]">
                        {promo.title} · {promo.label} · min ₱{promo.minimum.toLocaleString()} ·{" "}
                        {promo.active ? "active" : "inactive"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary" onClick={() => startEdit(promo)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-secondary border-[#e4a1ad] text-[#a44255]"
                        onClick={() => removePromo(promo)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
