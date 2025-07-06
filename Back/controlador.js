import {simularSegmentacionPaginada} from "./SegmentacionPaginada.js";

const btnLeerTabla = document.getElementById("btnLeerTabla");

btnLeerTabla.addEventListener("click", leerTablaProcesos);
document.addEventListener("click", (event) => {
	if (event.target.closest(".btnActivacionProcesos")) {
		leerTablaProcesos();
	}
});
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

	simularSegmentacionPaginada(datos);
}
