package homework2;

public class MergeSort implements ISort {
    public static void mergeSort(int[] array, int low, int high) {
        if (low < high) {
            int mid = low + (high - low) / 2;
            mergeSort(array, low, mid);
            mergeSort(array, mid + 1, high);

            merge(array, low, mid, high);
        }
    }

    public static void merge(int[] array, int low, int mid, int high) {
        int n1 = mid - low + 1;
        int n2 = high - mid;
        int[] leftSubArray = new int[n1];
        int[] rightSubArray = new int[n2];

        for (int i = 0; i < n1; i++) {
            leftSubArray[i] = array[low + i];
        }
        for (int j = 0; j < n2; j++) {
            rightSubArray[j] = array[mid + 1 + j];
        }

        int i = 0, j = 0, k = low;
         int comparison = 0;
        int swaps = 0;

        while (i < n1 && j < n2) {
            comparison++;
            if (leftSubArray[i] <= rightSubArray[j]) {
                array[k] = leftSubArray[i++];
            } else {
                array[k] = rightSubArray[j++];
            }
            k++;
            comparison++;
        }
        while (i < n1) {
            array[k++] = leftSubArray[i++];
        }

        while (j < n2) {
            array[k++] = rightSubArray[j++];
        }
        printArray(array);
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
        mergeSort(array, 0, array.length - 1);
    }


    public static void main(String[] args) {
        int[] arr = {12,11,13,5,6,7};
        System.out.println("Original array:");
        printArray(arr);

        mergeSort(arr, 0, arr.length - 1);
        System.out.println("\nSorted array:");
        printArray(arr);
    }
}
