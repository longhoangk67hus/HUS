package homework6.ex1;

import java.util.Arrays;

public class SortedArrayPriorityQueue<K extends Comparable, E> implements PriorityQueueInterface<K, E> {
    public class ArrEntry<K, E> implements Entry<K, E> {
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

    ArrEntry<K, E>[] array;


    int n = 0;
    int defaultSize = 1000;

    public SortedArrayPriorityQueue() {
        this.array = new ArrEntry[defaultSize];
    }

    @Override
    public int size() {
        return n;
    }

    @Override
    public boolean isEmpty() {
        return this.size() == 0;
    }

    @Override
    public void insert(Entry<K, E> entry) throws IllegalStateException {
        K k = entry.getKey();
        E e = entry.getValue();
        this.insert(k ,e);
    }

    @Override
    public void insert(K k, E e) {
        if (n == defaultSize) {
            throw new IllegalStateException("Array out of bound");
        }
        if (isEmpty()) {
            array[0] = new ArrEntry<>(k, e);
            this.n++;
            return;
        }
        int n = size() - 1;
        array[n + 1] = new ArrEntry<>(k, e);
        while (k.compareTo(array[n].getKey()) != 1) {
            ArrEntry temp = array[n];
            array[n] = array[n + 1];
            array[n + 1] = temp;
            if (n == 0) {
                break;
            }
            n--;
        }
        this.n++;
    }

    @Override
    public Entry<K, E> removeMin() {
        Entry<K, E> min = this.min();
        for (int i = 0; i < n; i++) {
            array[i] = array[i + 1];
        }
        this.n--;
        return min;
    }

    @Override
    public Entry<K, E> min() {
        return array[0];
    }
    public static void main(String[] args) {
        SortedArrayPriorityQueue<Integer, String> priorityQueue = new SortedArrayPriorityQueue<>();

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
