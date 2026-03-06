let datosEmpresas = JSON.parse(localStorage.getItem("datos_empresas_all")) || {};
let empresaActual = document.getElementById("selector-empresa")?.value || "CMPC Santa Fe";

// 1. Carga inicial
window.onload = function () {
    const guardado = localStorage.getItem("datos_empresas_all");
    if (guardado) {
        datosEmpresas = JSON.parse(guardado);
    }
    cambiarEmpresa(); 
};

// 2. Manejo de Carpetas (Empresas)
function cambiarEmpresa() {
    document.getElementById("input-busqueda").value = ""; // Limpia el buscador al cambiar de empresa
    document.getElementById("resultado-busqueda").innerHTML = "";
    empresaActual = document.getElementById("selector-empresa").value;
    
    if (!datosEmpresas[empresaActual]) {
        datosEmpresas[empresaActual] = { saldo: 0, movimientos: [] };
    }
    
    renderizarTodo();
}

// 3. Lógica de Movimientos
// Aseguramos que las variables globales nunca sean nulas

async function agregarMovimiento() {
    try {
        const cloudName = "dunyxlncz"; 
        const uploadPreset = "ldstg9tj"; 

        const fecha = document.getElementById("fecha").value;
        const descripcion = document.getElementById("descripcion").value;
        const documento = document.getElementById("documento").value || "N/A";
        const monto = Number(document.getElementById("monto").value);
        const tipo = document.getElementById("tipo").value;
        const fotoInput = document.getElementById("foto-movimiento");

        if (!fecha || !descripcion || monto <= 0) {
            alert("Faltan datos obligatorios.");
            return;
        }

        let urlFotoNube = "";

        // 1. Subida a Cloudinary con nombre de OC/OS
        if (fotoInput && fotoInput.files && fotoInput.files[0]) {
            const file = fotoInput.files[0];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            
            // ESTO HACE QUE SE GUARDE CON EL NOMBRE DE LA OC/OS
            // Limpiamos el nombre de espacios o caracteres raros para evitar errores
            const nombreLimpio = documento.replace(/[^a-zA-Z0-9]/g, "_");
            formData.append("public_id", nombreLimpio);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                // GUARDAMOS SOLO EL LINK (URL)
                urlFotoNube = data.secure_url; 
            } else {
                alert("Error al subir la imagen a la nube.");
                return;
            }
        }

        // 2. Guardado en LocalStorage (Solo texto, 0% peso de imagen)
        if (!datosEmpresas[empresaActual]) {
            datosEmpresas[empresaActual] = { saldo: 0, movimientos: [] };
        }

        if (tipo === "ingreso") {
            datosEmpresas[empresaActual].saldo += monto;
        } else {
            datosEmpresas[empresaActual].saldo -= monto;
        }

        datosEmpresas[empresaActual].movimientos.push({ 
            fecha, 
            descripcion, 
            documento, 
            monto, 
            tipo, 
            foto: urlFotoNube // <--- Aquí solo queda el link de Cloudinary
        });

        guardarDatos();
        renderizarTodo();
        limpiarFormulario();
        if(fotoInput) fotoInput.value = "";

        alert("Movimiento guardado exitosamente con respaldo en la nube.");

    } catch (error) {
        console.error("ERROR:", error);
        alert("Ocurrió un error: " + error.message);
    }
}


// --- TUS FUNCIONES RECUPERADAS Y ADAPTADAS ---

function agregarMovimientoLista(fecha, descripcion, monto, tipo, index, documento, foto) {
    const lista = document.getElementById("lista-movimientos");
    const li = document.createElement("li");
    li.classList.add(tipo);

    const txtDocumento = documento ? `<strong>[${documento}]</strong>` : "";
    
    // Si hay foto, creamos un botón pequeño para verla
    const btnFoto = foto ? `<button onclick="verFoto('${foto}')" style="cursor:pointer; background:none; border:none; margin-left:5px;">📷</button>` : "";

    li.innerHTML = `
        <span>${fecha} - ${txtDocumento} ${descripcion} ${btnFoto}</span>
        <span>
            ${tipo === "ingreso" ? "+" : "-"}$${monto.toLocaleString()}
            <button onclick="borrarMovimiento(${index})" style="margin-left:10px; cursor:pointer; border:none; background:none;">❌</button>
        </span>
    `;
    lista.appendChild(li);
}

