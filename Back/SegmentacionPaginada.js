let memoriaAsignada = [];

export function simularSegmentacionPaginada(procesos) {
	const TAM_PAGINA_KiB = 100;
	const TAM_PAGINA_BYTES = TAM_PAGINA_KiB * 1024;
	const LIMITE_MEMORIA_BYTES = 16 * 1024 * 1024;
	const MARCOS_SO = 5; // Número de marcos reservados para el SO

	const tabla = document.querySelector("#TablaSimulacion tbody");
	if (!tabla) {
		console.error("No se encontró la tabla de simulación.");
		return;
	}

	// Inicializar el SO si no existe en memoria
	inicializarSO(MARCOS_SO, TAM_PAGINA_BYTES);

	memoriaAsignada = memoriaAsignada.filter((entry) =>
		entry.proceso === "SO" || procesos.some((p) => p.nombre === entry.proceso)
	);

	let marcoActual =
		memoriaAsignada.length > 0
			? Math.max(...memoriaAsignada.map((m) => m.marco)) + 1
			: MARCOS_SO; // Comenzar después de los marcos del SO

	let memoriaUsada = memoriaAsignada.length * TAM_PAGINA_BYTES;

	procesos.forEach((proceso) => {
		["text", "data", "bss", "stack", "heap"].forEach((segmento) => {
			const tamSegmento = parseInt(proceso[segmento]);

			if (tamSegmento > 0) {
				const paginas = Math.ceil(tamSegmento / TAM_PAGINA_BYTES);
				const yaAsignado = memoriaAsignada.filter(
					(e) =>
						e.proceso === proceso.nombre && e.segmento === segmento
				);

				for (let i = yaAsignado.length; i < paginas; i++) {
					if (
						memoriaUsada + TAM_PAGINA_BYTES >
						LIMITE_MEMORIA_BYTES
					) {
						alert(
							`Se ha alcanzado el límite de 16 MiB de memoria. El proceso "${proceso.nombre}" no puede asignar más.`
						);
						return;
					}

					const base = marcoActual * TAM_PAGINA_BYTES;
					const fin = base + TAM_PAGINA_BYTES - 1;

					memoriaAsignada.push({
						proceso: proceso.nombre,
						segmento,
						pagina: i,
						marco: marcoActual,
						base,
						fin,
					});

					marcoActual++;
					memoriaUsada += TAM_PAGINA_BYTES;
				}
			}
		});
	});

	tabla.innerHTML = "";
	
	// Ordenar la memoria asignada para mostrar el SO primero
	const memoriaOrdenada = memoriaAsignada.sort((a, b) => {
		if (a.proceso === "SO" && b.proceso !== "SO") return -1;
		if (a.proceso !== "SO" && b.proceso === "SO") return 1;
		return a.marco - b.marco;
	});
	
	memoriaOrdenada.forEach(({proceso, segmento, pagina, marco, base, fin}) => {
		const fila = document.createElement("tr");
		
		// Aplicar estilo especial al SO
		if (proceso === "SO") {
			fila.style.backgroundColor = "#ffeb3b"; // Amarillo para destacar el SO
			fila.style.fontWeight = "bold";
		}
		
		fila.innerHTML = `
			<td>${proceso} - .${segmento}</td>
			<td>${pagina}</td>
			<td>${marco}</td>
			<td>0x${base.toString(16).toUpperCase().padStart(6, "0")}</td>
			<td>0x${fin.toString(16).toUpperCase().padStart(6, "0")}</td>
			<td>${TAM_PAGINA_KiB} KiB</td>
		`;
		tabla.appendChild(fila);
	});

	const filaResumen = document.createElement("tr");
	filaResumen.innerHTML = `
		<td colspan="5" style="background-color: #a6b871 ;"><strong>Total Memoria Ocupada</strong></td>
		<td style="background-color: #a6b871 ;">${(memoriaUsada / 1024).toFixed(
			2
		)} KiB</td>
	`;
	filaResumen.style.background = "#ddd";
	tabla.appendChild(filaResumen);
	
	// Actualizar visualización de memoria
	actualizarVisualizacionMemoria();
}

