import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin/permissions";
import { logger } from "@/lib/logger";
import { Card, CardBody, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { ArrowLeft, Settings } from "lucide-react";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  // ✅ Utiliser la logique centralisée pour vérifier admin
  const adminStatus = await isAdmin(user.id, user.email || undefined);
  if (!adminStatus) redirect("/demandes");

  // Utiliser admin client pour récupérer les données plus rapidement
  const adminSupabase = createAdminClient();

  // Récupérer demande et analyse en parallèle
  const [demandeResult, analysisResult] = await Promise.all([
    adminSupabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .single(),
    adminSupabase
      .from("ai_analyses")
      .select("*")
      .eq("request_id", id)
      .maybeSingle(),
  ]);

  if (demandeResult.error || !demandeResult.data) {
    notFound();
  }

  const demande = demandeResult.data;
  const ai_analyses = analysisResult.data ? [analysisResult.data] : [];

  // Récupérer les infos utilisateur si user_id existe
  let clientInfo = {
    fullName: "Client anonyme",
    email: demande.email || "",
  };

  if (demande.user_id) {
    try {
      const { data: userData } = await adminSupabase.auth.admin.getUserById(demande.user_id);
      if (userData?.user) {
        clientInfo = {
          fullName:
            userData.user.user_metadata?.full_name ||
            userData.user.email?.split("@")[0] ||
            "Client anonyme",
          email: userData.user.email || demande.email || "",
        };
      }
    } catch (error) {
      logger.error("Error fetching user:", error);
    }
  }

  const status = demande.status as string | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/demandes" prefetch={true} className="mb-6 inline-block">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-5 h-5" />}>
            Retour aux demandes
          </Button>
        </Link>

        <Card variant="elevated" className="p-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">
                  Détails de la demande
                </CardTitle>
                <p className="text-gray-500">
                  ID: <Badge variant="default" size="sm" className="font-mono">
                    #{demande.id.slice(-6)}
                  </Badge>
                </p>
              </div>
              <Badge status={status as any} size="md">
                {status || 'draft'}
              </Badge>
            </div>
          </CardHeader>

          <CardBody>
            <div className="space-y-6">
              <Card variant="bordered" className="bg-orange-50 border-orange-200">
                <CardBody className="p-4">
                  <CardTitle className="text-sm uppercase mb-2 text-orange-700">
                    👤 Client
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900">
                    {clientInfo.fullName}
                  </p>
                  {clientInfo.email && (
                    <p className="text-sm text-gray-600 mt-1">
                      {clientInfo.email}
                    </p>
                  )}
                </CardBody>
              </Card>

              <Card variant="bordered" className="bg-green-50 border-green-200">
                <CardBody className="p-4">
                  <CardTitle className="text-sm uppercase mb-2 text-green-700">
                    📋 Titre du projet
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900">
                    {demande.title}
                  </p>
                </CardBody>
              </Card>

              <Card variant="bordered" className="bg-blue-50 border-blue-200">
                <CardBody className="p-4">
                  <CardTitle className="text-sm uppercase mb-2 text-blue-700">
                    📝 Description
                  </CardTitle>
                  <p className="text-gray-700 leading-relaxed">
                    {demande.description || "Aucune description fournie"}
                  </p>
                </CardBody>
              </Card>

              <Card variant="bordered" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardBody className="p-4">
                  <CardTitle className="text-sm uppercase mb-2 text-green-700">
                    💰 Prix estimé (IA)
                  </CardTitle>
                  <p className="text-3xl font-bold text-green-600">
                    {ai_analyses?.[0]?.estimated_price
                      ? `${ai_analyses[0].estimated_price.toLocaleString()} FCFA`
                      : "Non analysé"}
                  </p>
                  {ai_analyses?.[0]?.analysis_summary && (
                    <p className="text-sm text-gray-600 mt-2">
                      {ai_analyses[0].analysis_summary}
                    </p>
                  )}
                </CardBody>
              </Card>

              <Card variant="bordered" className="bg-gray-50 border-gray-200">
                <CardBody className="p-4">
                  <CardTitle className="text-sm uppercase mb-2 text-gray-700">
                    📅 Date de création
                  </CardTitle>
                  <p className="text-gray-700">
                    {new Date(demande.created_at).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </CardBody>
              </Card>
            </div>

            <div className="mt-8 flex gap-4">
              <Link href={`/admin/gerer/${demande.id}`} prefetch={true} className="flex-1">
                <Button variant="primary" size="lg" className="w-full" leftIcon={<Settings className="w-5 h-5" />}>
                  Gérer cette demande
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
