package DFS;

import java.util.Arrays;
import java.util.Iterator;


import java.awt.BorderLayout;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import org.graphstream.graph.*;
import org.graphstream.graph.implementations.*;
import org.graphstream.ui.swing.SwingGraphRenderer;
import org.graphstream.ui.swing_viewer.DefaultView;
import org.graphstream.ui.swing_viewer.SwingViewer;

import hw8_20001928_maiviethung.Egde;
import hw8_20001928_maiviethung.GraphInterface;
import hw8_20001928_maiviethung.Vertex;
import hw8_20001928_maiviethung.ex1.UnDirectUnWeightGraph;

public class Visualize_1<T> extends JFrame {
    // GraphInterface<T> graph;
    MultiGraph graph;
    int x = 1;
    int y = 1;
    boolean running = false;
    boolean paused = false;
    private JFrame mainFrame;
    private JLabel headerLabel;
    private JLabel statusLabel;
    private JPanel controlPanel;

    public Visualize_1() {
        // this.graph = graph;
        // prepareGUI();
    }

    public MultiGraph convertToGUI(GraphInterface<T> g) {
        MultiGraph graph = new MultiGraph("single graph");

        Iterator it = g.egdes();
        Iterator it2 = g.vertices();
        int i = 0;
        while (it2.hasNext()) {
            String temp = (String) it2.next();
            graph.addNode((String) temp);
        }
        while (it.hasNext()) {
            Egde temp = (Egde) it.next();
            graph.addEdge((String) temp.getStart().getElement()
                    + " "
                    + (String) temp.getEnd().getElement(), (String) temp.getStart().getElement(),
                    (String) temp.getEnd().getElement());

        }
        it = g.egdes();
        while (it.hasNext()) {
            Egde temp = (Egde) it.next();
            graph.getEdge((String) temp.getStart().getElement()
                    + " "
                    + (String) temp.getEnd().getElement()).setAttribute("length", temp.getWeight());

        }
        for (Node node : graph) {
            node.setAttribute("ui.label", node.getId());
        }
        // graph.edges().forEach(e -> e.setAttribute("label", "" + (int)
        // e.getNumber("length")));

        // graph.edges().forEach(e -> e.setAttribute("length", 12));
        return graph;
    }

    public static void sleep() {
        try {
            Thread.sleep(500);
        } catch (Exception e) {
        }
    }

    public static void sleep(double sec) {
        try {
            Thread.sleep((int) sec * 1000);
        } catch (Exception e) {
        }
    }

    public GraphInterface loadGraph_2() {
        UnDirectUnWeightGraph<String> g = new UnDirectUnWeightGraph<>(6);
        // DFS<String> dfs = new DFS<String>();
        Vertex<String> V_1 = g.insertVertex("Node 1");
        Vertex<String> V_2 = g.insertVertex("Node 2");
        Vertex<String> V_3 = g.insertVertex("Node 3");
        Vertex<String> V_4 = g.insertVertex("Node 4");
        Vertex<String> V_5 = g.insertVertex("Node 5");
        Vertex<String> V_6 = g.insertVertex("Node 6");
        Vertex<String> V_7 = g.insertVertex("Node 7");
        Vertex<String> V_8 = g.insertVertex("Node 8");
        Vertex<String> V_9 = g.insertVertex("Node 9");
        Vertex<String> V_10 = g.insertVertex("Node 10");

        Egde<String> E_1 = g.insertEgde(V_1, V_6, 2);
        Egde<String> E_2 = g.insertEgde(V_1, V_8, 2);
        Egde<String> E_3 = g.insertEgde(V_1, V_9, 2);
        Egde<String> E_4 = g.insertEgde(V_2, V_8, 2);
        Egde<String> E_5 = g.insertEgde(V_2, V_10, 2);
        Egde<String> E_8 = g.insertEgde(V_3, V_9, 2);
        Egde<String> E_9 = g.insertEgde(V_3, V_6, 2);
        Egde<String> E_6 = g.insertEgde(V_5, V_10, 2);
        Egde<String> E_10 = g.insertEgde(V_5, V_7, 2);
        Egde<String> E_7 = g.insertEgde(V_4, V_9, 2);
        // Egde<String> E_11 = g.insertEgde(V_4, V_1, 2);
        // Egde<String> E_8 = g.insertEgde(V_8, V_2, 2);
        // Egde<String> E_9 = g.insertEgde(V_8, V_3, 2);
        // Egde<String> E_10 = g.insertEgde(V_10, V_1, 2);
        // Egde<String> E_11 = g.insertEgde(V_9, V_5, 2);
        this.checkBipartite(g, V_1);
        this.sleep();
        this.loadGraph_2_1();
        return g;
    }

