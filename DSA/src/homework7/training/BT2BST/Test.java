package homework7.training.BT2BST;

import java.io.IOException;

public class Test {
    public static void main(String[] args) throws IOException {
        BT2BST bt2BST = new BT2BST();

        // Input binary tree in level order (N represents null nodes)
        String treeInput = "5 3 7 2 4 6 N 8";

        // Build the binary tree
        BT2BST.Node root = bt2BST.buildTree(treeInput);

        // Print the inorder traversal of the original binary tree
        System.out.println("Inorder Traversal of Original Binary Tree:");
        bt2BST.printInorder(root);

        // Convert the binary tree to a BST
        root = bt2BST.binaryTreeToBST(root);

        // Print the inorder traversal of the converted BST
        System.out.println("\nInorder Traversal of Converted BST:");
        bt2BST.printInorder(root);
    }
}
