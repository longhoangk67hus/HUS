package homework5.ex1;

public class TestArrayTree {
    public static void main(String[] args) {
        ArrayBinaryTree<Integer, Integer> tree = new ArrayBinaryTree<>();
        tree.setRoot(1); //Set root for the tree

        tree.setLeft(1, 3);
        tree.setRight(1, 5);

        tree.setLeft(3,7);
        tree.setRight(3, 2);

        tree.setLeft(5, 6);
        tree.setRight(5, 8);

    }
}
