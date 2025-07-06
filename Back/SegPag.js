export function simularSegmentacionPaginada({
	memoriaMiB = 2, // Puedes subirlo si quieres ver más marcos
	pageKiB = 4,
	procesos = [],
} = {}) {
	const PAGE_SIZE = pageKiB * 1024;
	const NUM_FRAMES = Math.floor((memoriaMiB * 1024 * 1024) / PAGE_SIZE);
	const SO_BYTES = 983040;
	const SO_FRAMES = Math.ceil(SO_BYTES / PAGE_SIZE);

	const frames = [];

	// 1. Reservar marcos para el sistema operativo
	for (let i = 0; i < SO_FRAMES; i++) {
		frames[i] = {
			frame: i,
			pid: 'SO',
			segmento: 'sistema',
			page: i,
		};
	}

	// 2. Inicializar marcos restantes como libres
	for (let i = SO_FRAMES; i < NUM_FRAMES; i++) {
		frames[i] = {
			frame: i,
			pid: 'Libre',
			segmento: null,
			page: null,
		};
	}

	// 3. Asignar marcos por proceso y segmento
	let nextFreeFrame = SO_FRAMES;
	for (const { nombre, segmentos } of procesos) {
		for (const { tipo, tam } of segmentos) {
			const numPages = Math.ceil((tam * 1024) / PAGE_SIZE);
			for (let p = 0; p < numPages; p++) {
				if (nextFreeFrame >= NUM_FRAMES) {
					console.warn("Memoria llena. No caben todos los procesos.");
					return { PAGE_SIZE, frames };
				}
				frames[nextFreeFrame] = {
					frame: nextFreeFrame,
					pid: nombre,
					segmento: tipo,
					page: p,
				};
				nextFreeFrame++;
			}
		}
	}

	return {
		PAGE_SIZE,
		frames,
	};
}
