import { withAuth } from "next-auth/middleware";

export default withAuth({
    // CLAVE MAESTRA HARDCODED: Vital para que funcione en Windows
    secret: "clave_maestra_escolar_2025",

    pages: {
        signIn: "/login",
    },
});

export const config = {
    // Protege todo EXCEPTO login, api, y archivos estáticos
    matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
