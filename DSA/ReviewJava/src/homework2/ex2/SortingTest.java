package homework2.ex2;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class SortingTest {
    public static void main(String[] args) {
        List<Integer> integerList = generateRandomList(5);
        System.out.print("Original List: " + integerList);

        BubbleSort<Integer> bubbleSort = new BubbleSort<>();
        List<Integer> bubbleSortList = new ArrayList<>(integerList);
        bubbleSort.sort(bubbleSortList);
        System.out.print("\nBubble Sorted List: " + bubbleSortList);

        SelectionSort<Integer> selectionSort = new SelectionSort<>();
        List<Integer> selectionSortList = new ArrayList<>(integerList);
        selectionSort.sort(selectionSortList);
        System.out.print("\nSelection Sorted List: " + selectionSortList);

        InsertionSort<Integer> insertionSort = new InsertionSort<>();
        List<Integer> insertionSOrtList = new ArrayList<>(integerList);
        insertionSort.sort(insertionSOrtList);
        System.out.print("\nInsertion Sorted List: " + insertionSOrtList);

        MergeSort<Integer> mergeSort = new MergeSort<>();
        List<Integer> mergeSortList = new ArrayList<>(integerList);
        mergeSort.sort(mergeSortList);
        System.out.print("\nMerge Sorted List: " + mergeSortList);

        QuickSort<Integer> quickSort = new QuickSort<>();
        List<Integer> quickSortList = new ArrayList<>(integerList);
        quickSort.sort(quickSortList);
        System.out.println("\nQuick Sorted List: " + quickSortList);
    }
    public static List<Integer> generateRandomList(int size) {
        List<Integer> list = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < size; i++) {
            list.add(random.nextInt(20));
        }
        return list;
    }
}
