# RIU Frontend - Candela Landi

Aplicación SPA desarrollada con Angular 22 para gestionar superhéroes mediante listado, búsqueda, creación, edición y eliminación.

## Ejecución

Instalar las dependencias e iniciar la aplicación:

```bash
npm ci
npm start
```

Disponible en `http://localhost:4200`.

## Tests

```bash
npm test -- --watch=false
```

## Build

```bash
npm run build
```

## Docker

Construir la imagen:

```bash
docker build -t riu-frontend-candela-landi .
```

Ejecutar el contenedor:

```bash
docker run --rm -p 8080:80 riu-frontend-candela-landi
```

Disponible en `http://localhost:8080`.

