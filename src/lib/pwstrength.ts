// Rough password check for the register screen. A weak password is only a warning: the person can still use it.
const COMMON = ['12345678', '123456789', '1234567890', '87654321', '11111111', '00000000', '12341234', '11223344', 'password', 'password1', 'password123', 'qwertyui', 'qwerty123', 'abcd1234', 'abc12345', 'iloveyou', 'admin123', 'letmein1', 'welcome1', 'sayangkamu', 'malaysia', 'kata laluan'];
const run = (s: string) => { // 12345678, abcdefgh, 87654321 ...
  if (s.length < 6) return false; let up = true, down = true;
  for (let i = 1; i < s.length; i++) { const d = s.charCodeAt(i) - s.charCodeAt(i - 1); if (d !== 1) up = false; if (d !== -1) down = false; }
  return up || down;
};
export type PwLevel = 0 | 1 | 2; // 0 weak, 1 okay, 2 strong
export function pwLevel(p: string): PwLevel {
  const s = p.toLowerCase();
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
  if (COMMON.some((c) => s === c) || /^\d+$/.test(p) && p.length < 12 || /^(.)\1+$/.test(p) || run(s) || /^(.{1,3})\1+$/.test(p) || classes < 2 && p.length < 12) return 0;
  if (p.length >= 16 || p.length >= 12 && classes >= 3) return 2;
  return 1;
}
export const PW_TEXT = ['Too easy to guess, and risky. You can still use it, but a longer mix of letters and numbers is safer.', 'Okay. Make it longer or add a symbol to make it stronger.', 'Strong password.'];
