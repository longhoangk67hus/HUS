package homework5.ex2;

import homework5.ex1.LinkedBinaryTree;

public class ExpressionTree<E> extends LinkedBinaryTree<E> {
    public void preorderPrint(Node<E> p) {
        if (p == null) {
            return;
        }
        System.out.print(p.element);
        preorderPrint(p.left);
        preorderPrint(p.right);
    }

    public void postorderPrint(Node<E> p) {
        if (p == null) {
            return;
        }
        postorderPrint(p.left);
        postorderPrint(p.right);
        System.out.print(p.element);
    }

    public void inorderPrint(Node<E> p) {
        if (p == null) {
            return;
        }
        inorderPrint(p.left);
        System.out.print(p.element);
        inorderPrint(p.right);
    }

    public boolean isOperator(String ch) {
        return ch.equals("+") || ch.equals("-") || ch.equals("*") || ch.equals("/");
    }

    public static void main(String[] args) {
        LinkedBinaryTree<String> tree = new LinkedBinaryTree<>();
        ExpressionTree<String> expressionTree = new ExpressionTree<>();

        Node<String> root = tree.addRoot("+");
        Node<String> rightRoot = tree.addRight(root, "+");
        Node<String> leftRoot = tree.addLeft(root, "*");

        Node<String> node_4 = tree.addLeft(leftRoot, "3");
        Node<String> node_5 = tree.addRight(leftRoot, "*");
        Node<String> node_6 = tree.addLeft(node_5, "7");
        Node<String> node_7 = tree.addRight(node_5, "4");

        Node<String> node_8 = tree.addLeft(rightRoot, "*");
        Node<String> node_9 = tree.addLeft(node_8, "2");
        Node<String> node_10 = tree.addRight(node_8, "3");
        Node<String> node_11 = tree.addRight(rightRoot, "5");

        expressionTree.inorderPrint(root);
        System.out.println();

        expressionTree.preorderPrint(root);
        System.out.println();

        expressionTree.postorderPrint(root);
        System.out.println();

        //System.out.print(tree.root());
     }
}
