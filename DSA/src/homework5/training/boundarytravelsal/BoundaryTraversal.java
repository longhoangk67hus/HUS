package homework5.training.boundarytravelsal;

public class BoundaryTraversal {
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

    public BoundaryTraversal() {
        root = null;
    }

    public void printLeaves(Node node) {
        if (node == null) {
            return;
        }
        printLeaves(node.left);
        if (node.left == null && node.right == null) {
            System.out.print(node.data + " ");
        }
        printLeaves(node.right);
    }

    public void printBoundaryLeft(Node node) {
        if (node == null) {
            return;
        }
        if (node.left != null) {
            System.out.print(node.data + " ");
            printBoundaryLeft(node.left);
        } else if (node.right != null) {
            System.out.print(node.data + " ");
            printBoundaryLeft(node.right);
        }
    }

    public void printBoundaryRight(Node node) {
        if (node == null) {
            return;
        }
        if (node.right != null) {
            printBoundaryLeft(node.right);
            System.out.print(node.data + " ");
        } else if (node.left != null) {
            printBoundaryLeft(node.left);
            System.out.print(node.data + " ");
        }
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

    public void printBoundary(Node node) {
        if (node == null) {
            return;
        }
        System.out.print(node.data + " ");

        printBoundaryLeft(node.left);

        printLeaves(node.left);
        printLeaves(node.right);

        printBoundaryRight(node.right);
    }


}
