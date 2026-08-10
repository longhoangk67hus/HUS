package homework5.ex1;

public class LinkedBinaryTree<E> implements BinaryTreeInterface<LinkedBinaryTree.Node<E>> {

    public static class Node<E> {
        public E element;
        public Node<E> parent;
        public Node<E> left;
        public Node<E> right;

        public Node(E e, Node<E> above, Node<E> leftChild, Node<E> rightChild) {
            this.element = e;
            this.parent = above;
            this.left = leftChild;
            this.right = rightChild;
        }
        public E getElement() {
            return this.element;
        }
    }
    protected Node<E> root;
    protected int size;

    public LinkedBinaryTree() {
        root = null;
        size = 0;
    }

    @Override
    public Node<E> root() {
        return this.root;
    }

    @Override
    public int size() {
        return size;
    }

    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public int numChildren(Node<E> p) {
        Node<E> node = p;
        int children = 0;

        if (node.left != null) {
            children++;
        }
        if (node .right != null) {
            children++;
        }
        return children;
    }

    @Override
    public Node<E> parent(Node<E> p) {
        Node<E> node = p;
        return node.parent;
    }

    @Override
    public Node<E> left(Node<E> p) {
        Node<E> node = p;
        return node.left;
    }

    @Override
    public Node<E> right(Node<E> p) {
        Node<E> node = p;
        return node.right;
    }

    @Override
    public Node<E> sibling(Node<E> p) {
        Node<E> node = p;
        Node<E> parent = node.parent;

        if (parent == null) {
            return null;
        }
        if (parent.left == node) {
            return parent.right;
        }
        else {
            return parent.left;
        }
    }

    public Node<E> addRoot(E element) {
        if (!isEmpty()) {
            throw new IllegalStateException("Tree is not empty");
        }
        root = new Node<>(element, null, null, null);
        size++;
        return root;


    }

    public Node<E> addLeft(Node<E> p, E element) {
        if (p == null) {
            throw new IllegalStateException("Node p cannot be null");
        }
        if (p.left != null) {
            throw new IllegalStateException("Left child is not empty");
        }
        Node<E> newNode = new Node<>(element, p, null, null);
        p.left = newNode;
        size++;
        return newNode;
    }

    public Node<E> addRight(Node<E> p, E element) {
        if (p == null) {
            throw new IllegalStateException("Node p cannot be null");
        }
        if (p.right != null) {
            throw new IllegalStateException("Left child is not empty");
        }
        Node<E> newNode = new Node<>(element, p, null, null);
        p.right = newNode;
        size++;
        return newNode;
    }
    public void set(Node p, E element) {
        if (p == null) {
            throw new IllegalStateException("Node p cannot be null");
        }
        p.element = element;
    }
    public void printBinaryTree(Node root, int space, int height) {
        if (root == null) {
            return;
        }
        space += height;

        printBinaryTree(root.right, space, height);
        //System.out.println();
        for (int i = height; i < space; i++) {
            System.out.print(' ');
        }
        System.out.print(root.element);

        System.out.println();
        printBinaryTree(root.left, space, height);
    }

    public static void main(String[] args) {
        LinkedBinaryTree<Integer> linkedBinaryTree = new LinkedBinaryTree<>();
        LinkedBinaryTree.Node<Integer> rootNode = linkedBinaryTree.addRoot(1);
        LinkedBinaryTree.Node<Integer> L = linkedBinaryTree.addLeft(rootNode,5);
        LinkedBinaryTree.Node<Integer> R = linkedBinaryTree.addRight(rootNode,3);
        LinkedBinaryTree.Node<Integer> LL = linkedBinaryTree.addLeft(L, 8);
        LinkedBinaryTree.Node<Integer> LR = linkedBinaryTree.addRight(L, 6);
        LinkedBinaryTree.Node<Integer> RR = linkedBinaryTree.addRight(R, 7);
        LinkedBinaryTree.Node<Integer> RL = linkedBinaryTree.addLeft(R,2);

        linkedBinaryTree.printBinaryTree(rootNode, 0, 3);

    }
}
