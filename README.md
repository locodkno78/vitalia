# Vitalia Salud Comunitaria — Actividad 2

Aplicación web desarrollada con React, TypeScript y Vite para gestionar turnos, pacientes y datos maestros de un centro de salud comunitario.

El proyecto se enfoca en una interfaz modular, componentes reutilizables, validaciones de negocio, accesibilidad y adaptación a distintos tamaños de pantalla.

## 1. Tecnologías

- **React 19:** construcción de interfaces mediante componentes.
- **TypeScript 5:** tipado estático de datos, propiedades y funciones.
- **Vite 8:** servidor de desarrollo y compilación.
- **Lucide React:** iconografía.
- **CSS:** estilos globales, estilos por componente y tokens de diseño.
- **JSON:** datos ficticios iniciales para pacientes, turnos, especialidades, profesionales y coberturas.

## 2. Requisitos previos

Instalar:

- Node.js y npm.
- Un editor de código, por ejemplo Visual Studio Code.
- Un navegador actualizado.

Para comprobar las instalaciones:

```bash
node -v
npm -v
```

## 3. Instalación

Abrir una terminal en la carpeta raíz del proyecto, donde se encuentra `package.json`, y ejecutar:

```bash
npm install
```

Esto instala las dependencias declaradas por el proyecto.

## 4. Ejecución en desarrollo

Ejecutar:

```bash
npm run dev
```

Vite mostrará en la terminal una dirección local, habitualmente:

```text
http://localhost:5173/
```

Abrir esa dirección en el navegador.

Para detener el servidor, utilizar `Ctrl + C` en la terminal.

## 5. Verificación y compilación

Comprobar los tipos de TypeScript y generar la versión de producción:

```bash
npm run build
```

Ejecutar el análisis estático:

```bash
npm run lint
```

Para previsualizar localmente la compilación:

```bash
npm run preview
```

El comando `preview` se utiliza después de ejecutar `npm run build`.

## 6. Estructura general

```text
src/
├── components/
│   ├── common/       # Componentes reutilizables
│   ├── appointments/ # Componentes relacionados con turnos
│   ├── patients/     # Componentes relacionados con pacientes
│   └── masters/      # Componentes de datos maestros
├── data/             # Datos iniciales ficticios
├── hooks/            # Hooks y contexto de la aplicación
├── pages/            # Pantallas principales
├── styles/           # Estilos globales y tokens
├── types/            # Interfaces y tipos TypeScript
├── utils/            # Validaciones y funciones auxiliares
├── App.tsx           # Estado central y navegación
└── main.tsx          # Punto de entrada
```

La estructura puede contener archivos adicionales de estilos y componentes asociados a cada pantalla.

## 7. Pantallas principales

### Listado de turnos

Permite consultar los turnos registrados, buscar pacientes y aplicar filtros. Presenta información del turno y permite consultar su detalle, gestionar la confirmación y registrar estados de asistencia según las reglas implementadas.

### Solicitud de turnos

Permite seleccionar un paciente activo, una especialidad habilitada y un profesional activo asociado a esa especialidad. También permite ingresar fecha, hora y comentarios.

La fecha se valida para que no sea anterior al día actual ni supere los próximos 90 días. Los turnos nuevos se crean inicialmente como pendientes de confirmación.

### Gestión de pacientes

Permite consultar y administrar pacientes. Se contemplan datos identificatorios, tipo y número de documento, contacto, cobertura y estado.

La validación evita registrar documentos duplicados y se utiliza la cobertura Particular como valor predeterminado cuando corresponde.

### Datos maestros

Permite administrar especialidades, profesionales y coberturas.

Las especialidades se deshabilitan en lugar de eliminarse, para conservar su referencia en los registros históricos. Los elementos inactivos no se ofrecen para nuevas asignaciones.

## 8. Catálogo y documentación de componentes

Los componentes reutilizables se encuentran en `src/components/common/`.

Su objetivo es mantener una interfaz consistente, facilitar el mantenimiento y evitar duplicación de código.

### 8.1 Button

**Archivo:** `Button.tsx`

**Propósito:** representar acciones de la interfaz mediante un botón reutilizable.

**Props propias:**

