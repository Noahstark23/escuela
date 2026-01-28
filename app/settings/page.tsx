import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategories, getUsers } from "@/actions/settings";
import { CategoriesTab } from "@/components/settings/categories-tab";
import { UsersTab } from "@/components/settings/users-tab";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const categories = await getCategories();
    const users = await getUsers();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>

            <Tabs defaultValue="categories" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="categories">Categorías Financieras</TabsTrigger>
                    {session.user?.role === "ADMIN" && (
                        <TabsTrigger value="users">Usuarios</TabsTrigger>
                    )}
                </TabsList>
                <TabsContent value="categories" className="space-y-4">
                    <CategoriesTab categories={categories} />
                </TabsContent>
                <TabsContent value="users" className="space-y-4">
                    <UsersTab users={users} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
