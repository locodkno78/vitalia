Vitalia Salud Comunitaria -- Actividad 2
Aplicación web desarrollada con React, TypeScript y Vite para
gestionar turnos, pacientes y datos maestros de un centro de salud
comunitario. El proyecto se enfoca en una interfaz modular, componentes
reutilizables, validaciones de negocio y adaptación a distintos tamaños
de pantalla.
1. Tecnologías
- React 19: construcción de interfaces mediante componentes.
- TypeScript 5: tipado estático de datos, propiedades y funciones.
- Vite 8: servidor de desarrollo y compilación.
- Lucide React: iconografía.
- CSS: estilos globales, estilos por componente y tokens de
  diseño.
- JSON: datos ficticios iniciales para pacientes, turnos,
  especialidades, profesionales y coberturas.
2. Requisitos previos
Instalar:
- Node.js y npm.
- Un editor de código, por ejemplo Visual Studio Code.
- Un navegador actualizado.
Para comprobar las instalaciones:
node -v
npm -v
3. Instalación
Abrir una terminal en la carpeta raíz del proyecto, donde se encuentra
package.json, y ejecutar:
npm install
Esto instala las dependencias declaradas por el proyecto.
4. Ejecución en desarrollo
npm run dev
Vite mostrará en la terminal una dirección local, habitualmente:
http://localhost:5173/
Abrir esa dirección en el navegador. Para detener el servidor, utilizar
Ctrl + C en la terminal.
5. Verificación y compilación
Comprobar los tipos de TypeScript y generar la versión de producción:
npm run build
Ejecutar el análisis estático:
npm run lint
Para previsualizar localmente la compilación:
npm run preview
El comando preview se utiliza después de ejecutar npm run build.
6. Estructura general
src/
├── components/
│   ├── common/       # Componentes reutilizables de interfaz
│   ├── appointments/ # Componentes relacionados con turnos
│   ├── patients/     # Componentes relacionados con pacientes
│   └── masters/      # Componentes de datos maestros
├── data/             # Datos iniciales ficticios en JSON
├── hooks/            # Hooks y contexto de la aplicación
├── pages/            # Pantallas principales
├── styles/           # Estilos globales y tokens
├── types/            # Interfaces y tipos TypeScript
├── utils/            # Validaciones y funciones auxiliares
├── App.tsx           # Estado central y navegación
└── main.tsx          # Punto de entrada
La estructura puede contener archivos adicionales de estilos y
componentes asociados a cada pantalla.
7. Pantallas principales
Listado de turnos
Permite consultar los turnos registrados, buscar pacientes y aplicar
filtros. Presenta información del turno y permite consultar su detalle,
gestionar la confirmación y registrar estados de asistencia según las
reglas implementadas.
Solicitud de turnos
Permite seleccionar un paciente activo, una especialidad habilitada y un
profesional activo asociado a esa especialidad. También permite ingresar
fecha, hora y comentarios.

La fecha se valida para que no sea anterior al día actual ni supere los
próximos 90 días. Los turnos nuevos se crean inicialmente como
pendientes de confirmación.
Gestión de pacientes
Permite consultar y administrar pacientes. Se contemplan datos
identificatorios, tipo y número de documento, contacto, cobertura y
estado. La validación evita registrar documentos duplicados y se utiliza
la cobertura Particular como valor predeterminado cuando corresponde.
Datos maestros
Permite administrar especialidades, profesionales y coberturas. Las
especialidades se deshabilitan en lugar de eliminarse, para conservar su
referencia en los registros históricos. Los elementos inactivos no se
ofrecen para nuevas asignaciones.
8. Componentes y diseño
En src/components/common/ se encuentran componentes reutilizables como
botones, campos de entrada, selectores, tarjetas, indicadores de estado
y ventanas modales.

Los tipos e interfaces se centralizan en src/types/. Las validaciones
de fechas y confirmaciones se ubican en src/utils/.

El sistema visual utiliza tokens CSS para colores, tipografía,
espaciados, bordes y sombras. El tema puede configurarse como claro,
oscuro o según la preferencia del sistema operativo.
9. Datos y alcance de esta versión
La aplicación utiliza datos ficticios cargados desde archivos JSON. El
estado de trabajo se administra en memoria desde la aplicación; por lo
tanto, esta versión de demostración no cuenta con una API ni una base de
datos persistente. Los cambios realizados durante la sesión pueden
perderse al recargar la página.

No se incluye autenticación ni una separación efectiva de permisos por
rol en esta versión. Estos aspectos pueden incorporarse en una etapa
posterior mediante un backend y un sistema de usuarios.
10. Notas
- No cargar datos personales reales: los registros incluidos son de
  demostración.
- Ejecutar npm run build antes de entregar para verificar
  compilación y tipos.
- No incluir la carpeta node_modules en el ZIP de entrega.