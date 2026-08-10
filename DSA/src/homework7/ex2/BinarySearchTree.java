package homework7.ex2;

import homework5.ex1.LinkedBinaryTree;

public class BinarySearchTree<E extends Comparable<E>> extends LinkedBinaryTree<E> {
    public E findMin(Node<E> root) {
        Node<E> min = root;
        while (min.left != null) {
            min = min.left;
        }
        return min.element;
    }
    public LinkedBinaryTree.Node<E> findMinNode(LinkedBinaryTree.Node<E> root) {
        while (root.left != null) {
            root = root.left;
        }
        return root;
    }

    public LinkedBinaryTree.Node<E> search(E data, Node<E> root) {
        while (!isEmpty()) {
            if (data == root.element) {
                return root;
            } else if (data.compareTo(root.element) < 0) {
                search(data, root.left);
            } else if (data.compareTo(root.element) > 0) {
                search(data, root.right);
            }
        }
        return null;
    }

    public LinkedBinaryTree.Node<E> insert(E data, Node<E> root) throws Exception {
        if (isEmpty()) {
            return new Node<>(data, null, null, null);
        } else if (data.compareTo(root.element) < 0) {
            if (root.left == null) {
                root.left = new Node<>(data, root, null, null);
            } else {
                insert(data, root.left);
            }
        } else if (data.compareTo(root.element) > 0) {
            if (root.right == null) {
                root.right = new Node<>(data, root, null, null);
            }else {
                insert(data, root.right);
            }
        } else if (data.compareTo(root.element) == 0) {
            throw new IllegalStateException("Data has already in tree");
        }
        return root;
    }
    public LinkedBinaryTree.Node<E> delete(E data, LinkedBinaryTree.Node<E> root) {
        if (root == null) {
            System.out.println("Not found " + data + " in tree");
            return null;
        }
        if (data.compareTo(root.element) < 0) {
            root.left = delete(data, root.left);
        } else if (data.compareTo(root.element) > 0) {
            root.right = delete(data, root.right);
        } else {

            // Case 1: Node with only one child or no child
            if (root.left == null) {
                return root.right;
            } else if (root.right == null) {
                return root.left;
            }

            // Case 2: Node with two children
            root.element = findMinNode(root.right).element;
            root.right = delete(root.element, root.right);
        }
        return root;
    }
}

