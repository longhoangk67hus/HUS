package hw8_20001928_maiviethung;

public class Egde<E> {
    Vertex<E> start;
    Vertex<E> end;  
    int weight;
    public Egde(Vertex<E> start, Vertex<E> end, int weight) {
        this.start = start;
        this.end = end;
        this.weight = weight;
    }  
    public Egde(Vertex<E> start, Vertex<E> end) {
        this.start = start;
        this.end = end;
        // this.weight = null;/
    }

    public Vertex<E> getStart() {
        return this.start;
    }

    public Vertex<E> getEnd() {
        return this.end;
    }

    public int getWeight() {
        return this.weight;
    }

    public void setStart(Vertex<E> start) {
        this.start = start;
    }

    public void setEnd(Vertex<E> end) {
        this.end = end;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public String toString() {
        String str = start.element + " " +end.element;
        // if (weight != 0) {
        //     str += " weight: " + weight;
        // }
        return  str;
    }
}
