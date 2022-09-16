"""
Tool to construct graphs to pass to the frontend.
"""
from typing import Any, Callable


class GraphBuilder:
    """
    Allows the gradual building of a graph to pass to the frontend.
    """
    def __init__(self):
        self._num_records = 0
        self._nodes: dict[int, list[Any]] = {}
        self._edges: dict[tuple[int, int], list[Any]] = {}

    def get_node_count(self) -> int:
        """ Returns the number of nodes in the current graph. """
        return len(self._nodes)

    def get_edge_count(self) -> int:
        """ Returns the number of edges in the current graph. """
        return len(self._edges)

    def add_record(self):
        """ Marks that another record is being processed. """
        self._num_records += 1

    def add_node(self, node_id: int, data: Any):
        """ Adds a single node to the graph. """
        if node_id in self._nodes:
            self._nodes[node_id].append(data)
        else:
            self._nodes[node_id] = [data]

    def add_edge(self, from_id: int, to_id: int, data: Any):
        """ Adds an edge between nodes in the graph. """
        key = (min(from_id, to_id), max(from_id, to_id))
        if key in self._edges:
            self._edges[key].append(data)
        else:
            self._edges[key] = [data]

    def build(
            self, node_configure_fn: Callable[[list[Any]], dict],
            edge_configure_fn: Callable[[list[Any]], dict]
    ) -> dict:
        """ Builds the graph to be passed to the frontend. """
        nodes = []
        for node_id, node_data in self._nodes.items():
            nodes.append({
                **node_configure_fn(node_data),
                "id": node_id,
            })

        edges = []
        for (from_id, to_id), edge_data in self._edges.items():
            edges.append({
                **edge_configure_fn(edge_data),
                "from": from_id,
                "to": to_id,
            })

        return {
            "counts": {
                "edges num": len(self._edges),
                "nodes num": len(self._nodes),
                "records num": self._num_records
            },
            "nodes": nodes,
            "edges": edges
        }
