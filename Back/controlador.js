import {simularSegmentacionPaginada} from "./SegPag.js";

const btnLeerTabla = document.getElementById("btnLeerTabla");
const selAlgoritmo = document.getElementById("Algoritmo");
const tablaSimulacion = document.querySelector(".TablaSimulacion tbody");

document.addEventListener("click", (event) => {
	if (event.target.closest(".btnActivacionProcesos")) {
		setTimeout(render, 0);
	}
});

btnLeerTabla.addEventListener("click", () => {
	setTimeout(render, 0);
});

function render() {
	const datos = leerTablaProcesos();
	if (!datos.length) {
		alert("No hay procesos activos que simular.");
		return;
	}

	const procesosSegPag = datos.map((p) => ({
		nombre: p.nombre,
		segmentos: [
			{ tipo: "text", tam: parseInt(p.text, 10) },
			{ tipo: "data", tam: parseInt(p.data, 10) },
			{ tipo: "bss", tam: parseInt(p.bss, 10) },
			{ tipo: "stack", tam: parseInt(p.stack, 10) },
			{ tipo: "heap", tam: parseInt(p.heap, 10) },
		],
	}));

	const resultado = simularSegmentacionPaginada({
		memoriaMiB: 16,
		pageKiB: 4,
		procesos: procesosSegPag,
	});

	renderTablaSegmentacionPaginada(resultado);
}


function leerTablaProcesos() {
	const tabla = document.querySelector(".TablaProcesosIterativos tbody");
	const datos = [];
	tabla.querySelectorAll("tr").forEach((fila) => {
		const celdas = fila.querySelectorAll("td");
		const btn = celdas[6]?.querySelector("button");
		if (btn && btn.classList.contains("desactivado")) return;
		if (celdas.length >= 6) {
			datos.push({
				nombre: celdas[0].textContent.trim(),
				text: celdas[1].textContent.trim() || "0",
				data: celdas[2].textContent.trim() || "0",
				bss: celdas[3].textContent.trim() || "0",
				stack: celdas[4].textContent.trim() || "0",
				heap: celdas[5].textContent.trim() || "0",
			});
		}
	});
	return datos;
}

function renderTablaSegmentacionPaginada({ frames, PAGE_SIZE }) {
	tablaSimulacion.innerHTML = "";
	const fragment = document.createDocumentFragment();
	let memoriaOcupada = 0;

	const thead = document.getElementById("TablaSimulacion").querySelector("thead");
	if (thead && thead.rows.length > 0) {
		const filaEncabezado = thead.rows[0];
		filaEncabezado.innerHTML = `
			<th style="border-top-left-radius: 20px;">Marco</th>
			<th>Proceso (Segmento)</th>
			<th>Pagina</th>
			<th>Direccion Base</th>
			<th>Direccion Fin</th>
			<th style="border-top-right-radius: 20px;">Tamaño (KiB)</th>
		`;
	}

	frames.forEach(({ frame, pid, segmento, page }) => {
		const base = frame * PAGE_SIZE;
		const fin = (frame + 1) * PAGE_SIZE - 1;
		const tam = PAGE_SIZE / 1024;

		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${frame}</td>
			<td>${pid === 'Libre' ? 'Libre' : `${pid} (${segmento})`}</td>
			<td>${page !== null ? page : "-"}</td>
			<td>${base}</td>
			<td>${fin}</td>
			<td>${tam}</td>
		`;

		if (pid !== 'Libre' && pid !== null) memoriaOcupada += tam;

		fragment.appendChild(tr);
	});

	const trResumen = document.createElement("tr");
	trResumen.innerHTML = `
		<td colspan="5"><b>Memoria ocupada total (KiB)</b></td>
		<td><b>${memoriaOcupada}</b></td>
	`;
	fragment.appendChild(trResumen);

	tablaSimulacion.appendChild(fragment);
}

