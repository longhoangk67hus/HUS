package homework7.ex1;

import homework3.ex3.SimpleLinkedList;

import java.util.Iterator;

public class SequentialSearchLinkedList <T extends Comparable<T>> extends SimpleLinkedList<T> {
    public SequentialSearchLinkedList() {
        super();
    }
    public int search(T data) {
        Iterator<T> iterator = super.iterator();
        int i = 0;
        while (iterator.hasNext()) {
            if (iterator.next().compareTo(data) == 0) {
                return i;
            }
            i++;
        }
        return -1;
    }
}
