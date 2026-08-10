package homework4.ex5;


import java.util.Iterator;

public class LinkedListStack<E> {
    class Node {
        E element;
        Node next;
    }
    private int size;
    private Node stack = null;

    public void push(E element) {
        Node newNode = new Node();
        newNode.element = element;
        newNode.next = stack;
        stack = newNode;
    }


    public E pop() {
        if (isEmpty()) {
            return null;
        }
        Node current = stack;
        stack = stack.next;
        size--;
        return current.element;
    }


    public boolean isEmpty() {
        return stack == null;
    }


    public E top() {
        if (!isEmpty()) {
            return stack.element;
        } else {
            System.out.println("Stack is empty");
            return null;
        }
    }


    public Iterator<E> iterator() {
        return new StackIterator();
    }
    public void printList() {
        Node node = stack;

        while (node != null) {
            System.out.print(node.element + " ");
            node = node.next;
        }
    }
    class StackIterator implements Iterator<E> {
        private Node current = stack;
        @Override
        public boolean hasNext() {
            return current != null;
        }

        @Override
        public E next() {
            E data = current.element;;
            current = current.next;
            return data;
        }
    }
}
