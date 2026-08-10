package homework4.codelearn.ex13;

import java.util.Iterator;

public class LinkedListStack<E> implements Iterable<E> {
    @Override
    public Iterator<E> iterator() {
        return new Stackiterator();
    }
    class Stackiterator implements Iterator<E> {
        private Node current = stack;
        @Override
        public boolean hasNext() {
            return current != null;
        }

        @Override
        public E next() {
            E data = current.element;
            current = current.next;
            return data;
        }
    }
    class Node {
        E element;
        Node next;
    }
    private Node stack = null;
    private int size;

    public void push(E element) {
        Node newNode = new Node();
        newNode.element = element;
        newNode.next = stack;
        stack = newNode;
    }
    public E pop() {
        if (isEmpty()) {
            throw new IllegalStateException("Stack is null");
        }
        Node current = stack;
        stack = stack.next;
        size--;
        return current.element;
    }
    public E top() {
        if (!isEmpty()) {
            return stack.element;
        } else {
            System.out.println("Stack is empty");
            return null;
        }
    }
    public boolean isEmpty() {
        return stack == null;
    }
}
