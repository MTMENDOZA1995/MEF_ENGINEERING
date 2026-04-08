'use strict';

// --- 1. SEGURIDAD: REDIRECCIÓN TEMPRANA ---
// Se ejecuta inmediatamente para evitar el "parpadeo" del login si ya hay sesión
if (sessionStorage.getItem("sesionActiva") === "true") {
    const ruta = sessionStorage.getItem("menuUsuario") || "Botones.html";
    window.location.replace(ruta);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    // --- 2. CONFIGURACIÓN DEL USUARIO MAESTRO ---
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
                cargo: "GERENTE",
                id: "MTMENDOZA",
                // Nota: btoa es codificación Base64 (ofuscación básica)
                clave: btoa("C8KM1Y0F1I3K1S6H") 
            };
            usuarios.push(usuarioMaestro);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            console.log("✅ Sistema inicializado: Usuario Maestro MTMENDOZA configurado.");
        }
    };

    inicializarSistema();

    // --- 3. PROCESAMIENTO DEL LOGIN ---
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuarioInput = document.getElementById("usuario").value.trim().toUpperCase();
        const claveInput = document.getElementById("contrasena").value.trim();

        if (!usuarioInput || !claveInput) {
            alert("⚠️ Por favor, complete ambos campos.");
            return;
        }

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        
        // Búsqueda optimizada
        const usuarioEncontrado = usuarios.find(u => {
            // Si el ID no coincide, pasamos al siguiente inmediatamente
            if ((u.id || "").toUpperCase() !== usuarioInput) return false;

            let claveDecodificada = "";
            try {
                claveDecodificada = atob(u.clave); // Desencripta la clave guardada
            } catch (err) {
                claveDecodificada = u.clave; // Si falla, asume que está en texto plano
            }
            
            return claveDecodificada === claveInput;
        });

        if (!usuarioEncontrado) {
            alert("❌ ERROR: Usuario o contraseña incorrectos.");
            return;
        }

        // --- 4. ACCESO EXITOSO Y ENRUTAMIENTO ---
        sessionStorage.setItem("sesionActiva", "true");
        localStorage.setItem("sesionActiva", "true");

        // Determinar ruta según cargo (Gestión de Permisos)
        const cargo = (usuarioEncontrado.cargo || "").toUpperCase();
        let rutaDestino = "BotonesOperario.html"; // Ruta por defecto para cargos menores

        if (cargo.includes("GERENTE")) {
            rutaDestino = "Botones.html";
        } else if (cargo.includes("ADMINISTRADOR") || cargo.includes("SUPERVISOR") || cargo.includes("ASISTENTE")) {
            rutaDestino = "BotonesAdministrador.html";
        }

        // Guardar destino para que el botón "Volver" global sepa a dónde ir
        sessionStorage.setItem("menuUsuario", rutaDestino);

        // Saludo personalizado seguro
        const nombreCompleto = usuarioEncontrado.nombres || "Usuario";
        const primerNombre = nombreCompleto.split(" ")[0];
        
        alert(`👋 ¡Bienvenido al sistema, ${primerNombre}!`);
        
        // Redirección final
        window.location.replace(rutaDestino);
    });
});