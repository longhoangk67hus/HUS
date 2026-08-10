package homework5.codelearn.ex64;

public class GetTreeHeight {
    //Bài 52
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

    public GetTreeHeight() {
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

    public int treeLevel(Node node) {
        int count = 0;
        if (node == null) {
            return count;
        } else {
            count++;
            return count + Math.max(treeLevel(node.left), treeLevel(node.right));
        }

    }
}
