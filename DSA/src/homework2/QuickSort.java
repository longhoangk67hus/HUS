package homework2;

public class QuickSort implements ISort {

    public static void quickSort(int[] array, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(array, low, high);
            quickSort(array, low, pivotIndex - 1);
            quickSort(array, pivotIndex + 1, high);

        }

    }

    public static int partition(int[] array, int low, int high) {
        int pivot = array[high];
        int i = low - 1;
        int comparisons = 0;
        int swaps = 0;


        for (int j = low; j < high; j++) {
            comparisons++;
            if (array[j] <= pivot) {
                i++;

                int temp = array[i];
                array[i] = array[j];
                array[j] = temp;
                swaps++;
            }

        }
        int temp = array[i + 1];
        array[i + 1] = array[high];
        array[high] = temp;
        swaps++;
        printArray(array);
        System.out.println("Comparison: " + comparisons);
        System.out.println("Swaps: " + swaps);
        return i + 1;
    }

    public static void printArray(int[] array) {
        for (int i : array) {
            System.out.print(i + " ");
        }
        System.out.println();
    }

    @Override
    public void sort(int[] array) {
        quickSort(array, 0, array.length - 1);
    }
}
