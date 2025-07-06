let memoriaAsignada = [];

export function simularSegmentacionPaginada(procesos) {
	const TAM_PAGINA_KiB = 100;
	const TAM_PAGINA_BYTES = TAM_PAGINA_KiB * 1024;
	const LIMITE_MEMORIA_BYTES = 16 * 1024 * 1024;

	const tabla = document.querySelector("#TablaSimulacion tbody");
	if (!tabla) {
		console.error("No se encontró la tabla de simulación.");
		return;
	}

	memoriaAsignada = memoriaAsignada.filter((entry) =>
		procesos.some((p) => p.nombre === entry.proceso)
	);

	let marcoActual =
		memoriaAsignada.length > 0
			? Math.max(...memoriaAsignada.map((m) => m.marco)) + 1
			: 0;

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
	memoriaAsignada.forEach(({proceso, segmento, pagina, marco, base, fin}) => {
		const fila = document.createElement("tr");
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
}
