package homework7.ex2;
//import homework5.ex1.LinkedBinaryTree.Node;
//import homework7.ex1.BinarySearchLinkedList;
//import homework7.ex1.SequentialSearchLinkedList;
//
//import java.io.FileWriter;
//import java.io.IOException;
//
//public class Test {
//    public static void inorderPrint(Node<Integer> bt, FileWriter out) throws IOException {
//        if (bt == null) {
//            return;
//        }
//        String padding = "";
//        inorderPrint(bt.right, out);
//        for (int i = 0; i < getDeg(bt); i++) padding = padding + "  ";
//        out.write(padding + bt.getElement() + "\n");
//        inorderPrint(bt.left, out);
//    }
//    public static int getDeg(Node<Integer> node) {
//        int degree = 0;
//        while (node.parent != null) {
//            node = node.parent;
//            degree++;
//        }
//        return degree;
//    }
//
//}
import homework5.ex1.LinkedBinaryTree;
import homework7.ex1.BinarySearchLinkedList;
import homework7.ex1.SequentialSearchLinkedList;

import java.io.FileWriter;
import java.io.IOException;

public class Test {

    public static void main(String[] args) throws Exception {
        int size1 = 1000000; // 10^6
        int size2 = 10000000; // 10^7
        int size3 = 100000000; // 10^8

        // Test sequential search for different array sizes
        testSequentialSearch(size1, "sequential_search_results.txt");
        testSequentialSearch(size2, "sequential_search_results.txt");
        testSequentialSearch(size3, "sequential_search_results.txt");

        // Test binary search with linked list for different array sizes
//        testBinarySearchLinkedList(size1, "binary_search_linked_list_results.txt");
//        testBinarySearchLinkedList(size2, "binary_search_linked_list_results.txt");
//        testBinarySearchLinkedList(size3, "binary_search_linked_list_results.txt");

        // Test binary search tree search for different array sizes
        testBinarySearchTree(size1, "binary_search_tree_results.txt");
        testBinarySearchTree(size2, "binary_search_tree_results.txt");
        testBinarySearchTree(size3, "binary_search_tree_results.txt");
    }

    private static void testSequentialSearch(int size, String outputFileName) {
        SequentialSearchLinkedList<Integer> linkedList = new SequentialSearchLinkedList<>();
        for (int i = 0; i < size; i++) {
            linkedList.add(i);
        }

        long startTime = System.currentTimeMillis();
        int result = linkedList.search(size / 2); // Searching for the middle element
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        writeResultToFile("Sequential Search", size, executionTime, outputFileName);
    }

    private static void testBinarySearchLinkedList(int size, String outputFileName) {
        BinarySearchLinkedList<Integer> linkedList = new BinarySearchLinkedList<>();
        for (int i = 0; i < size; i++) {
            linkedList.insert(i);
        }

        long startTime = System.currentTimeMillis();
        int result = linkedList.search(size / 2); // Searching for the middle element
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        writeResultToFile("Binary Search Linked List", size, executionTime, outputFileName);
    }

    private static void testBinarySearchTree(int size, String outputFileName) throws Exception {
        BinarySearchTree<Integer> bst = new BinarySearchTree<>();
        LinkedBinaryTree.Node<Integer> rootNode = null;

        for (int i = 0; i < size; i++) {
            rootNode = bst.insert(i, rootNode); // Inserting numbers from 0 to size-1
        }

        long startTime = System.currentTimeMillis();
        LinkedBinaryTree.Node<Integer> resultNode = bst.search(size / 2, rootNode); // Searching for the middle element
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        writeResultToFile("Binary Search Tree", size, executionTime, outputFileName);
    }

    private static void writeResultToFile(String algorithmName, int size, long executionTime, String outputFileName) {
        try (FileWriter writer = new FileWriter(outputFileName, true)) {
            writer.write("Algorithm: " + algorithmName + ", Array Size: " + size + ", Execution Time: " + executionTime + " milliseconds\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
