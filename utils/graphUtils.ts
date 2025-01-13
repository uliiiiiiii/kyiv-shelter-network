export const dijkstra = (graph: Record<string, Record<string, number>>, start: string) => {
    const distances: Record<string, number> = {};
    const visited: Record<string, boolean> = {};
    const previous: Record<string, string | null> = {};
  
    Object.keys(graph).forEach((node) => {
      distances[node] = Infinity;
      previous[node] = null;
    });
    distances[start] = 0;
  
    const queue = new Set(Object.keys(graph));
  
    while (queue.size > 0) {
      const currentNode = Array.from(queue).reduce((closest, node) =>
        distances[node] < distances[closest] ? node : closest
      );
  
      queue.delete(currentNode);
      visited[currentNode] = true;
  
      Object.entries(graph[currentNode]).forEach(([neighbor, distance]) => {
        if (!visited[neighbor]) {
          const newDist = distances[currentNode] + distance;
          if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist;
            previous[neighbor] = currentNode;
          }
        }
      });
    }
  
    return { distances, previous };
  };
  