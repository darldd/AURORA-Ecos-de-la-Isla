# AURORA: Ecos de la Isla — prototipo jugable

Un pequeño juego 3D de exploración creado con Three.js. Incluye una isla procedural, personaje controlable, NPC con diálogo, misión de tres cristales, inventario, enemigo sencillo, combate, interfaz y guardado local.

## Ejecutar en Windows 11
1. Instala Node.js LTS desde https://nodejs.org/ (si no lo tienes).
2. Descarga el repositorio con **Code → Download ZIP** y extrae el archivo, o clónalo:
   `git clone https://github.com/darldd/AURORA-Ecos-de-la-Isla.git`
3. Abre una terminal dentro de la carpeta del proyecto.
4. Ejecuta:
   ```powershell
   npm install
   npm run dev
   ```
5. Abre la URL local que indique Vite (normalmente http://127.0.0.1:5173).

## Controles
- WASD / flechas: moverse
- Ratón: orientar la cámara (haz clic en el juego para capturar el ratón)
- Shift: correr
- Espacio: saltar
- E: hablar / recoger
- Clic izquierdo: atacar cuando la sombra esté cerca
- I: inventario · J: misiones · K: guardar · Esc: pausa

## Guardado
La partida se guarda en localStorage del navegador. Para conservarla, vuelve a usar el mismo navegador y la misma dirección local.

## Alcance y limitaciones
Esta es una primera versión jugable, no un juego comercial final. El escenario y los personajes usan geometría procedural sencilla; todavía no incluye audio ni modelos artísticos externos. Three.js se carga desde CDN, así que hace falta conexión a Internet al iniciar. El código se ha generado, pero no se afirma que se haya probado visualmente en tu PC.