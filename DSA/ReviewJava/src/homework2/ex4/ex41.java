package homework2.ex4;

import java.util.Scanner;

public class ex41 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n - 1; i++) {
            a[i] = sc.nextInt();
        }
        bubbleSort(a, n);
        printArray(a);
    }

    public static void bubbleSort(int[] array, int n) {
        boolean swapped;

        for (int i = 0; i < n - 1; i++) {
            swapped = false;

            for (int j = 0; j < n - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    // Swap array[j] and array[j + 1]
                    int temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                    swapped = true;
                }
            }

            // If no two elements were swapped in inner loop, the array is already sorted
            if (!swapped) {
                break;
            }
        }
    }
    public static void printArray(int[] array) {
        for (int i:
             array) {
            System.out.print(array[i] + " ");
        }
    }
}