| Prop | Tipo | Valor predeterminado | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | Obligatorio | Contenido del botón. |
| `variant` | `ButtonVariant` | `primary` | Estilo visual. |
| `size` | `ButtonSize` | `md` | Tamaño del botón. |
| `fullWidth` | `boolean` | `false` | Ocupa todo el ancho disponible. |
| `loading` | `boolean` | `false` | Activa el estado de procesamiento. |

**Variantes:**

- `primary`
- `secondary`
- `outline`
- `danger`

**Tamaños:**

- `sm`
- `md`
- `lg`

**Estados simulados:**

- Normal.
- Deshabilitado mediante `disabled`.
- Procesando mediante `loading`.

**Accesibilidad:**

- Utiliza el elemento nativo `button`.
- Admite navegación por teclado.
- El estado de carga se comunica mediante `aria-busy`.
- Durante la carga muestra un mensaje con `role="status"`.
- El botón se deshabilita mientras está procesando.
- El icono decorativo del indicador de carga no se anuncia al lector de pantalla.

Hereda las propiedades nativas de `ButtonHTMLAttributes<HTMLButtonElement>`.

### 8.2 Card

**Archivo:** `Card.tsx`

**Propósito:** agrupar información relacionada dentro de una superficie visual reutilizable.

**Props propias:**

| Prop | Tipo | Valor predeterminado | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | Obligatorio | Contenido de la tarjeta. |
| `variant` | `CardVariant` | `default` | Variante visual. |
| `padding` | `sm \| md \| lg` | `md` | Espaciado interno. |

**Variantes:**

- `default`
- `outlined`
- `elevated`

**Estados simulados:**

- Tarjeta predeterminada.
- Tarjeta con borde.
- Tarjeta con elevación.
- Variaciones de espaciado interno.

**Accesibilidad:**

- Utiliza un elemento semántico `section`.
- Puede contener títulos, textos, controles y otros elementos.
- Los elementos interactivos internos deben conservar sus etiquetas y estados accesibles.
- No debe utilizarse como sustituto de un botón cuando representa una acción.

Hereda las propiedades HTML de `HTMLAttributes<HTMLElement>`.

### 8.3 Input

**Archivo:** `Input.tsx`

**Propósito:** proporcionar un campo de entrada reutilizable con etiqueta, ayuda y validación.

**Props propias:**

| Prop | Tipo | Descripción |
|---|---|---|
| `label` | `string` | Etiqueta obligatoria del campo. |
| `hint` | `string` | Texto de ayuda opcional. |
| `error` | `string` | Mensaje de error opcional. |

**Estados simulados:**

- Campo normal.
- Campo con texto de ayuda.
- Campo obligatorio.
- Campo con error de validación.

**Accesibilidad:**

- La etiqueta se relaciona con el campo mediante `htmlFor` e `id`.
- Genera un identificador automático cuando no se proporciona uno.
- Los campos obligatorios utilizan el atributo `required`.
- El error se comunica mediante `aria-invalid`.
- Las ayudas y los errores se relacionan con el campo mediante `aria-describedby`.
- Los mensajes de error utilizan `role="alert"`.

Hereda las propiedades nativas de `InputHTMLAttributes<HTMLInputElement>`, excepto `size`.

### 8.4 Modal

**Archivo:** `Modal.tsx`

**Propósito:** mostrar información o formularios en una ventana de diálogo superpuesta.

**Props:**

| Prop | Tipo | Descripción |
|---|---|---|
| `open` | `boolean` | Controla la apertura del diálogo. |
| `title` | `string` | Título obligatorio del diálogo. |
| `children` | `ReactNode` | Contenido principal. |
| `onClose` | `() => void` | Función ejecutada al cerrar. |
| `footer` | `ReactNode` | Contenido opcional del pie. |
| `size` | `sm \| md \| lg` | Tamaño del diálogo. |

**Tamaño predeterminado:** `md`.

**Estados simulados:**

- Modal cerrado.
- Modal abierto.
- Modal con contenido principal.
- Modal con pie de acciones.
- Modal en diferentes tamaños.

**Accesibilidad:**

- Utiliza el elemento nativo `dialog` y el método `showModal()`.
- Incluye `aria-modal="true"` y `aria-labelledby`.
- El título se asocia al diálogo mediante un identificador.
- Guarda el elemento que tenía el foco antes de abrirse.
- Lleva el foco al primer control disponible o al elemento con `autofocus`.
- Permite cerrar mediante la tecla `Escape`.
- Devuelve el foco al elemento que abrió el diálogo.
- El botón de cierre tiene una etiqueta accesible.

