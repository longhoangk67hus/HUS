package hw8_20001928_maiviethung;

import java.util.Iterator;

public interface GraphInterface<V> {
    int numVertices() ;
    Iterator< V > vertices();

    int numEgde();
    Iterator<Egde<V>> egdes();

    Egde<V> getEgde(Vertex<V> u, Vertex<V> v);

    Vertex<V>[] endVertices(Egde<V> e);

    Vertex<V> opposite(Vertex<V> v, Egde<V> e);

    int outDegree(Vertex<V> v);

    int inDegree(Vertex<V> v);

    Iterator<Egde<V>> outgoingEgdes(Vertex<V> v);
    
    Iterator<Egde<V>> outcomingEgdes(Vertex<V> v);

    Vertex<V> insertVertex(V element);

    Egde<V> insertEgde(Vertex<V> u, Vertex<V> v,int weight);
    
    void removeVertex(Vertex<V> v);

    void removeEgde(Egde<V> e);

    int getVIndex(Vertex<V> v);
}
