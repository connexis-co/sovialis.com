# Search Console: corrección del marcado de reseñas · 8 de octubre de 2026

La cuenta de servicio proporcionada tiene permiso `siteOwner` sobre `sc-domain:sovialis.com`.
El MCC y el token de programador de Google Ads no son necesarios para Search Console y no se usaron.
Las credenciales permanecen fuera del repositorio.

## Hallazgo y corrección publicada

Google identifica `El tipo de objeto del campo "<parent_node>" no es válido` al encontrar
`aggregateRating` dentro de `Service`. El grafo duplicaba el mismo promedio en `Service` y `Product`.
Se conserva únicamente en `Product`, condicionado al ajuste SEO, al mínimo de votos configurado
y a un promedio finito de 1–5 con un recuento entero positivo. No se generan votos ni reseñas.

`Service`, `BlogPosting`, `Organization` y `LocalBusiness` no reciben `aggregateRating`.
Las estrellas visibles de servicios, zonas y guías y sus votos almacenados se conservan.
Se corrigieron las etiquetas del panel SEO para explicar este alcance sin prometer estrellas en Google.

La inspección histórica de Google muestra el problema en:

- `/servicios/auxiliar-de-enfermeria/`
- `/servicios/cuidado-por-horas/`
- `/servicios/acompanamiento-hospitalario/`

El tercer caso pasó a estar indexado durante la auditoría, con un rastreo anterior a la corrección.
La comprobación del HTML publicado confirma que las tres páginas ya no emiten la calificación en Service.

## Verificación

- Despliegue: `d1a9f302-1c92-41e6-8ba4-ff80fffd4ed7`; caché de Cloudflare purgada.
- Astro: 0 errores, 0 advertencias, 5 sugerencias existentes.
- Cuatro pruebas de regresión pasan: calificación exclusiva de Product, tipos no admitidos,
  datos numéricos inválidos y ausencia de reseñas propias del negocio.
- 48 URLs del sitemap comprobadas después del despliegue: HTTP correcto, JSON-LD legible,
  imagen OG presente y ningún agregado en tipos no elegibles de este sitio. Estos controles locales
  no sustituyen una validación completa de Google de todos los campos del grafo.
- Nueve servicios: precio COP conservado, estrellas visibles y tarjeta OG JPEG accesible (HTTP 200).
- Sitemap enviado mediante la API de Google: operación aceptada. Sitemap principal y de páginas:
  0 errores y 0 advertencias en Search Console.

## Estado de Google después del envío

| Estado de indexación | URLs |
| --- | ---: |
| Enviada e indexada | 39 |
| Descubierta: actualmente sin indexar | 7 |
| Google no reconoce esta URL | 2 |

La API de inspección todavía devuelve **3 errores históricos de reseñas** y **29 advertencias**.
Es el resultado del último rastreo, no el HTML actual. Los informes solo se actualizarán cuando
Google vuelva a rastrear y procese la corrección; enviar el sitemap no garantiza indexación ni
inicia la validación del informe de mejoras. La API pública no ofrece el botón «Validar corrección»
ni solicitudes generales de indexación.

Las advertencias de `review`/`aggregateRating` no se completan cuando faltan datos suficientes.
`shippingDetails`, `hasMerchantReturnPolicy` y `validFrom` son datos recomendados de comercio:
no se inventaron envíos, políticas de devolución de mercancías ni fechas de promoción para estos
servicios domiciliarios. La ausencia de esos campos recomendados no equivale al error crítico.
La prueba pública en vivo de resultados enriquecidos pidió inicio de sesión y no se completó;
la verificación publicada se realizó leyendo el HTML y con las pruebas automatizadas.

## Repetir la auditoría

```sh
GSC_SERVICE_ACCOUNT=/ruta/cuenta-de-servicio.json npm run gsc:audit -- --output /ruta/informe.json
npm run test:seo
```

Añadir `--submit-sitemap` envía el sitemap. Sin esa opción, la auditoría es de lectura.
El script guarda únicamente datos de Sovialis y nunca el JWT, token OAuth ni clave privada.

Referencias: [tipos admitidos para reseñas de Google](https://developers.google.com/search/docs/appearance/structured-data/review-snippet),
[requisitos de Product](https://developers.google.com/search/docs/appearance/structured-data/product-snippet),
[inspección de la versión indexada](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect).
