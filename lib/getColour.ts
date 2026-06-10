export function getUserColor(userId: string) {
  const colors = [
    "#ef4444", 
    "#3b82f6", 
    "#22c55e", 
    "#f59e0b", 
    "#a855f7", 
    "#ec4899", 
  ];

  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash += userId.charCodeAt(i);
  }

  return colors[hash % colors.length];
}