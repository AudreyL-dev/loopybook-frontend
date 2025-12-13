// src/pages/Login.jsx

function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();

    // Pour l'instant : simple log dans la console
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const pinCode = formData.get("pinCode");

    console.log("Tentative de connexion :", { email, pinCode });
    // Plus tard : appel à l'API backend d'authentification parent
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">
          LoopyBook – Espace Parent
        </h1>

        <p className="text-sm text-slate-600 text-center mb-8">
          Connectez-vous pour gérer les livres sélectionnés par vos enfants.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-800"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="parent@example.com"
            />
          </div>

          {/* Champ code PIN */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pinCode"
              className="text-sm font-medium text-slate-800"
            >
              Code PIN
            </label>
            <input
              id="pinCode"
              name="pinCode"
              type="password"
              required
              minLength={4}
              maxLength={6}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 tracking-widest"
              placeholder="••••"
            />
            <p className="text-xs text-slate-500">
              Votre code PIN parent (4 à 6 chiffres).
            </p>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700 transition"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500 text-center">
          LoopyBook – Projet CDA / LoopyBook Backend (API) + Frontend React.
        </p>
      </div>
    </div>
  );
}

export default Login;
