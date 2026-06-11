import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DIFFICULTY_COLORS = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const TAG_STYLES = {
  Donburi: "bg-amber-100 text-amber-800",
  "Yōshoku": "bg-rose-100 text-rose-800",
  default: "bg-stone-100 text-stone-700",
};

const TAG_EMOJIS = {
  Donburi: { emoji: "🍚", bg: "bg-amber-50" },
  "Yōshoku": { emoji: "🍳", bg: "bg-orange-50" },
  default: { emoji: "🥢", bg: "bg-stone-50" },
};

export default async function RecipePage({ params }) {
  const { id } = await params;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) notFound();

  const difficultyColor = DIFFICULTY_COLORS[recipe.difficulty] ?? "bg-stone-100 text-stone-700";
  const tagStyle = TAG_STYLES[recipe.tag] ?? TAG_STYLES.default;
  const { emoji, bg } = TAG_EMOJIS[recipe.tag] ?? TAG_EMOJIS.default;

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {/* Back nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Recipes
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Hero emoji */}
        <div className={`${bg} h-48 flex items-center justify-center text-7xl`}>
          {emoji}
        </div>

        {/* Title block */}
        <div className="mt-6">
          <p className="text-sm text-stone-400 mb-1">{recipe.title_ja}</p>
          <h1 className="text-2xl font-bold text-stone-900 leading-tight">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-3 text-stone-600 leading-relaxed text-sm">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`${tagStyle} text-xs font-medium px-3 py-1.5 rounded-full`}>
            {recipe.tag}
          </span>
          <span className={`${difficultyColor} text-xs font-medium px-3 py-1.5 rounded-full`}>
            {recipe.difficulty}
          </span>
          <span className="bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cook_time} min
          </span>
        </div>

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-stone-900 mb-3">Ingredients</h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-baseline justify-between px-4 py-3">
                  <span className="text-sm text-stone-800">{ing.item}</span>
                  <span className="text-sm font-medium text-stone-500 ml-4 shrink-0">{ing.amount}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-stone-900 mb-3">Instructions</h2>
            <div className="space-y-4">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {recipe.notes?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-stone-900 mb-3">Notes</h2>
            <div className="space-y-3">
              {recipe.notes.map((note, i) => (
                <div key={i} className="flex gap-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                  <span className="text-base shrink-0">💡</span>
                  <p className="text-sm text-stone-700 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
