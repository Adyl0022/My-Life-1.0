type L = (c: boolean) => void;
const ls = new Set<L>();
let last = 0;
let col = false;
export function subscribeNav(f: L) { ls.add(f); return () => { ls.delete(f); }; }
export function setNavCollapsed(c: boolean) { if (c !== col) { col = c; ls.forEach((f) => f(c)); } }
export function navScroll(e: any) {
  const y = e?.nativeEvent?.contentOffset?.y ?? 0;
  const dy = y - last;
  last = y;
  if (y < 30) setNavCollapsed(false);
  else if (dy > 8) setNavCollapsed(true);
  else if (dy < -8) setNavCollapsed(false);
}
