package hw8_20001928_maiviethung.ex2;

import java.util.ArrayList;
import java.util.Iterator;

import hw8_20001928_maiviethung.Egde;
import hw8_20001928_maiviethung.GraphInterface;
import hw8_20001928_maiviethung.Vertex;
// import hw8_20001928_maiviethung.ex1.UnDirectUnWeightGraph;

public class DirectedWeightGraph<V> implements GraphInterface<V> {

    private ArrayList<Vertex<V>> vList;
    private ArrayList<Egde<V>> eList;
    private ArrayList<ArrayList<Egde<V>>> adj;
    

    public DirectedWeightGraph(int cap) {
        vList = new ArrayList<Vertex<V>>(cap);
        eList = new ArrayList<Egde<V>>(cap);
        adj = new ArrayList<ArrayList<Egde<V>>>(cap);
        
    }

    public DirectedWeightGraph() {
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
    public Egde<V> getEgde(Vertex<V> start, Vertex<V> end) {
        // TODO Auto-generated method stub
        int startIndex = this.vList.indexOf(start);
        int endIndex = this.vList.indexOf(end);

        if (startIndex == -1 || endIndex == -1) return null;

        return adj.get(startIndex).get(endIndex);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Vertex<V>[] endVertices(Egde<V> e) {
        // TODO Auto-generated method stub
        // Vertex<V>[] res = (Vertex<V>[]) new Object[2];
        // res[0]
        if (eList.indexOf(e) == -1) return new Vertex[] {new Vertex<>(null), new Vertex<>(null)};
        return new Vertex[] {e.getStart(), e.getEnd()};
    }

    @Override
    public Vertex<V> opposite(Vertex<V> v, Egde<V> e) {
        // TODO Auto-generated method stub
        if (e.getStart() != v && e.getEnd() != v) {
            return new Vertex<V>(null);
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
        int degree = 0;
        int vIndex = this.vList.indexOf(v);
        if (vIndex == -1) return -1;
         
        for (int i = 0; i < adj.size(); i++) {
            if (this.adj.get(vIndex).get(i) != null) {
                degree++;
            }
        }
        return degree;
    }

    @Override
    public int inDegree(Vertex<V> v) {
        // TODO Auto-generated method stub
        int degree = 0;
        int vIndex = this.vList.indexOf(v);
        if (vIndex == -1) return -1;
         
        for (int i = 0; i < adj.size(); i++) {
            if (this.adj.get(i).get(vIndex) != null) {
                degree++;
            }
        }
        return degree;
    }

    @Override
    public Iterator<Egde<V>> outgoingEgdes(Vertex<V> v) {
        // TODO Auto-generated method stub
        int vIndex = this.vList.indexOf(v);
        if (vIndex == -1) return new Iterator<Egde<V>>() {

            @Override
            public boolean hasNext() {
                // TODO Auto-generated method stub
                return false;
            }

            @Override
            public Egde<V> next() {
                // TODO Auto-generated method stub
                return null;
            }
            
        };
         
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
                while (next == null) {
                    next = adj.get(vIndex).get(i++);
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
        int vIndex = this.vList.indexOf(v);
        if (vIndex == -1) return new Iterator<Egde<V>>() {

            @Override
            public boolean hasNext() {
                // TODO Auto-generated method stub
                return false;
            }

            @Override
            public Egde<V> next() {
                // TODO Auto-generated method stub
                return null;
            }
            
        };

        Iterator<Egde<V>> it = new Iterator<Egde<V>>() {
            int n = 0;
            int i = 0;
            @Override
            public boolean hasNext() {
                // TODO Auto-generated method stub
                return n != inDegree(v);
            }

            @Override
            public Egde<V> next() {
                // TODO Auto-generated method stub
                Egde<V> next = adj.get(i++).get(vIndex);
                while (next == null) {
                    next = adj.get(i++).get(vIndex);
                }
                n++;
                return next;
            }
            
        };
        return it;
    }

    @Override
    public Vertex<V> insertVertex(V element) {
        // TODO Auto-generated method stub
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
    public Egde<V> insertEgde(Vertex<V> start, Vertex<V> end,int weight) {
        // TODO Auto-generated method stub
        // if(this.vList.indexOf(o))
        int startIndex = this.vList.indexOf(start);
        int endIndex = this.vList.indexOf(end);

        if(startIndex == -1 || endIndex == -1) return null;

        Egde<V> newE = new Egde<V>(start, end, weight);

        this.adj.get(startIndex).set(endIndex, newE);
        this.eList.add(newE);
        return newE;
    }

    @Override
    public void removeVertex(Vertex<V> v) {
        // TODO Auto-generated method stub
        int vIndex = this.vList.indexOf(v);
        // for (int i = 0; i < adj.size())
        if (vIndex == -1) return;
        this.removeAllEgdes(v);
        adj.remove(vIndex);
        for (int i = 0; i < adj.size(); i++) {
            // eList.remove(adj.get(i).get(vIndex));
            adj.get(i).remove(vIndex);
        }
        vList.remove(v);
    }
    public void removeAllEgdes(Vertex<V> v) {
        int vIndex = this.vList.indexOf(v);
        // for (int i = 0; i < adj.size())
        if (vIndex == -1) return;

        Iterator<Egde<V>> it = this.outcomingEgdes(v);
        while (it.hasNext()) {
            this.eList.remove(it.next());
        }
        it = this.outgoingEgdes(v);
        while (it.hasNext()) {
            this.eList.remove(it.next());
        }
    }

    @Override
    public void removeEgde(Egde<V> e) {
        // TODO Auto-generated method stub
        if (eList.indexOf(e) == -1) return;
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
        int startIndex = vList.indexOf(e.getStart());
        int endIndex = vList.indexOf(e.getEnd());
        this.adj.get(startIndex).set(endIndex, null);
        // this.adj.get(vIndex).set(uIndex, null);
    }

    @Override
    public int getVIndex(Vertex<V> v) {
        // TODO Auto-generated method stub
        return vList.indexOf(v);
    }
    
}
