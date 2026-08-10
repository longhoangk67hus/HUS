package hw8_20001928_maiviethung.ex1;

import java.util.ArrayList;
import java.util.Iterator;

import hw8_20001928_maiviethung.Egde;
import hw8_20001928_maiviethung.GraphInterface;
import hw8_20001928_maiviethung.Vertex;

public class UnDirectUnWeightGraph<V> implements GraphInterface<V> {
    // private int numV;
    // private int numE;
    // private int defaultSize = 30;
    private ArrayList<Vertex<V>> vList;
    private ArrayList<Egde<V>> eList;
    private ArrayList<ArrayList<Egde<V>>> adj;

    public UnDirectUnWeightGraph(int cap) {
        // numE = 0;
        // numV = 0;
        vList = new ArrayList<Vertex<V>>(cap);
        eList = new ArrayList<Egde<V>>(cap);
        adj = new ArrayList<ArrayList<Egde<V>>>(cap);
        
    }
    
    public UnDirectUnWeightGraph() {
        // numE = 0;
        // numV = 0;
        vList = new ArrayList<Vertex<V>>();
        eList = new ArrayList<Egde<V>>();
        adj = new ArrayList<ArrayList<Egde<V>>>();
    }

    @Override
    public int numVertices() {
        // TODO Auto-generated method stub
        return vList.size();
    }

    @Override
    public Iterator<V> vertices() {
        // TODO Auto-generated method stub
        Iterator<V> it = new Iterator<V>() {
            int i = 0;
            @Override
            public boolean hasNext() {
                // TODO Auto-generated method stub
                return i < vList.size();
            }

            @Override
            public V next() {
                // TODO Auto-generated method stub
                return vList.get(i++).getElement();
            }
            
        };
        return it;
    }

    @Override
    public int numEgde() {
        // TODO Auto-generated method stub
        return eList.size();
    }

    @Override
    public Iterator<Egde<V>> egdes() {
        // TODO Auto-generated method stub
         Iterator<Egde<V>> it = new Iterator<Egde<V>>() {
            int i = 0;
            @Override
            public boolean hasNext() {
                // TODO Auto-generated method stub
                return i < eList.size();
            }

            @Override
            public Egde<V> next() {
                // TODO Auto-generated method stub
                return eList.get(i++);
            }
            
        };
        return it;
    }

    @Override
    public Egde<V> getEgde(Vertex<V> u, Vertex<V> v) {
        // TODO Auto-generated method stub
        // boolean checkNull = (u == null || v == null) ? true : false;
        if (u == null || v == null) return null;

        int uIndex = this.findVIndex(u, this.vList);
        int vIndex = this.findVIndex(v, this.vList);
        if (uIndex != -1 && vIndex != -1) {

            return this.adj.get(uIndex).get(vIndex);
        }
        System.out.println("there is no egde between " + u.getElement() + " and " + v.getElement());
        return null;
    }

    @Override
    public Vertex<V>[] endVertices(Egde<V> e) {
        // TODO Auto-generated method stub
        // System.out.println("there is no end vertice in undrected graph");
        // Vertex<V>[] res = (Vertex<V>[]) new Object[2];
        return new Vertex[] {e.getStart(), e.getEnd()};
    }

    @Override
    public Vertex<V> opposite(Vertex<V> v, Egde<V> e) {
        // TODO Auto-generated method stub
        if (e.getStart() != v && e.getEnd() != v) {
            return null;
        }

        // int vIndex = this.findVIndex(v, this.vList);
        // int[] eIndex = this.findEIndex(e, this.adj) ;

        Vertex<V> res = e.getStart() == v ? e.getEnd() : e.getStart();

        // if (res != null) {
            // return res;
        // }
        return res;
    }

    @Override
    public int outDegree(Vertex<V> v) {
        // TODO Auto-generated method stub
        int vIndex = this.findVIndex(v, vList);
        int degree = 0;
        for (int i = 0; i < adj.size(); i++) {
            if (adj.get(vIndex).get(i) != null) {
                degree++;
            } 
        }
        return degree;
    }

