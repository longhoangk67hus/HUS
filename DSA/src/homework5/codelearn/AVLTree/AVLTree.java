package homework5.codelearn.AVLTree;

public class AVLTree {
    public static class Node {
        public int data;

        public Node right;
        public Node left;

        public Node(int data, Node right, Node left) {
            this.data = data;
            this.right = right;
            this.left = left;
        }

        public int getData() {
            return this.data;
        }
    }
    public Node root;

    public AVLTree() {
        this.root = null;
    }

    public Node insert(Node node, int x) {
        if (node == null) {
            return new Node(x, null, null);
        } else {
            if (x < node.data) {
                node.left = insert(node.left, x);
            } else {
                node.right = insert(node.right, x);
            }
        }
        return node;
    }
    public int treeLevelRight(Node node) {
        int count = 0;
        if (node == null) {
            return count;
        } else {
            count++;
            return count +  treeLevelRight(node.right);
        }
    }
    public int treeLevelLeft(Node node) {
        int count = 0;
        if (node == null) {
            return count;
        } else {
            count++;
            return count +  treeLevelLeft(node.left);
        }
    }
    public boolean isAVL(Node node) {
        return Math.abs(treeLevelLeft(node) - treeLevelRight(node)) <= 1;
    }
}
