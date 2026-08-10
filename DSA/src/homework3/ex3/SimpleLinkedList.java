package homework3.ex3;

import java.util.Iterator;
import java.util.NoSuchElementException;

public class SimpleLinkedList<T>{
    public class Node {
        public T data;
        public Node next;

        public Node(T data, Node next) {
            this.data = data;
            this.next = next;
        }

        public Node() {
        }
    }
    public Node top = null;
    public Node bot = null;
    public int n = 0;

    public void add(T data) {
        Node newNode = new Node();
        newNode.data = data;

        if (top == null) {
            top = newNode;
            bot = newNode;
        } else {
            newNode.next = top;
            top = newNode;
        }
        n++;

    }
    public void addBot(T data) {
        Node newNode = new Node();
        newNode.data = data;

        if (isEmpty()) {
            top = newNode;
            bot = newNode;
        } else {
            bot.next = newNode;
            bot = newNode;
        }
        n++;
    }
    public T get(int i) {
        if (i >= size() || i < 0) {
            throw new IndexOutOfBoundsException();
        }
        Node current = top;

        for (int currentIndex = 0; currentIndex < i; currentIndex++) {
            current = current.next;
        }
        return current.data;
    }
    public void set(int i, T data) {
        if (i < 0 || i >= size()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        Node currentNode = top;
        for (int j = 0; j < i; j++) {
            currentNode = currentNode.next;
        }
        currentNode.data = data;
    }
    public boolean isContain(T data) {
        Node currentNode = top;
        for (int i = 0; i < size(); i++) {
            if (currentNode.data.equals(data)) {
                return true;
            }
        }
        return false;
    }
    public int size() {
        return n;
    }
    public boolean isEmpty() {
        return top == null;
    }
    public T removeTop() {
//        Node currentNode = top;
//        for (int i = 0; i < size(); i++) {
//            currentNode = currentNode.next;
//        }
//        currentNode.data = currentNode.next.data;
//        currentNode.data = null;
//        return
        if (isEmpty()) {
            throw new NoSuchElementException("List is empty");
        }
        T removeData = top.data;
        top = top.next;
        n--;
        if (isEmpty()) {
            bot = null;
        }
        return removeData;
    }
    public T removeBot() {
        if (isEmpty()) {
            throw new NoSuchElementException("List is empty");
        }

        T removeData;

        if (top == bot) {
            removeData = top.data;
            top = null;
            bot = null;
        }
        else {
            Node currentNode = top;
            while (currentNode.next != bot) {
                currentNode = currentNode.next;
            }
            removeData = bot.data;
            currentNode.next = null;
            bot = currentNode;
        }
        n--;
        return removeData;
    }
    public void remove(T data) {
        if (isEmpty()) {
            return;
        }
        if (top.data.equals(data)) {
            top = top.next;
            n--;
            if (top == null) {
                bot = null;
            }
            return;
        }
        Node preNode = top;
        Node currentNode = top.next;

        while (currentNode != null) {
            if (currentNode.data.equals(data)) {
                preNode.next = currentNode.next;
                n--;
                if (currentNode == bot) {
                    bot = preNode;
                }
                return;
            }
            preNode = currentNode;
            currentNode = currentNode.next;
        }
    }
    public void print() {
        Node node = top;
        while (node != null) {
            System.out.print(node.data + " ");
            node = node.next;
        }
    }
    public Iterator<T> iterator() {
        Iterator<T> iterator = new Iterator<T>() {
            Node head = top;
            @Override
            public boolean hasNext() {
                return head != null;
            }

            @Override
            public T next() {
                T current = head.data;
                head = head.next;
                return current;
            }

        };
        return iterator;
    }
}
