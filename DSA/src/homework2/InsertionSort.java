package homework2;

public class InsertionSort implements ISort {
    public void insertionSort(int[] array) {
        int comparison =0;
        int swaps = 0;

        for (int i = 1; i < array.length; i++) {
            int key = array[i];
            int j = i - 1;
            while (j >= 0 && array[j] > key) {
                comparison++;
                array[j + 1] = array[j];
                j--;
                swaps++;
            }
            array[j + 1] = key;
            System.out.println("Round:" + i);
            printArray(array);
        }

        System.out.println("Comparison: " + comparison);
        System.out.println("Swap: " + swaps);
    }

    public static void printArray(int[] array) {
        for (int i : array) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
    @Override
    public void sort(int[] array) {
        insertionSort(array);
    }
}