// Función para inicializar el Sistema Operativo con marcos reservados
function inicializarSO(marcosReservados, tamPaginaBytes) {
	// Verificar si el SO ya está cargado
	const soExiste = memoriaAsignada.some(entry => entry.proceso === "SO");
	
	if (!soExiste) {
		// Crear entradas para el SO en los primeros marcos
		for (let marco = 0; marco < marcosReservados; marco++) {
			const base = marco * tamPaginaBytes;
			const fin = base + tamPaginaBytes - 1;
			
			memoriaAsignada.push({
				proceso: "SO",
				segmento: "kernel",
				pagina: marco,
				marco: marco,
				base: base,
				fin: fin,
			});
		}
		
		console.log(`Sistema Operativo inicializado con ${marcosReservados} marcos reservados.`);
	}
}

// Función para configurar el número de marcos del SO
export function configurarMarcosOS(numeroMarcos) {
	// Limpiar SO existente
	memoriaAsignada = memoriaAsignada.filter(entry => entry.proceso !== "SO");
	
	// Reinicializar con el nuevo número de marcos
	const TAM_PAGINA_BYTES = 100 * 1024;
	inicializarSO(numeroMarcos, TAM_PAGINA_BYTES);
	
	console.log(`SO reconfigurado con ${numeroMarcos} marcos.`);
}

// Función para obtener estadísticas de memoria por proceso
export function obtenerEstadisticasMemoria() {
	const estadisticas = {};
	const TAM_PAGINA_KiB = 100;
	
	memoriaAsignada.forEach(entry => {
		if (!estadisticas[entry.proceso]) {
			estadisticas[entry.proceso] = {
				marcos: 0,
				memoriaKiB: 0,
				segmentos: new Set()
			};
		}
		
		estadisticas[entry.proceso].marcos++;
		estadisticas[entry.proceso].memoriaKiB += TAM_PAGINA_KiB;
		estadisticas[entry.proceso].segmentos.add(entry.segmento);
	});
	
	// Convertir Set a Array para facilitar el uso
	Object.keys(estadisticas).forEach(proceso => {
		estadisticas[proceso].segmentos = Array.from(estadisticas[proceso].segmentos);
	});
	
	return estadisticas;
}

// Función para actualizar la visualización gráfica de memoria
function actualizarVisualizacionMemoria() {
	const container = document.getElementById("memoriaVisual");
	const memoriaUsadaSpan = document.getElementById("memoria-usada");
	const memoriaDisponibleSpan = document.getElementById("memoria-disponible");
	
	if (!container) return;
	
	const TAM_PAGINA_KiB = 100;
	const LIMITE_MEMORIA_KiB = 16384; // 16 MiB
	const TOTAL_MARCOS = LIMITE_MEMORIA_KiB / TAM_PAGINA_KiB; // 164 marcos
	
	// Limpiar container
	container.innerHTML = "";
	
	// Calcular memoria usada
	const memoriaUsadaKiB = memoriaAsignada.length * TAM_PAGINA_KiB;
	const memoriaDisponibleKiB = LIMITE_MEMORIA_KiB - memoriaUsadaKiB;
	
	// Actualizar estadísticas
	memoriaUsadaSpan.textContent = `Memoria Usada: ${memoriaUsadaKiB} KiB`;
	memoriaDisponibleSpan.textContent = `Disponible: ${memoriaDisponibleKiB} KiB`;
	
	// Crear marcos visuales
	for (let marco = 0; marco < TOTAL_MARCOS; marco++) {
		const marcoDiv = document.createElement("div");
		marcoDiv.className = "marco-memoria";
		marcoDiv.textContent = marco;
		
		// Buscar si este marco está asignado
		const asignado = memoriaAsignada.find(m => m.marco === marco);
		
		if (asignado) {
			if (asignado.proceso === "SO") {
				marcoDiv.classList.add("marco-so");
				marcoDiv.setAttribute("data-tooltip", `Marco ${marco}: SO - ${asignado.segmento}`);
			} else {
				marcoDiv.classList.add("marco-proceso");
				marcoDiv.setAttribute("data-tooltip", `Marco ${marco}: ${asignado.proceso} - ${asignado.segmento} (Página ${asignado.pagina})`);
			}
		} else {
			marcoDiv.classList.add("marco-libre");
			marcoDiv.setAttribute("data-tooltip", `Marco ${marco}: Libre`);
			marcoDiv.textContent = "";
		}
		
		container.appendChild(marcoDiv);
	}
}
