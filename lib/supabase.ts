// Configuración del cliente Supabase (base de datos en la nube)
// Se conectará a la base de datos real cuando estén disponibles las variables de entorno

// URL del proyecto Supabase obtenida desde las variables de entorno
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Clave anónima (pública) para autenticar las peticiones desde el cliente
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
