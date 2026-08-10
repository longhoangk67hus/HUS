package homework6.ex3;
import java.util.*;
public class SortingComparison {
    public static void main(String[] args) {
        int size = 10000;
        Integer[] array = generateRandomArray(size);

        // BubbleSort
        long startTime = System.currentTimeMillis();
        BubbleSort(array.clone());
        long endTime = System.currentTimeMillis();
        System.out.println("BubbleSort: " + (endTime - startTime) + " ms");

        // InsertionSort
        startTime = System.currentTimeMillis();
        InsertionSort(array.clone());
        endTime = System.currentTimeMillis();
        System.out.println("InsertionSort: " + (endTime - startTime) + " ms");

        // SelectionSort
        startTime = System.currentTimeMillis();
        SelectionSort(array.clone());
        endTime = System.currentTimeMillis();
        System.out.println("SelectionSort: " + (endTime - startTime) + " ms");

        // HeapSort
        startTime = System.currentTimeMillis();
        HeapSort(array.clone());
        endTime = System.currentTimeMillis();
        System.out.println("HeapSort: " + (endTime - startTime) + " ms");

        // QuickSort
        startTime = System.currentTimeMillis();
        QuickSort(array.clone());
        endTime = System.currentTimeMillis();
        System.out.println("QuickSort: " + (endTime - startTime) + " ms");

        // MergeSort
        startTime = System.currentTimeMillis();
        MergeSort(array.clone());
        endTime = System.currentTimeMillis();
        System.out.println("MergeSort: " + (endTime - startTime) + " ms");



    }
    private static Integer[] generateRandomArray(int size) {
        Integer[] array = new Integer[size];
        Random rand = new Random();
        for (int i = 0; i < size; i++) {
            array[i] = rand.nextInt(1000); // Adjust the range as needed
        }
        return array;
    }
    private static void BubbleSort(Integer[] array) {
        int n = array.length;
        boolean swapped;
        do {
            swapped = false;
            for (int i = 1; i < n; i++) {
                if (array[i - 1] > array[i]) {
                    int temp = array[i - 1];
                    array[i - 1] = array[i];
                    array[i] = temp;
                    swapped = true;
                }
            }
        } while (swapped);
    }

    private static void InsertionSort(Integer[] array) {
        int n = array.length;
        for (int i = 1; i < n; i++) {
            int key = array[i];
            int j = i - 1;
            while (j >= 0 && array[j] > key) {
                array[j + 1] = array[j];
                j--;
            }
            array[j + 1] = key;
        }
    }

    private static void SelectionSort(Integer[] array) {
        int n = array.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }
            int temp = array[i];
            array[i] = array[minIndex];
            array[minIndex] = temp;
        }
    }
    private static void QuickSort(Integer[] array) {
        QuickSort(array, 0, array.length - 1);
    }
    private static void QuickSort(Integer[] array, int low, int high) {
        if (low < high) {
            int pi = partition(array, low, high);

            QuickSort(array, low, pi - 1);
            QuickSort(array, pi + 1, high);
        }
    }

    private static int partition(Integer[] array, int low, int high) {
        int pivot = array[high];
        int i = low - 1;

        for (int j = low; j < high; j++) {
            if (array[j] <= pivot) {
                i++;

                int temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
        int temp = array[i + 1];
        array[i + 1] = array[high];
        array[high] = temp;

        return i + 1;
    }
    private static void MergeSort(Integer[] array) {
        MergeSort(array, 0, array.length - 1);
    }
    private static void MergeSort(Integer[] array, int left, int right) {
        if (left < right) {
            int mid = (left + right) / 2;

            MergeSort(array, left, mid);
            MergeSort(array, mid + 1, right);

            merge(array, left, mid, right);
        }
    }

    private static void merge(Integer[] array, int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        Integer[] leftArray = new Integer[n1];
        Integer[] rightArray = new Integer[n2];

        System.arraycopy(array, left, leftArray, 0, n1);
        System.arraycopy(array, mid + 1, rightArray, 0, n2);

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (leftArray[i] <= rightArray[j]) {
                array[k++] = leftArray[i++];
            } else {
                array[k++] = rightArray[j++];
            }
        }

        while (i < n1) {
            array[k++] = leftArray[i++];
        }

        while (j < n2) {
            array[k++] = rightArray[j++];
        }
    }
    private static void HeapSort(Integer[] array) {
        // Use your HeapSort class
        HeapSort<Integer> heapSort = new HeapSort<>(array);
        heapSort.sort();
    }

}