// Función para abrir la foto en una pestaña nueva
function verFoto(url) {
    if (url && url.startsWith("http")) {
        // Abre el link de Cloudinary en una pestaña nueva
        window.open(url, '_blank');
    } else {
        alert("Este movimiento no tiene una foto válida en la nube.");
    }
}


// --------------------------------------------

function borrarMovimiento(index) {
    const mov = datosEmpresas[empresaActual].movimientos[index];
    
    if (mov.tipo === "ingreso") {
        datosEmpresas[empresaActual].saldo -= mov.monto;
    } else {
        datosEmpresas[empresaActual].saldo += mov.monto;
    }

    datosEmpresas[empresaActual].movimientos.splice(index, 1);
    
    guardarDatos();
    renderizarTodo();
}

function actualizarSaldo() {
    const saldoElemento = document.getElementById("saldo");
    if (!saldoElemento) return; // Seguridad por si no existe el ID
    
    // Si no hay datos de la empresa actual, el saldo es 0
    const saldoActual = datosEmpresas[empresaActual] ? datosEmpresas[empresaActual].saldo : 0;
    
    saldoElemento.textContent = saldoActual.toLocaleString();
}

function renderizarTodo() {
    actualizarSaldo(); // <--- Aquí es donde fallaba antes
    
    const lista = document.getElementById("lista-movimientos");
    if (!lista) return;
    
    lista.innerHTML = "";
    
    // Si la empresa tiene movimientos, los mostramos
    if (datosEmpresas[empresaActual] && datosEmpresas[empresaActual].movimientos) {
        const movimientos = datosEmpresas[empresaActual].movimientos;
        movimientos.forEach((mov, index) => {
            // Le pasamos todos los datos, incluyendo la foto
            agregarMovimientoLista(mov.fecha, mov.descripcion, mov.monto, mov.tipo, index, mov.documento, mov.foto);
        });
    }
}

function guardarDatos() {
    localStorage.setItem("datos_empresas_all", JSON.stringify(datosEmpresas));
}

function limpiarFormulario() {
    document.getElementById("descripcion").value = "";
    document.getElementById("documento").value = "";
    document.getElementById("monto").value = "";
    document.getElementById("fecha").value = "";    
}