### 8.5 Select

**Archivo:** `Select.tsx`

**Propósito:** permitir seleccionar una opción de una lista desplegable.

**Props propias:**

| Prop | Tipo | Descripción |
|---|---|---|
| `label` | `string` | Etiqueta obligatoria. |
| `options` | `SelectOption[]` | Opciones disponibles. |
| `placeholder` | `string` | Texto inicial. |
| `hint` | `string` | Texto de ayuda opcional. |
| `error` | `string` | Mensaje de error opcional. |

**Tipo de opción:**

```ts
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

**Estados simulados:**

- Sin selección.
- Opción seleccionada.
- Opción deshabilitada.
- Campo obligatorio.
- Campo con ayuda.
- Campo con error.

**Accesibilidad:**

- Utiliza el elemento nativo `select`.
- Relaciona la etiqueta con el control mediante `htmlFor` e `id`.
- Permite navegación mediante teclado.
- Comunica errores con `aria-invalid`.
- Relaciona las ayudas y los errores mediante `aria-describedby`.
- Los mensajes de error utilizan `role="alert"`.

Hereda las propiedades nativas de `SelectHTMLAttributes<HTMLSelectElement>`, excepto `size`.

### 8.6 StatusBadge

**Archivo:** `StatusBadge.tsx`

**Propósito:** identificar visualmente el estado de un registro mediante una etiqueta.

**Props:**

| Prop | Tipo | Valor predeterminado | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | Obligatorio | Texto o contenido de estado. |
| `status` | `BadgeStatus` | `neutral` | Variante visual. |

**Variantes:**

- `success`
- `warning`
- `danger`
- `info`
- `neutral`

**Estados simulados:**

Permite representar diferentes situaciones, como estados satisfactorios, advertencias, errores, información general o estados neutros.

**Accesibilidad:**

- El texto debe describir claramente el estado.
- La identificación no debe depender únicamente del color.
- Se debe mantener un contraste adecuado entre texto y fondo.

## 9. Diseño visual y temas

El sistema visual utiliza tokens CSS para centralizar:

- Colores.
- Tipografía.
- Espaciados.
- Bordes.
- Sombras.
- Transiciones.

La aplicación contempla tres opciones de tema:

- Claro.
- Oscuro.
- Sistema, según la preferencia del sistema operativo.

Los estilos se organizan en archivos globales y archivos CSS asociados a cada componente.

## 10. Accesibilidad

La interfaz contempla criterios de accesibilidad basados en las pautas WCAG.

Entre las consideraciones implementadas se encuentran:

- Navegación mediante teclado.
- Uso de elementos HTML semánticos.
- Etiquetas asociadas a campos de formulario.
- Estados de validación comunicados mediante atributos ARIA.
- Mensajes de error accesibles.
- Indicadores de foco visibles mediante `:focus-visible`.
- Diferenciación del foco en los temas claro y oscuro.
- Identificación textual de estados, sin depender exclusivamente del color.
- Gestión del foco al abrir y cerrar ventanas modales.
- Identificación de la página activa en la navegación mediante `aria-current`.

La verificación manual debe incluir navegación con `Tab`, activación con `Enter` y cierre de diálogos con `Escape`, además de comprobar la visibilidad del foco en ambos temas.

## 11. Datos y alcance de esta versión

La aplicación utiliza datos ficticios cargados desde archivos JSON.

El estado de trabajo se administra en memoria desde la aplicación; por lo tanto, esta versión de demostración no cuenta con una API ni una base de datos persistente.

Los cambios realizados durante la sesión pueden perderse al recargar la página.

No se incluye autenticación ni una separación efectiva de permisos por rol en esta versión. Estos aspectos pueden incorporarse en una etapa posterior mediante un backend y un sistema de usuarios.

## 12. Notas finales

- No cargar datos personales reales: los registros incluidos son de demostración.
- Ejecutar `npm run build` antes de entregar para verificar compilación y tipos.
- No incluir la carpeta `node_modules` en el ZIP de entrega.
- Mantener actualizada la documentación cuando se incorporen nuevos componentes o funcionalidades.