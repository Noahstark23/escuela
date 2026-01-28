"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        console.log("Enviando credenciales...");

        try {
            // Usamos redirect: false para controlar la respuesta nosotros mismos
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("Respuesta del servidor:", result);

            if (result?.error) {
                // Si el servidor dice explícitamente que hubo error
                setError("Error: " + result.error);
                setLoading(false);
            } else if (result?.ok) {
                // ✅ ¡ÉXITO CONFIRMADO!
                // Forzamos la entrada usando el navegador nativo (Hard Redirect)
                // Esto limpia cualquier basura de memoria y fuerza la recarga
                console.log("Login exitoso. Redirigiendo a la fuerza...");
                window.location.href = "/";
            } else {
                setError("Respuesta inesperada del servidor.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Error en el cliente:", err);
            setError("Error de conexión.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
                    <p className="mt-2 text-sm text-gray-600">School ERP System</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder="admin@school.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Entrando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
}