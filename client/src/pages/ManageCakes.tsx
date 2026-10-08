import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getApiError } from "../api";
import { mapCake, useCakes } from "../hooks/useCakes";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useModal } from "../components/Modal";
import { usePageTitle } from "../hooks/usePageTitle";

const categories = ["Fruity", "Classic", "Specialty", "Chocolate", "Celebration", "Y2K"] as const;

const schema = z.object({
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().min(100, "Minimum price is 100").max(20000),
  category: z.enum(categories),
  tone: z.enum(["pink", "yellow", "green", "lilac", "blue", "rose"]),
  imageFile: z.string().min(1, "Image filename is required"),
  stock: z.number().min(0).max(500),
  popular: z.boolean(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  slug: "",
  name: "",
  description: "",
  basePrice: 650,
  category: "Classic",
  tone: "pink",
  imageFile: "vanilla-dream.png",
  stock: 10,
  popular: false,
  active: true,
};

export default function ManageCakes() {
  usePageTitle("Manage Menu");
  const { cakes, loading, error, reload } = useCakes();
  const { show } = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
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

  useEffect(() => {
    if (!editingId) reset(emptyValues);
  }, [editingId, reset]);

  const onSubmit = async (values: FormValues) => {
    setFormError("");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/cakes/${editingId}`, values);
        show({ title: "Cake updated", message: `${values.name} was saved to the menu.` });
      } else {
        await api.post("/cakes", values);
        show({ title: "Cake created", message: `${values.name} was added to the menu.` });
      }
      setEditingId(null);
      reset(emptyValues);
      await reload();
    } catch (err) {
      setFormError(getApiError(err, "Could not save cake."));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cake: ReturnType<typeof mapCake>) => {
    if (!cake.mongoId) return;
    setEditingId(cake.mongoId);
    reset({
      slug: cake.id,
      name: cake.name,
      description: cake.description,
      basePrice: cake.basePrice,
      category: cake.category as FormValues["category"],
      tone: (cake.tone || "pink") as FormValues["tone"],
      imageFile: cake.imageFile || `${cake.id}.png`,
      stock: cake.stock ?? 0,
      popular: Boolean(cake.popular),
      active: cake.active !== false,
    });
  };

  const removeCake = (cake: ReturnType<typeof mapCake>) => {
    if (!cake.mongoId) return;
    show({
      title: `Delete ${cake.name}?`,
      message: "This permanently removes the cake from the menu if it has no active orders.",
      confirmLabel: "Delete cake",
      tone: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/cakes/${cake.mongoId}`);
          show({ title: "Cake deleted", message: `${cake.name} was removed.` });
          if (editingId === cake.mongoId) setEditingId(null);
          await reload();
        } catch (err) {
          setFormError(getApiError(err, "Could not delete cake."));
        }
      },
    });
  };

  return (
    <section className="py-14">
      <div className="page-shell">
        <p className="section-label">STUDIO TOOLS</p>
        <h1 className="mt-3 font-display text-5xl">Manage menu.</h1>
        <p className="mt-4 max-w-2xl text-[#786a76]">
          Add new cakes, update details and stock, or remove items from the menu.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="soft-card space-y-4 p-6">
            <h2 className="font-display text-3xl">{editingId ? "Edit cake" : "Add cake"}</h2>
            {formError && <ErrorState message={formError} />}
            <div>
              <label className="label">Slug</label>
              <input className="input" {...register("slug")} disabled={Boolean(editingId)} />
              {errors.slug && <p className="error-text">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="label">Name</label>
              <input className="input" {...register("name")} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-24" {...register("description")} />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Base price</label>
                <input className="input" type="number" {...register("basePrice", { valueAsNumber: true })} />
                {errors.basePrice && <p className="error-text">{errors.basePrice.message}</p>}
              </div>
              <div>
                <label className="label">Stock</label>
                <input className="input" type="number" {...register("stock", { valueAsNumber: true })} />
                {errors.stock && <p className="error-text">{errors.stock.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Category</label>
                <select className="input" {...register("category")}>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tone</label>
                <select className="input" {...register("tone")}>
                  {["pink", "yellow", "green", "lilac", "blue", "rose"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Image filename</label>
              <input className="input" {...register("imageFile")} />
              {errors.imageFile && <p className="error-text">{errors.imageFile.message}</p>}
            </div>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("popular")} /> Popular
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("active")} /> Active
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button disabled={!isValid || saving} className="btn-primary disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Update cake" : "Create cake"}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>
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
            ) : cakes.length === 0 ? (
              <div className="soft-card p-10 text-center">
                <h2 className="font-display text-3xl">No cakes yet.</h2>
                <p className="mt-2 text-sm text-[#786a76]">Create your first menu item on the left.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cakes.map((cake) => (
                  <div key={cake.id} className="soft-card flex flex-wrap items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-display text-2xl">{cake.name}</p>
                      <p className="mt-1 text-xs text-[#786a76]">
                        {cake.category} · ₱{cake.basePrice.toLocaleString()} · stock {cake.stock ?? 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary" onClick={() => startEdit(cake)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-secondary border-[#e4a1ad] text-[#a44255]"
                        onClick={() => removeCake(cake)}
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
