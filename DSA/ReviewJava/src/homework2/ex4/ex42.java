package homework2.ex4;

import java.util.Scanner;

public class ex42 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] array = new int[n];
        for (int i = 0; i < array.length; i++) {
            array[i] = sc.nextInt();
        }
        insertionSort(array);
        printArray(array);
    }
    public static void printArray(int[] array) {
        for (int i:
             array) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
    public static int[] insertionSort(int[] array) {
        int index, value;
        for (int i = 1; i < array.length; i++) {
            index = i;
            value = array[i];
            while (index > 0 && array[index - 1] > value) {
                array[index] = array[index - 1];
                index--;
            }
            array[index] = value;
        }
        return array;
    }
}
