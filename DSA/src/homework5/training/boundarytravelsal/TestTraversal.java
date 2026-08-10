package homework5.training.boundarytravelsal;

public class TestTraversal {
    public static void main(String[] args) {
        BoundaryTraversal tree = new BoundaryTraversal();
        tree.root = tree.insert(tree.root, 10);
        tree.insert(tree.root, 5);
        tree.insert(tree.root, 15);
        tree.insert(tree.root, 3);
        tree.insert(tree.root, 7);
        tree.insert(tree.root, 12);
        tree.insert(tree.root, 18);

        tree.printBoundary(tree.root);
    }
}
