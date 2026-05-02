const memory = [];

export function storeMemory(entry) {
  memory.push({
    ...entry,
    timestamp: new Date().toISOString()
  });

  if (memory.length > 50) {
    memory.shift();
  }
}

export function getRecentMemory(limit = 10) {
  return memory.slice(-limit);
}

export function getAllMemory() {
  return memory;
}
