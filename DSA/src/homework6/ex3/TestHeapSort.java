package homework6.ex3;

import java.util.*;
public class TestHeapSort {
    public static void main(String[] args) {
        // Example usage
        int size = 10000; // Adjust the size of the array as needed
        Integer[] array = generateRandomArray(size);

        // Perform HeapSort and measure time
        long startTime = System.currentTimeMillis();
        performHeapSort(array.clone());
        long endTime = System.currentTimeMillis();

        // Print sorted array and execution time
        System.out.println("Sorted array: " + Arrays.toString(array));
        System.out.println("HeapSort execution time: " + (endTime - startTime) + " ms");
    }

    private static void performHeapSort(Integer[] array) {
        // Create an instance of HeapSort and call the sort method
        HeapSort<Integer> heapSort = new HeapSort<>(array);
        heapSort.sort();
    }

    private static Integer[] generateRandomArray(int size) {
        Integer[] array = new Integer[size];
        Random rand = new Random();
        for (int i = 0; i < size; i++) {
            array[i] = rand.nextInt(100000); // Adjust the range as needed
        }
        return array;
    }
}
