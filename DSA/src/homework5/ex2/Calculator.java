package homework5.ex2;

import homework5.ex1.LinkedBinaryTree;
import homework5.ex1.LinkedBinaryTree.Node;

public class Calculator {
    LinkedBinaryTree<String> tree;

    public Calculator(LinkedBinaryTree<String> tree) {
        this.tree = tree;
    }

    private boolean isOperator(String character) {
        return character.equals("+")
                || character.equals("-")
                || character.equals("*")
                || character.equals("/");
    }

    private boolean isNumber(String character) {
        try {
            double n = Double.parseDouble(character);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private double calculate(String op, String num1, String num2) {
        double a = Double.parseDouble(num1);
        double b = Double.parseDouble(num2);
        double r = 0;
        if (op.equals("+")) {
            r = a + b;
        } else if (op.equals("-")) {
            r = a - b;
        } else if (op.equals("*")) {
            r = a* b;
        } else if (op.equals("/")) {
            if (b == 0) {
                try {
                    r = a / b;
                } catch (Exception e) {
                    System.out.println("Invalid denominator");
                }
            }
        }
        return r;
    }

    public void calculatorPreOrder(Node<String> node) {
        if (node == null) {
            return;
        }
        if (isOperator(node.element) && node.left != null && node.right != null) {
            if (isNumber(node.left.element) && isNumber(node.right.element)) {
                node.element = String.valueOf(this.calculate(node.element, node.left.element, node.right.element));
                node.left = null;
                node.right = null;
            }
        }
        calculatorPreOrder(node.left);
        calculatorPreOrder(node.right);
    }

    public Double calculation(LinkedBinaryTree<String> tree) {
        while (!isNumber(tree.root().element)) {
            this.calculatorPreOrder(tree.root());
        }
        return Double.parseDouble(tree.root().getElement());
    }

    public static void main(String[] args) {
        LinkedBinaryTree<String> tree = new LinkedBinaryTree<>();
        ExpressionTree<String> expressionTree = new ExpressionTree<>();
        Calculator calculator = new Calculator(tree);

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

        Double result = calculator.calculation(tree);
        System.out.println(result);
    }
}