function buscarPorOC() {
    const termino = document.getElementById("input-busqueda").value.trim(); // Usamos trim para quitar espacios accidentales
    const listaElemento = document.getElementById("lista-movimientos");
    const resultadoTexto = document.getElementById("resultado-busqueda");
    
    const movimientos = datosEmpresas[empresaActual].movimientos;
    
    let sumaTotal = 0;
    let encontrados = 0;

    if (termino === "") {
        renderizarTodo();
        resultadoTexto.innerHTML = "";
        return;
    }

    listaElemento.innerHTML = "";

    movimientos.forEach(m => {
        // CAMBIO CLAVE: Cambiamos .includes() por comparación exacta ===
        // Usamos toLowerCase() en ambos por si acaso hay letras
        if (m.documento.toLowerCase() === termino.toLowerCase()) {
            const li = document.createElement("li");
            // Agregamos el icono de cámara si existe foto en el resultado de búsqueda
            const btnFoto = m.foto ? `<button onclick="verFoto('${m.foto}')" style="cursor:pointer; background:none; border:none; margin-left:5px;">📷</button>` : "";
            
            li.innerHTML = `${m.fecha} - ${m.descripcion} (${m.documento}) ${btnFoto}: <strong>$${Number(m.monto).toLocaleString()}</strong> [${m.tipo}]`;
            listaElemento.appendChild(li);

            if (m.tipo === "ingreso") {
                sumaTotal += Number(m.monto);
            } else {
                sumaTotal -= Number(m.monto);
            }
            encontrados++;
        }
    });

    if (encontrados > 0) {
        resultadoTexto.innerHTML = `Resultados encontrados: ${encontrados} | Total acumulado para esta OC: $${sumaTotal.toLocaleString()}`;
        resultadoTexto.style.color = sumaTotal >= 0 ? "#28a745" : "#dc3545";
    } else {
        resultadoTexto.innerHTML = "No se encontraron movimientos con esa OC exacta.";
        resultadoTexto.style.color = "red";
    }
}

    // Mostramos el resumen de la búsqueda
    if (encontrados > 0) {
        resultadoTexto.innerHTML = `Resultados encontrados: ${encontrados} | Total acumulado para esta OC: $${sumaTotal.toLocaleString()}`;
        resultadoTexto.style.color = sumaTotal >= 0 ? "#28a745" : "#dc3545";
    } else {
        resultadoTexto.innerHTML = "No se encontraron movimientos con esa OC.";
        resultadoTexto.style.color = "red";
    
}

function resetearTodo() {
    // 1. Pedimos confirmación porque esto borra TODO
    const confirmar = confirm("¿Estás seguro de que deseas borrar TODOS los movimientos de TODAS las empresas? Esta acción no se puede deshacer.");
    
    if (confirmar) {
        // 2. Limpiamos el objeto principal
        datosEmpresas = {};
        
        // 3. Limpiamos el almacenamiento local (LocalStorage)
        localStorage.removeItem("datos_empresas_all");
        
        // 4. Reiniciamos la empresa actual para que cree el objeto limpio
        cambiarEmpresa();
        
        alert("Todos los datos han sido reseteados correctamente.");
    }
}


function exportarExcel() {
    let tablaHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8">
        <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; }
            th { 
                border: 1px solid #000000; 
                padding: 10px; 
                text-align: center; /* ENUNCIADOS SE QUEDAN CENTRADOS */
                font-weight: bold;
            }
            td { 
                border: 1px solid #ccc; 
                padding: 8px; 
                text-align: left; /* TODA LA INFORMACIÓN SE VA A LA IZQUIERDA */
            }
            .ingreso { color: #008000; font-weight: bold; }
            .egreso { color: #FF0000; font-weight: bold; }
        </style>
    </head>
    <body>
        <table>
            <thead>
                <tr bgcolor="#D9EAF7">
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>OC / OS</th>
                    <th>Monto</th>
                    <th>Tipo</th>
                    <th>Empresa</th>
                </tr>
            </thead>
            <tbody>`;

    let contadorFila = 0;
    // Asegúrate de que 'datosEmpresas' sea el nombre correcto de tu variable global
    for (let nombreEmpresa in datosEmpresas) { 
        let movimientos = datosEmpresas[nombreEmpresa].movimientos;
        
        movimientos.forEach(m => {
            const estiloFila = contadorFila % 2 === 0 ? "" : 'bgcolor="#F9F9F9"';
            const claseMonto = m.tipo === "ingreso" ? "ingreso" : "egreso";

            tablaHtml += `
                <tr ${estiloFila}>
                    <td>${m.fecha}</td>
                    <td>${m.descripcion}</td>
                    <td>${m.documento || 'N/A'}</td>
                    <td class="${claseMonto}">$${Number(m.monto).toLocaleString()}</td>
                    <td>${m.tipo.toUpperCase()}</td>
                    <td>${nombreEmpresa}</td>
                </tr>`;
            contadorFila++;
        });
    }

    tablaHtml += `</tbody></table></body></html>`;

    const blob = new Blob(['\uFEFF' + tablaHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Reporte_KAYL_Izquierda.xls";
    link.click();
}