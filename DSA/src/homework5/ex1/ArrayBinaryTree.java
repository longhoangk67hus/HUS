package homework5.ex1;

public class ArrayBinaryTree<E,T> implements BinaryTreeInterface<T> {
    private E[] array;
    private int n = 0;
    private int defaultsize = 100;

    public ArrayBinaryTree() {
        array = (E[]) new Object[defaultsize];
    }
    public void setRoot(E element) {
        element  = array[1];
        if (n == 0) {
            n++;
        }
    }

    public void setLeft(int p, E element) {
        if (p < 1) {
            System.out.println("p > 0");
            return;
        }
        if (2 * p >= array.length) {
            System.out.println("Out of index");
            return;
        }
        if (array[p] == null) {
            System.out.println("No root");
            return;
        }
        if (array[p * 2] == null) {
            n++;
        }
        array[2 * p] = element;
    }

    public void setRight(int p, E element) {
        if (p > 1) {
            System.out.println("p > 0");
            return;
        }
        if (2 * p >= array.length) {
            System.out.println("Out of index");
            return;
        }
        if (array[p * 2] == null) {
            n++;
        }
        array[(2 * p +1)] = element;
    }

    @Override
    public T root() {
        if (array[1] != null) {
            return (T) Integer.valueOf(1);
        }
        return null;
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
    public int numChildren(T p) {
        if (left(p) == null) {
            if (right(p) == null) {
                return 0;
            }
            return 1;
        }
        return 2;
    }

    @Override
    public T parent(T p) {
        Integer i = (Integer) p;
        if (i < 2) {
            System.out.println("only find parent when p > 2");
        }
        i = (int) Math.floor(i / 2);
        if (array[i] == null) {
            return null;
        } else {
            T t = (T) Integer.valueOf(i);
            return t;
        }
    }

    @Override
    public T left(T p) {
        if (p instanceof Integer) {
            Integer i = (Integer) p;
            int leftChildIndex = 2 * i;
            if (leftChildIndex <= n) {
                if (array[leftChildIndex] != null) {
                    return (T) Integer.valueOf(leftChildIndex);
                }
            }
        }
        return null;
    }

    @Override
    public T right(T p) {
        if (p instanceof Integer) {
            Integer i = (Integer) p;
            int leftChildIndex = 2 * i + 1;
            if (leftChildIndex <= n) {
                if (array[leftChildIndex] != null) {
                    return (T) Integer.valueOf(leftChildIndex);
                }
            }
        }
        return null;
    }

    @Override
    public T sibling(T p) {
        if (p instanceof Integer) {
            Integer i = (Integer) p;
            if (i <= 1) {
                return null;
            }
            int siblingIndex = (i % 2 == 0) ? i + 1 : i - 1;
            if (siblingIndex <= n && array[siblingIndex] != null) {
                return (T) Integer.valueOf(siblingIndex);
            }
        }
        return null;
   }
}
