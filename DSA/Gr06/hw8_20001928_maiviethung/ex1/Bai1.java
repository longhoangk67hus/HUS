package hw8_20001928_maiviethung.ex1;

import java.util.Iterator;

import hw8_20001928_maiviethung.Egde;
import hw8_20001928_maiviethung.Vertex;

public class Bai1 {
    public static void main(String[] args) {
        UnDirectUnWeightGraph<String> g = new UnDirectUnWeightGraph<>(6);
        Vertex<String> HN = g.insertVertex("ha noi");
        Vertex<String> HP =g.insertVertex("Hai phong");
        Vertex<String> ND =g.insertVertex("Nam dinh");
        Vertex<String> BN =g.insertVertex("Bac Ninh");
        // g.insertVertex("");
        Egde<String> Ql1 = g.insertEgde(HN, ND,0);
        Egde<String> Ql2 = g.insertEgde(HN, HP,0);
        Egde<String> Ql3 = g.insertEgde(HN, BN,0);

        System.out.println(g.opposite(HN, Ql1).getElement());
        g.removeVertex(HN);
        g.removeEgde(Ql2);
        Iterator it = g.outcomingEgdes(HN);
        while(it.hasNext()) {
            System.out.println(it.next().toString());
        }

        Iterator it2 = g.vertices();
        while(it2.hasNext()) {
            System.out.println(it2.next());
        }
        Iterator it3 = g.egdes();
        while(it3.hasNext()) {
            System.out.println(it3.next().toString());
        }
    }
}
