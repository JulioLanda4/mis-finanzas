# App de finanzas personales

App local y simple para registrar movimientos diarios en menos de 5 minutos.

## Uso en computadora

Abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático.

```powershell
python -m http.server 8000
```

Después entra a `http://localhost:8000`.

## Usarla en iPhone

La app ya está preparada como PWA. Para instalarla en iPhone:

1. Sube esta carpeta a un sitio con `https://`, por ejemplo GitHub Pages, Netlify o Vercel.
2. Abre la URL en Safari desde tu iPhone.
3. Toca el botón de compartir.
4. Elige `Agregar a pantalla de inicio`.

Después aparecerá como una app normal. Los datos se guardan en el iPhone donde la uses, así que conviene exportar un respaldo JSON de vez en cuando.

Importante: abrirla como archivo `file://` sirve para probar en computadora, pero iPhone necesita una URL web para instalarla bien y usar el modo sin conexión.

## Publicarla con GitHub Pages

GitHub Pages es la opción recomendada para empezar porque es gratis, usa `https://` y no requiere servidor.

1. Crea un repositorio nuevo en GitHub, por ejemplo `mis-finanzas`.
2. Sube estos archivos al repositorio.
3. En GitHub entra a `Settings` > `Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. En `Branch`, elige `main` y la carpeta `/root`.
6. Guarda los cambios.
7. Espera uno o dos minutos y abre la URL que GitHub te muestre, normalmente:

```text
https://TU_USUARIO.github.io/mis-finanzas/
```

Desde tu iPhone, abre esa URL en Safari y usa `Compartir` > `Agregar a pantalla de inicio`.

## Qué incluye

- Balance total por cuentas.
- Registro de inversiones separadas del dinero disponible.
- Registro rápido de gastos, ingresos y apartados.
- Gastos por categoría del mes.
- Límites mensuales de gasto y ahorro.
- Historial reciente.
- Exportación/importación de respaldo JSON.
- Descarga CSV de movimientos.
- Instalación en iPhone como PWA.
- Cache básico para abrirla sin conexión después de instalarla.

Los datos se guardan en `localStorage` del navegador. Exporta un respaldo JSON periódicamente si quieres mover la información a otra computadora o navegador.
