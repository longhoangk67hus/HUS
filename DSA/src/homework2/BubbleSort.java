package homework2;

import java.util.List;
import java.util.Scanner;

public class BubbleSort implements ISort{
    public static void printArray(int[] array) {
        for (int i : array) {
            System.out.print(i + " ");
        }
        System.out.println();
    }

    public static void bubbleSort(int[] array) {
        int comparison = 0;
        int swaps = 0;

        for (int i = 0; i < array.length; i++) {
            boolean is_sorted = false;

            for (int j = 1; j < array.length - i; j++) {
                comparison++;
                if (array[j - 1] > array[j]) {
                    int temp = array[j - 1];
                    array[j - 1] = array[j];
                    array[j] = temp;
                    is_sorted = true;
                }
                if (is_sorted) {
                    break;
                }
            }
            System.out.println("Round " + (i + 1));
            printArray(array);
        }
        System.out.println("Comparison: " + comparison);
        System.out.println("Swap: " + swaps);
    }

    @Override
    public void sort(int[] array) {
       bubbleSort(array);
    }

//    public static void main(String[] args) {
//        Scanner sc = new Scanner(System.in);
//        System.out.print("Length of the array:");
//        int n = sc.nextInt();
//        int[] array = new int[n];
//        System.out.print("Enter the array:");
//        for (int i = 0; i < n; i++) {
//            array[i] = sc.nextInt();
//        }
//        bubbleSort(array);
//    }

}
