package homework5.codelearn.ex63;

public class CountLeaves {
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

    public CountLeaves() {
        root = null;
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

    public boolean isLeaf(Node node) {
        return node.left == null && node.right == null;
    }
    public int countLeaves(Node node) {
        int count = 0;
        if (node == null) {
            return 0;
        }
        if (isLeaf(node)) {
            return 1;
        }
        return countLeaves(node.left) + countLeaves(node.right);
    }
}
