import {simularSegmentacionPaginada, configurarMarcosOS, obtenerEstadisticasMemoria} from "./SegmentacionPaginada.js";

const btnLeerTabla = document.getElementById("btnLeerTabla");
const btnEstadisticas = document.getElementById("btnEstadisticas");
const btnOcultarEstadisticas = document.getElementById("btnOcultarEstadisticas");

// Función para configurar marcos del SO (opcional)
function configurarSO(numMarcos = 5) {
	configurarMarcosOS(numMarcos);
	console.log(`SO configurado con ${numMarcos} marcos`);
}

// Función para mostrar estadísticas de memoria
function mostrarEstadisticas() {
	const stats = obtenerEstadisticasMemoria();
	const container = document.getElementById("estadisticas-container");
	const content = document.getElementById("estadisticas-content");
	
	if (!container || !content) return;
	
	// Limpiar contenido anterior
	content.innerHTML = "";
	
	// Crear estadísticas para cada proceso
	Object.entries(stats).forEach(([proceso, datos]) => {
		const item = document.createElement("div");
		item.className = "estadistica-item";
		
		const colorProceso = proceso === "SO" ? "#ffeb3b" : "#4caf50";
		
		item.innerHTML = `
			<div class="estadistica-header">
				<span class="estadistica-proceso" style="color: ${proceso === "SO" ? "#f57f17" : "#2e7d32"}">
					${proceso === "SO" ? "🖥️ " : "⚙️ "}${proceso}
				</span>
				<span class="estadistica-memoria">${datos.memoriaKiB} KiB</span>
			</div>
			<div class="estadistica-detalles">
				<div class="estadistica-marcos">
					<strong>Marcos:</strong> ${datos.marcos}
				</div>
				<div class="estadistica-segmentos">
					<strong>Segmentos:</strong>
					${datos.segmentos.map(seg => `<span class="segmento-tag">${seg}</span>`).join("")}
				</div>
			</div>
		`;
		
		content.appendChild(item);
	});
	
	// Mostrar el contenedor
	container.style.display = "block";
	
	// Hacer scroll suave hacia las estadísticas
	container.scrollIntoView({ behavior: "smooth", block: "nearest" });
	
	return stats;
}

// Hacer las funciones disponibles globalmente
window.configurarSO = configurarSO;
window.mostrarEstadisticas = mostrarEstadisticas;

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
	
	// Si las estadísticas están visibles, actualizarlas automáticamente
	const estadisticasContainer = document.getElementById("estadisticas-container");
	if (estadisticasContainer && estadisticasContainer.style.display !== "none") {
		mostrarEstadisticas();
	}
}

// Event listener para el botón de estadísticas
btnEstadisticas.addEventListener("click", () => {
	mostrarEstadisticas();
});

// Event listener para el botón de ocultar estadísticas
btnOcultarEstadisticas.addEventListener("click", () => {
	const container = document.getElementById("estadisticas-container");
	if (container) {
		container.style.display = "none";
	}
});
