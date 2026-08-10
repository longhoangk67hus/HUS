package homework6.ex1;

import java.util.Arrays;

public class UnsortedArrayPriorityQueue<K extends Comparable, E> implements PriorityQueueInterface<K ,E> {
    public class ArrEntry<K,E> implements Entry<K,E> {
        K key;
        E element;

        public ArrEntry(K key, E element) {
            this.key = key;
            this.element = element;
        }

        @Override
        public K getKey() {
            return key;
        }

        @Override
        public E getValue() {
            return element;
        }
    }
     public ArrEntry<K, E>[] array;
     public int n = 0;
    int defaultSize = 100000;
    @Override
    public int size() {
        return n;
    }

    public UnsortedArrayPriorityQueue(int cap) {
        array = new ArrEntry[cap];
    }

    public UnsortedArrayPriorityQueue() {
        array = new ArrEntry[defaultSize];
    }

    @Override
    public boolean isEmpty() {
        return array.length == 0;
    }

    @Override
    public void insert(Entry<K,E> entry) throws IllegalStateException {
        K k = entry.getKey();
        E e  = entry.getValue();
        this.insert(k ,e);
    }

    @Override
    public void insert(K k, E e) {
        if (n == defaultSize) {
            throw new IllegalStateException("Array out of bound");
        }
        array[n] = new ArrEntry<>(k, e);
        n++;
    }

    @Override
    public Entry<K,E> removeMin() {
        if (isEmpty()) {
            return null;
        }
        int minIndex = 0;
        for (int i = 0; i < n; i++) {
            if (array[i].getKey().compareTo(array[minIndex].getKey()) < 0) {
                minIndex = i;
            }
        }
        Entry<K ,E> minEntry = array[minIndex];
        array[minIndex] = array[n - 1];
        array[n - 1] = null;
        n--;
        return minEntry;
    }

    @Override
    public Entry<K,E> min() {
        if (isEmpty()) {
            return null;
        }

        Entry<K, E> minEntry = array[0];
        for (int i = 0; i < n; i++) {
            if (array[i].getKey().compareTo(minEntry.getKey()) < 0) {
                minEntry = array[i];
            }
        }
        return minEntry;
    }
    public static void main(String[] args) {
        UnsortedArrayPriorityQueue<Integer, String> priorityQueue = new UnsortedArrayPriorityQueue<>();

        // Insert elements
        priorityQueue.insert(3, "Three");
        priorityQueue.insert(1, "One");
        priorityQueue.insert(4, "Four");
        priorityQueue.insert(2, "Two");

        // Test size and isEmpty
        System.out.println("Size: " + priorityQueue.size()); // Output should be 4
        System.out.println("Is Empty: " + priorityQueue.isEmpty()); // Output should be false

        // Test min and removeMin
        Entry<Integer, String> minEntry = priorityQueue.min();
        System.out.println("Min Element: " + minEntry.getValue()); // Output should be "One"

        Entry<Integer, String> removedEntry = priorityQueue.removeMin();
        System.out.println("Removed Min Element: " + removedEntry.getValue()); // Output should be "One"
        System.out.println("Size after removal: " + priorityQueue.size()); // Output should be 3

        // Insert another element
        priorityQueue.insert(0, "Zero");

        // Test min after insertion
        minEntry = priorityQueue.min();
        System.out.println("Min Element after insertion: " + minEntry.getValue()); // Output should be "Zero"
    }
}
