package homework6.ex3;
import homework6.ex2.MinHeapPriorityQueue;
public class HeapSort<T extends Comparable<T>> {
    MinHeapPriorityQueue<T, T> heapArray = new MinHeapPriorityQueue<>();
    public HeapSort(T[] array) {
        for (T t : array) {
            this.heapArray.insert(t, t);
        }
    }
    public T[] sort() {
        int n = heapArray.size();
        T[] res = (T[])new Comparable[n];
        for (int i = 0; i < res.length; i++) {
            res[i] = (T)heapArray.removeMin().getKey();
        }
        return res;
    }
}
