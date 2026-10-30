# Sincronización con Supabase: puesta en marcha

La app funciona sin esto: el progreso vive en IndexedDB. Supabase solo añade una copia en la nube
para compartirlo entre dispositivos. Todo es del plan gratuito.

## 1. Proyecto de Supabase

1. Crea un proyecto en <https://supabase.com/dashboard> (región europea, p. ej. Frankfurt).
2. **SQL Editor** → pega y ejecuta [`supabase/migrations/20261030000000_review_cards.sql`](../supabase/migrations/20261030000000_review_cards.sql).
   Crea la tabla `review_cards` con Row Level Security: cada usuario solo ve sus filas.

## 2. App OAuth de GitHub

1. <https://github.com/settings/developers> → **New OAuth App**.
   - Homepage URL: `https://andresfernandeznad.github.io/mi-academia/`
   - Authorization callback URL: `https://<ref-del-proyecto>.supabase.co/auth/v1/callback`
2. Genera un **client secret**. Guárdalo solo en Supabase, nunca en el repositorio.

## 3. Autenticación en Supabase

1. **Authentication → Sign In / Providers → GitHub**: actívalo y pega Client ID y Client secret.
2. **Authentication → URL Configuration**:
   - Site URL: `https://andresfernandeznad.github.io/mi-academia/`
   - Redirect URLs: la misma y `http://localhost:4200/` para desarrollo.

## 4. Conectar la app

1. **Project Settings → API Keys**: copia la *Project URL* y la clave pública (*anon* o *publishable*).
   **Nunca** la `service_role` / *secret*: esa salta RLS.
2. Ponlas en [`app/src/app/sync/supabase.config.ts`](../app/src/app/sync/supabase.config.ts).
   La clave pública puede ir en el frontend: lo que protege los datos es RLS.
3. Secretos del repositorio para el keepalive (el plan gratuito pausa el proyecto tras 7 días sin uso):

   ```bash
   gh secret set SUPABASE_URL
   gh secret set SUPABASE_ANON_KEY
   ```

## Cómo sincroniza

- IndexedDB es la fuente de verdad offline; Supabase, la copia compartida.
- Cada tarjeta lleva `updatedAt`; en un conflicto gana la versión más reciente.
- Sincroniza al entrar, 2 s después de cada respuesta, al recuperar la conexión y al volver a la app.
- Login con flujo PKCE: el token nunca aparece en la URL.
