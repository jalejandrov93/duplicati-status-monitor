export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  if (response.status === 403) {
    throw new Error("No autorizado");
  }
  if (response.status === 503) {
    throw new Error("Servicio no configurado");
  }
  if (!response.ok) {
    throw new Error(`Error al realizar la petición: ${response.status}`);
  }

  return response.json();
}
