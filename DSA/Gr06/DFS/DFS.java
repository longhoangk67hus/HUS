package DFS;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.Scanner;

import org.graphstream.graph.Edge;
import org.graphstream.graph.Graph;
import org.graphstream.graph.Node;
import org.graphstream.graph.implementations.SingleGraph;
import org.graphstream.ui.view.Viewer;

public class DFS {
    Node start;
    Graph g;
    boolean[] isVisited;
    boolean[] isVisitedE;
    int[] color;
    int timeSleep = 300;
    ArrayList<Edge> failE = new ArrayList<>();

    public DFS(Graph g, Node start) {
        this.g = g;
        g.setAttribute("ui.stylesheet", "url('D:\\Project\\java\\src\\DFS\\stylesheet')");
        this.start = start;
        isVisited = new boolean[g.getNodeCount()];
        isVisitedE = new boolean[g.getEdgeCount()];
        color = new int[g.getNodeCount()];
    }

    public DFS(Graph g, String start) {
        this.g = g;
        g.setAttribute("ui.stylesheet", "url('D:\\Project\\java\\src\\DFS\\stylesheet')");
        this.start = g.getNode(start);
        isVisited = new boolean[g.getNodeCount()];
        isVisitedE = new boolean[g.getEdgeCount()];
        color = new int[g.getNodeCount()];
    }

    public void run(Node start) {
        isVisited[start.getIndex()] = true;

        Iterator<Edge> edges = start.iterator();
        while (edges.hasNext()) {

            start.setAttribute("ui.class", "visiting");
            // sleep();
            Iterator<Edge> edges1 = start.iterator();

            while (edges1.hasNext()) {
                Edge nextE = edges1.next();
                if (!isVisitedE[nextE.getIndex()]) {
                    nextE.setAttribute("ui.class", "movable");
                }
            }
            sleep();

            Edge nextE = edges.next();
            Node next = nextE.getOpposite(start);

            // marked is the egde is chosen
            if (!isVisitedE[nextE.getIndex()]) {
                nextE.setAttribute("ui.class", "visited");
                isVisitedE[nextE.getIndex()] = true;
                sleep();
            }
            // marked is the node visited
            start.setAttribute("ui.class", "marked");

            edges1 = start.iterator();

            while (edges1.hasNext()) {
                edges1.next().setAttribute("ui.class", "default");
            }
            if (!isVisited[next.getIndex()]) {
                run(next);
            }
        }
        start.setAttribute("ui.class", "visiting");
        sleep();
        start.setAttribute("ui.class", "marked");
    }

    public boolean checkBipartite(Node start) {
        start.setAttribute("ui.class", "visiting");
        sleep();
        separateColor(start);
        isVisited[start.getIndex()] = true;
        Iterator<Edge> edges = start.iterator();
        while (edges.hasNext()) {
            // start.setAttribute("ui.class", "visiting");
            // sleep();
            Iterator<Edge> edges1 = start.iterator();

            while (edges1.hasNext()) {
                Edge nextE = edges1.next();
                if (!isVisitedE[nextE.getIndex()]) {
                    nextE.setAttribute("ui.class", "movable");
                }
            }
            sleep();

            Edge nextE = edges.next();
            Node next = nextE.getOpposite(start);

            // marked is the egde is chosen
            if (!isVisitedE[nextE.getIndex()]) {
                nextE.setAttribute("ui.class", "visited");
                isVisitedE[nextE.getIndex()] = true;
                sleep();
            }
            // marked is the node visited

            edges1 = start.iterator();

            while (edges1.hasNext()) {
                edges1.next().setAttribute("ui.class", "default");
            }

            if (isVisited[next.getIndex()] == false) {
                color[next.getIndex()] = 1 - color[start.getIndex()];
                isVisitedE[nextE.getIndex()] = true;
                if (!checkBipartite(next)) {
                    return false;
                }
                ;
            } else if (color[next.getIndex()] == color[start.getIndex()]) {
                // nextE.setAttribute("ui.class", "false");
                failE.add(nextE);
                return false;
            }
        }
        start.setAttribute("ui.class", "visiting");
        sleep();
        separateColor(start);
        return true;
    }

    public void separateColor(Node start) {

        if (color[start.getIndex()] == 1) {
            // graph.getNode(v.getElement()).setAttribute("xy", x, x * 20);
            start.setAttribute("ui.class", "blue");
            // x++;
            // sleep();
        } else {
            // graph.getNode(v.getElement()).setAttribute("xy", y + 100, y * 20);
            start.setAttribute("ui.class", "green");
            // y++;
            // sleep();
        }

    }

    public void setTimeSleep(int time) {
        this.timeSleep = time;
    }

    public void alertEdgeFail() {
        for (Edge e : failE) {
            e.setAttribute("ui.class", "visited");
        }
    }

    protected void sleep() {
        try {
            Thread.sleep(this.timeSleep);
        } catch (Exception e) {
        }
    }

    protected void sleep(int time) {
        try {
            Thread.sleep(time);
        } catch (Exception e) {
        }
    }

    public static void main(String[] args) {
        System.setProperty("org.graphstream.ui", "swing");
        Scanner sc = new Scanner(System.in);
        Store st = new Store();
        Graph graph = new SingleGraph("single graph", false, true);

        System.out.println("please choose one graph");
        System.out.println("1. bipartite");
        System.out.println("2. unbipartite");
        int graphIndex = sc.nextInt();

        switch (graphIndex) {
            case 1:
                graph = st.graph_1();
                break;
            case 2:
                graph = st.graph_2();
                break;
            default:
                break;
        }
        Viewer viewer = graph.display();
        DFS d = new DFS(graph, graph.getNode("Node 1"));
        System.out.println("type of dfs");
        System.out.println("1. normal dfs");
        System.out.println("2. check bipartite");
        int type = sc.nextInt();

        switch (type) {
            case 1:
                d.run(d.start);
                break;
            case 2:
                d.setTimeSleep(100);
                boolean isBi = d.checkBipartite(d.start);
                if (!isBi) {
                    d.alertEdgeFail();
                }
                break;
            default:
                break;
        }
        // Let the layout work ...
        // viewer.disableAutoLayout();
        // Do some work ...
        viewer.enableAutoLayout();
        
    }
}
