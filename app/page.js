import Link from "next/link";
import { supabase } from "@/lib/supabase";

const TAG_STYLES = {
  Donburi: "bg-amber-100 text-amber-800",
  "Yōshoku": "bg-rose-100 text-rose-800",
  default: "bg-stone-100 text-stone-700",
};

const DIFFICULTY_COLORS = {
  Easy: "text-emerald-600",
  Medium: "text-amber-600",
  Hard: "text-red-600",
};

const TAG_EMOJIS = {
  Donburi: { emoji: "🍚", bg: "bg-amber-50" },
  "Yōshoku": { emoji: "🍳", bg: "bg-orange-50" },
  default: { emoji: "🥢", bg: "bg-stone-50" },
};

export default async function Home() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, title_ja, tag, difficulty, cook_time")
    .order("created_at", { ascending: true });

  if (error) console.error("Failed to fetch recipes:", error.message);

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-medium tracking-widest text-stone-400 uppercase">
                和食
              </span>
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                Washoku
              </h1>
            </div>
            <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white text-sm font-bold select-none">
              和
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-stone-100 text-stone-800 placeholder-stone-400 text-sm outline-none focus:ring-2 focus:ring-rose-300 transition"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-stone-800">
            Popular Recipes
          </h2>
          <span className="text-sm text-stone-400">
            {recipes?.length ?? 0} recipes
          </span>
        </div>

        {/* Recipe grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {recipes?.map((recipe) => {
            const tagStyle = TAG_STYLES[recipe.tag] ?? TAG_STYLES.default;
            const difficultyColor = DIFFICULTY_COLORS[recipe.difficulty] ?? "text-stone-500";
            const { emoji, bg } = TAG_EMOJIS[recipe.tag] ?? TAG_EMOJIS.default;

            return (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 active:scale-[0.98] transition-transform"
              >
                {/* Emoji banner */}
                <div className={`${bg} h-28 flex items-center justify-center text-5xl`}>
                  {emoji}
                </div>

                {/* Card content */}
                <div className="p-4">
                  <p className="text-xs text-stone-400 mb-0.5">{recipe.title_ja}</p>
                  <h3 className="font-semibold text-stone-900 text-base leading-snug group-hover:text-rose-600 transition-colors">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`${tagStyle} text-xs font-medium px-2.5 py-1 rounded-full`}>
                      {recipe.tag}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {recipe.cook_time} min
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`text-xs font-medium ${difficultyColor}`}>●</span>
                    <span className="text-xs text-stone-500">{recipe.difficulty}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
