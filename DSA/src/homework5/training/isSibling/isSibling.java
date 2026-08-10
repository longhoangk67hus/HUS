package homework5.training.isSibling;

public class isSibling {
    public static class Node {
        public int data;

        public Node right;
        public Node left;

        public Node(int data) {
            this.data = data;
            right = left = null;
        }

        public int getData() {
            return this.data;
        }
    }

    public Node root;

    public isSibling() {
        root = null;
    }


    public void sibling(Node node) {
        if (node == null) {
            return;
        }
        sibling(node.left);
        sibling(node.right);
        if (node.left != null && node.right == null) {
            System.out.print(node.left.data + " ");
            //sibling(node.left);
        }
        else if (node.right != null && node.left == null) {
            System.out.print(node.right.data + " ");
            //sibling(node.right);
        }

    }
}
