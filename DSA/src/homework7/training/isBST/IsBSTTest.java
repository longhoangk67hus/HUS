package homework7.training.isBST;

public class IsBSTTest {
    public static void main(String[] args) {
        IsBST isBSTChecker = new IsBST();

        // Test Case 1: Valid BST
        String input1 = "10 5 15 3 7 N 18";
        System.out.println("Test Case 1:");
        System.out.println("Input Tree: " + input1);
        IsBST.Node root1 = isBSTChecker.buildTree(input1);
        System.out.println("Inorder Traversal:");
        isBSTChecker.printInorder(root1);
        System.out.println("Is BST: " + isBSTChecker.isBST(root1));
        System.out.println();

        // Test Case 2: Invalid BST
        String input2 = "10 5 15 3 7 N 8";
        System.out.println("Test Case 2:");
        System.out.println("Input Tree: " + input2);
        IsBST.Node root2 = isBSTChecker.buildTree(input2);
        System.out.println("Inorder Traversal:");
        isBSTChecker.printInorder(root2);
        System.out.println("Is BST: " + isBSTChecker.isBST(root2));
        System.out.println();

        // Test Case 3: Empty Tree
        String input3 = "";
        System.out.println("Test Case 3:");
        System.out.println("Input Tree: " + input3);
        IsBST.Node root3 = isBSTChecker.buildTree(input3);
        System.out.println("Is BST: " + isBSTChecker.isBST(root3));
    }
}
