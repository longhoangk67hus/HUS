package homework5.ex3;

import homework5.ex1.LinkedBinaryTree;

public class Test {
    public static void main(String[] args) {
        BuildTree buildTree = new BuildTree();

        String inFixExpression = "(6/3 + 2) * (7 - 4)";
        String[] token = {"(", "6", "/", "3", "+", "2", ")", "*", "(", "7", "-", "4", ")"};

        String postFixExpression = buildTree.inFixToPostFix(inFixExpression);
        System.out.println("InFix Expression: " + inFixExpression);
        System.out.println("PostFix Expression: " + postFixExpression);

        //LinkedBinaryTree<String> tree = buildTree.
    }
}
