"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logger } from "@/lib/logger";
import Logo from "@/components/Logo";
import { Card, CardBody, CardHeader, CardTitle, Input, Button, Alert } from "@/components/ui";
import { Camera, Save, LogOut } from "lucide-react";

type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  gender: "male" | "female";
  phone: string;
  company: string;
};

export default function ProfilContent({ user }: { user: User }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [gender, setGender] = useState<"male" | "female">(user.gender);
  const [phone, setPhone] = useState(user.phone);
  const [company, setCompany] = useState(user.company);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // Synchroniser avatarUrl avec les props
  useEffect(() => {
    setAvatarUrl(user.avatarUrl);
  }, [user.avatarUrl]);

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      setMessage("❌ Veuillez sélectionner une image valide");
      return;
    }
  
    if (file.size > 2 * 1024 * 1024) {
      setMessage("❌ La photo doit faire moins de 2MB");
      return;
    }
  
    setUploading(true);
    setMessage("⏳ Upload en cours...");
  
    try {
      const supabase = createClient();
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (!session) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }
  
      logger.log("✅ Session active:", session.user.email);
  
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
  
      logger.log("📤 Upload vers:", filePath);
  
      // Supprimer l'ancienne photo
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);
  
      if (existingFiles && existingFiles.length > 0) {
        logger.log("🗑️ Suppression de l'ancienne photo...");
        const filesToRemove = existingFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToRemove);
      }
  
      // Upload du nouveau fichier
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
  
      if (uploadError) {
        logger.error("❌ Erreur upload:", uploadError);
        throw new Error(uploadError.message);
      }
  
      logger.log("✅ Upload réussi:", uploadData);
  
      // Obtenir l'URL publique avec timestamp pour forcer le refresh
      const timestamp = new Date().getTime();
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
  
      const finalUrl = `${publicUrl}?t=${timestamp}`;
  
      logger.log("🔗 URL publique:", finalUrl);
  
      // Mettre à jour l'état local pour affichage immédiat
      setAvatarUrl(finalUrl);
  
      // Sauvegarder automatiquement dans user_metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl, // Sans timestamp pour la base
        },
      });
  
      if (updateError) {
        logger.warn("⚠️ Impossible de sauvegarder l'URL dans metadata:", updateError);
      } else {
        logger.log("✅ URL sauvegardée dans user_metadata");
      }
  
      setMessage("✅ Photo uploadée et sauvegardée !");
    } catch (error: any) {
      logger.error("❌ Erreur complète:", error);
  
      let errorMessage = "Échec de l'upload";
  
      if (error.message.includes("policy")) {
        errorMessage = "Permissions insuffisantes. Contactez le support.";
      } else if (error.message.includes("Session")) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      setMessage(`❌ Erreur : ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };  

  // Mettre à jour le profil
  const handleUpdateProfile = async () => {
    setUpdating(true);
    setMessage("");
  
    try {
      const supabase = createClient();
  
      // ✅ Préparer les données avec l'avatar actuel
      const updateData = {
        full_name: fullName,
        gender,
        phone,
        company,
        avatar_url: avatarUrl, // ✅ Sauvegarder l'URL de l'avatar
      };
  
      logger.log("💾 Données à sauvegarder:", updateData);
  
      const { error } = await supabase.auth.updateUser({
        data: updateData,
      });
  
      if (error) throw error;
  
        logger.log("✅ Profil sauvegardé avec succès");
      setMessage("✅ Profil mis à jour avec succès !");
      
      // ✅ Rafraîchir la page après 1 seconde pour recharger les données
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      logger.error("❌ Erreur sauvegarde:", error);
      setMessage(`❌ Erreur : ${error.message}`);
    } finally {
      setUpdating(false);
    }
  }; 

  // Déconnexion
  const handleLogout = async () => {
    const { createBrowserClient } = await import("@supabase/ssr");
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const defaultAvatar =
    gender === "female"
      ? "https://api.dicebear.com/7.x/avataaars/svg?seed=female&backgroundColor=ffa500"
      : "https://api.dicebear.com/7.x/avataaars/svg?seed=male&backgroundColor=0ea5e9";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" href="/" showText={false} />
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  Mon Profil
                </p>
                <h1 className="text-xl font-black text-gray-900">
                  Paramètres du compte
                </h1>
              </div>
            </div>
            <Link
              href="/demandes"
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-semibold"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert
            variant={message.includes("✅") ? "success" : "error"}
            className="mb-6"
          >
            {message}
          </Alert>
        )}

        <Card variant="elevated" className="overflow-hidden">
          {/* Section Avatar */}
<div className="bg-gradient-to-r from-orange-500 via-sky-500 to-green-500 px-8 py-12 text-center">
  <div className="relative inline-block">
    <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
      {avatarUrl && avatarUrl.trim() !== "" ? (
        <Image
          src={avatarUrl}
          alt="Avatar utilisateur"
          width={128}
          height={128}
          className="w-full h-full object-cover"
          unoptimized
          onError={(e) => {
            // Fallback en cas d'erreur de chargement
            const target = e.target as HTMLImageElement;
            target.src = defaultAvatar;
          }}
        />
      ) : (
        <Image
          src={defaultAvatar}
          alt="Avatar par défaut"
          width={128}
          height={128}
          className="w-full h-full object-cover"
          unoptimized
        />
      )}
    </div>
    <label
      htmlFor="avatar-upload"
      className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-lg"
    >
      <Camera className="w-5 h-5 text-gray-600" />
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploading}
        className="hidden"
      />
    </label>
  </div>
  <h2 className="text-2xl font-black text-white mt-4">
    {fullName || "Utilisateur"}
  </h2>
  <p className="text-white/90 text-sm mt-1">{user.email}</p>
</div>

          {/* Formulaire */}
          <CardBody className="p-8 space-y-6">
            {/* Nom complet */}
            <Input
              type="text"
              label="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jean Dupont"
              required
            />

            {/* Sexe */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Sexe
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    gender === "male"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">👨</span>
                  <span className="font-bold">Homme</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    gender === "female"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">👩</span>
                  <span className="font-bold">Femme</span>
                </button>
              </div>
            </div>

            {/* Téléphone */}
            <Input
              type="tel"
              label="Téléphone (optionnel)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 XX XX XX XX XX"
            />

            {/* Entreprise */}
            <Input
              type="text"
              label="Entreprise (optionnel)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nom de votre entreprise"
            />

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={updating || uploading}
                isLoading={updating}
                variant="primary"
                size="lg"
                leftIcon={!updating ? <Save className="w-5 h-5" /> : undefined}
                className="flex-1"
              >
                {updating ? "Enregistrement..." : "Sauvegarder"}
              </Button>
              <Button
                onClick={handleLogout}
                variant="danger"
                size="lg"
                leftIcon={<LogOut className="w-5 h-5" />}
              >
                Déconnexion
              </Button>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
