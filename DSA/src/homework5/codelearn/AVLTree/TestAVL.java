package homework5.codelearn.AVLTree;

public class TestAVL {
    public static void main(String[] args) {
        AVLTree tree = new AVLTree();

        // Insert nodes to form an AVL tree
        tree.root = tree.insert(tree.root, 10);
        tree.root = tree.insert(tree.root, 5);
        tree.root = tree.insert(tree.root, 15);
        tree.root = tree.insert(tree.root, 3);
        tree.root = tree.insert(tree.root, 7);
        tree.root = tree.insert(tree.root, 12);
        tree.root = tree.insert(tree.root, 18);

        // Check if the tree is an AVL tree
        boolean isAVL = tree.isAVL(tree.root);

        System.out.println("Is the tree an AVL tree? \n" + isAVL);
    }
}
