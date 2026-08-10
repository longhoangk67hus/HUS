package homework7.ex1;

import homework3.ex2.SimpleArrayList;

public class SequentialSearchArrayList<T extends Comparable<T>> extends SimpleArrayList<T> {
    private String string;
    private int count;
    private T valueSearching;

    public SequentialSearchArrayList() {
        super();
        string = "";
        count = 0;
    }

    public SequentialSearchArrayList(int cap) throws Exception {
        super(cap);
        string = "";
        count = 0;
    }
    public int search(T data) {
        string = "";
        count = 0;
        valueSearching = data;
        int position = this.sequentialSearch(super.array, 0, super.size(), data);
        while (position != -1) {
            count++;
            string += "\n" + data + " at index "  + position;
            if (position < super.size()) {
                position = this.sequentialSearch(super.array, position + 1, super.size(), data);
            }
        }
        return position;
    }
    public int sequentialSearch(T[] array, int start, int end, T data) {
        for (int i = start; i < end; i++) {
            if (array[i].compareTo(data) == 0) {
                return i;
            }
        }
        return -1;
    }

    @Override
    public String toString() {
        string = this.valueSearching + "appears " + count + " times in list" + string;
        return string;
    }
}