    public GraphInterface loadGraph_1() {
        UnDirectUnWeightGraph<String> g = new UnDirectUnWeightGraph<>(6);
        // DFS<String> dfs = new DFS<String>();
        Vertex<String> V_1 = g.insertVertex("Node 1");
        Vertex<String> V_2 = g.insertVertex("Node 2");
        Vertex<String> V_3 = g.insertVertex("Node 3");
        Vertex<String> V_4 = g.insertVertex("Node 4");
        Vertex<String> V_5 = g.insertVertex("Node 5");
        Vertex<String> V_6 = g.insertVertex("Node 6");
        Vertex<String> V_8 = g.insertVertex("Node 8");
        Vertex<String> V_9 = g.insertVertex("Node 9");
        Vertex<String> V_10 = g.insertVertex("Node 10");

        Egde<String> E_1 = g.insertEgde(V_1, V_2, 2);
        Egde<String> E_2 = g.insertEgde(V_1, V_3, 2);
        Egde<String> E_3 = g.insertEgde(V_1, V_4, 2);
        Egde<String> E_4 = g.insertEgde(V_2, V_3, 2);
        Egde<String> E_5 = g.insertEgde(V_3, V_5, 2);
        Egde<String> E_6 = g.insertEgde(V_5, V_2, 2);
        Egde<String> E_7 = g.insertEgde(V_4, V_6, 2);
        Egde<String> E_8 = g.insertEgde(V_8, V_6, 2);
        Egde<String> E_9 = g.insertEgde(V_8, V_3, 2);
        Egde<String> E_10 = g.insertEgde(V_10, V_1, 2);
        Egde<String> E_11 = g.insertEgde(V_9, V_5, 2);

        this.dfs(g, V_1);
        return g;
    }

    public void loadGraph_2_1() {
        Graph graph = new SingleGraph("single graph", false, true);
        graph.setAttribute("ui.quality");
        graph.setAttribute("ui.antialias");
        graph.addNode("Node 1").setAttribute("ui.class", "green");
        graph.addNode("Node 2").setAttribute("ui.class", "green");
        graph.addNode("Node 3").setAttribute("ui.class", "green");
        graph.addNode("Node 4").setAttribute("ui.class", "green");
        graph.addNode("Node 5").setAttribute("ui.class", "green");
        graph.addNode("Node 6").setAttribute("ui.class", "blue");
        graph.addNode("Node 7").setAttribute("ui.class", "blue");
        graph.addNode("Node 8").setAttribute("ui.class", "blue");
        graph.addNode("Node 9").setAttribute("ui.class", "blue");
        graph.addNode("Node 10").setAttribute("ui.class", "blue");
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
        graph.setAttribute("ui.stylesheet", styleSheet);
        graph.display(false);
        // graph.getNode("Node 1")
        
    }

    public void dfs(GraphInterface g, Vertex<String> start) {
        // GraphInterface g = this.loadGraph_2();
        graph = this.convertToGUI(g);
        graph.setAttribute("ui.stylesheet", "url('D:\\Project\\java\\src\\DFS\\stylesheet')");
        graph.display();

        Boolean[] isVisited = new Boolean[g.numVertices()];
        this.dfsWithRecusive(g, isVisited, start);
    }

    public void checkBipartite(GraphInterface g, Vertex<String> start) {
        graph = this.convertToGUI(g);
        graph.setAttribute("ui.stylesheet", styleSheet);
        graph.setAttribute("ui.quality");
        graph.setAttribute("ui.antialias");

        graph.display();

        Boolean[] isVisited = new Boolean[g.numVertices()];
        Arrays.fill(isVisited, false);
        int[] color = new int[g.numVertices()];
        this.dfsForCheckBipartite(g, isVisited, start, color);
    }

    public void separateColor(Vertex<String> v, int[] color, GraphInterface<String> g) {

        if (color[g.getVIndex(v)] == 1) {
            // graph.getNode(v.getElement()).setAttribute("xy", x, x * 20);
            graph.getNode(v.getElement()).setAttribute("ui.class", "blue");
            // x++;
            sleep();
        } else {
            // graph.getNode(v.getElement()).setAttribute("xy", y + 100, y * 20);
            graph.getNode(v.getElement()).setAttribute("ui.class", "green");
            // y++;
            sleep();
        }

    }

    public int[] dfsForCheckBipartite(GraphInterface<String> g, Boolean[] isVisited, Vertex<String> start,
            int[] color) {
        // System.out.println(start.getElement());
        // this.visiting(start.getElement());
        // isVisited[g.getVIndex(start)] = false;
        this.visiting((String) start.getElement());
        sleep();
        this.separateColor(start, color, g);
        Iterator edges = g.outgoingEgdes(start);
        isVisited[g.getVIndex(start)] = true;
        while (edges.hasNext()) {
            // boolean isVisited
            // System.out.println(""(String)start.getElement());
            Iterator edges1 = g.outgoingEgdes(start);
            while (edges1.hasNext()) {
                movable(edges1.next().toString());
            }
            sleep(0.2);
            Egde<String> nextE = (Egde<String>) edges.next();
            markedEdge(nextE.toString());
            sleep();
            clearColor(nextE.toString());
            edges1 = g.outgoingEgdes(start);
            while (edges1.hasNext()) {
                clearColor(edges1.next().toString());
            }

            Vertex<String> next = g.opposite(start, nextE);
            if (isVisited[g.getVIndex(next)] == false) {
                // isVisited[g.getVIndex(next)] = true;
                color[g.getVIndex(next)] = 1 - color[g.getVIndex(start)];
                // this.separateColor(next, color, g);
                dfsForCheckBipartite(g, isVisited, next, color);

            } else if (color[g.getVIndex(next)] == color[g.getVIndex(start)]) {
                // for (int i = 0; i < 5; i++) {

                // }
                clearColor(nextE.toString());
                // sleep();
                markedEdge(nextE.toString());
                sleep(1000);
                return color;
            }
        }
        this.visiting((String) start.getElement());
        sleep();
        this.separateColor(start, color, g);
        return color;
    }

