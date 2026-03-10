import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const userData = {
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
    };

    return (
        <div className="py-8 animate-in fade-in duration-700">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-gray-900 mb-2">Paramètres du Compte</h1>
                <p className="text-gray-500">Mettez à jour vos informations personnelles et vos préférences</p>
            </div>

            <ProfileForm user={userData} />
        </div>
    );
}
