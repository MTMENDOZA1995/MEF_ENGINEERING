'use strict';

// =========================================================
// 1. SEGURIDAD: REDIRECCIÓN TEMPRANA (ANTI-PARPADEO)
// =========================================================
if (sessionStorage.getItem("sesionActiva") === "true") {
    const ruta = sessionStorage.getItem("menuUsuario") || "Botones.html";
    window.location.replace(ruta);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    // Helper Inteligente: Usa el Modal PRO si existe en el HTML, sino usa alert nativo
    const notificar = (titulo, mensaje, tipo = "warning") => {
        if (typeof window.mostrarAlerta === "function") {
            window.mostrarAlerta(titulo, mensaje, tipo);
        } else {
            alert(`${titulo}\n\n${mensaje}`);
        }
    };

    // =========================================================
    // 2. CONFIGURACIÓN DEL USUARIO MAESTRO (GERENCIA)
    // =========================================================
    const inicializarSistema = () => {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        
        // Verificamos si el administrador principal ya existe
        const existeMaestro = usuarios.some(u => u.id === "MTMENDOZA");

        if (!existeMaestro) {
            const usuarioMaestro = {
                codigo: "116224516",
                dni: "73372032",
                apellidos: "MENDOZA ACUÑA",
                nombres: "MAX TAYSON",
                cargo: "GERENTE GENERAL",
                area: "GLOBAL",
                estado: "ACTIVO",
                id: "MTMENDOZA",
                clave: btoa("C8KM1Y0F1I3K1S6H.") // Encriptación Base64
            };
            usuarios.push(usuarioMaestro);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            console.log("✅ Sistema inicializado: Llave Maestra MTMENDOZA configurada.");
        }
    };

    inicializarSistema();

    // =========================================================
    // 3. PROCESAMIENTO DE AUTENTICACIÓN
    // =========================================================
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuarioInput = document.getElementById("usuario").value.trim().toUpperCase();
        const claveInput = document.getElementById("contrasena").value.trim();

        if (!usuarioInput || !claveInput) {
            return notificar("Campos Vacíos", "Por favor, ingrese su ID de Usuario y su Contraseña.", "warning");
        }

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        
        // Búsqueda Optimizada de Credenciales
        const usuarioEncontrado = usuarios.find(u => {
            if ((u.id || "").toUpperCase() !== usuarioInput) return false;

            let claveDecodificada = "";
            try {
                claveDecodificada = atob(u.clave); 
            } catch (err) {
                claveDecodificada = u.clave; 
            }
            
            return claveDecodificada === claveInput;
        });

        // 3.1. Validaciones de Fallo
        if (!usuarioEncontrado) {
            return notificar("Acceso Denegado", "El ID de Usuario o la contraseña son incorrectos.", "error");
        }

        if (usuarioEncontrado.estado === "INACTIVO") {
            return notificar("Cuenta Suspendida", "Esta cuenta ha sido desactivada temporalmente por el Administrador.", "error");
        }

        // =========================================================
        // 4. CREACIÓN DE SESIÓN Y ENRUTAMIENTO (RBAC)
        // =========================================================
        const cargo = (usuarioEncontrado.cargo || "OPERARIO").toUpperCase();
        const sede = usuarioEncontrado.area || usuarioEncontrado.sede || "GLOBAL";
        
        // Inyección de variables requeridas por los módulos de "Innovación Sostenible & Atractiva"
        sessionStorage.setItem("sesionActiva", "true");
        sessionStorage.setItem("usuarioLogueado", usuarioEncontrado.id);
        sessionStorage.setItem("rolUsuario", cargo);
        sessionStorage.setItem("usuarioSede", sede);
        
        // Mantenemos compatibilidad con tu requerimiento local
        localStorage.setItem("sesionActiva", "true");

        // Lógica de Enrutamiento según el Cargo
        let rutaDestino = "BotonesOperario.html"; 

        if (cargo.includes("GERENTE")) {
            rutaDestino = "Botones.html";
        } else if (cargo.includes("ADMINISTRADOR") || cargo.includes("SUPERVISOR") || cargo.includes("ASISTENTE")) {
            rutaDestino = "BotonesAdministrador.html";
        }

        sessionStorage.setItem("menuUsuario", rutaDestino);

        // Saludo y Redirección
        const primerNombre = (usuarioEncontrado.nombres || "Usuario").split(" ")[0];
        
        if (typeof window.mostrarToast === "function") {
            window.mostrarToast(`¡Bienvenido, ${primerNombre}!`);
            setTimeout(() => window.location.replace(rutaDestino), 1000);
        } else {
            alert(`👋 ¡Bienvenido al sistema, ${primerNombre}!`);
            window.location.replace(rutaDestino);
        }
    });
});