    @Override
    public int inDegree(Vertex<V> v) {
        // TODO Auto-generated method stub
        System.out.println("out and in degree in undirected graph is the same");
        return this.outDegree(v);
    }

    @Override
    public Iterator<Egde<V>> outgoingEgdes(Vertex<V> v) {
        // TODO Auto-generated method stub
        int vIndex = this.vList.indexOf(v);

        Iterator<Egde<V>> it = new Iterator<Egde<V>>() {
            int n = 0;
            int i = 0;
            @Override
            public boolean hasNext() {
                // TODO Auto-generated method stub
                return n != outDegree(v);
            }

            @Override
            public Egde<V> next() {
                // TODO Auto-generated method stub
                Egde<V> next = adj.get(vIndex).get(i++);
                while(next == null && i < adj.size()) {
                    next = adj.get(vIndex).get(i++);
                    // i++;
                }
                n++;
                return next;
            }
            
        };
        return it;
    }

    @Override
    public Iterator<Egde<V>> outcomingEgdes(Vertex<V> v) {
        // TODO Auto-generated method stub
        return this.outgoingEgdes(v);
    }

    @Override
    public Vertex<V> insertVertex(V element) {
        Vertex<V> newV = new Vertex<>(element);
        vList.add(newV);
        adj.add(new ArrayList<Egde<V>>());

        // add null vao de khi insert chi can set(index, newValue)
        int indexNew = vList.indexOf(newV);
        adj.get(indexNew).add(null);
        for (int i = 0; i < indexNew; i++) {
            adj.get(i).add(null);
            adj.get(indexNew).add(null);
        }
        // numV++;
        return newV;
    }

    @Override
    public Egde<V> insertEgde(Vertex<V> u, Vertex<V> v, int weight) {
        // TODO Auto-generated method stub
        // if (this.vList.indexOf(u) == -1 || this.vList.indexOf(v) == -1) {
            // Vertex<V> newV = 

        // }

        Egde<V> checkExist = this.getEgde(u, v);
        if (checkExist != null) return null;

        Egde<V> newE = new Egde<>(u, v);
        eList.add(newE);
        // int i = vList.indexOf(v)
        int uIndex = this.findVIndex(u, vList);
        int vIndex = this.findVIndex(v, vList);

        this.adj.get(uIndex).set(vIndex, newE);
        this.adj.get(vIndex).set(uIndex, newE);

        return newE;
    }

    private int findVIndex(Vertex<V> v, ArrayList<Vertex<V>> vArr) {
        int res = -1;
        for (int i = 0; i < this.numVertices(); i++) {
            if (v == vArr.get(i)) {
                res = i;
            }
        }
        return res;
    }

    @Override
    public void removeVertex(Vertex<V> v) {
        // TODO Auto-generated method stub
        int vIndex = this.vList.indexOf(v);
        // for (int i = 0; i < adj.size())
        adj.remove(vIndex);
        for (int i = 0; i < adj.size(); i++) {
            adj.get(i).remove(vIndex);
        }
        vList.remove(v);
        // numV--;
    }

    @Override
    public void removeEgde(Egde<V> e) {
        // TODO Auto-generated method stub
        if (e == null) return;
        // int[] eIndex = this.adj(e, adj);
        // if (eIndex[0] == -1) {
        //     try {
        //         throw new Exception("the egde is not exist");
        //     } catch (Exception e1) {
        //         // TODO Auto-generated catch block
        //         e1.printStackTrace();
        //     }
        //     return;
        // }
        eList.remove(e);
        int uIndex = vList.indexOf(e.getStart());
        int vIndex = vList.indexOf(e.getEnd());
        this.adj.get(uIndex).set(vIndex, null);
        this.adj.get(vIndex).set(uIndex, null);

    }

    @Override
    public int getVIndex(Vertex<V> v) {
        // TODO Auto-generated method stub
        return vList.indexOf(v);
    }
    
}
