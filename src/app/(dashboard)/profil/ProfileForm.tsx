"use client";

import { useState } from "react";
import { updateProfile } from "@/app/(auth)/actions";
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Input,
    Button,
    Alert
} from "@/components/ui";
import { User, Save, Loader2, CheckCircle } from "lucide-react";

interface ProfileFormProps {
    user: {
        email?: string;
        full_name?: string;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [fullName, setFullName] = useState(user.full_name || "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("fullName", fullName);

        try {
            const result = await updateProfile(formData);
            if (result?.error) {
                setMessage({ type: "error", text: result.error });
            } else {
                setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Une erreur est survenue lors de la mise à jour." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black">Mon Profil</CardTitle>
                            <p className="text-orange-100 font-medium">Gérez vos informations personnelles</p>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="p-8 space-y-8">
                    {message && (
                        <Alert
                            variant={message.type === "success" ? "success" : "error"}
                            className="rounded-2xl border-2 animate-in fade-in slide-in-from-top-4"
                        >
                            <div className="flex items-center gap-2">
                                {message.type === "success" && <CheckCircle className="w-5 h-5" />}
                                <span>{message.text}</span>
                            </div>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Adresse Email (non modifiable)</label>
                            <Input
                                value={user.email}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 rounded-2xl h-14"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Nom complet</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ex: Jean Kouassi"
                                className="border-2 border-gray-100 focus:border-orange-500 rounded-2xl h-14 transition-all"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || fullName === user.full_name}
                            className="w-full h-16 rounded-2xl text-lg font-black bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Mise à jour...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-6 h-6" />
                                    Enregistrer les modifications
                                </div>
                            )}
                        </Button>
                    </form>
                </CardBody>
            </Card>

            <div className="text-center">
                <p className="text-sm text-gray-400">
                    Besoin d'aide ? <a href="#" className="text-orange-500 font-bold hover:underline">Contactez le support</a>
                </p>
            </div>
        </div>
    );
}
