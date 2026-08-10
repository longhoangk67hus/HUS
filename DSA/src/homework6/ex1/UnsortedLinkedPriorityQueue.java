package homework6.ex1;

import java.util.Iterator;

public class UnsortedLinkedPriorityQueue<K extends Comparable, E> implements PriorityQueueInterface<K,E> {
    public class NodeEntry<K, E> implements Entry<K, E> {
        private K key;
        private E element;
        private NodeEntry<K, E> next;

        public NodeEntry(K key, E element) {
            this.key = key;
            this.element = element;
        }

        @Override
        public K getKey() {
            return null;
        }

        @Override
        public E getValue() {
            return null;
        }

    }

    private NodeEntry<K, E> head;
    private NodeEntry<K, E> tail;
    int n = 0;

    @Override
    public int size() {
        return n;
    }

    @Override
    public boolean isEmpty() {
        return n == 0;
    }

    @Override
    public void insert(Entry<K, E> entry) {
        K k = entry.getKey();
        E e = entry.getValue();
        this.insert(k, e);
    }

    @Override
    public void insert(K k, E e) {
        NodeEntry<K, E> newNode = new NodeEntry<>(k, e);
        if (head == null) {
            head = newNode;
            tail = newNode;
            n++;
            return;
        }
        this.tail.next = newNode;
        tail = newNode;
        n++;
    }

    @Override
    public Entry<K, E> removeMin() {
        Entry<K,E> min = this.min();
        NodeEntry<K,E> temp = head;
        if (head == min) {
            n--;
            return min;
        }
        while (temp.next != null) {
            if (temp.next == min) {
                temp.next = temp.next.next;
                return min;
            }
            temp = temp.next;
        }
        n--;
        return min;
    }

    @Override
    public Entry<K, E> min() {
        NodeEntry<K ,E> min = head;
        NodeEntry<K, E> tempHead = head;
        while (tempHead.next != null) {
            if (min.key.compareTo(tempHead.next.key) == 1) {
                min = tempHead.next;
            }
            tempHead = tempHead.next;
        }
        return min;
    }

    public Iterator<E> iterator() {
        Iterator<E> iterator = new Iterator<E>() {
            private NodeEntry<K, E> currentNode = head;

            @Override
            public boolean hasNext() {
                return currentNode != null;
            }

            @Override
            public E next() {
                E data = currentNode.element;
                currentNode = currentNode.next;
                return data;
            }


        };
        return iterator;
    }
    public static void main(String[] args) {
        UnsortedLinkedPriorityQueue<Integer, String> priorityQueue = new UnsortedLinkedPriorityQueue<>();

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

        // Test iterator
        System.out.println("Elements using iterator:");
        Iterator<String> iterator = priorityQueue.iterator();
        while (iterator.hasNext()) {
            System.out.print(iterator.next() + " ");
        }
    }
}
