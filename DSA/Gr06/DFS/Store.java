package DFS;

import org.graphstream.graph.Graph;
import org.graphstream.graph.Node;
import org.graphstream.graph.implementations.SingleGraph;

public class Store {
    public Graph graph_1() {
        Graph graph = new SingleGraph("single graph", false, true);
        graph.addNode("Node 1").setAttribute("xy", 1, 1 * 30);
        graph.addNode("Node 2").setAttribute("xy", 1, 2 * 30);
        graph.addNode("Node 3").setAttribute("xy", 1, 3 * 30);
        graph.addNode("Node 4").setAttribute("xy", 1, 4 * 30);
        graph.addNode("Node 5").setAttribute("xy", 1, 5 * 30);
        graph.addNode("Node 6").setAttribute("xy", 100, 1 * 30);
        graph.addNode("Node 7").setAttribute("xy", 100, 2 * 30);
        graph.addNode("Node 8").setAttribute("xy", 100, 3 * 30);
        graph.addNode("Node 9").setAttribute("xy", 100, 4 * 30);
        graph.addNode("Node 10").setAttribute("xy", 100, 5 * 30);
        graph.addEdge("Node 1 Node 6", "Node 1", "Node 6");
        graph.addEdge("Node 1 Node 8", "Node 1", "Node 8");
        graph.addEdge("Node 1 Node 9", "Node 1", "Node 9");
        graph.addEdge("Node 2 Node 8", "Node 2", "Node 8");
        graph.addEdge("Node 2 Node 10", "Node 2", "Node 10");
        graph.addEdge("Node 3 Node 9", "Node 3", "Node 9");
        graph.addEdge("Node 3 Node 6", "Node 3", "Node 6");
        graph.addEdge("Node 5 Node 10", "Node 5", "Node 9");
        graph.addEdge("Node 5 Node 7", "Node 5", "Node 7");
        graph.addEdge("Node 4 Node 9", "Node 4", "Node 9");
        // graph.addEdge("Node 4 Node 9", "Node 4", "Node 9");
        for (Node node : graph) {
            node.setAttribute("ui.label", node.getId());
        }
        return graph;
    }

    public Graph graph_2() {
        Graph graph = new SingleGraph("single graph", false, true);
        graph.addNode("Node 1").setAttribute("xy", 1, 1 * 30);
        graph.addNode("Node 2").setAttribute("xy", 1, 2 * 30);
        graph.addNode("Node 3").setAttribute("xy", 1, 3 * 30);
        graph.addNode("Node 4").setAttribute("xy", 1, 4 * 30);
        graph.addNode("Node 5").setAttribute("xy", 1, 5 * 30);
        graph.addNode("Node 6").setAttribute("xy", 100, 1 * 30);
        graph.addNode("Node 7").setAttribute("xy", 100, 2 * 30);
        graph.addNode("Node 8").setAttribute("xy", 100, 3 * 30);
        graph.addNode("Node 9").setAttribute("xy", 100, 4 * 30);
        graph.addNode("Node 10").setAttribute("xy", 100, 5 * 30);
        graph.addEdge("Node 1 Node 6", "Node 1", "Node 6");
        graph.addEdge("Node 1 Node 8", "Node 1", "Node 8");
        graph.addEdge("Node 1 Node 9", "Node 1", "Node 9");
        graph.addEdge("Node 2 Node 8", "Node 2", "Node 8");
        graph.addEdge("Node 2 Node 10", "Node 2", "Node 10");
        graph.addEdge("Node 3 Node 9", "Node 3", "Node 9");
        graph.addEdge("Node 3 Node 6", "Node 3", "Node 6");
        graph.addEdge("Node 5 Node 10", "Node 5", "Node 9");
        graph.addEdge("Node 5 Node 7", "Node 5", "Node 7");
        graph.addEdge("Node 4 Node 9", "Node 4", "Node 9");
        graph.addEdge("Node 4 Node 5", "Node 4", "Node 5");
        // graph.addEdge("Node 4 Node 9", "Node 4", "Node 9");
        for (Node node : graph) {
            node.setAttribute("ui.label", node.getId());
        }
        return graph;
    }
}
