// Iconos de trazo fino (24×24). Para usar uno nuevo, añádelo aquí y nómbralo en la configuración.
const P = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  church: '<path d="M12 2v4M10 4h4M7 21V11l5-4 5 4v10M3 21h18M10 21v-4a2 2 0 0 1 4 0v4"/>',
  glasses: '<path d="M7 3h4l-.5 6a1.5 1.5 0 0 1-3 0zM13 3h4l-.5 6a1.5 1.5 0 0 1-3 0zM9 10.5V20M15 10.5V20M7 20h4M13 20h4"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  bouquet: '<circle cx="9" cy="7" r="2.5"/><circle cx="15" cy="7" r="2.5"/><circle cx="12" cy="4.5" r="2.5"/><circle cx="12" cy="9.5" r="2.5"/><path d="M12 12l-3 9h6z"/>',
  disco: '<circle cx="12" cy="13" r="7"/><path d="M5 13h14M12 6c2.2 2 2.2 12 0 14M12 6c-2.2 2-2.2 12 0 14M12 2v4"/>',
  food: '<circle cx="12" cy="13" r="6"/><path d="M3 4v6M5 4v6M4 10v10M20 4c-1.5 1-2 3-2 5h2v11"/>',
  cake: '<path d="M4 21h16M5 21v-7h14v7M7 14v-3h10v3M12 11V8M12 6.5a1 1 0 0 0 0-2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="M9 4h6l-3 5z"/>',
  dress: '<path d="M9.5 2v4l-1.5 3 1.5 1.5L5 21h14l-4.5-10.5L16 9l-1.5-3V2"/><path d="M9.5 6h5"/>',
  suit: '<path d="M8 3l4 4 4-4 4 2v16H4V5z"/><path d="M12 7v14"/><path d="M8 3l1 6-1 2 4-4"/><path d="M16 3l-1 6 1 2-4-4"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  pin: '<path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.2"/>',
};

export function icon(name, { size = 34, stroke = 1.2, label = '' } = {}) {
  const d = P[name];
  if (!d) throw new Error(`Icono desconocido: "${name}". Disponibles: ${Object.keys(P).join(', ')}`);
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${d}</svg>`;
}

export const LEAF = '<path d="M58 238C56 180 60 110 72 6" stroke="var(--leaf-stem)" stroke-width="1.2"/><path d="M58 205C36 198 24 178 26 156C44 166 55 184 58 205Z" fill="var(--leaf-1)"/><path d="M59 175C80 166 90 146 88 124C70 134 61 154 59 175Z" fill="var(--leaf-2)"/><path d="M61 140C40 132 30 112 33 92C50 102 59 120 61 140Z" fill="var(--leaf-3)"/><path d="M64 108C84 98 92 80 90 60C73 70 65 88 64 108Z" fill="var(--leaf-1)"/><path d="M67 74C50 66 43 50 46 34C60 42 67 58 67 74Z" fill="var(--leaf-2)"/>';

export const SPRIG = '<path d="M8 10c22 18 58 36 124 48" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" opacity=".55"/><path d="M16 4c11 4 16 14 6 22-12-2-16-12-6-22z" opacity=".82"/><path d="M28 22c10 6 12 16 1 22-11-3-14-13-1-22z" opacity=".5"/><path d="M40 12c12 5 16 16 5 24-13-2-16-14-5-24z" opacity=".72"/><path d="M58 28c9 5 11 14 1 20-10-2-12-12-1-20z" opacity=".48"/><path d="M72 18c11 4 14 14 4 22-12-2-14-13-4-22z" opacity=".68"/>';
