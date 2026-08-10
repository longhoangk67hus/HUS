package homework3.ex2;

import java.util.Iterator;

public class SimpleArrayList<T> implements ListInterface<T> {
    public T[] array;
    public int n = 0;
    private int defaultSize = 100;

    public SimpleArrayList() {
        array = (T[]) new Object[defaultSize];
    }

    public SimpleArrayList(int capacity) {
        array = (T[]) new Object[capacity];
    }

    @Override
    public void add(T data) {
        if (n >= array.length) {
            int newSize = array.length * 2;
            T[] newArray = (T[]) new Object[newSize];
            System.arraycopy(array, 0, newArray, 0, n);
            array = newArray;
        }
        array[n++] = data;
    }

    @Override
    public T get(int n) {
        if (array.length == 0) {
            throw new IllegalArgumentException();
        }
        return array[n];
    }

    @Override
    public void set(int i, T data) {
        if (array.length == 0) {
            throw new IllegalArgumentException();
        }
        array[i] = data;
    }

    @Override
    public void remove(T data) {
        for (int i = 0; i < n; i++) {
            if (array[i].equals(data)) {
                System.arraycopy(array, i + 1, array, i, n - i - 1);
                array[--n] = null;
                return;
            }
        }
    }

    @Override
    public boolean isContain(T data) {
        for (T t : array) {
            if (t == data) {
                return true;
            }
        }
        return false;
    }

    @Override
    public int size() {
        return n;
    }

    @Override
    public boolean isEmpty() {
        return n == 0;
    }

    @Override
    public Iterator iterator() {
        return new Iterator<T>() {
            private int currentIndex = 0;

            @Override
            public boolean hasNext() {
                return currentIndex < n;
            }

            @Override
            public T next() {
                return array[currentIndex++];
            }

            @Override
            public void remove() {
                throw new UnsupportedOperationException("remove() is not supported");
            }
        };
    }
}
