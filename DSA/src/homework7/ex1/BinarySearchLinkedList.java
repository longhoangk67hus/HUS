package homework7.ex1;

import homework3.ex3.SimpleLinkedList;

public class BinarySearchLinkedList<T extends Comparable<T>> extends SimpleLinkedList<T> {
    public void insert(T element) {
        Node newNode = this.findPositionFor(element);
        if (newNode == null) {
            if (super.isEmpty()) {
                Node temp = new Node(element, null);
                super.bot = temp;
                super.top = temp;
            } else {
                Node temp = new Node(element, super.top);
                super.top = temp;
            }
            super.n++;
            return;
        }
        Node temp = new Node(element, newNode.next);
        newNode.next = temp;
        System.out.println(newNode.data);
        if (newNode == super.bot) {
            super.bot = temp;
        }
        super.n++;
    }

    public Node findPositionFor(T element) {
        Node position = null;
        Node temp = super.top;

        System.out.println(super.toString());
        if (temp != null) {
            if (temp.data.compareTo(element) != -1) {
                return null;
            }
        }
        while (temp != null) {
            if (temp.next == null) {
                if (temp.data.compareTo(element) != 1) {
                    position = temp;
                    break;
                }
            } else if (temp.next.data.compareTo(element) != -1) {
                position = temp;
                break;
            }
            temp = temp.next;
            position = temp;
        }
        return position;
    }
    public int search(T data) {
        return binarySearch(this, 0, this.size(), data);
    }

    public int binarySearch(BinarySearchLinkedList<T> linkedList, int left, int right, T data) {
        if (right >= left) {
            int mid = left + (right - left) / 2;
            if (linkedList.get(mid).compareTo(data) == 0) {
                return mid;
            }
            if (linkedList.get(mid).compareTo(data) == 1) {
                return binarySearch(linkedList, left, mid - 1, data);
            }
            return binarySearch(linkedList, mid + 1, right, data);
        }
        return  -1;
    }
}
