export type Period = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export const THEMES: Record<Period, { colors: string[]; locations: number[]; shade: number; a: string; b: string; c: string }> = {
  Morning: { colors: ['#4a86d9', '#8db6ec', '#f5b88e', '#c76f7e', '#5c4a8f'], locations: [0, 0.26, 0.52, 0.78, 1], shade: 0.42, a: 'rgba(255,214,150,.55)', b: 'rgba(255,150,170,.4)', c: 'rgba(160,200,255,.35)' },
  Afternoon: { colors: ['#1f6fd8', '#3f9bea', '#6fb0ee', '#3f6fc0'], locations: [0, 0.38, 0.62, 1], shade: 0.4, a: 'rgba(255,236,160,.5)', b: 'rgba(120,200,255,.4)', c: 'rgba(255,255,255,.25)' },
  Evening: { colors: ['#2a2468', '#7a3b8f', '#e8667a', '#f6a35b', '#4a2a5e'], locations: [0, 0.32, 0.58, 0.76, 1], shade: 0.45, a: 'rgba(255,150,120,.5)', b: 'rgba(183,120,255,.45)', c: 'rgba(255,196,107,.3)' },
  Night: { colors: ['#0a0f2c', '#1a1048', '#0c2b4d'], locations: [0, 0.48, 1], shade: 0, a: 'rgba(124,156,255,.5)', b: 'rgba(183,148,255,.4)', c: 'rgba(94,231,223,.3)' },
};
// Morning 5:00-12:00, Afternoon 12:00-17:00, Evening 17:00-20:00, Night 20:00-5:00
export function periodOf(d: Date): Period {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 20) return 'Evening';
  return 'Night';
}
export const LINES = ["hope you are well today..", "today is a fresh page, make it count.", "small steps still move you forward.", "take a deep breath, you've got this.", "drink some water and keep going.", "be kind to yourself today.", "one good habit at a time.", "your effort today matters.", "stay calm, stay steady.", "hope something good finds you today.", "make time for what matters most.", "progress, not perfection.", "a little gratitude goes a long way.", "rest when you need to, then continue.", "you are doing better than you think.", "keep your focus on what you can control.", "may your day be light and easy.", "start small, finish strong.", "take care of your mind and body.", "every day is a chance to improve.", "slow and steady wins the day.", "remember to pause and smile.", "your goals are closer than yesterday.", "let today be productive and peaceful.", "look after your time and your health.", "you have plenty to be proud of.", "stay patient, good things take time.", "do one thing today your future self will thank you for.", "keep going, you are on the right track.", "finish what you started yesterday.", "end the month with a strong heart."];
export const FONT = undefined as string | undefined;
