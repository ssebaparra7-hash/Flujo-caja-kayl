let saldo = 0;
let movimientos = [];

function agregarMovimiento() {
    const fecha = document.getElementById("fecha").value;
    const descripcion = document.getElementById("descripcion").value;
    const monto = Number(document.getElementById("monto").value);
    const tipo = document.getElementById("tipo").value;

    if (descripcion === "" || monto <= 0) {
        alert("Complete todos los campos correctamente");
        return;
    }

    if (tipo === "ingreso") {
        saldo += monto;
    } else {
        saldo -= monto;
    }

    movimientos.push({
    fecha,
    descripcion,
    monto,
    tipo
});

guardarDatos();

    actualizarSaldo();
    agregarMovimientoLista(fecha, descripcion, monto, tipo);
    limpiarFormulario();
}

function actualizarSaldo() {
    document.getElementById("saldo").textContent = saldo.toLocaleString();
}

function agregarMovimientoLista(fecha, descripcion, monto, tipo) {
    const lista = document.getElementById("lista-movimientos");
    const li = document.createElement("li");

    li.classList.add(tipo);
    li.innerHTML = `
        <span>${fecha} - ${descripcion}</span>
        <span>${tipo === "ingreso" ? "+" : "-"}$${monto.toLocaleString()}</span>
    `;

    lista.appendChild(li);
}

function limpiarFormulario() {
    document.getElementById("descripcion").value = "";
    document.getElementById("monto").value = "";
    document.getElementById("fecha").value = "";    
}

function guardarDatos() {
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
    localStorage.setItem("saldo", saldo);
}

window.onload = function () {
    const datosGuardados = localStorage.getItem("movimientos");
    const saldoGuardado = localStorage.getItem("saldo");

    if (datosGuardados) {
        movimientos = JSON.parse(datosGuardados);
        saldo = Number(saldoGuardado);

        actualizarSaldo();

        movimientos.forEach(mov => {
            agregarMovimientoLista(
                mov.fecha,
                mov.descripcion,
                mov.monto,
                mov.tipo
            );
        });
    }
};

