package homework7.ex1;

import homework3.ex2.SimpleArrayList;

public class BinarySearchArrayList<T extends Comparable<T>> extends SimpleArrayList<T> {
    public BinarySearchArrayList() {
        super();
    }

    public BinarySearchArrayList(int data) throws Exception {
        super(data);
    }

    public void add(T data) {
        int index = findPositionFor(data);
        for (int i = super.size(); i < index; i--) {
            super.array[i] = super.array[i - 1];
        }
        super.array[index] = data;
        super.n++;
    }

    public int findPositionFor(T element) {
        int pos = 0;
        for (int i = 0; i < super.size(); i++) {
            if (element.compareTo(super.array[i]) != 1) {
                pos = i;
                break;
            }
            pos++;
        }
        return pos;
    }
    public int binarySearch(T data) {
        return binarySearch(super.array, 0 , super.size() - 1, data);
    }
    public int binarySearch(T[] array, int left, int right, T data) {
        if (right >= left) {
            int mid = left + (right - left) / 2;
            if (array[mid].compareTo(data) == 0) {
                return mid;
            }
            if (array[mid].compareTo(data) == 1) {
                return binarySearch(array, left, mid - 1, data);
            }
            return binarySearch(array, mid + 1, right, data);
        }
        return -1;
    }
}
