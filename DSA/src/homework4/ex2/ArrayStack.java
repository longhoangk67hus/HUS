package homework4.ex2;

import java.util.Iterator;
import java.util.NoSuchElementException;

public class ArrayStack<E> implements StackInterface<E> {
    public static final int CAPACITY = 100;
    private E[] data;
    private int t = -1;
    public ArrayStack(int capacity) {
        data = (E[]) new Object[capacity];
    }
    @Override
    public void push(E element) throws IllegalStateException{
        if (size() == data.length) {
            throw new IllegalStateException("Stack is full");
        }
        data[++t] = element;
    }

    @Override
    public E pop() {
        if (isEmpty()) {
            return null;
        }
        E answer = data[t];
        data[t] = null;
        t--;
        return answer;
    }

    @Override
    public boolean isEmpty() {
        return t == -1;
    }

    @Override
    public E top() {
        if (isEmpty()) {
            return null;
        }
        return data[t];
    }

    @Override
    public Iterator iterator() {
        return new StackIterator();
    }
    public int size() {
        return (t+1);
    }
    class StackIterator implements Iterator<E> {
        private int current = t;
        @Override
        public boolean hasNext() {
            return current >= 0;
        }

        @Override
        public E next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            return data[current--];
        }
    }
}
