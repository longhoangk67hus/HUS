package hw8_20001928_maiviethung;

public class Vertex<T> {
    T element;
    public Vertex() {
        element = null;
    }
    public Vertex(T e) {
        element = e;
    }

    public T getElement() {
        return element;
    }
}
