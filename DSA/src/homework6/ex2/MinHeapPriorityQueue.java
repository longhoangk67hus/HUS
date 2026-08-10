package homework6.ex2;

import homework6.ex1.UnsortedArrayPriorityQueue;

public class MinHeapPriorityQueue<K extends Comparable, E> extends UnsortedArrayPriorityQueue<K, E> {
//    public class ArrEntry<K, E> implements Entry<K, E> {
//        K key;
//        E element;
//
//        public ArrEntry(K key, E element) {
//            this.key = key;
//            this.element = element;
//        }
//
//        @Override
//        public K getKey() {
//            return key;
//        }
//
//        @Override
//        public E getValue() {
//            return element;
//        }
//    }
//
//    ArrEntry<K, E>[] array;

    ArrEntry<K, E> headPQ[];

    public MinHeapPriorityQueue(int cap) {
        super(cap);
    }

    public MinHeapPriorityQueue() {
        super();
    }

    public void insert(K k, E e) {
        if (super.array[0] == null) {
            super.array[0] = new ArrEntry<K, E>(null, null);
            super.n++;
            super.insert(k, e);
            return;
        }
        super.insert(k, e);
        this.upHeap();
    }

    protected void upHeap() {
        int i = this.size() - 1;
        while (i > 1 && super.array[i / 2].getKey().compareTo(super.array[i].getKey()) == 1) {
            ArrEntry<K, E> temp = super.array[i / 2];
            super.array[i / 2] = super.array[i];
            super.array[i] = temp;
            i = i / 2;
        }
    }

    public ArrEntry<K, E> removeMin() {
        ArrEntry<K, E> min = super.array[1];
        super.array[1] = super.array[super.n - 1];
        super.n--;
        downHeap();
        return min;
    }

    public int size() {
        return super.n - 1;
    }

    protected void downHeap() {
        int i = 1;
//        while (i < n) {
//            if (2 * i + 1 < n) {
//                if (super.array[i].getKey().compareTo(super.array[i * 2].getKey()) == -1
//                && super.array[i].getKey().compareTo(super.array[2 * i + 1].getKey()) == -1)
//                {
//                    return;
//                } else  {
//                    int min = super.array[2 * i].getKey().compareTo(super.array[2 * i + 1].getKey()) == -1
//                            ? 2 * i : 2 * i + 1;
//                    ArrEntry<K, E> temp = super.array[min];
//                    super.array[min] = super.array[i];
//                    super.array[i] = temp;
//                    i = min;
//                }
//            } else {
//                if (2 * i < n) {
//                    if (super.array[i].getKey().compareTo(super.array[2 * i].getKey()) == 1)
//                    {
////                        ArrEntry<K, E> temp = super.array[i];
////                        super.array[i] = super.array[i * 2];
////                        super.array[i * 2] = temp;
//                        swap(super.array[i], super.array[i * 2]);
//                    }
//                }
//                return;
//            }
//        }
//        return;
        while (2 * i < super.n) {
            int min = 2 * i;
            if (2 * i + 1 < super.n && super.array[2 * i + 1].getKey().compareTo(super.array[2 * i].getKey()) < 0) {
                min = 2 * i + 1;
            }
            if (super.array[i].getKey().compareTo(super.array[min].getKey()) > 0) {
                swap(array[i], array[min]);
                i = min;
            } else  {
                break;
            }
        }
    }

    public ArrEntry<K, E>[] getHeadPQ() {
        return super.array;
    }

    private void swap(ArrEntry<K, E> right, ArrEntry<K, E> left) {
        ArrEntry<K, E> temp = right;
        right = left;
        left = temp;
    }

    public static void main(String[] args) {
        MinHeapPriorityQueue<Integer, String> minHeapPriorityQueue = new MinHeapPriorityQueue<>();

        // Insert elements
        minHeapPriorityQueue.insert(3, "Three");
        minHeapPriorityQueue.insert(1, "One");
        minHeapPriorityQueue.insert(4, "Four");
        minHeapPriorityQueue.insert(2, "Two");

        // Test size
        System.out.println("Size: " + minHeapPriorityQueue.size()); // Output should be 4

        // Test removeMin
        System.out.println("Min Element: " + minHeapPriorityQueue.removeMin().getValue()); // Output should be "One"
        System.out.println("Size after removal: " + minHeapPriorityQueue.size()); // Output should be 3

        // Insert another element
        minHeapPriorityQueue.insert(0, "Zero");

        // Test size after insertion
        System.out.println("Size after insertion: " + minHeapPriorityQueue.size()); // Output should be 4

        // Test getHeadPQ
        System.out.println("Elements using getHeadPQ:");
//        UnsortedArrayPriorityQueue.ArrEntry<Integer, String>[] headPQ = minHeapPriorityQueue.getHeadPQ();
//        for (int i = 1; i < headPQ.length; i++) {
//            if (headPQ[i] != null) {
//                System.out.println("Key: " + headPQ[i].getKey() + ", Value: " + headPQ[i].getValue());
//            }
//        }
    }
}
