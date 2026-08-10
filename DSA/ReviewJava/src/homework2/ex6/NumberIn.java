package homework2.ex6;

import java.util.Scanner;

public class NumberIn {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] array = new int[n];
        for (int i = 0; i < array.length; i++) {
            array[i] = sc.nextInt();
        }
        mergeSort(array, 0, array.length - 1);
        System.out.println(array[k]);
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

        while (i < n1 && j < n2) {

            if (leftSubArray[i] <= rightSubArray[j]) {
                array[k] = leftSubArray[i];
                i++;
            } else {
                array[k] = rightSubArray[j];
                j++;
            }
            k++;

        }
        while (i < n1) {
            array[k] = leftSubArray[i];
            i++;
            k++;
        }

        while (j < n2) {
            array[k] = rightSubArray[j];
            j++;
            k++;
        }
    }
    public static void mergeSort(int[] array, int low, int high) {
        if (low < high) {
            int mid = low + (high - low) / 2;
            mergeSort(array, low, mid);
            mergeSort(array, mid + 1, high);

            merge(array, low, mid, high);
        }
    }


}
