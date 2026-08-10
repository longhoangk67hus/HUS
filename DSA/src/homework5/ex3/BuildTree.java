package homework5.ex3;

import homework5.ex1.LinkedBinaryTree;
import java.util.*;

public class BuildTree {
    public String inFixToPostFix(String inFix) {
        Stack<Character> stack = new Stack<>();
        StringBuilder postFix = new StringBuilder();

        for (int i = 0; i < inFix.length(); i++) {
            char currentChar = inFix.charAt(i);
            if (Character.isDigit(currentChar)) {
                postFix.append(currentChar);
            } else if (currentChar == '(') {
                stack.push(currentChar);
            } else if (currentChar == ')') {
                while (!stack.isEmpty() && stack.peek() != '(') {
                    postFix.append(stack.pop());
                }
                if (!stack.isEmpty() && stack.peek() == '(') {
                    stack.pop();
                }
            } else {
                while (!stack.isEmpty() && getPrecedence(stack.peek()) >= getPrecedence(currentChar)) {
                    postFix.append(stack.pop());
                }
                stack.push(currentChar);
            }
        }
        while (!stack.isEmpty()) {
            postFix.append(stack.pop());
        }
        return postFix.toString();
    }

    public String inFixToPreFix(String inFix) {
        Stack<Character> stack = new Stack<>();
        StringBuilder preFix = new StringBuilder();
        for (int i = inFix.length(); i >= 0; i--) {
            char currentChar = inFix.charAt(i);
            if (Character.isDigit(currentChar)) {
                preFix.append(currentChar);
            } else if (currentChar == ')') {
                stack.push(currentChar);
            } else if (currentChar == '(') {
                while (!stack.isEmpty() && stack.peek() != ')') {
                    preFix.append(stack.pop());
                }
                if (!stack.isEmpty() && stack.peek() == ')') {
                    stack.pop();
                }
            } else {
                while (!stack.isEmpty() && getPrecedence(stack.peek()) >= getPrecedence(currentChar)) {
                    preFix.append(stack.pop());
                }
                stack.push(currentChar);
            }
        }
        while (!stack.isEmpty()) {
            preFix.append(stack.pop());
        }
        return preFix.toString();
    }

    public LinkedBinaryTree<String> buildTree(String input) {
        String postFix = inFixToPostFix(input);
        Stack<LinkedBinaryTree.Node<String>> stack = new Stack<>();
        for (int i = 0; i < postFix.length(); i++) {
            char currentChar = postFix.charAt(i);
            LinkedBinaryTree.Node<String> newNode = new LinkedBinaryTree.Node<>(String.valueOf(currentChar), null, null, null);
            if (Character.isDigit(currentChar)) {
                stack.push(newNode);
            } else if (currentChar == '+' || currentChar == '-' || currentChar == '*' || currentChar == '/') {{
                    newNode.right = stack.pop();
                    newNode.left = stack.pop();
                    stack.push(newNode);
                }
            }
        }
        if (stack.isEmpty()) {
            return null;
        } else {
            LinkedBinaryTree<String> tree = new LinkedBinaryTree<>();
            tree.addRoot(stack.pop().element);
            return tree;
        }

    }
    private int getPrecedence(char operator) {
        switch (operator) {
            case '+':
            case '-':
                return 1;
            case '*':
            case '/':
                return 2;
        }
        return 0;
    }

}