    public void dfsWithRecusive(GraphInterface<String> g, Boolean[] isVisited, Vertex<String> start) {
        isVisited[g.getVIndex(start)] = true;

        // road.add(start);
        // System.out.println(start.getElement());

        // sleep();

        Iterator edges = g.outgoingEgdes(start);
        edges = g.outgoingEgdes(start);
        while (edges.hasNext()) {
            this.visiting((String) start.getElement());
            // System.out.println(""(String)start.getElement());
            Iterator edges1 = g.outgoingEgdes(start);
            while (edges1.hasNext()) {
                movable(edges1.next().toString());
            }
            sleep();
            Egde<String> nextE = (Egde<String>) edges.next();
            markedEdge(nextE.toString());
            sleep();
            clearColor(nextE.toString());
            edges1 = g.outgoingEgdes(start);
            while (edges1.hasNext()) {
                clearColor(edges1.next().toString());
            }
            marked((String) start.getElement());
            // sleep();
            Vertex<String> next = g.opposite(start, nextE);
            if (isVisited[g.getVIndex(next)] == null) {
                this.dfsWithRecusive(g, isVisited, next);
            }
        }
        this.visiting((String) start.getElement());
        sleep(1);
        this.marked((String) start.getElement());
    }

    public void marked(String node) {
        this.graph.getNode(node).setAttribute("ui.class", "marked");
    }

    public void visiting(String node) {
        this.graph.getNode(node).setAttribute("ui.class", "visiting");
    }

    public void markedEdge(String id) {
        this.graph.getEdge(id).setAttribute("ui.class", "visited");
    }

    public void movable(String id) {
        this.graph.getEdge(id).setAttribute("ui.class", "movable");
    }

    public void clearColor(String id) {
        this.graph.getEdge(id).setAttribute("ui.class", "default");
    }

    public static String styleSheet = "node {" +
            "	fill-color: black; size: 30px; size-mode:fit;" +
            "}" +
            "node.marked {" +
            "	fill-color: orange;" +
            "}" +
            "node.visiting {" +
            "	fill-color: red;" +
            "}" +
            "node.blue {" +
            "	fill-color: blue;" +
            "}" +
            "node.green {" +
            "	fill-color: green;" +
            "}" +
            "edge.visited {fill-color: red;}"
            +

            "edge.movable {fill-color: green;}"
            +

            "edge.default {fill-color: black;}"
            +
            "edge {size: 3px;}" +
            "node { text-alignment: at-right; text-color: #222; text-background-mode: plain; text-background-color: white; } node#B { text-alignment: at-left; } node#C { text-alignment: under; }"
            +
            "graph { padding: 50px; } node { size-mode: fit; shape: rounded-box; fill-color: white; stroke-mode: plain; padding: 5px, 4px;  }"
            +
            "node { text-alignment: under; text-color: white; text-style: bold; text-background-mode: rounded-box; text-background-color: #222C; text-padding: 5px, 4px; text-offset: 0px, 5px; }node#C {text-alignment:above; text-offset: 0px, -5px;}";

    

    // public SwingViewer run(Graph graph) {
    //     // Graph graph = new SingleGraph("single graph", false, true);
    //     SwingViewer v = new SwingViewer(graph, SwingViewer.ThreadingModel.GRAPH_IN_GUI_THREAD);
    //     graph.setAttribute("ui.quality");
    //     graph.setAttribute("ui.antialias");
    //     graph.addNode("Node 1").setAttribute("ui.class", "green");
    //     graph.addNode("Node 2").setAttribute("ui.class", "green");
    //     graph.addNode("Node 3").setAttribute("ui.class", "green");
    //     graph.addNode("Node 4").setAttribute("ui.class", "green");
    //     graph.addNode("Node 5").setAttribute("ui.class", "green");
    //     // g.setAttribute("ui.antialias");
    //     // g.setAttribute("ui.quality");
    //     // g.setAttribute("ui.stylesheet", styleSheet);

    //     // v.enableAutoLayout();
    //     add((DefaultView) v.addDefaultView(true, new SwingGraphRenderer()), BorderLayout.CENTER);
    //     setSize(800, 600);
    //     setVisible(true);
    //     return v;
    //     // loadGraph_1();

    // }

    

    public static void main(String[] args) {

        System.setProperty("org.graphstream.ui", "swing");
        Visualize_1<String> v = new Visualize_1<String>();
        v.loadGraph_1();
        sleep();
        v.loadGraph_2();
    }

}
