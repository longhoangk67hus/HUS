package homework5.codelearn.ex63;

public class CountLeavesTest {

    public static void main(String[] args) {
        CountLeaves tree = new CountLeaves();

        tree.root = tree.insert(tree.root, 10);
        tree.insert(tree.root, 5);
        tree.insert(tree.root, 15);
        tree.insert(tree.root, 3);
        tree.insert(tree.root, 7);
        tree.insert(tree.root, 12);
        tree.insert(tree.root, 18);

        int leaves = tree.countLeaves(tree.root);
        System.out.println("Number of leaves are: " + leaves);
    }

}
